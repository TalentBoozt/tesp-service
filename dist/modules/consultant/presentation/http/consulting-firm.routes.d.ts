import { Router } from 'express';
import { MongoConsultingFirmRepository } from '../../infrastructure/persistence/mongoose/mongo-consulting-firm.repository';
export declare function createConsultingFirmRouter(firmRepo?: MongoConsultingFirmRepository): Router;
