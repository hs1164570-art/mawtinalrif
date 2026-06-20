"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";

// ─── Cloudinary Upload ────────────────────────────────────────────────────────
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env variables missing");
  }

  // 1. الضغط المحلي قبل الرفع (محافظين عليه لتسريع الرفع)
  const compressed = await imageCompression(file, {
    maxSizeMB: 1.5, // رفعناها لـ 1.5 عشان نضمن أعلى تفاصيل للموبيليات الفخمة قبل ما كلاوديناري تتعامل
    maxWidthOrHeight: 2000, // أبعاد مريحة جداً لعرض تفاصيل الـ Premium Furniture
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.9, // جودة بصرية أولية ممتازة
  });

  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("فشل رفع الصورة على Cloudinary");
  const data = await res.json();

  const rawUrl = data.secure_url as string;

  // 2. السحر كله هنا: حقن معاملات الأوبتمايزر الذكي جوه رابط كلاوديناري المرجوع
  // ده بيحول الرابط من شكل خام إلى شكل ديناميكي فوري مضغوط ومحول لـ WebP/AVIF تلقائياً
  const optimizedUrl = rawUrl.replace("/upload/", "/upload/f_auto,q_auto/");

  return optimizedUrl;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface SingleUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  multiple?: false;
  maxFiles?: never;
}

interface MultiUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple: true;
  maxFiles?: number;
  folder: string;
  label?: string;
}

type ImageUploaderProps = SingleUploaderProps | MultiUploaderProps;

// ─── Component ────────────────────────────────────────────────────────────────
export function ImageUploader(props: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const isMultiple = props.multiple === true;
  const currentValue =
    isMultiple ? (props.value as string[])
    : props.value ? [props.value as string]
    : [];
  const maxFiles = isMultiple ? (props.maxFiles ?? 10) : 1;
  const canAddMore = currentValue.length < maxFiles;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setError(null);
      setUploading(true);
      setUploadProgress(0);

      try {
        const remaining = maxFiles - currentValue.length;
        const filesToUpload = acceptedFiles.slice(0, remaining);
        const uploaded: string[] = [];

        for (let i = 0; i < filesToUpload.length; i++) {
          const url = await uploadToCloudinary(filesToUpload[i], props.folder);
          uploaded.push(url);
          setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
        }

        if (isMultiple) {
          const multiProps = props as MultiUploaderProps;
          multiProps.onChange([...currentValue, ...uploaded]);
        } else {
          const singleProps = props as SingleUploaderProps;
          singleProps.onChange(uploaded[0] ?? "");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [currentValue, maxFiles, props, isMultiple],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".avif",
        ".gif",
        ".jfif",
        ".svg",
        ".ico",
      ],
    },
    multiple: isMultiple,
    disabled: uploading || !canAddMore,
    maxFiles: maxFiles - currentValue.length,
    maxSize: 10 * 1024 * 1024,
  });

  const removeImage = (index: number) => {
    if (isMultiple) {
      const multiProps = props as MultiUploaderProps;
      multiProps.onChange(currentValue.filter((_, i) => i !== index));
    } else {
      (props as SingleUploaderProps).onChange("");
    }
  };

  // Dropzone border/bg are dynamic so we keep style for those
  const dropzoneBorder =
    isDragActive ? "#B89A5A"
    : error ? "#C4614A"
    : "#EDE5D8";
  const dropzoneBg =
    isDragActive ? "#FBF6EC"
    : uploading ? "#FAF7F2"
    : "#FDFAF7";

  return (
    <div>
      {/* ─── Dropzone ─────────────────────────────────────────── */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={`rounded-[12px] p-5 text-center transition-all duration-200 ${
            currentValue.length > 0 ? "mb-[0.875rem]" : ""
          } ${uploading ? "cursor-not-allowed" : "cursor-pointer"}`}
          style={{
            border: `2px dashed ${dropzoneBorder}`,
            background: dropzoneBg,
          }}
        >
          <input {...getInputProps()} aria-label={props.label} />
          <div className="flex flex-col items-center gap-2">
            {uploading ?
              <>
                <Loader2 size={28} color="#B89A5A" className="animate-spin" />
                <p className="text-[#B89A5A] font-semibold text-[0.875rem] m-0">
                  جاري الرفع... {uploadProgress}%
                </p>
                <div className="w-full max-w-[200px] h-1 bg-[#EDE5D8] rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B89A5A] to-[#8C7340] rounded transition-[width] duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[#A89585] text-[0.75rem] m-0">
                  يتم الضغط والرفع — لحظة من فضلك
                </p>
              </>
            : isDragActive ?
              <>
                <Upload size={28} color="#B89A5A" />
                <p className="text-[#B89A5A] font-semibold text-[0.875rem] m-0">
                  أفلت الصور هنا
                </p>
              </>
            : <>
                <div className="w-12 h-12 rounded-[12px] bg-[#F5EFE6] border-[1.5px] border-[#EDE5D8] flex items-center justify-center text-[#B89A5A]">
                  <ImageIcon size={22} />
                </div>
                <p className="text-[#3D2B1F] font-semibold text-[0.875rem] m-0">
                  {props.label ?? "اسحب وأفلت أو انقر للاختيار"}
                </p>
                <p className="text-[#A89585] text-[0.75rem] m-0">
                  JPG, PNG, WebP — حتى 10 ميجا • يُضغط تلقائيًا قبل الرفع
                </p>
                {isMultiple && (
                  <p className="text-[#A89585] text-[0.72rem] m-0">
                    {currentValue.length}/{maxFiles} صورة
                  </p>
                )}
              </>
            }
          </div>
        </div>
      )}

      {/* ─── Error ────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#FBF0EE] border border-[#E8C3BB] rounded-[8px] mb-[0.875rem]">
          <AlertCircle size={14} color="#C4614A" />
          <span className="text-[#C4614A] text-[0.8rem]">{error}</span>
        </div>
      )}

      {/* ─── Preview Grid ─────────────────────────────────────── */}
      {currentValue.length > 0 && (
        <div
          className="grid gap-[0.625rem]"
          style={{
            gridTemplateColumns:
              isMultiple ? "repeat(auto-fill, minmax(90px, 1fr))" : "1fr",
          }}
        >
          {currentValue.map((url, idx) => (
            <div
              key={url}
              className="relative rounded-[10px] overflow-hidden border-[1.5px] border-[#EDE5D8] bg-[#F5EFE6]"
              style={{ aspectRatio: isMultiple ? "1" : "16/9" }}
            >
              <Image
                quality={95}
                src={url}
                alt={`صورة ${idx + 1}`}
                fill
                sizes={isMultiple ? "120px" : "480px"}
                className="object-cover"
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-[5px] left-[5px] w-6 h-6 rounded-full border-none bg-[rgba(196,97,74,0.9)] text-white cursor-pointer flex items-center justify-center backdrop-blur-[4px]"
                aria-label={`حذف الصورة ${idx + 1}`}
              >
                <X size={12} />
              </button>
              {/* Main badge */}
              {idx === 0 && isMultiple && (
                <span className="absolute bottom-[5px] right-[5px] bg-[rgba(184,154,90,0.9)] text-[#FAF7F2] text-[0.6rem] font-bold px-1.5 py-[2px] rounded backdrop-blur-[4px]">
                  رئيسية
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
