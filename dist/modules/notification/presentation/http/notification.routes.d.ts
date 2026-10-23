import { Router } from 'express';
import { INotificationRepository } from '../../domain/repositories/notification.repository.interface';
import { NotificationService } from '../../infrastructure/services/notification.service';
export declare function createNotificationRouter(repo?: INotificationRepository, service?: NotificationService): Router;
