"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStorageById = exports.getStorageByUserId = exports.addNewStorage = exports.getStorageById = exports.StorageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const storageSchema = new mongoose_1.default.Schema({
    totalStorage: { type: Number, required: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});
exports.StorageModel = mongoose_1.default.model('Storage', storageSchema);
//Actions
const getStorageById = (id) => exports.StorageModel.findById(id);
exports.getStorageById = getStorageById;
const addNewStorage = (values) => new exports.StorageModel(values).save().then((user) => user.toObject());
exports.addNewStorage = addNewStorage;
const getStorageByUserId = (userId) => exports.StorageModel.find({ user: userId }).sort({ _id: -1 });
exports.getStorageByUserId = getStorageByUserId;
const updateStorageById = (id, values) => exports.StorageModel.findByIdAndUpdate(id, values);
exports.updateStorageById = updateStorageById;
//# sourceMappingURL=storage.js.map