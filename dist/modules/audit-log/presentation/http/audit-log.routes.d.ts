import { Router } from 'express';
import { AuditLogService } from '../../application/services/audit-log.service';
export declare function createAuditLogRouter(service?: AuditLogService): Router;
