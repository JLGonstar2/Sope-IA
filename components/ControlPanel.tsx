import React, { useState } from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface ControlPanelProps {
  onGenerate: (prompt: string) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating || !prompt.trim()) return;
    onGenerate(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-grow flex flex-col">
          <h2 className="text-lg font-semibold mb-3 text-gray-100">Describe tu Edición</h2>
          <div className="flex-grow flex flex-col">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="Ej: 'cambia el fondo a una playa tropical' o 'añadele un sombrero de pirata'"
              className="w-full flex-grow bg-gray-900/70 border border-gray-700 rounded-md p-2.5 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:opacity-50 resize-none"
            />
          </div>

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
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:shadow-none"
          >
            <MagicWandIcon className="w-5 h-5" />
            {isGenerating ? 'Generando...' : 'Generar'}
          </button>
        </div>
      </form>
    </div>
  );
};