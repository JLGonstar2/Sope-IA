import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons/UploadIcon';
import type { ImageState } from '../services/geminiService';

interface ImageUploaderProps {
  onImageUpload: (image: ImageState) => void;
  isDisabled: boolean;
}

const ACCEPTED_FILES = {
  'image/jpeg': [],
  'image/png': [],
  'image/webp': [],
  'image/heic': [],
  'image/heif': [],
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, isDisabled }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    if (file.size > 4 * 1024 * 1024) { // 4MB limit for inline data
        setError("El archivo es muy grande. Sube una imagen de menos de 4MB.");
        return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          } else {
            reject(new Error('No se pudo leer el archivo como base64.'));
          }
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
      onImageUpload({ base64, mimeType: file.type });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar la imagen.');
    }

  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILES,
    multiple: false,
    disabled: isDisabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full max-w-2xl mx-auto text-center p-8 rounded-lg cursor-pointer transition-all duration-300 ease-in-out relative flex flex-col justify-center items-center group
        ${isDisabled ? 'cursor-not-allowed bg-gray-900/50 border-gray-700' :
          isDragActive ? 'bg-cyan-900/30 border-2 border-cyan-500' : 'bg-gray-900/50 border-2 border-dashed border-gray-600 hover:border-cyan-500 hover:bg-gray-900'
        }`}
    >
      <div className="absolute inset-0 bg-cyan-500/10 rounded-lg animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <input {...getInputProps()} />
      <div className="relative z-10 flex flex-col items-center text-gray-400">
        <UploadIcon className="w-12 h-12 mb-4 transition-transform duration-300 group-hover:scale-110" />
        {isDragActive ? (
          <p className="text-lg font-semibold text-cyan-300">Suelta la imagen aquí...</p>
        ) : (
          <>
            <p className="text-lg font-semibold text-gray-200">Arrastra una imagen o haz clic para subir</p>
            <p className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP (Máx 4MB)</p>
          </>
        )}
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
};