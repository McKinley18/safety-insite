export interface EngineDiagnostic {
  engineName: string;
  status: "not_called" | "stubbed" | "called" | "failed";
  notes?: string[];
  confidence?: number;
}
