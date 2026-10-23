import { EmployeeEntity } from '../entities/employee.entity';
export interface IDemographicSnapshot {
    employeeId: string;
    projectId: string;
    nodeId: string;
    matrixNodeIds: string[];
    attributes: Record<string, any>;
    ancestorPaths?: string;
    compiledAt: string;
}
export declare class DemographicSnapshotCompiler {
    /**
     * Compiles an immutable demographic snapshot payload for survey response intake.
     * Strips out all PII fields (email, fullName, phoneNumber) and includes org node ancestor paths.
     */
    static compile(employee: EmployeeEntity, ancestorPaths?: string): IDemographicSnapshot;
}
