import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { ImageViewer } from './components/ImageViewer';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { PhotoIcon } from './components/icons/PhotoIcon';
import { editImage, ImageState } from './services/geminiService';

function App() {
  const [history, setHistory] = useState<ImageState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentImage = useMemo(() => {
    return historyIndex >= 0 ? history[historyIndex] : null;
  }, [history, historyIndex]);
  
  const originalImage = useMemo(() => {
    return history.length > 0 ? history[0] : null;
  }, [history]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleImageUpload = useCallback((image: ImageState) => {
    setHistory([image]);
    setHistoryIndex(0);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!currentImage) return;

    setIsLoading(true);
    setError(null);

    // Prepend the instruction to preserve facial features.
    const fullPrompt = `IMPORTANT: The user's face, features, and expression must be preserved perfectly. Do not change their identity. With that rule in mind, apply the following edit: "${prompt}"`;

    try {
      const result = await editImage(currentImage.base64, currentImage.mimeType, fullPrompt);
      if (result.newImage) {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, result.newImage]);
        setHistoryIndex(newHistory.length);
      } else {
        setError(result.text || 'La edición falló. El modelo no devolvió una imagen nueva.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
    }
  }, [currentImage, history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(prev => prev - 1);
    }
  }, [canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [canRedo]);

  const handleReset = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    setError(null);
  }, []);
  
  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col font-sans antialiased">
      <Header 
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        canUndo={canUndo}
        canRedo={canRedo}
        hasImage={!!originalImage}
      />
      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 p-4 gap-4 overflow-hidden">
        {isLoading && <Loader />}
        
        {/* Main Content: Image Viewer or Uploader */}
        <div className="md:col-span-2 xl:col-span-3 flex items-center justify-center bg-black/30 rounded-lg p-2 sm:p-4 min-h-[40vh] md:min-h-0 relative">
          {currentImage && originalImage ? (
            <ImageViewer
              key={historyIndex} // Force re-mount to reset internal state on undo/redo
              currentImage={currentImage}
              originalImageSrc={`data:${originalImage.mimeType};base64,${originalImage.base64}`}
            />
          ) : (
            <ImageUploader onImageUpload={handleImageUpload} isDisabled={isLoading} />
          )}
        </div>

        {/* Aside: Control Panel */}
        <aside className="md:col-span-1 xl:col-span-1 glassmorphism rounded-lg p-4 flex flex-col flex-shrink-0">
          {currentImage ? (
            <ControlPanel
              onGenerate={handleGenerate}
              isGenerating={isLoading}
              error={error}
              onClearError={() => setError(null)}
            />
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4">
                <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-200">Comienza subiendo una imagen</h3>
                <p className="text-sm">Tu imagen aparecerá aquí, lista para que desates tu creatividad.</p>
            </div>
          )}
        </aside>
      </main>
      <footer className="text-center p-2 text-xs text-gray-500">
        Creado con ❤️ por Sope IA
      </footer>
    </div>
  );
}

export default App;