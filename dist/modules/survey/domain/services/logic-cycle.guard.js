"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicCycleGuard = void 0;
class LogicCycleGuard {
    /**
     * Validates that all branching skip rules skip strictly forward to a page that appears AFTER the current page in display order.
     * BR-SRV-004 & VR-SRV-003: Target page ID in skip logic MUST exist and appear AFTER the current page in display sequence.
     */
    static validateForwardOnlySkipLogic(pages) {
        const pageOrderMap = new Map();
        pages.forEach((page) => {
            pageOrderMap.set(page.pageId, page.pageOrder);
        });
        pages.forEach((page) => {
            const currentOrder = page.pageOrder;
            page.sections.forEach((section) => {
                section.questions.forEach((question) => {
                    if (question.logicRules && question.logicRules.length > 0) {
                        question.logicRules.forEach((rule) => {
                            const targetOrder = pageOrderMap.get(rule.targetPageId);
                            if (targetOrder === undefined) {
                                throw new Error(`Invalid skip logic target page '${rule.targetPageId}' referenced in question '${question.questionId}'. Target page does not exist.`);
                            }
                            if (targetOrder <= currentOrder) {
                                throw new Error(`Invalid forward skip target page '${rule.targetPageId}' (Order ${targetOrder}) in question '${question.questionId}' on Page '${page.pageId}' (Order ${currentOrder}). Skip logic rules MUST skip forward-only (VR-SRV-003).`);
                            }
                        });
                    }
                });
            });
        });
    }
}
exports.LogicCycleGuard = LogicCycleGuard;
//# sourceMappingURL=logic-cycle.guard.js.map