import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import type { ImageState } from '../services/geminiService';

const MAX_PROMPT_IMAGES = 3;
const ACCEPTED_FILES = {
  'image/jpeg': [],
  'image/png': [],
  'image/webp': [],
  'image/heic': [],
  'image/heif': [],
};

interface ControlPanelProps {
  onGenerate: (prompt: string, promptImages: ImageState[]) => void;
  isGenerating: boolean;
  error: string | null;
  onClearError: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onGenerate,
  isGenerating,
  error,
  onClearError,
}) => {
  const [prompt, setPrompt] = useState('');
  const [promptImages, setPromptImages] = useState<ImageState[]>([]);
  const [promptError, setPromptError] = useState<string | null>(null);

  const processFiles = useCallback(async (files: File[]) => {
    setPromptError(null);

    const filesToProcess = files.slice(0, MAX_PROMPT_IMAGES - promptImages.length);

    if (files.length > filesToProcess.length) {
        setPromptError(`Puedes añadir un máximo de ${MAX_PROMPT_IMAGES} imágenes de referencia.`);
    }

    const imagePromises: Promise<ImageState | null>[] = filesToProcess.map(file => {
        return new Promise((resolve) => {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setPromptError(`La imagen "${file.name}" es muy grande (máx 4MB).`);
                resolve(null);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve({ base64: reader.result.split(',')[1], mimeType: file.type });
                } else {
                    setPromptError(`No se pudo leer el archivo ${file.name}.`);
                    resolve(null);
                }
            };
            reader.onerror = () => {
                setPromptError(`No se pudo leer el archivo ${file.name}.`);
                resolve(null);
            };
            reader.readAsDataURL(file);
        });
    });

    const newImages = (await Promise.all(imagePromises)).filter((img): img is ImageState => img !== null);
    
    if (newImages.length > 0) {
        setPromptImages(prev => [...prev, ...newImages]);
    }
}, [promptImages]);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles);
  }, [processFiles]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILES,
    noClick: true,
    noKeyboard: true,
    disabled: isGenerating || promptImages.length >= MAX_PROMPT_IMAGES,
  });

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              files.push(file);
            }
        }
    }
    if (files.length > 0) {
      event.preventDefault();
      processFiles(files);
    }
  }, [processFiles]);
  
  const handleRemoveImage = (index: number) => {
    setPromptImages(prev => prev.filter((_, i) => i !== index));
    if (promptImages.length -1 < MAX_PROMPT_IMAGES) {
        setPromptError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating || !prompt.trim()) return;
    onGenerate(prompt, promptImages);
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-grow flex flex-col">
          <h2 className="text-lg font-semibold mb-1 text-gray-100">Describe tu Edición</h2>
           <p className="text-xs text-gray-400 mb-3">Puedes arrastrar, pegar o adjuntar imágenes de referencia.</p>
          
          <div {...getRootProps()} className="flex-grow flex flex-col relative">
            <input {...getInputProps()} />
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onPaste={handlePaste}
              disabled={isGenerating}
              placeholder="Ej: 'cambia el fondo a una playa tropical' o 'añadele un sombrero como este'"
              className="w-full flex-grow bg-gray-900/70 border border-gray-700 rounded-md p-2.5 pr-10 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:opacity-50 resize-none"
            />
             <button
              type="button"
              onClick={open}
              disabled={isGenerating || promptImages.length >= MAX_PROMPT_IMAGES}
              title="Adjuntar imagen"
              aria-label="Adjuntar imagen de referencia"
              className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full text-gray-400 hover:text-cyan-400 hover:bg-gray-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <PaperclipIcon className="w-5 h-5" />
            </button>
          </div>

          {promptImages.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-300 mb-2">Imágenes de referencia:</p>
              <div className="flex flex-wrap gap-2">
                {promptImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={`data:${image.mimeType};base64,${image.base64}`}
                      alt={`Referencia ${index + 1}`}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Eliminar imagen de referencia ${index + 1}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
           {promptError && (
            <p className="text-red-400 text-sm mt-2" role="alert">{promptError}</p>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative mt-4" role="alert">
              <span className="block sm:inline">{error}</span>
              <button
                type="button"
                onClick={onClearError}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                aria-label="Cerrar"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-4 mt-2">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to--gray-700 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:shadow-none"
          >
            <MagicWandIcon className="w-5 h-5" />
            {isGenerating ? 'Generando...' : 'Generar'}
          </button>
        </div>
      </form>
    </div>
  );
};
