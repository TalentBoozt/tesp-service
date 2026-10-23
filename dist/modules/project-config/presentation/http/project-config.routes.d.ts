import { Router } from 'express';
import { ProjectMongoRepository } from '../../infrastructure/persistence/mongoose/project.repository';
import { ProjectRedisCache } from '../../infrastructure/cache/project-cache.repository';
export declare function createProjectConfigRouter(repo?: ProjectMongoRepository, cacheRepo?: ProjectRedisCache): Router;
