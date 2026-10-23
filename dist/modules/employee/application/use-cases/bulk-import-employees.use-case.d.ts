import { IEmployeeRepository } from '../../domain/repositories/employee.repository.interface';
import { IEmployeeProps } from '../../domain/entities/employee.entity';
import { DomainEventBus } from '../../../../shared/domain/events/event-bus';
export interface BulkImportSummary {
    totalRecords: number;
    inserted: number;
    updated: number;
    terminated: number;
    failed: number;
    authAccountsProvisioned?: number;
    errors: Array<{
        line: number;
        employeeId?: string;
        error: string;
    }>;
}
export declare class BulkImportEmployeesUseCase {
    private employeeRepo;
    private eventBus;
    private readonly BATCH_SIZE;
    constructor(employeeRepo: IEmployeeRepository, eventBus?: DomainEventBus);
    execute(projectId: string, records: Array<Omit<IEmployeeProps, 'projectId'>>, options?: {
        autoTerminateMissing?: boolean;
    }, actorContext?: {
        actorId: string;
        actorRole: string;
    }): Promise<BulkImportSummary>;
}
