import { Request, Response, NextFunction } from 'express';
import { MongoConsultingFirmRepository } from '../../infrastructure/persistence/mongoose/mongo-consulting-firm.repository';
export declare function createConsultantTenantGuard(firmRepo?: MongoConsultingFirmRepository): (req: Request, res: Response, next: NextFunction) => Promise<void>;
