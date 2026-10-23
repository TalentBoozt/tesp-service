import { IEmployeeRepository } from '../../domain/repositories/employee.repository.interface';
import { EmployeeEntity } from '../../domain/entities/employee.entity';
export declare class ListEmployeesUseCase {
    private employeeRepo;
    constructor(employeeRepo: IEmployeeRepository);
    execute(projectId: string, options?: {
        page?: number;
        limit?: number;
        nodeId?: string;
        status?: string;
        search?: string;
    }): Promise<{
        employees: EmployeeEntity[];
        total: number;
    }>;
}
