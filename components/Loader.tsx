import React, { useState, useEffect } from 'react';

const messages = [
  "La IA está haciendo su magia...",
  "Pintando píxeles con creatividad...",
  "Consultando a los espíritus del arte...",
  "Esto puede tardar un momento...",
  "Generando una obra maestra...",
  "Pulido final en curso...",
];

export const Loader: React.FC = () => {
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(messages[Math.floor(Math.random() * messages.length)]);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
            <p className="text-white text-lg mt-6 font-medium tracking-wide">{message}</p>
        </div>
    );
};