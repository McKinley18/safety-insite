"use client";

import { useEffect, useMemo, useState } from "react";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, AppSelect } from "@/components/ui/AppInput";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import { Badge } from "@/components/ui/Badge";
import LockedFeatureCard from "@/components/ui/LockedFeatureCard";
import {
  approveReviewCoreKnowledgeRecord,
  createReviewCoreKnowledgeDraft,
  getReviewCorePersistenceReadiness,
  listReviewCoreActiveRetrievalRecords,
  listReviewCoreKnowledgeQueue,
  rejectReviewCoreKnowledgeRecord,
  requestMoreInfoForReviewCoreKnowledgeRecord,
  type ReviewCoreQueueActor,
} from "@/lib/safescopeKnowledge";
import {
  canAccessProtectedArea,
  getStoredPlanCode,
  requiredPlanForArea,
  type PlanCode,
} from "@/lib/planEntitlements";

type QueueRecord = {
  id?: string;
  title?: string;
  content?: string;
  domain?: string;
  tags?: string[];
  authorityTier?: string;
  status?: string;
  primaryCitation?: string | null;
  citation?: string | null;
  sourceReferences?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  guardrails?: Record<string, any>;
  originalPayload?: string;
};

type QueueItem = {
  record?: QueueRecord;
  id?: string;
  recordId?: string;
  title?: string;
  status?: string;
  authorityTier?: string;
  domain?: string;
  approvalReadiness?: {
    ready?: boolean;
    blockers?: string[];
  };
  duplicateCandidates?: string[];
  reviewChecklist?: string[];
};

const DEFAULT_ACTOR: ReviewCoreQueueActor = {
  actorId: "local-reviewer",
  role: "admin",
  planTier: "company",
};

function asArray(value: any): any[] {
  return Array.isArray(value) ? value : [];
}

function unwrapQueueItems(payload: any): QueueItem[] {
  return asArray(
    payload?.data?.result?.queueItems ??
      payload?.result?.queueItems ??
      payload?.data?.queueItems ??
      payload?.queueItems,
  );
}

function unwrapCounts(payload: any) {
  return (
    payload?.data?.result?.lifecycleCounts ??
    payload?.result?.lifecycleCounts ??
    payload?.data?.lifecycleCounts ??
    payload?.lifecycleCounts ??
    {}
  );
}

function itemRecord(item: QueueItem): QueueRecord {
  return item.record ?? item;
}

function recordId(item: QueueItem | QueueRecord | null | undefined) {
  if (!item) return "";
  return String((item as QueueItem).record?.id ?? (item as QueueItem).recordId ?? item.id ?? "");
}

function readableStatus(value: any) {
  const raw = String(value || "unknown").toLowerCase().replaceAll("_", " ");
  return raw.replace(/\b\w/g, (match) => match.toUpperCase());
}

function statusTone(value: any) {
  const status = String(value || "").toLowerCase();
  if (status.includes("governed") || status.includes("approved")) return "green";
  if (status.includes("reject") || status.includes("blocked")) return "red";
  if (status.includes("pending") || status.includes("review")) return "amber";
  if (status.includes("draft")) return "blue";
  return "white";
}

function guardrailLabels(record: QueueRecord) {
  const guardrails = record.guardrails ?? {};
  const labels = [
    ["advisoryOnly", "Advisory only"],
    ["doesNotDeclareViolation", "No violation declaration"],
    ["doesNotCreateCitation", "No citation creation"],
    ["requiresQualifiedReview", "Qualified review required"],
    ["cannotOverrideRegulation", "Cannot override regulation"],
    ["prohibitedLanguage", "Prohibited language flagged"],
    ["confidentialData", "Confidential data flagged"],
    ["isDuplicate", "Duplicate flagged"],
  ];

  return labels
    .filter(([key]) => guardrails[key] === true)
    .map(([, label]) => label);
}

function parseOriginalPayload(record: QueueRecord) {
  if (!record.originalPayload) return null;

  try {
    return JSON.parse(record.originalPayload);
  } catch {
    return null;
  }
}

