import React from 'react';
import { LoaderIcon } from './icons';

interface SpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ message, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
            <LoaderIcon className={sizeClasses[size]} />
            {message && <p className="text-sm">{message}</p>}
        </div>
    );
};

export default Spinner;
