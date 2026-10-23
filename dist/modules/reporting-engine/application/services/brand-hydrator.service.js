"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandHydratorService = void 0;
class BrandHydratorService {
    projectRepo;
    constructor(projectRepo) {
        this.projectRepo = projectRepo;
    }
    async hydrateBranding(projectId) {
        if (this.projectRepo) {
            const proj = await this.projectRepo.findByProjectId(projectId);
            if (proj && proj.branding) {
                return {
                    companyName: proj.name,
                    logoUrl: proj.branding.logoUrl || 'https://tesp.talnova.io/assets/default-logo.png',
                    primaryColorHex: proj.branding.primaryColor || '#1E40AF',
                    secondaryColorHex: proj.branding.secondaryColor || '#3B82F6',
                    fontFamily: 'Inter, Roboto, sans-serif',
                    footerText: `Confidential Enterprise Engagement Report — ${proj.name}`,
                };
            }
        }
        return {
            companyName: 'Talnova Enterprise',
            logoUrl: 'https://tesp.talnova.io/assets/default-logo.png',
            primaryColorHex: '#1E40AF',
            secondaryColorHex: '#3B82F6',
            fontFamily: 'Inter, Roboto, sans-serif',
            footerText: 'Confidential Enterprise Engagement Report — Talnova Platform',
        };
    }
}
exports.BrandHydratorService = BrandHydratorService;
//# sourceMappingURL=brand-hydrator.service.js.map