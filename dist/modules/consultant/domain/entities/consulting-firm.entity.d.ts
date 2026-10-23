export type ConsultingFirmTier = 'ENTERPRISE' | 'BOUTIQUE' | 'INTERNAL';
export interface IConsultingFirmProps {
    firmId: string;
    name: string;
    slug?: string;
    contactEmail: string;
    tier?: ConsultingFirmTier;
    assignedProjectIds?: string[];
    consultantUserIds?: string[];
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class ConsultingFirmEntity {
    static FIRM_ID_REGEX: RegExp;
    static EMAIL_REGEX: RegExp;
    readonly firmId: string;
    private _name;
    private _slug;
    private _contactEmail;
    private _tier;
    private _assignedProjectIds;
    private _consultantUserIds;
    private _isActive;
    readonly createdAt: Date;
    private _updatedAt;
    constructor(props: IConsultingFirmProps);
    get name(): string;
    get slug(): string;
    get contactEmail(): string;
    get tier(): ConsultingFirmTier;
    get assignedProjectIds(): string[];
    get consultantUserIds(): string[];
    get isActive(): boolean;
    get updatedAt(): Date;
    assignProject(projectId: string): void;
    unassignProject(projectId: string): void;
    setAssignedProjects(projectIds: string[]): void;
    addConsultantUser(userId: string): void;
    removeConsultantUser(userId: string): void;
    isAssignedToProject(projectId: string): boolean;
    updateProfile(name: string, contactEmail: string, tier?: ConsultingFirmTier): void;
    deactivate(): void;
    activate(): void;
    toJSON(): Record<string, any>;
}
