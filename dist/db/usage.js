"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsageById = exports.getUsageByUserId = exports.addNewUsage = exports.getUsageById = exports.UsageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const usageSchema = new mongoose_1.default.Schema({
    totalUsage: { type: Number, required: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});
exports.UsageModel = mongoose_1.default.model('Usage', usageSchema);
//Actions
const getUsageById = (id) => exports.UsageModel.findById(id);
exports.getUsageById = getUsageById;
const addNewUsage = (values) => new exports.UsageModel(values).save().then((user) => user.toObject());
exports.addNewUsage = addNewUsage;
const getUsageByUserId = (userId) => exports.UsageModel.find({ user: userId }).sort({ _id: -1 });
exports.getUsageByUserId = getUsageByUserId;
const updateUsageById = (id, values) => exports.UsageModel.findByIdAndUpdate(id, values);
exports.updateUsageById = updateUsageById;
//# sourceMappingURL=usage.js.map