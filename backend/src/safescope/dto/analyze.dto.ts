export class AnalyzeDto {
  hazardType: string;
  description: string;
  task?: string;
  environment?: string;
  equipment?: string;

  severity?: string;
  likelihood?: string;
  calculatedRisk?: string;
}
