import React from 'react';
export { BriefcaseIcon, TrashIcon } from '@heroicons/react/24/outline'; // تأكد من أن الأيقونات مُصدرة بشكل صحيح

export const LoaderIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.333c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8" />
    </svg>
);

export const WalletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

export const CreateIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

export const SupportIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

export const GrowIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);
export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        {...props} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={props.className || "w-6 h-6"}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M15.75 17.25v2.25A2.25 2.25 0 0 1 13.5 22.5h-8.25A2.25 2.25 0 0 1 3 20.25v-8.25A2.25 2.25 0 0 1 5.25 10.5h2.25m4.5-5.698l-2.25 2.25M11.25 5.25h1.5A2.25 2.25 0 0 1 15 7.5v1.5m-4.5-2.25h4.5m4.5 9l-2.25 2.25M11.25 15h1.5A2.25 2.25 0 0 0 15 12.75V11.25"
        />
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M8.25 6.75h9A2.25 2.25 0 0 1 19.5 9v9A2.25 2.25 0 0 1 17.25 20.25h-9A2.25 2.25 0 0 1 6 18v-9A2.25 2.25 0 0 1 8.25 6.75z"
        />
    </svg>
);
export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M9.813 15.904L9 18.75l-.813-2.846m4.772-5.904L17.5 10.5l.813 2.846m-4.772-5.904L12 8.25l-.813-2.846m-4.772 5.904L3 10.5l.813 2.846M13.5 10.5h.008v.008h-.008V10.5zm-5.25 0h.008v.008H8.25V10.5z" 
        />
    </svg>
);