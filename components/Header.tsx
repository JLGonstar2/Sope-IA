import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HeaderProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasImage: boolean;
}

const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }> = ({ label, children, ...props }) => (
    <button 
      {...props} 
      aria-label={label} 
      title={label} 
      className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-600/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
    >
        {children}
    </button>
);

export const Header: React.FC<HeaderProps> = ({ onUndo, onRedo, onReset, canUndo, canRedo, hasImage }) => {
  return (
    <header className="glassmorphism p-3 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <LogoIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-xl font-bold text-gray-100 tracking-wider">Sope IA</h1>
      </div>
      <div className="flex items-center gap-2">
        <ActionButton onClick={onUndo} disabled={!canUndo} label="Deshacer">
          <UndoIcon className="w-5 h-5" />
        </ActionButton>
        <ActionButton onClick={onRedo} disabled={!canRedo} label="Rehacer">
          <RedoIcon className="w-5 h-5" />
        </ActionButton>
        <ActionButton onClick={onReset} disabled={!hasImage} label="Empezar de Nuevo">
          <TrashIcon className="w-5 h-5 text-red-400 hover:text-red-300 transition-colors" />
        </ActionButton>
      </div>
    </header>
  );
};