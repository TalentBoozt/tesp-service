import { Router } from 'express';
import { OrgNodeMongoRepository } from '../../infrastructure/persistence/mongoose/org-node.repository';
export declare function createOrgNodeRouter(repo?: OrgNodeMongoRepository): Router;
