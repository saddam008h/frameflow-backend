import mongoose from 'mongoose';

// Feedback Config
const FolderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    parent: { type: String, required:true, default:"root" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export const FolderModel = mongoose.model('Folder', FolderSchema);

// Feedback Actions
export const getFolders = () => FolderModel.find().sort({ _id: -1 });
export const getFolderById = (id: string) => FolderModel.findById(id); 
export const createFolder = (values: Record<string, any>) => new FolderModel(values).save().then((folder) => folder.toObject());
export const deleteFolderById = (id: string) => FolderModel.findOneAndDelete({ _id: id });
export const updateFolderById = (id: string, values: Record<string, any>) => FolderModel.findByIdAndUpdate(id, values);
export const getFoldersByUserId = (userId: string) => FolderModel.find({ user: userId }).sort({ _id: -1 })

export const getFolderAncestorsById = async (folderId: string) => {
  const ancestors = [];

  let currentFolder = await FolderModel.findById(folderId);

  while (currentFolder && currentFolder.parent !== 'root itselft') {
    currentFolder = await FolderModel.findById(currentFolder.parent);
    if (currentFolder) {
      ancestors.unshift(currentFolder); // Add current folder to the beginning of the array
    }
  }

  return ancestors;
};

export const getFoldersByUserIdAndParent = async (userId: string, parentId: string) => {
  try {
    const userFolders = await FolderModel.find({ user: userId, parent: parentId });
    return userFolders;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// get Root Folder by user id
export const getRootFolderByUserId = async (userId: string) => {
  try {
    const rootFolder = await FolderModel.find({ user: userId, name: 'Root' });
    return rootFolder;
  } catch (error) {
    console.error(error);
    throw error;
  }
};