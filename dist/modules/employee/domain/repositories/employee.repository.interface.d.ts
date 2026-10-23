import { EmployeeEntity } from '../entities/employee.entity';
export interface IEmployeeRepository {
    save(employee: EmployeeEntity): Promise<EmployeeEntity>;
    findByEmployeeId(projectId: string, employeeId: string): Promise<EmployeeEntity | null>;
    findAll(projectId: string, options?: {
        page?: number;
        limit?: number;
        nodeId?: string;
        status?: string;
        search?: string;
    }): Promise<{
        employees: EmployeeEntity[];
        total: number;
    }>;
    existsByEmployeeId(projectId: string, employeeId: string): Promise<boolean>;
    bulkUpsert(employees: EmployeeEntity[]): Promise<{
        inserted: number;
        updated: number;
    }>;
    terminateMissingInList(projectId: string, activeEmployeeIdsInImport: string[]): Promise<number>;
    softDelete(projectId: string, employeeId: string): Promise<boolean>;
}
