import { IEmployeeRepository } from '../../domain/repositories/employee.repository.interface';
import { EmployeeEntity } from '../../domain/entities/employee.entity';
export declare class GetEmployeeUseCase {
    private employeeRepo;
    constructor(employeeRepo: IEmployeeRepository);
    execute(projectId: string, employeeId: string): Promise<EmployeeEntity>;
}
