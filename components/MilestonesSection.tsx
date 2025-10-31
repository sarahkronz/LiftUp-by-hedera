import React, { useState, useEffect, useCallback } from 'react';
import { Project, Milestone } from '../types';
import { firestoreService } from '../services/firebase';
import { hederaService } from '../services/hedera';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

interface MilestonesSectionProps {
    project: Project;
    onUpdate: () => void;
}

const MilestonesSection: React.FC<MilestonesSectionProps> = ({ project, onUpdate }) => {
    const { user } = useAuth();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [payoutInProgress, setPayoutInProgress] = useState<string | null>(null); 

    // Form state for new milestone
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newTarget, setNewTarget] = useState('');

    const fetchMilestones = useCallback(async () => {
        try {
            const fetchedMilestones = await firestoreService.getMilestonesForProject(project.id);
            setMilestones(fetchedMilestones);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching milestones:', error);
            setError('Failed to load milestones.');
            setLoading(false);
        }
    }, [project.id]);
    
    useEffect(() => {
        fetchMilestones();
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [fetchMilestones, successMessage]);

    const handleCreateMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await firestoreService.addMilestoneToProject(project.id, {
                title: newTitle,
                description: newDescription,
                targetAmount: parseInt(newTarget, 10),
                status: 'pending', 
                isPaid: false, 
            });
            setNewTitle('');
            setNewDescription('');
            setNewTarget('');
            setShowCreateForm(false);
            setSuccessMessage('Milestone created successfully!');
        } catch (err: any) {
            setError(err.message || 'Failed to create milestone.');
        } finally {
            setIsSubmitting(false);
            fetchMilestones(); 
        }
    };
    
    const handleCompleteAndPayout = async (milestone: Milestone) => {
        setPayoutInProgress(milestone.id);
        setError('');
        setSuccessMessage(''); 
        try {
            if (project.fundsInEscrow < milestone.targetAmount) {
                 setError('Payout failed: Escrow funds are insufficient. Current Escrow: ' + project.fundsInEscrow);
                 return;
            }

            
            await firestoreService.updateMilestoneStatus(project.id, milestone.id, 'completed', true); 
            
            await firestoreService.releaseFundsForMilestone(project.id, milestone);
            
            await hederaService.releaseMilestoneFunds(project.treasuryAccountId, milestone.targetAmount);

            setSuccessMessage(`Payout of ${milestone.targetAmount} HBAR for '${milestone.title}' was successful!`);
            
            onUpdate();
            fetchMilestones();

        } catch (err: any) {
            console.error("Payout error:", err);
            setError(err.message || 'Automatic Payout failed. Please check Hedera network status.');
        } finally {
            setPayoutInProgress(null);
        }
    }


    const isCreator = user?.id === project.creatorId;

    const getStatusColor = (status: Milestone['status'], isPaid?: boolean) => {
        if (isPaid) return 'bg-green-500/20 text-green-400';
        switch(status) {
            case 'completed': return 'bg-blue-500/20 text-blue-400';
            case 'in-progress': return 'bg-yellow-500/20 text-yellow-400';
            case 'pending':
            default: return 'bg-slate-500/20 text-slate-400';
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-200">Milestones</h3>
                {isCreator && (
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-teal-600 text-white font-bold py-2 px-4 rounded hover:bg-teal-500 text-sm">
                        {showCreateForm ? 'Cancel' : '+ Add Milestone'}
                    </button>
                )}
            </div>

            {isCreator && showCreateForm && (
                 <form onSubmit={handleCreateMilestone} className="space-y-4 p-6 bg-navy-900 rounded-lg border border-navy-700">
                    <h4 className="text-lg font-semibold text-slate-200">New Milestone</h4>
                    <div>
                        <label className="text-sm text-slate-400 block mb-1" htmlFor="ms-title">Title</label>
                        <input id="ms-title" type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-2 bg-navy-800 border border-navy-700 rounded" required />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 block mb-1" htmlFor="ms-desc">Description</label>
                        <textarea id="ms-desc" value={newDescription} onChange={e => setNewDescription(e.target.value)} className="w-full p-2 bg-navy-800 border border-navy-700 rounded" rows={3} required />
                    </div>
                     <div>
                        <label className="text-sm text-slate-400 block mb-1" htmlFor="ms-target">Funding Payout (HBAR)</label>
                        <input id="ms-target" type="number" min="1" value={newTarget} onChange={e => setNewTarget(e.target.value)} className="w-full p-2 bg-navy-800 border border-navy-700 rounded" required />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="bg-teal-500 text-navy-900 font-bold py-2 px-4 rounded hover:bg-teal-400 disabled:bg-slate-500">
                            {isSubmitting ? <Spinner size="sm" /> : 'Save Milestone'}
                        </button>
                    </div>
                </form>
            )}

           
            {successMessage && (
                <div className="p-3 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                    {successMessage}
                </div>
            )}

            {loading && <Spinner />}
            {error && <p className="text-red-400 text-sm bg-red-500/20 p-3 rounded">{error}</p>}
            
            {!loading && milestones.length === 0 && (
                <div className="text-center py-8 text-slate-400">No milestones defined yet.</div>
            )}
            
            {milestones.length > 0 && (
                 <div className="space-y-4">
                    {milestones.map(ms => (
                        <div key={ms.id} className="bg-navy-900 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h5 className="font-bold text-slate-200">{ms.title}</h5>
                                    <p className="text-sm text-slate-400 mt-1">{ms.description}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="font-bold text-teal-400 font-mono">{ms.targetAmount.toLocaleString()} HBAR</p>
                                    <span className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ms.status, ms.isPaid)}`}>
                                        {ms.isPaid ? 'Paid' : ms.status.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>
                            
                            
                            {isCreator && (
                                <div className="mt-3 pt-3 border-t border-navy-700 flex items-center justify-end space-x-2">
                                    {ms.isPaid ? (
                                        <span className="font-bold text-green-400 text-xs py-1 px-3 rounded bg-green-900/40">
                                            ✅ Funds Released
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={() => handleCompleteAndPayout(ms)}
                                            disabled={payoutInProgress === ms.id || project.fundsInEscrow < ms.targetAmount} 
                                            className="bg-green-600 text-white font-bold py-1 px-3 rounded text-xs hover:bg-green-500 disabled:bg-slate-500"
                                        >
                                            {payoutInProgress === ms.id ? <Spinner size="sm"/> : 'Mark Complete & Payout'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
};

export default MilestonesSection;