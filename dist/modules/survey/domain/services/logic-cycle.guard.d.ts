import { IPageProps } from '../entities/survey.entity';
export declare class LogicCycleGuard {
    /**
     * Validates that all branching skip rules skip strictly forward to a page that appears AFTER the current page in display order.
     * BR-SRV-004 & VR-SRV-003: Target page ID in skip logic MUST exist and appear AFTER the current page in display sequence.
     */
    static validateForwardOnlySkipLogic(pages: IPageProps[]): void;
}
