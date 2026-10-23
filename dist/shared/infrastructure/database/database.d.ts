import mongoose from 'mongoose';
export declare class Database {
    private static isConnected;
    static connect(uri?: string): Promise<typeof mongoose>;
    static disconnect(): Promise<void>;
}
