import mongoose from 'mongoose';

// Token Config
const TokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const TokenModel = mongoose.model('Token', TokenSchema);

// Token Actions
export const createToken = (values: Record<string,any>) => new TokenModel(values).save().then((token) => token.toObject());
export const getTokenByUserId = (userId: string) => TokenModel.findOne({ userId });
export const getTokenByTokenValue = (tokenValue: string) => TokenModel.findOne({ token: tokenValue });
export const deleteTokenByUserId = (userId: string) => TokenModel.findOneAndDelete({ userId });
export const deleteTokenByTokenValue = (tokenValue: string) => TokenModel.findOneAndDelete({ token: tokenValue });
