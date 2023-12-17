
import mongoose from 'mongoose';

// Feedback Config
const ImageSchema = new mongoose.Schema({
    imageName: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageSize: { type: Number, required: true },
    imagePublicId: { type: String, required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

export const ImageModel = mongoose.model('Image', ImageSchema);

// Feedback Actions
export const getImageById = (id: string) => ImageModel.findById(id).populate('user'); 
export const addImage = (values: Record<string, any>) => new ImageModel(values).save().then((image) => image.toObject());
export const deleteImageById = (id: string) => ImageModel.findOneAndDelete({ _id: id });
export const updateImageById = (id: string, values: Record<string, any>) => ImageModel.findByIdAndUpdate(id, values);
export const getImagesByUserId = (userId: string) => ImageModel.find({ user: userId }).sort({ _id: -1 })
export const getImagesByFolderId = (folderId: string) => ImageModel.find({ folder: folderId }).sort({ _id: -1 })
export const deleteImagesByFolderId = (folderId: string) => ImageModel.deleteMany({ folder: folderId });

export const getImagesByUserIdAndFolder = async (userId: string, folderId: string) => {
  try {
    const userImages = await ImageModel.find({ user: userId, folder: folderId });
    return userImages;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
