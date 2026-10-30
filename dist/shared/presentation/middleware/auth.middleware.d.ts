import { Request, Response, NextFunction } from 'express';
export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    PROJECT_ADMIN = "PROJECT_ADMIN",
    CONSULTANT = "CONSULTANT",
    CONSULTANT_DAASH = "CONSULTANT_DAASH",
    ORG_ADMIN = "ORG_ADMIN",
    HR_MANAGER = "HR_MANAGER",
    DEPARTMENT_MANAGER = "DEPARTMENT_MANAGER",
    SURVEY_AUTHOR = "SURVEY_AUTHOR",
    REPORT_VIEWER = "REPORT_VIEWER",
    SURVEY_RESPONDENT = "SURVEY_RESPONDENT"
}
export interface AuthenticatedUser {
    userId: string;
    role: UserRole;
    projectId?: string;
    name?: string;
    mustChangePassword?: boolean;
    email?: string;
    employeeId?: string;
    authorizedProjectIds?: string[];
    firmId?: string;
    firmName?: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}
export declare const ROLE_ALIASES: Record<string, UserRole>;
export declare function normalizeUserRole(role: string): UserRole;
export declare function generateToken(payload: AuthenticatedUser): string;
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
export declare function authorize(allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
export declare function enforceProjectScope(req: Request, res: Response, next: NextFunction): void;
