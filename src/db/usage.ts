import mongoose from 'mongoose';


const usageSchema = new mongoose.Schema({
    totalUsage: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

export const UsageModel = mongoose.model('Usage', usageSchema);

//Actions
export const getUsageById = (id: string) => UsageModel.findById(id);
export const addNewUsage = (values: Record<string, any>) => new UsageModel(values).save().then((user) => user.toObject());
export const getUsageByUserId = (userId: string) => UsageModel.find({ user: userId }).sort({ _id: -1 });
export const updateUsageById = (id: string, values: Record<string, any>) => UsageModel.findByIdAndUpdate(id, values);


