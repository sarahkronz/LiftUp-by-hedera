import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { firestoreService } from '../services/firebase';
import { hederaService } from '../services/hedera';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import Spinner from './Spinner';
import { projectCategories, ProjectCategory, Project } from '../types';
import AIAssistantModal from './AIAssistantModal';
import { SparklesIcon } from './icons';
import { PhotoIcon } from '@heroicons/react/24/outline';

const PLACEHOLDER_IMAGE_URL = 'https://picsum.photos/seed/placeholder/800/400';

const validateImageUrl = (url: string): boolean => {
    if (!url) return true; 
    
    const imageExtensions = /\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i;
    const isUrl = /^https?:\/\//i.test(url);

    return isUrl && imageExtensions.test(url);
};

const CreateProject: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [category, setCategory] = useState<ProjectCategory>(projectCategories[0]);
    
    const [manualImageUrl, setManualImageUrl] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
   
    const [imageUrlError, setImageUrlError] = useState(''); 
    
    const [tokenomics, setTokenomics] = useState({ team: '', advisors: '', publicSale: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [showAIAssistant, setShowAIAssistant] = useState(false);

   
    const handleImageUrlChange = (value: string) => {
        setManualImageUrl(value);
        setImagePreview(value);
        
        if (value && !validateImageUrl(value)) {
            setImageUrlError('The link must point to a direct image file (ending with .jpg, .png, etc.)');
        } else {
            setImageUrlError('');
        }
    };

    const handleTokenomicsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const parsedValue = value === '' ? '' : Math.min(100, parseInt(value, 10)).toString();
        setTokenomics(prev => ({ ...prev, [name]: parsedValue }));
    };
    
    const totalAllocation = useMemo(() => {
        return Object.values(tokenomics as Record<string, string>).reduce((sum, val) => {
            const numericVal = parseInt(val || '0', 10) || 0;
            return sum + numericVal;
        }, 0);
    }, [tokenomics]);
    
    const handleApplyAISuggestions = (suggestedTitle: string, suggestedDescription: string) => {
        setTitle(suggestedTitle);
        setDescription(suggestedDescription);
        setShowAIAssistant(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        
        if (manualImageUrl && !validateImageUrl(manualImageUrl)) {
            setError('Please correct the image URL or leave it empty.');
            
            return; 
        }

        if (!user || user.role !== 'creator') {
            setError('You must be a creator to create a project.');
            return;
        }
        if (!title || !description || !targetAmount || !deadline || !category) {
            setError('Please fill all required fields.');
            return;
        }
        if (totalAllocation > 100) {
            setError('Total token allocation cannot exceed 100%.');
            return;
        }
        
        setError('');
        setLoading(true);

        try {
            setStatusMessage('Setting project image...');
            
            const imageUrl = manualImageUrl || `https://picsum.photos/seed/${title}${Date.now()}/800/400`;
            
            setStatusMessage('Creating project token on Hedera...');
            const projectSymbol = title.substring(0, 5).toUpperCase().replace(/\s/g, '');
            const { tokenId, treasuryAccountId } = await hederaService.createProjectToken(user.wallet, title, projectSymbol);
            
            setStatusMessage('Saving project details...');
            const deadlineDate = new Date(deadline);

            let tokenomicsData: Project['tokenomics'] | undefined = undefined;
            const team = parseInt(tokenomics.team, 10) || 0;
            const advisors = parseInt(tokenomics.advisors, 10) || 0;
            const publicSale = parseInt(tokenomics.publicSale, 10) || 0;
            if (team > 0 || advisors > 0 || publicSale > 0) {
                tokenomicsData = { team, advisors, publicSale };
            }

            const projectData = {
                creatorId: user.id,
                creatorName: user.name,
                title,
                description,
                imageUrl, 
                targetAmount: parseInt(targetAmount, 10),
                deadline: firebase.firestore.Timestamp.fromDate(deadlineDate),
                tokenId,
                tokenSymbol: projectSymbol,
                treasuryAccountId,
                category,
                treasuryBalance: 0,
                ...(tokenomicsData && { tokenomics: tokenomicsData }),
            };
            
            await firestoreService.createProject(projectData);
            
            setStatusMessage('Project created successfully!');
            navigate('/dashboard');

        } catch (err: any) {
            console.error('PROJECT CREATION FAILED:', err);
            setError(`Failed at: ${statusMessage}. Error: ${err.message || 'An unknown error occurred. Ensure Hedera account is ready.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-2xl mx-auto bg-navy-800 p-8 rounded-lg">
                <h2 className="text-3xl font-bold text-slate-200 mb-6">Create a New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2" htmlFor="title">Project Title</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required
                            className="w-full p-2 bg-navy-900 border border-navy-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2" htmlFor="category">Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as ProjectCategory)}
                            className="w-full p-2 bg-navy-900 border border-navy-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500">
                            {projectCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-sm font-bold text-slate-400 block" htmlFor="description">Description</label>
                             <button
                                 type="button"
                                 onClick={() => setShowAIAssistant(true)}
                                 disabled={!title || !description}
                                 className="flex items-center space-x-1 text-xs font-semibold text-teal-400 hover:text-teal-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                             >
                                 <SparklesIcon className="w-4 h-4" />
                                 <span>Improve with AI</span>
                             </button>
                        </div>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required
                            className="w-full p-2 bg-navy-900 border border-navy-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                    
                    {}
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2" htmlFor="image-url">Project Image URL(optional)</label>
                        <input 
                            type="url" 
                            id="image-url" 
                            value={manualImageUrl} 
                            onChange={e => handleImageUrlChange(e.target.value)}
                            placeholder="https://example.com/your-image.jpg"
                            
                            className={`w-full p-2 bg-navy-900 border rounded focus:outline-none focus:ring-2 ${imageUrlError ? 'border-red-500 focus:ring-red-500' : 'border-navy-700 focus:ring-teal-500'}`} 
                        />
                        {}
                        {imageUrlError && ( 
                            <p className="text-red-400 text-xs mt-1 font-medium">{imageUrlError}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            The URL must be a direct link to an image file (.jpg, .png, etc.). If left empty, a default image will be used.
                        </p>

                        <div className="mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-navy-700 border-dashed rounded-md">
                             <div className="space-y-1 text-center">
                                 {imagePreview && manualImageUrl ? (
                                     <img 
                                         src={manualImageUrl} 
                                         alt="Project preview" 
                                         className="mx-auto h-48 w-auto rounded-lg object-cover" 
                                         onError={(e) => {
                                            
                                            e.currentTarget.src = PLACEHOLDER_IMAGE_URL;
                                         }}
                                     />
                                 ) : (
                                     <PhotoIcon className="mx-auto h-12 w-12 text-slate-500" /> 
                                 )}
                                 <p className="text-sm text-slate-400">
                                     {manualImageUrl || 'No image URL provided'}
                                 </p>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-bold text-slate-400 block mb-2" htmlFor="target">Target Amount (HBAR)</label>
                            <input type="number" id="target" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} min="1" required
                                className="w-full p-2 bg-navy-900 border border-navy-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-400 block mb-2" htmlFor="deadline">Deadline</label>
                            <input type="date" id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)} required
                                className="w-full p-2 bg-navy-900 border border-navy-700 rounded" />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-navy-700">
                        <h3 className="text-xl font-bold text-slate-200 mb-4">Tokenomics (Optional)</h3>
                        <p className="text-sm text-slate-400 mb-4">Define how your project's tokens will be distributed.</p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-400 block mb-2" htmlFor="team">Team (%)</label>
                                    <input type="number" id="team" name="team" value={tokenomics.team} onChange={handleTokenomicsChange} min="0" max="100"
                                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-400 block mb-2" htmlFor="advisors">Advisors (%)</label>
                                    <input type="number" id="advisors" name="advisors" value={tokenomics.advisors} onChange={handleTokenomicsChange} min="0" max="100"
                                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-400 block mb-2" htmlFor="publicSale">Public Sale (%)</label>
                                    <input type="number" id="publicSale" name="publicSale" value={tokenomics.publicSale} onChange={handleTokenomicsChange} min="0" max="100"
                                        className="w-full p-2 bg-navy-900 border border-navy-700 rounded" />
                                </div>
                            </div>
                            <div className={`text-sm text-right pr-2 ${totalAllocation > 100 ? 'text-red-400' : 'text-slate-400'}`}>
                                 Total Allocated: {totalAllocation}% / 100%
                            </div>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-400 text-sm text-center pt-4">{error}</p>}
                    {loading && <div className="flex justify-center"><Spinner message={statusMessage} /></div>}

                    {}
                    <button 
                        type="submit" 
                        disabled={loading || totalAllocation > 100 || !!imageUrlError} 
                        className="w-full bg-teal-500 text-navy-900 font-bold py-3 px-4 rounded hover:bg-teal-400 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        Create Project
                    </button>
                </form>
            </div>
            {showAIAssistant && (
                <AIAssistantModal 
                    currentTitle={title}
                    currentDescription={description}
                    onClose={() => setShowAIAssistant(false)}
                    onApply={handleApplyAISuggestions}
                />
            )}
        </>
    );
};

export default CreateProject;