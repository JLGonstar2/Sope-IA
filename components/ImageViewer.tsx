import React, { useState } from 'react';
import type { ImageState } from '../services/geminiService';
import { DownloadIcon } from './icons/DownloadIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';

interface ImageViewerProps {
  currentImage: ImageState;
  originalImageSrc: string;
}

const ToolButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }> = ({ label, children, ...props }) => (
    <button {...props} aria-label={label} title={label} className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">
        {children}
    </button>
);

export const ImageViewer: React.FC<ImageViewerProps> = ({
  currentImage,
  originalImageSrc,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const handleDownload = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = `data:${currentImage.mimeType};base64,${currentImage.base64}`;
    const fileExtension = currentImage.mimeType.split('/')[1] || 'png';
    link.download = `sope-ia-edit-${Date.now()}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imageToDisplay = showOriginal ? originalImageSrc : `data:${currentImage.mimeType};base64,${currentImage.base64}`;

  return (
    <div className="w-full h-full flex items-center justify-center relative group">
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ToolButton onClick={() => setShowOriginal(p => !p)} label={showOriginal ? "Mostrar Editada" : "Mostrar Original"}>
                {showOriginal ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </ToolButton>
             <ToolButton onClick={handleDownload} disabled={!currentImage} label="Descargar Imagen">
                <DownloadIcon className="w-5 h-5" />
            </ToolButton>
        </div>

        <img
            src={imageToDisplay}
            alt={showOriginal ? "Imagen original" : "Imagen editada"}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50"
        />

        <div 
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-opacity duration-300
          ${showOriginal ? 'opacity-100' : 'opacity-0'}`}
        >
            Mostrando Original
        </div>
    </div>
  );
};