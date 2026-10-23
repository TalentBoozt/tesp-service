import { IProjectRepository } from '../../../project-config/domain/repositories/project.repository.interface';
export interface HydratedBranding {
    companyName: string;
    logoUrl: string;
    primaryColorHex: string;
    secondaryColorHex: string;
    fontFamily: string;
    footerText: string;
}
export declare class BrandHydratorService {
    private projectRepo?;
    constructor(projectRepo?: IProjectRepository | undefined);
    hydrateBranding(projectId: string): Promise<HydratedBranding>;
}
