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
    find?(projectIdOrQuery: string | {
        projectId: string;
        page?: number;
        limit?: number;
        nodeId?: string;
        status?: string;
        search?: string;
    }, options?: {
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
    findByEmail?(projectId: string, email: string): Promise<EmployeeEntity | null>;
    countActiveByNodeId?(projectId: string, nodeId: string): Promise<number>;
    getNodeEmployeeIdSets?(projectId: string): Promise<Record<string, Set<string>>>;
}
