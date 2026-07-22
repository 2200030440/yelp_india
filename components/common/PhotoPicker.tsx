"use client";

// components/common/PhotoPicker.tsx
// Comprehensive Photo Selection Component with:
//  - 📷 Camera capture mode (direct device camera launch)
//  - 📁 Gallery file browser (drag & drop or click)
//  - 🔗 Optional image URL tab
//  - Instant visual preview with remove & edit actions

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { Camera, Image as ImageIcon, Link as LinkIcon, X, Check, Upload, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoPickerProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function PhotoPicker({
  value = "",
  onChange,
  label = "Photo",
  placeholder = "Upload from gallery or take a photo...",
  className,
}: PhotoPickerProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "camera" | "url">("gallery");
  const [urlInput, setUrlInput] = useState(value);
  const [isUploading, setIsUploading] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle local file selection (Gallery or Camera)
  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Generate local preview data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          onChange(dataUrl);
          setUrlInput("");
        }

        // 2. Optional background upload to Cloudinary API if configured
        try {
          const sigRes = await fetch("/api/upload", { method: "POST" });
          if (sigRes.ok) {
            const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", folder);

            const uploadRes = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              { method: "POST", body: formData },
            );
            if (uploadRes.ok) {
              const cloudData = await uploadRes.json();
              if (cloudData.secure_url) {
                onChange(cloudData.secure_url);
              }
            }
          }
        } catch {
          /* Fallback to data URL */
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center justify-between">
          <span>{label}</span>
          {value && (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="h-3 w-3" /> Photo Attached
            </span>
          )}
        </label>
      )}

      {/* Hidden Native File Inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* If Photo is selected -> Show Interactive Preview */}
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-50/20 p-3 transition-all">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-sm border border-zinc-200">
              <Image
                src={value}
                alt="Selected preview"
                fill
                className="object-cover"
                unoptimized={value.startsWith("data:")}
              />
            </div>

            <div className="flex flex-1 flex-col gap-1.5 min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">Image Ready</p>
              <p className="text-[11px] text-zinc-500 truncate">
                {value.startsWith("data:") ? "Camera / Local Upload" : value}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Change
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Action Picker Box */
        <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all",
                activeTab === "gallery"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Gallery</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("camera")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all",
                activeTab === "camera"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              <Camera className="h-3.5 w-3.5 text-red-600" />
              <span>Take Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all",
                activeTab === "url"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800",
              )}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Web Link</span>
            </button>
          </div>

          {/* Action Contents */}
          <div className="mt-3">
            {activeTab === "gallery" && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isUploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-5 transition-all hover:border-red-400 hover:bg-red-50/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-zinc-800">
                    {isUploading ? "Processing photo..." : "Upload from Gallery"}
                  </p>
                  <p className="text-[11px] text-zinc-400">PNG, JPG, WebP up to 10MB</p>
                </div>
              </button>
            )}

            {activeTab === "camera" && (
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isUploading}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-red-200 bg-red-50/30 py-5 transition-all hover:border-red-500 hover:bg-red-50/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
                  <Camera className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-red-900">Open Device Camera</p>
                  <p className="text-[11px] text-red-700/70">Snap food or ambiance photo directly</p>
                </div>
              </button>
            )}

            {activeTab === "url" && (
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={placeholder || "Paste image URL (https://...)"}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-red-500 font-medium"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
