import { IEmployeeRepository } from '../../domain/repositories/employee.repository.interface';
export interface UpdateHrisConfigDto {
    provider: 'WORKDAY' | 'BAMBOOHR' | 'SAP_SUCCESSFACTORS' | 'OTHER';
    tenantUrl: string;
    clientId?: string;
    clientSecret?: string;
    syncSchedule?: 'HOURLY' | 'NIGHTLY' | 'WEEKLY' | 'MANUAL';
}
export declare class ManageHrisConfigUseCase {
    private employeeRepository;
    constructor(employeeRepository?: IEmployeeRepository);
    getConfig(projectId: string): Promise<{
        provider: "WORKDAY" | "BAMBOOHR" | "SAP_SUCCESSFACTORS" | "OTHER";
        tenantUrl: string;
        clientId: string;
        syncSchedule: "HOURLY" | "NIGHTLY" | "WEEKLY" | "MANUAL";
        lastSyncAt: string | undefined;
        syncedCount: number | undefined;
        status: "PAUSED" | "CONNECTED" | "ERROR";
    } | null>;
    updateConfig(projectId: string, dto: UpdateHrisConfigDto): Promise<{
        provider: "WORKDAY" | "BAMBOOHR" | "SAP_SUCCESSFACTORS" | "OTHER";
        tenantUrl: string;
        clientId: string;
        syncSchedule: "HOURLY" | "NIGHTLY" | "WEEKLY" | "MANUAL";
        lastSyncAt: string | undefined;
        syncedCount: number | undefined;
        status: "PAUSED" | "CONNECTED" | "ERROR";
    }>;
    triggerSync(projectId: string, dto?: Partial<UpdateHrisConfigDto>): Promise<{
        success: boolean;
        syncedCount: number;
        created: number;
        updated: number;
        failed: number;
        lastSyncAt: string;
        provider: "WORKDAY" | "BAMBOOHR" | "SAP_SUCCESSFACTORS" | "OTHER";
        status: string;
    }>;
}
