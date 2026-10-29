"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionStateMachineService = void 0;
const auth_middleware_1 = require("../../../../shared/presentation/middleware/auth.middleware");
class ActionStateMachineService {
    allowedTransitions = new Map([
        ['DRAFT', ['PROPOSED', 'IN_PROGRESS', 'ACTIVE', 'CANCELLED']],
        ['PROPOSED', ['APPROVED', 'REJECTED', 'IN_PROGRESS', 'ACTIVE', 'CANCELLED']],
        ['REJECTED', ['DRAFT', 'PROPOSED', 'CANCELLED']],
        ['APPROVED', ['IN_PROGRESS', 'ACTIVE', 'CANCELLED']],
        ['IN_PROGRESS', ['COMPLETED', 'ACTIVE', 'CANCELLED', 'DRAFT']],
        ['ACTIVE', ['COMPLETED', 'IN_PROGRESS', 'CANCELLED', 'DRAFT']],
        ['COMPLETED', ['VERIFIED', 'IN_PROGRESS', 'ACTIVE', 'CANCELLED']],
        ['VERIFIED', ['COMPLETED', 'IN_PROGRESS', 'ACTIVE']],
        ['CANCELLED', ['DRAFT']],
    ]);
    canTransition(current, target, userRole) {
        if (current === target)
            return false;
        // Super Admin and Project Admin have overriding lifecycle governance
        if (userRole === auth_middleware_1.UserRole.SUPER_ADMIN || userRole === auth_middleware_1.UserRole.PROJECT_ADMIN) {
            return true;
        }
        const validTargets = this.allowedTransitions.get(current);
        if (!validTargets || !validTargets.includes(target)) {
            return false;
        }
        // Role guard for approval (BR-ACT-001)
        if (current === 'PROPOSED' && target === 'APPROVED') {
            if (!userRole)
                return false;
            const allowedApprovers = [auth_middleware_1.UserRole.SUPER_ADMIN, auth_middleware_1.UserRole.PROJECT_ADMIN, auth_middleware_1.UserRole.HR_MANAGER, auth_middleware_1.UserRole.CONSULTANT_DAASH];
            return allowedApprovers.includes(userRole);
        }
        return true;
    }
    validateTransition(current, target, userRole) {
        if (!this.canTransition(current, target, userRole)) {
            throw new Error(`Invalid state transition from '${current}' to '${target}' for role '${userRole || 'ANONYMOUS'}'`);
        }
    }
}
exports.ActionStateMachineService = ActionStateMachineService;
//# sourceMappingURL=action-state-machine.service.js.map