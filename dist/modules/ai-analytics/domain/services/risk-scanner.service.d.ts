import { RiskFlag } from '../entities/ai-insight.entity';
export declare class RiskScannerService {
    private riskRules;
    scan(text: string): RiskFlag[];
}
