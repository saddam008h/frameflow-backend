"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTokenByTokenValue = exports.deleteTokenByUserId = exports.getTokenByTokenValue = exports.getTokenByUserId = exports.createToken = exports.TokenModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Token Config
const TokenSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
exports.TokenModel = mongoose_1.default.model('Token', TokenSchema);
// Token Actions
const createToken = (values) => new exports.TokenModel(values).save().then((token) => token.toObject());
exports.createToken = createToken;
const getTokenByUserId = (userId) => exports.TokenModel.findOne({ userId });
exports.getTokenByUserId = getTokenByUserId;
const getTokenByTokenValue = (tokenValue) => exports.TokenModel.findOne({ token: tokenValue });
exports.getTokenByTokenValue = getTokenByTokenValue;
const deleteTokenByUserId = (userId) => exports.TokenModel.findOneAndDelete({ userId });
exports.deleteTokenByUserId = deleteTokenByUserId;
const deleteTokenByTokenValue = (tokenValue) => exports.TokenModel.findOneAndDelete({ token: tokenValue });
exports.deleteTokenByTokenValue = deleteTokenByTokenValue;
//# sourceMappingURL=tokens.js.map