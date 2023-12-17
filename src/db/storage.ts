import mongoose from 'mongoose';

const storageSchema = new mongoose.Schema({
    totalStorage: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

export const StorageModel = mongoose.model('Storage', storageSchema);

//Actions
export const getStorageById = (id: string) => StorageModel.findById(id);
export const addNewStorage = (values: Record<string, any>) => new StorageModel(values).save().then((user) => user.toObject());
export const getStorageByUserId = (userId: string) => StorageModel.find({ user: userId }).sort({ _id: -1 });
export const updateStorageById = (id: string, values: Record<string, any>) => StorageModel.findByIdAndUpdate(id, values);


