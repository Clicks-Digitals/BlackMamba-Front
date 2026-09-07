"use client";

import { useRef, useState, ChangeEvent, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Upload, X, FileText } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  name: string;
  label?: string;
  error?: string;
  defaultValue?: string | null;
  className?: string;
  accept?: string;
}

export function FileUpload({
  name,
  label,
  error,
  defaultValue,
  className,
  accept = "image/*"
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const form = fileInputRef.current?.closest("form");
    if (!form || !selectedFile) return;

    const handleFormData = (e: FormDataEvent) => {
      if (selectedFile) {
        e.formData.set(name, selectedFile);
      }
    };

    form.addEventListener("formdata", handleFormData);
    return () => form.removeEventListener("formdata", handleFormData);
  }, [selectedFile, name]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-medium text-[#FFFFFF]">{label}</label>}

      <div
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all",
          "overflow-hidden border-[#000000] bg-[#000000]",
          "hover:border-[#EB0B1A]/50 hover:bg-white/4",
          error && "border-primary/40",
          preview ? "aspect-video h-48" : "h-32"
        )}
        onClick={handleClick}
      >
        {preview ? (
          <>
            <Image src={preview} alt="Preview" fill className="object-contain p-2" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-full bg-black/50 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                Change File
              </span>
            </div>
          </>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-2 p-4">
            <div className="rounded-full bg-[#EB0B1A]/15 p-3 text-[#EB0B1A]">
              <FileText className="h-6 w-6" />
            </div>
            <p className="max-w-[200px] truncate text-sm font-medium text-[#FFFFFF]">{fileName}</p>
            <span className="text-xs text-white/40">Click to change</span>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-white/8 p-3 text-white/40 transition-colors group-hover:text-[#EB0B1A]">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#FFFFFF]">Click to upload</p>
              <p className="mt-1 text-xs text-white/40">Images or Documents</p>
            </div>
          </>
        )}

        <input
          type="file"
          name={preview || fileName ? name : undefined}
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
        {!preview && !fileName && <input type="hidden" name={name} value="" />}
      </div>

      {preview && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="mt-1 flex w-fit items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary"
        >
          <X className="h-3.5 w-3.5" />
          Remove File
        </button>
      )}

      {error && <p className="mt-1 text-xs font-medium text-primary">{error}</p>}
    </div>
  );
}
