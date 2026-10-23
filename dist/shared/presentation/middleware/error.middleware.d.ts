import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    type: string;
    details?: any | undefined;
    constructor(statusCode: number, message: string, type?: string, details?: any | undefined);
}
export declare function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void;
