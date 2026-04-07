import React from "react";
import { Loader } from "lucide-react";
import MediaUploader from "../ui/MediaUploader";
import { MemoryFormData } from "./types";

interface MemoryMediaTabProps {
  formData: MemoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<MemoryFormData>>;
  handleUpload: (
    uploadPairs: { file: File; id: string }[],
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    signal?: AbortSignal,
  ) => Promise<void>;
  imageUploading: boolean;
  setImageUploading: (uploading: boolean) => void;
}

export default function MemoryMediaTab({
  formData,
  setFormData,
  handleUpload,
  imageUploading,
  setImageUploading,
}: MemoryMediaTabProps) {
  return (
    <div className="p-5">
      <div className="mb-3">
        <p className="text-sm font-semibold text-neutral-700">Photos & Videos</p>
        <p className="text-xs text-neutral-400">Add visuals to bring your memory to life.</p>
      </div>
      <MediaUploader
        label=""
        accept="image/*,video/*"
        multiple={true}
        files={formData.images}
        onFilesChange={(uploadedFiles) =>
          setFormData((prev) => ({ ...prev, images: uploadedFiles }))
        }
        onUpload={handleUpload}
        onUploadStart={() => setImageUploading(true)}
        onUploadEnd={() => setImageUploading(false)}
      />
      {imageUploading && (
        <p className="mt-3 flex items-center space-x-1.5 text-xs text-neutral-500">
          <Loader size={12} className="animate-spin" />
          <span>Uploading your images securely...</span>
        </p>
      )}
    </div>
  );
}
