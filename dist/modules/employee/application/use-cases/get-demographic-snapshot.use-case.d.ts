import { IEmployeeRepository } from '../../domain/repositories/employee.repository.interface';
import { IOrgNodeRepository } from '../../../organization/domain/repositories/org-node.repository.interface';
import { IDemographicSnapshot } from '../../domain/services/demographic-snapshot.compiler';
export declare class GetDemographicSnapshotUseCase {
    private employeeRepo;
    private orgNodeRepo?;
    constructor(employeeRepo: IEmployeeRepository, orgNodeRepo?: IOrgNodeRepository | undefined);
    execute(projectId: string, employeeId: string): Promise<IDemographicSnapshot>;
}
