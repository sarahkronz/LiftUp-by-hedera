import React, { useState } from 'react';

interface ShareButtonProps {
  projectTitle: string;
  projectId: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ projectTitle, projectId }) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}?project=${projectId}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center space-x-2">
        <span className="text-sm text-slate-400">Share:</span>
        <button onClick={copyToClipboard} title="Copy link" className="p-2 rounded-full bg-navy-700 hover:bg-navy-600 text-slate-300 transition-colors">
            {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.586-1.586m-1.586-5.656l4-4a4 4 0 015.656 0l-1.586 1.586m-5.656 5.656l-4 4" /></svg>
            )}
        </button>
    </div>
  );
};

export default ShareButton;
