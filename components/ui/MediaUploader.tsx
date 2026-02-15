import React, { useState, useRef } from "react";
import { Upload, X, File, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./Button";
import Loader from "./Loader";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  progress?: number;
  error?: string;
}

interface MediaUploaderProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onUpload?: (files: { file: File; id: string }[]) => Promise<void>;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  className?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  accept = "image/*",
  multiple = true,
  maxSize = 10,
  maxFiles = 10,
  files,
  onFilesChange,
  onUpload,
  onUploadStart,
  onUploadEnd,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (newFiles: File[]) => {
    // Validate files
    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        console.error(`File ${file.name} is too large`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      console.error(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    // Create file objects with progress
    const fileObjects: UploadedFile[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      progress: 0,
    }));

    onFilesChange([...files, ...fileObjects]);

    // Simulate upload progress
    if (onUpload) {
      setUploading(true);
      onUploadStart?.();
      try {
        await onUpload(fileObjects.map((obj, i) => ({ file: validFiles[i], id: obj.id })));
      } catch (error) {
        // Update files to show error
        onFilesChange([...files, ...fileObjects.map((f) => ({ ...f, error: "Upload failed" }))]);
        console.error("Upload failed", error);
      } finally {
        setUploading(false);
        onUploadEnd?.();
      }
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter((f) => f.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && <label className="block text-sm font-medium text-neutral-700">{label}</label>}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-primary-400 bg-primary-50"
            : "hover:border-primary-400 hover:bg-primary-50 border-neutral-300",
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
        <p className="mb-2 text-neutral-600">Drag & drop files here, or click to browse</p>
        <p className="text-sm text-neutral-500">
          {accept.includes("image") ? "images" : "Files"} up to {maxSize}MB each
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center space-x-3 rounded-lg bg-neutral-50 p-3">
              {/* File Icon/Thumbnail */}
              <div className="flex-shrink-0">
                {file.type.startsWith("image/") ? (
                  <div className="h-10 w-10 overflow-hidden rounded bg-neutral-200">
                    <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-200">
                    <File className="h-5 w-5 text-neutral-500" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">{file.name}</p>
                <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>

                {/* Progress Bar */}
                {typeof file.progress === "number" && file.progress < 100 && (
                  <div className="mt-1">
                    <div className="h-1 w-full rounded-full bg-neutral-200">
                      <div
                        className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {file.error && (
                  <div className="mt-1 flex items-center space-x-1">
                    <AlertCircle className="text-destructive-500 h-3 w-3" />
                    <p className="text-destructive-600 text-xs">{file.error}</p>
                  </div>
                )}
              </div>

              {/* Status/Actions */}
              <div className="flex-shrink-0">
                {typeof file.progress === "number" && file.progress < 100 && !file.error && (
                  <Loader size="sm" />
                )}
                {file.progress === 100 && (
                  <div className="bg-success-100 flex h-5 w-5 items-center justify-center rounded-full">
                    <div className="bg-success-600 h-2 w-2 rounded-full" />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="text-primary-600 flex items-center space-x-2 text-sm">
          <Loader size="sm" />
          <span>Uploading files...</span>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
