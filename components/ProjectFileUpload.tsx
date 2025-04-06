"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ProjectFileUploadProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: string;
}

const ProjectFileUpload = ({
  onFileUpload,
  acceptedFileTypes = ".pdf,.docx,.pptx,.zip",
}: ProjectFileUploadProps) => {
  const [fileName, setFileName] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      onFileUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onFileUpload(file);
    }
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer transition-colors ${
          dragActive ? "border-primary-500 bg-primary-50/10" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        role="button"
        aria-label="Upload project file"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          id="project-file-upload"
          name="project-file"
          type="file"
          className="hidden"
          accept={acceptedFileTypes}
          onChange={handleChange}
          aria-label="Upload project file input"
          title="Upload your project documentation"
        />
        <Image
          src="/upload.svg"
          alt="Upload"
          width={40}
          height={40}
          className="mb-2"
        />
        {fileName ? (
          <p className="text-sm text-primary-100">{fileName}</p>
        ) : (
          <>
            <p className="text-sm text-primary-100">Upload your project file</p>
            <p className="text-xs text-gray-400 mt-1">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports: PDF, DOCX, PPTX, ZIP
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectFileUpload;
