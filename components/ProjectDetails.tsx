import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, Investment } from '../types';
import { firestoreService } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';
import InvestmentModal from './InvestmentModal';
import ShareButton from './ShareButton';
import TokenomicsChart from './TokenomicsChart';
import ProjectUpdates from './ProjectUpdates';
import CommentsSection from './CommentsSection';
import MilestonesSection from './MilestonesSection';
import AIAssistantModal from './AIAssistantModal';
import { SparklesIcon } from './icons';

const ProjectDetails: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showInvestModal, setShowInvestModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'updates' | 'comments' | 'milestones'>('details');
    const [showAIAssistant, setShowAIAssistant] = useState(false);

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        try {
            const projectData = await firestoreService.getProject(projectId);
            if (projectData) {
                setProject(projectData);
                const investmentData = await firestoreService.getInvestmentsForProject(projectId);
                setInvestments(investmentData);
            } else {
                setError('Project not found.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch project details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    const handleInvestmentSuccess = () => {
        fetchData();
    };
    
    const handleApplyAIDescription = async (suggestedTitle: string, suggestedDescription: string) => {
        if (!project) return;
        try {
            await firestoreService.updateProjectDescription(project.id, suggestedDescription);
            setShowAIAssistant(false);
            fetchData();
        } catch (err) {
            console.error("Failed to apply AI description:", err);
        }
    };

    if (loading) {
        return <div className="flex justify-center mt-12"><Spinner message="Loading project details..." /></div>;
    }

    if (error) {
        return <div className="text-center text-red-400 mt-12">{error}</div>;
    }

    if (!project) {
        return <div className="text-center text-slate-400 mt-12">Project could not be loaded.</div>;
    }

    // Total raised includes all investments (escrow + released)
    const totalRaised = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const fundedPercentage = (totalRaised / project.targetAmount) * 100;

    const daysLeft = () => {
        const deadlineDate = project.deadline;
        const now = new Date();
        const diff = deadlineDate.getTime() - now.getTime();
        if (diff <= 0) return 0;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'updates':
                return <ProjectUpdates projectId={project.id} creatorId={project.creatorId} projectTitle={project.title} />;
            case 'comments':
                return <CommentsSection projectId={project.id} />;
            case 'milestones':
                return <MilestonesSection project={project} onUpdate={fetchData} />;
            case 'details':
            default:
                return (
                    <>
                        <p className="text-sm mt-4 text-slate-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                        {user?.id === project.creatorId && (
                            <div className="mt-4 text-right">
                                <button
                                    onClick={() => setShowAIAssistant(true)}
                                    className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-400 hover:text-teal-300"
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    <span>Improve Description with AI</span>
                                </button>
                            </div>
                        )}
                        {project.tokenomics && (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-slate-200 mb-4">Tokenomics</h3>
                                <div className="max-w-xs mx-auto">
                                    <TokenomicsChart tokenomics={project.tokenomics} />
                                </div>
                            </div>
                        )}
                    </>
                );
        }
    }

    return (
        <div>
            <button onClick={() => navigate('/dashboard')} className="text-teal-500 hover:text-teal-400 mb-6">&larr; Back to Dashboard</button>
            <div className="bg-navy-800 rounded-lg shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 p-8">
                    <div className="md:col-span-3">
                        <img src={project.imageUrl} alt={project.title} className="w-full h-auto object-cover rounded-lg shadow-md mb-6" />
                        <h2 className="text-3xl font-bold text-slate-100">{project.title}</h2>
                        <p className="text-slate-400 mt-2">by <span className="font-semibold text-slate-300">{project.creatorName}</span></p>
                        
                        <div className="border-b border-navy-700 my-6">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => setActiveTab('details')} className={`${activeTab === 'details' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    Details
                                </button>
                                 <button onClick={() => setActiveTab('milestones')} className={`${activeTab === 'milestones' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    Milestones
                                </button>
                                <button onClick={() => setActiveTab('updates')} className={`${activeTab === 'updates' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    Updates
                                </button>
                                <button onClick={() => setActiveTab('comments')} className={`${activeTab === 'comments' ? 'border-teal-500 text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    Comments
                                </button>
                            </nav>
                        </div>
                        
                        <div className="mt-4">
                            {renderTabContent()}
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-navy-900/50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-slate-200 mb-4">Project Stats</h3>
                        <div className="w-full bg-navy-700 rounded-full h-2.5 mb-2">
                            <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${Math.min(fundedPercentage, 100)}%` }}></div>
                        </div>
                        <p className="text-slate-200 font-bold text-lg">{fundedPercentage.toFixed(2)}%<span className="text-slate-400 font-normal text-sm"> Funded</span></p>

                        <div className="mt-6 space-y-4">
                            <div className="flex justify-between items-baseline">
                                <span className="text-slate-400">Total Raised:</span>
                                <span className="text-2xl font-bold text-slate-100">{totalRaised.toLocaleString()} HBAR</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-slate-400">Target:</span>
                                <span className="text-lg font-semibold text-slate-300">{project.targetAmount.toLocaleString()} HBAR</span>
                            </div>
                             <div className="flex justify-between items-baseline">
                                <span className="text-slate-400">Days Left:</span>
                                <span className="text-lg font-semibold text-slate-300">{daysLeft()}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-slate-400">Investors:</span>
                                <span className="text-lg font-semibold text-slate-300">{investments.length}</span>
                            </div>
                        </div>

                        {user?.role === 'investor' && user.id !== project.creatorId && daysLeft() > 0 && (
                             <button 
                                onClick={() => setShowInvestModal(true)}
                                className="w-full mt-8 bg-teal-500 text-navy-900 font-bold py-3 px-4 rounded hover:bg-teal-400 transition-colors duration-300"
                            >
                                Invest Now
                            </button>
                        )}

                        <div className="mt-6 flex justify-end">
                            <ShareButton projectId={project.id} projectTitle={project.title} />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 bg-navy-800 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-slate-200 mb-6">Investment History</h3>
                {investments.length > 0 ? (
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {investments.map(inv => (
                            <div key={inv.id} className="bg-navy-900 p-4 rounded-lg flex justify-between items-center hover:bg-navy-800 transition-colors">
                                <div>
                                    <p className="font-bold text-slate-200">{inv.investorName}</p>
                                    <a href={`https://hashscan.io/testnet/transaction/${inv.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-400 hover:underline font-mono mt-1">Tx: {inv.txHash.substring(0, 10)}...</a>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-teal-400">{inv.amount.toLocaleString()} <span className="text-sm font-normal text-slate-300">{inv.currency}</span></p>
                                    <p className="text-xs text-slate-500">{inv.timestamp.toDate().toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-4">No investments yet. Be the first to support this project!</p>
                )}
            </div>

            {showInvestModal && (
                <InvestmentModal 
                    project={project} 
                    onClose={() => setShowInvestModal(false)}
                    onSuccess={handleInvestmentSuccess}
                />
            )}
            
            {showAIAssistant && (
                <AIAssistantModal 
                    currentTitle={project.title}
                    currentDescription={project.description}
                    onClose={() => setShowAIAssistant(false)}
                    onApply={handleApplyAIDescription}
                />
            )}
        </div>
    );
};

export default ProjectDetails;
