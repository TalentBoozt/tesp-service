import { IOrgNodeRepository } from '../../domain/repositories/org-node.repository.interface';
import { OrgNodeEntity } from '../../domain/entities/org-node.entity';
import { IEmployeeRepository } from '../../../employee/domain/repositories/employee.repository.interface';
export declare class GetSubTreeUseCase {
    private repository;
    private employeeRepo?;
    constructor(repository: IOrgNodeRepository, employeeRepo?: IEmployeeRepository);
    execute(projectId: string, nodeId: string): Promise<OrgNodeEntity[]>;
}
