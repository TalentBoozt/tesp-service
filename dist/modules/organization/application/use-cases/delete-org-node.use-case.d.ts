import { IOrgNodeRepository } from '../../domain/repositories/org-node.repository.interface';
import { IEmployeeRepository } from '../../../employee/domain/repositories/employee.repository.interface';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class DeleteOrgNodeUseCase {
    private repository;
    private eventBus;
    private employeeRepo?;
    constructor(repository: IOrgNodeRepository, employeeRepo?: IEmployeeRepository, eventBus?: DomainEventBus);
    execute(projectId: string, nodeId: string, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<boolean>;
}
