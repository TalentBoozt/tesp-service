export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';
export interface IEmployeeProps {
    projectId: string;
    employeeId?: string;
    nodeId: string;
    matrixNodeIds?: string[];
    email?: string;
    fullName: string;
    phoneNumber?: string;
    status?: EmploymentStatus;
    attributes?: Record<string, any>;
    version?: number;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class EmployeeEntity {
    static EMPLOYEE_ID_REGEX: RegExp;
    static EMAIL_REGEX: RegExp;
    readonly projectId: string;
    readonly employeeId: string;
    private _nodeId;
    private _matrixNodeIds;
    private _email;
    private _fullName;
    private _phoneNumber?;
    private _status;
    private _attributes;
    private _version;
    private _isDeleted;
    readonly createdAt: Date;
    private _updatedAt;
    constructor(props: IEmployeeProps);
    get nodeId(): string;
    get matrixNodeIds(): string[];
    get email(): string;
    get fullName(): string;
    get phoneNumber(): string | undefined;
    get status(): EmploymentStatus;
    get attributes(): Record<string, any>;
    get version(): number;
    get isDeleted(): boolean;
    get updatedAt(): Date;
    updateDetails(params: {
        nodeId?: string;
        matrixNodeIds?: string[];
        email?: string;
        fullName?: string;
        phoneNumber?: string;
        status?: EmploymentStatus;
        attributes?: Record<string, any>;
    }): void;
    terminate(): void;
    markAsDeleted(): void;
    toDemographicSnapshot(ancestorPaths?: string): {
        compiledAt: string;
        ancestorPaths?: string | undefined;
        employeeId: string;
        projectId: string;
        nodeId: string;
        matrixNodeIds: string[];
        attributes: {
            [x: string]: any;
        };
    };
    toJSON(): {
        projectId: string;
        employeeId: string;
        nodeId: string;
        matrixNodeIds: string[];
        email: string;
        fullName: string;
        phoneNumber: string | undefined;
        status: EmploymentStatus;
        attributes: Record<string, any>;
        version: number;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}
