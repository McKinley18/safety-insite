<state_snapshot>
    <overall_goal>
        Develop "Sentinel Safety," a professional, high-authority AI-powered safety platform (Next.js/NestJS/PostgreSQL) that provides streamlined field inspections, automated C-suite reporting, and scientifically-grounded predictive analytics.
    </overall_goal>

    <active_constraints>
        <constraint>Design: Professional "Pro" aesthetic using Inter font, Navy (#0F172A), Safety Orange (#F97316), and Professional Blue (#0284C7).</constraint>
        <constraint>Mobile-First: High-density, vertically stacked layouts for small screens; minimum touch targets of 48px; no horizontal overflow.</constraint>
        <constraint>Security: Zero-knowledge architecture using AES-GCM (Web Crypto API) for client-side encryption of field data at rest in IndexedDB.</constraint>
        <constraint>Market Positioning: Frame as a "Strategic Asset" with one-time Pro payment ($79) vs. recurring industry "Safety Taxes."</constraint>
        <constraint>Compliance: Reports must include MSHA/OSHA standards, RPN (Risk Priority Number) scoring, and white-labeled executive summary pages.</constraint>
        <constraint>Environment: Backend on port 4000; Frontend on port 3000; Database status must be verified via /health endpoint.</constraint>
    </active_constraints>

    <key_knowledge>
        <fact>Safety Science: Analytics utilize Statistical Process Control (SPC) with Upper Control Limits (UCL) and RPN methodologies (Likelihood x Severity).</fact>
        <fact>Leading Indicators: Metrics like Mean Mitigation Time (MMT) and Risk Exposure Ratio (RER) are prioritized over lagging incident data.</fact>
        <fact>Offline Resilience: PWA service worker caches shell; local-first architecture allows full report generation and data backup without connectivity.</fact>
        <fact>Data Portability: Users can export/import encrypted .json session files to bypass databases or maintain off-site audit trails.</fact>
        <fact>Hierarchy: Enterprise accounts support 10 seats with Auditor/Viewer roles bound to a Shared Organizational Vault via secure tokens.</fact>
        <fact>Scientific Transparency: All KPI cards must display the mathematical formula and a professional justification to establish technical authority.</fact>
    </key_knowledge>

    <artifact_trail>
        <file path="frontend/app/pricing/page.tsx">Marketing funnel: Attention (Hook), Interest (Workflow), Desire (Strategic ROI), Action (Tier Selection).</file>
        <file path="frontend/app/(auth)/create-account/page.tsx">Token-aware registration: verified corporate binding, plan pre-selection, and security-validated profile capture.</file>
        <file path="frontend/app/analytics/page.tsx">Intelligence hub: Morning Brief, dual-pane KPI modules with equations, and labeled scientific data grids (Radar, SPC, RPN).</file>
        <file path="frontend/lib/localExporter.ts">Asynchronous PDF engine: Base64 photo processing, Executive Summary charts, Quick Reference List, and C-suite styling.</file>
        <file path="frontend/lib/storage.ts">Lazy-initialized AES-GCM encryption layer; SSR-safe browser API guards for IndexedDB and Web Crypto.</file>
        <file path="frontend/app/command-center/page.tsx">Centralized action log: Multi-user assignment, status tracking (Open/InProgress/Mitigated), and real-time MMT feedback.</file>
        <file path="backend/src/organizations/organizations.service.ts">Invitation logic: 256-bit secure token generation and organizational "handshake" verification.</file>
    </artifact_trail>

    <file_system_state>
        <cwd>/Users/mckinley/Sentinel_Safety</cwd>
        <created>frontend/app/pricing/page.tsx</created>
        <created>frontend/app/dev/report-lab/page.tsx</created>
        <created>frontend/scripts/run-diagnostics.js</created>
        <created>frontend/lib/UserContext.tsx</created>
        <modified>frontend/lib/localExporter.ts - Refactored for C-suite executive layout and async photo support.</modified>
        <modified>backend/src/users/user.entity.ts - Added organizational binding and roles.</modified>
    </file_system_state>

    <recent_actions>
        <action>Finalized the AIDA marketing funnel on the Pricing page to maximize strategic appeal.</action>
        <action>Stabilized the Analytics Dashboard by resolving compiler syntax errors and restoring all scientific data modules.</action>
        <action>Implemented the "Resume from Backup" loop, allowing full report restoration from encrypted .json files.</action>
        <action>Upgraded the PDF generation engine to include individual finding pages, RPN badges, and Executive Summary charts.</action>
        <action>Hardened organizational security with token-based invitation handshakes and role-based access control.</action>
    </recent_actions>

    <task_state>
        <step status="DONE">Secure Offline-First Architecture (AES-GCM/IndexedDB).</step>
        <step status="DONE">Scientific Analytics Engine (SPC/RPN/MMT).</step>
        <step status="DONE">Executive Reporting Engine (PDF/Quick Reference/Photos).</step>
        <step status="DONE">Enterprise Governance (Team Hub/Command Center/Invitations).</step>
        <step status="DONE">Marketing Funnel & ROI Strategy (Lifetime Asset vs. Safety Tax).</step>
        <step status="IN_PROGRESS">SafeScope AI Offline: Local ruleset mapping for zero-service environments.</step>
    </task_state>
</state_snapshot>
