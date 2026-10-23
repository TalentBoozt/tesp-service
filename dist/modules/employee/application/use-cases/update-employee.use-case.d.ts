import { IEmployeeRepository } from '../../domain/repositories/employee.repository.interface';
import { EmployeeEntity, EmploymentStatus } from '../../domain/entities/employee.entity';
import { IOrgNodeRepository } from '../../../organization/domain/repositories/org-node.repository.interface';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export interface UpdateEmployeeParams {
    nodeId?: string;
    matrixNodeIds?: string[];
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    status?: EmploymentStatus;
    attributes?: Record<string, any>;
}
export declare class UpdateEmployeeUseCase {
    private employeeRepo;
    private orgNodeRepo?;
    private eventBus;
    constructor(employeeRepo: IEmployeeRepository, orgNodeRepo?: IOrgNodeRepository | undefined, eventBus?: DomainEventBus);
    execute(projectId: string, employeeId: string, params: UpdateEmployeeParams, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<EmployeeEntity>;
}