export default function ReviewCoreKnowledgeReviewPage() {
  const [planCode, setPlanCode] = useState<PlanCode>("basic");
  const [actorRole, setActorRole] = useState<NonNullable<ReviewCoreQueueActor["role"]>>("admin");
  const [actorPlan, setActorPlan] = useState<NonNullable<ReviewCoreQueueActor["planTier"]>>("company");

  const [queuePayload, setQueuePayload] = useState<any>(null);
  const [activePayload, setActivePayload] = useState<any>(null);
  const [readinessPayload, setReadinessPayload] = useState<any>(null);
  const [selectedId, setSelectedId] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviewNote, setReviewNote] = useState("");
  const [newDraftTitle, setNewDraftTitle] = useState("Machine guarding cleanup exposure");
  const [newDraftContent, setNewDraftContent] = useState(
    "During cleanup near moving conveyor or machinery components, verify guarding, isolation, task controls, and exposure before relying on a general housekeeping classification.",
  );
  const [newDraftCitation, setNewDraftCitation] = useState("Internal governed review required before retrieval activation.");
  const [newDraftDomain, setNewDraftDomain] = useState("machine_guarding");

  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState("");
  const [error, setError] = useState("");

  const actor: ReviewCoreQueueActor = useMemo(
    () => ({
      ...DEFAULT_ACTOR,
      role: actorRole,
      planTier: actorPlan,
    }),
    [actorRole, actorPlan],
  );

  async function loadQueue() {
    try {
      setLoading(true);
      setError("");

      const [queue, active, readiness] = await Promise.all([
        listReviewCoreKnowledgeQueue(actor),
        listReviewCoreActiveRetrievalRecords(actor),
        getReviewCorePersistenceReadiness(actor),
      ]);

      setQueuePayload(queue);
      setActivePayload(active);
      setReadinessPayload(readiness);

      const items = unwrapQueueItems(queue);
      if (!selectedId && items.length > 0) {
        setSelectedId(recordId(items[0]));
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load ReviewCore knowledge queue.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPlanCode(getStoredPlanCode());
  }, []);

  useEffect(() => {
    loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actorRole, actorPlan]);

  const queueItems = useMemo(() => unwrapQueueItems(queuePayload), [queuePayload]);
  const lifecycleCounts = useMemo(() => unwrapCounts(queuePayload), [queuePayload]);
  const activeRecords = useMemo(
    () =>
      asArray(
        activePayload?.data?.result?.records ??
          activePayload?.result?.records ??
          activePayload?.records,
      ),
    [activePayload],
  );

  const filteredItems = useMemo(() => {
    if (filterStatus === "all") return queueItems;

    return queueItems.filter((item) => {
      const record = itemRecord(item);
      return String(record.status ?? item.status ?? "").toLowerCase() === filterStatus;
    });
  }, [filterStatus, queueItems]);

  const selectedItem = useMemo(
    () => queueItems.find((item) => recordId(item) === selectedId) ?? null,
    [queueItems, selectedId],
  );
  const selectedRecord = selectedItem ? itemRecord(selectedItem) : null;
  const selectedOriginal = selectedRecord ? parseOriginalPayload(selectedRecord) : null;

  async function runAction(label: string, action: () => Promise<any>) {
    try {
      setActionBusy(label);
      setError("");
      await action();
      await loadQueue();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ReviewCore action failed.");
    } finally {
      setActionBusy("");
    }
  }

  async function createDraft() {
    if (!newDraftTitle.trim() || !newDraftContent.trim()) {
      setError("Draft title and content are required.");
      return;
    }

    await runAction("create", async () => {
      await createReviewCoreKnowledgeDraft(
        {
          title: newDraftTitle.trim(),
          content: newDraftContent.trim(),
          domain: newDraftDomain.trim() || "uncategorized",
          authorityTier: "SUPPORTING",
          citation: newDraftCitation.trim(),
          tags: newDraftDomain
            .split(/[,\s]+/)
            .map((tag) => tag.trim())
            .filter(Boolean),
          guardrails: {
            advisoryOnly: true,
            doesNotDeclareViolation: true,
            doesNotCreateCitation: true,
            requiresQualifiedReview: true,
            cannotOverrideRegulation: true,
          },
        },
        actor,
      );
    });
  }

  const canUseKnowledgeReview = canAccessProtectedArea("knowledge_library", planCode);
  const canApprove =
    ["owner", "admin", "compliance_admin"].includes(actorRole) &&
    ["team", "company"].includes(actorPlan);

  if (!canUseKnowledgeReview) {
    return (
      <LockedFeatureCard
        eyebrow="Company Knowledge Governance"
        title="ReviewCore knowledge review is Company-only."
        description="The review console controls source-backed knowledge candidates, approval decisions, and governed promotion into the ReviewCore knowledge base."
        requiredPlan={requiredPlanForArea("knowledge_library")}
        bullets={[
          "Review proposed source-backed knowledge before it can influence future ReviewCore output.",
          "Protect regulatory mappings with qualified approval and audit history.",
          "Keep Company knowledge governance separate from Basic and Pro field workflows.",
        ]}
        ctaLabel="View Company Plan"
      />
    );
  }

  return (
    <section className="space-y-4">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          ReviewCore Governance
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Governed knowledge review queue.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Review, approve, reject, or request more information before knowledge can become active retrieval intelligence.
        </p>
      </HeroPanel>

      <AppPanel padding="md" className="rounded-[24px] p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
              Live Queue Connection
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-slate-100">
              ReviewCore route: /reviewcore/knowledge-queue
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500 dark:text-slate-400">
              Active retrieval remains locked until approval readiness and governance guardrails pass.
            </p>
          </div>

          <AppSelect
            value={actorRole}
            onChange={(event) => setActorRole(event.target.value as any)}
            fieldSize="sm"
            className="min-h-11 font-black"
          >
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="compliance_admin">Compliance Admin</option>
            <option value="safety_manager">Safety Manager</option>
            <option value="field_inspector">Field Inspector</option>
            <option value="viewer">Viewer</option>
          </AppSelect>

          <AppSelect
            value={actorPlan}
            onChange={(event) => setActorPlan(event.target.value as any)}
            fieldSize="sm"
            className="min-h-11 font-black"
          >
            <option value="company">Company</option>
            <option value="team">Team</option>
            <option value="individual">Individual</option>
          </AppSelect>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
          {[
            ["Draft", lifecycleCounts.draft ?? 0],
            ["Needs Review", lifecycleCounts.needs_review ?? 0],
            ["Approved", lifecycleCounts.approved ?? 0],
            ["Rejected", lifecycleCounts.rejected ?? 0],
            ["Superseded", lifecycleCounts.superseded ?? 0],
            ["Active", activeRecords.length],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-950">
              <p className="text-2xl font-black text-[#1D72B8]">{String(value)}</p>
              <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                {String(label)}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-black text-red-700">
            {error}
          </p>
        )}
      </AppPanel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <AppPanel padding="md" className="rounded-[24px] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#F97316]">
                Queue
              </p>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Pending knowledge records
              </h2>
            </div>

            <AppSelect
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              fieldSize="sm"
              className="min-h-10 font-black"
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="pending_validation">Pending Validation</option>
              <option value="governed">Governed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="superseded">Superseded</option>
            </AppSelect>
          </div>

          {loading ? (
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-500">
              Loading ReviewCore queue...
            </p>
          ) : filteredItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              No queue records found. Create a draft below to validate the review workflow.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filteredItems.map((item) => {
                const record = itemRecord(item);
                const id = recordId(item);
                const isSelected = id === selectedId;

                return (
                  <button
                    key={id || record.title}
                    type="button"
                    onClick={() => setSelectedId(id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#1D72B8] bg-[#E8F4FF]"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {record.title || "Untitled knowledge record"}
                        </p>
                        <p className="mt-1 text-[11px] font-bold text-slate-500">
                          {record.domain || "uncategorized"} · {record.authorityTier || "SUPPORTING"}
                        </p>
                      </div>
                      <Badge tone={statusTone(record.status) as any}>
                        {readableStatus(record.status)}
                      </Badge>
                    </div>

                    <p className="mt-3 line-clamp-3 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300">
                      {record.content || selectedOriginal?.content || "No content summary available."}
                    </p>

                    {!!record.primaryCitation && (
                      <p className="mt-2 text-[11px] font-black text-[#1D72B8]">
                        {record.primaryCitation}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </AppPanel>

        <div className="space-y-4">
          <AppPanel padding="md" className="rounded-[24px] p-4 sm:p-5">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
                Review Detail
              </p>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {selectedRecord?.title || "Select a record"}
              </h2>
            </div>

            {selectedRecord ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge tone={statusTone(selectedRecord.status) as any}>
                    {readableStatus(selectedRecord.status)}
                  </Badge>
                  <Badge tone="white">{selectedRecord.domain || "uncategorized"}</Badge>
                  <Badge tone="white">{selectedRecord.authorityTier || "SUPPORTING"}</Badge>
                </div>

                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
                  {selectedRecord.content || selectedOriginal?.content || "No record content available."}
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                      Citation / Source
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-900 dark:text-slate-100">
                      {selectedRecord.primaryCitation ||
                        selectedRecord.citation ||
                        selectedOriginal?.citation ||
                        "No citation supplied"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                      Active Retrieval
                    </p>
                    <p className="mt-2 text-sm font-black text-slate-900 dark:text-slate-100">
                      {activeRecords.some((record) => record.id === selectedRecord.id)
                        ? "Eligible"
                        : "Locked until governed approval"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
                    Governance Guardrails
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {guardrailLabels(selectedRecord).length ? (
                      guardrailLabels(selectedRecord).map((label) => (
                        <Badge key={label} tone="white" className="text-amber-700">
                          {label}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-amber-800">
                        No explicit guardrail flags were stored on this row.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                    Reviewer Note
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                    className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#1D72B8] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="Add rationale for rejection or request for more information..."
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <AppButton
                    disabled={!canApprove || !!actionBusy}
                    onClick={() =>
                      runAction("approve", () =>
                        approveReviewCoreKnowledgeRecord(recordId(selectedRecord), actor),
                      )
                    }
                    className="min-h-11"
                  >
                    {actionBusy === "approve" ? "Approving..." : "Approve"}
                  </AppButton>

                  <AppButton
                    variant="secondary"
                    disabled={!!actionBusy}
                    onClick={() =>
                      runAction("more-info", () =>
                        requestMoreInfoForReviewCoreKnowledgeRecord(
                          recordId(selectedRecord),
                          reviewNote.trim() || "More information required before governed approval.",
                          actor,
                        ),
                      )
                    }
                    className="min-h-11"
                  >
                    More Info
                  </AppButton>

                  <AppButton
                    variant="secondary"
                    disabled={!!actionBusy}
                    onClick={() =>
                      runAction("reject", () =>
                        rejectReviewCoreKnowledgeRecord(
                          recordId(selectedRecord),
                          reviewNote.trim() || "Rejected during governed ReviewCore review.",
                          actor,
                        ),
                      )
                    }
                    className="min-h-11"
                  >
                    Reject
                  </AppButton>
                </div>

                {!canApprove && (
                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">
                    Approval requires owner/admin/compliance admin role and Team or Company plan.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm font-black text-slate-500">
                Select a queue record to review details and governance actions.
              </p>
            )}
          </AppPanel>

          <AppPanel padding="md" className="rounded-[24px] p-4 sm:p-5">
            <div className="border-b border-slate-200 pb-3 dark:border-slate-800">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#F97316]">
                Create Draft
              </p>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Stage new governed knowledge
              </h2>
            </div>

            <div className="mt-4 grid gap-3">
              <AppInput
                value={newDraftTitle}
                onChange={(event) => setNewDraftTitle(event.target.value)}
                fieldSize="sm"
                className="min-h-11 font-semibold"
                placeholder="Draft title"
              />

              <AppInput
                value={newDraftDomain}
                onChange={(event) => setNewDraftDomain(event.target.value)}
                fieldSize="sm"
                className="min-h-11 font-semibold"
                placeholder="Domain, example: machine_guarding"
              />

              <AppInput
                value={newDraftCitation}
                onChange={(event) => setNewDraftCitation(event.target.value)}
                fieldSize="sm"
                className="min-h-11 font-semibold"
                placeholder="Citation or source reference"
              />

              <textarea
                value={newDraftContent}
                onChange={(event) => setNewDraftContent(event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#1D72B8] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Proposed knowledge text"
              />

              <AppButton
                onClick={createDraft}
                disabled={!!actionBusy}
                className="min-h-11"
              >
                {actionBusy === "create" ? "Creating..." : "Create Review Draft"}
              </AppButton>
            </div>
          </AppPanel>

          <AppPanel padding="md" className="rounded-[24px] p-4 sm:p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              Persistence Readiness
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {Object.entries(
                readinessPayload?.data?.result ??
                  readinessPayload?.result ??
                  readinessPayload?.data ??
                  {},
              ).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                    {key.replaceAll(/([A-Z])/g, " $1")}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900 dark:text-slate-100">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </AppPanel>
        </div>
      </div>
    </section>
  );
}
