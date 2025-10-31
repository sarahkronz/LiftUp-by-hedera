import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import Spinner from './Spinner';
import { SparklesIcon } from './icons';

interface AIAssistantModalProps {
    currentTitle: string;
    currentDescription: string;
    onClose: () => void;
    onApply: (suggestedTitle: string, suggestedDescription: string) => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ currentTitle, currentDescription, onClose, onApply }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState<{ suggestedTitle: string; suggestedDescription: string; } | null>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setError('');
            try {
                const result = await aiService.getProjectSuggestions(currentTitle, currentDescription);
                setSuggestions(result);
            } catch (err: any) {
                setError(err.message || "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [currentTitle, currentDescription]);
    
    const handleApply = () => {
        if (suggestions) {
            onApply(suggestions.suggestedTitle, suggestions.suggestedDescription);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-navy-800 p-8 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center space-x-2 mb-4">
                    <SparklesIcon className="w-6 h-6 text-teal-400" />
                    <h2 className="text-2xl font-bold text-slate-200">AI Project Assistant</h2>
                </div>

                {loading && <div className="py-20 flex justify-center"><Spinner message="Generating AI suggestions..." /></div>}
                
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                        <p className="font-bold">Could not get suggestions</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {suggestions && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Original */}
                            <div>
                                <h3 className="font-bold text-slate-300 mb-2">Original</h3>
                                <div className="bg-navy-900 p-4 rounded-lg space-y-2 border border-navy-700">
                                    <p className="font-semibold text-slate-200 text-sm">{currentTitle}</p>
                                    <p className="text-slate-400 text-xs whitespace-pre-wrap">{currentDescription}</p>
                                </div>
                            </div>
                            {/* Suggested */}
                            <div>
                                <h3 className="font-bold text-teal-400 mb-2">AI Suggestion</h3>
                                <div className="bg-navy-900 p-4 rounded-lg space-y-2 border border-teal-500/50">
                                    <p className="font-semibold text-slate-100 text-sm">{suggestions.suggestedTitle}</p>
                                    <p className="text-slate-300 text-xs whitespace-pre-wrap">{suggestions.suggestedDescription}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end space-x-4 pt-8 mt-6 border-t border-navy-700">
                    <button onClick={onClose} className="bg-navy-700 text-slate-200 font-bold py-2 px-4 rounded hover:bg-navy-600 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleApply} disabled={!suggestions || loading} className="bg-teal-500 text-navy-900 font-bold py-2 px-4 rounded hover:bg-teal-400 disabled:bg-slate-500 transition-colors">
                        Apply Suggestions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantModal;