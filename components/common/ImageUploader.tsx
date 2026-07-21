"use client";

// components/common/ImageUploader.tsx
// Full-featured drag-and-drop image uploader with:
//  - Cloudinary direct signed upload (no file touches our server)
//  - File validation (type + size)
//  - Preview thumbnails with progress bars
//  - Remove button per-image
//  - Callback: onUploadComplete(photos[])

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────

interface UploadedPhoto {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

export interface ImageUploaderProps {
  /** Folder to upload into, e.g. "yelp-india/places" */
  folder?: string;
  /** Max number of photos allowed */
  maxFiles?: number;
  /** Called when all queued files finish uploading */
  onUploadComplete?: (photos: UploadedPhoto[]) => void;
  /** Initial photos (edit mode) */
  initialPhotos?: UploadedPhoto[];
  className?: string;
}

// ── Internal state for each file in the queue ─────────────────────────────

type UploadStatus = "queued" | "uploading" | "done" | "error";

interface FileEntry {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  result?: UploadedPhoto;
}

// ── Constants ─────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ── Component ─────────────────────────────────────────────────────────────

export default function ImageUploader({
  folder = "yelp-india/places",
  maxFiles = 10,
  onUploadComplete,
  initialPhotos = [],
  className,
}: ImageUploaderProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedPhotos] = useState<UploadedPhoto[]>(initialPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = files.some((f) => f.status === "uploading");

  // ── File validation ──────────────────────────────────────────────────────

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Unsupported file type. Please use JPEG, PNG, WebP, or GIF.";
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`;
    }
    return null;
  }

  // ── Add files to queue ───────────────────────────────────────────────────

  function addFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    const currentCount = files.filter(
      (f) => f.status !== "error",
    ).length;
    const remaining = maxFiles - currentCount;
    if (remaining <= 0) return;

    const newEntries: FileEntry[] = [];

    Array.from(selectedFiles)
      .slice(0, remaining)
      .forEach((file) => {
        const error = validateFile(file);
        newEntries.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          status: error ? "error" : "queued",
          progress: 0,
          error: error ?? undefined,
        });
      });

    setFiles((prev) => [...prev, ...newEntries]);
  }

  // ── Cloudinary signed upload ─────────────────────────────────────────────

  async function uploadFile(entry: FileEntry): Promise<UploadedPhoto | null> {
    try {
      // 1. Get signed params from our API
      const sigRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (!sigRes.ok) throw new Error("Could not get upload signature");
      const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", entry.file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append(
        "transformation",
        "c_limit,w_1920,h_1080,q_auto:good,f_auto",
      );

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData },
      );

      if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
      const data = await uploadRes.json();

      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
      };
    } catch (err) {
      console.error("[ImageUploader] upload error:", err);
      return null;
    }
  }

  // ── Upload all queued files ──────────────────────────────────────────────

  async function handleUploadAll() {
    const queued = files.filter((f) => f.status === "queued");
    if (!queued.length) return;

    const completed: UploadedPhoto[] = [];

    for (const entry of queued) {
      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id ? { ...f, status: "uploading", progress: 10 } : f,
        ),
      );

      // Animate progress (indeterminate)
      const ticker = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id && f.status === "uploading"
              ? { ...f, progress: Math.min(f.progress + 15, 85) }
              : f,
          ),
        );
      }, 400);

      const result = await uploadFile(entry);
      clearInterval(ticker);

      if (result) {
        // Save to DB
        try {
          await fetch("/api/photos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...result, folder }),
          });
        } catch {
          /* non-critical */
        }

        completed.push(result);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "done", progress: 100, result }
              : f,
          ),
        );
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "error", progress: 0, error: "Upload failed" }
              : f,
          ),
        );
      }
    }

    if (completed.length && onUploadComplete) {
      onUploadComplete([...uploadedPhotos, ...completed]);
    }
  }

  // ── Remove file from queue ───────────────────────────────────────────────

  function removeFile(id: string) {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry?.preview) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  // ── Drag handlers ────────────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const queuedCount = files.filter((f) => f.status === "queued").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") &&
          fileInputRef.current?.click()
        }
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200",
          isDragging
            ? "border-red-500 bg-red-50 scale-[1.01]"
            : "border-zinc-300 bg-zinc-50 hover:border-red-400 hover:bg-red-50/50",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        <div
          className={cn(
            "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
            isDragging ? "bg-red-100" : "bg-zinc-100",
          )}
        >
          <ImagePlus
            className={cn(
              "h-7 w-7 transition-colors",
              isDragging ? "text-red-600" : "text-zinc-400",
            )}
          />
        </div>

        <p className="text-sm font-semibold text-zinc-700">
          {isDragging
            ? "Release to add photos"
            : "Drag & drop photos here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          JPEG, PNG, WebP or GIF · Max {MAX_FILE_SIZE_MB} MB per file · Up to{" "}
          {maxFiles} photos
        </p>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((entry) => (
            <div
              key={entry.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
            >
              <Image
                src={entry.preview}
                alt="Upload preview"
                fill
                className="object-cover"
                unoptimized
              />

              {/* Status overlay */}
              {entry.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                  <div className="mt-2 h-1 w-3/4 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-300"
                      style={{ width: `${entry.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {entry.status === "done" && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/80">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
              )}

              {entry.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-600/80 p-2">
                  <AlertCircle className="h-6 w-6 text-white" />
                  <p className="text-center text-[10px] font-semibold text-white leading-tight">
                    {entry.error}
                  </p>
                </div>
              )}

              {/* Remove button (not shown while uploading) */}
              {entry.status !== "uploading" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(entry.id);
                  }}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {queuedCount > 0 && (
        <Button
          onClick={handleUploadAll}
          disabled={isUploading}
          className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload {queuedCount} photo{queuedCount > 1 ? "s" : ""}
            </>
          )}
        </Button>
      )}

      {doneCount > 0 && queuedCount === 0 && !isUploading && (
        <p className="text-center text-sm font-medium text-emerald-600">
          ✓ {doneCount} photo{doneCount > 1 ? "s" : ""} uploaded successfully
        </p>
      )}
    </div>
  );
}
