"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const maxAge = parseFloat(process.env.MAX_AGE_JWT_DAYS) * 24 * 60 * 60; //days
const generateToken = (data) => {
    return jsonwebtoken_1.default.sign(data, process.env.JWTPRIVATEKEY, {
        expiresIn: maxAge,
    });
};
exports.generateToken = generateToken;
//# sourceMappingURL=generateToken.js.map