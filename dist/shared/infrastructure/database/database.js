"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../../../config");
class Database {
    static isConnected = false;
    static async connect(uri) {
        if (this.isConnected && mongoose_1.default.connection.readyState === 1) {
            return mongoose_1.default;
        }
        const mongoUri = uri || config_1.config.mongoDbUri;
        const conn = await mongoose_1.default.connect(mongoUri);
        this.isConnected = true;
        return conn;
    }
    static async disconnect() {
        if (this.isConnected) {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
        }
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map