import { IEmployeeRepository } from '../../../domain/repositories/employee.repository.interface';
import { EmployeeEntity } from '../../../domain/entities/employee.entity';
export declare class EmployeeMongoRepository implements IEmployeeRepository {
    private toEntity;
    save(employee: EmployeeEntity): Promise<EmployeeEntity>;
    findByEmployeeId(projectId: string, employeeId: string): Promise<EmployeeEntity | null>;
    findByEmail(projectId: string, email: string): Promise<EmployeeEntity | null>;
    find(projectIdOrQuery: string | {
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
    countActiveByNodeId(projectId: string, nodeId: string): Promise<number>;
    getNodeEmployeeIdSets(projectId: string): Promise<Record<string, Set<string>>>;
}
