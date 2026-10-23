import { IEmployeeRepository } from '../../domain/repositories/employee.repository.interface';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class TerminateEmployeeUseCase {
    private employeeRepo;
    private eventBus;
    constructor(employeeRepo: IEmployeeRepository, eventBus?: DomainEventBus);
    execute(projectId: string, employeeId: string, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<boolean>;
}
