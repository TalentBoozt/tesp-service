import { IEmployeeRepository } from '../../domain/repositories/employee.repository.interface';
import { EmployeeEntity, IEmployeeProps } from '../../domain/entities/employee.entity';
import { IOrgNodeRepository } from '../../../organization/domain/repositories/org-node.repository.interface';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export declare class CreateEmployeeUseCase {
    private employeeRepo;
    private orgNodeRepo?;
    private eventBus;
    constructor(employeeRepo: IEmployeeRepository, orgNodeRepo?: IOrgNodeRepository | undefined, eventBus?: DomainEventBus);
    execute(props: IEmployeeProps, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<EmployeeEntity>;
}
