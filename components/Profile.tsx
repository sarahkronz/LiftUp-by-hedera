// components/Profile.tsx

import React, { useState, useEffect, useCallback } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { firestoreService } from '../services/firebase';
import { UserInvestment, Project, User } from '../types'; 
import Spinner from './Spinner';
import { WalletIcon, BriefcaseIcon, TrashIcon, CopyIcon } from './icons';

const Profile: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [investments, setInvestments] = useState<UserInvestment[]>([]);
    const [createdProjects, setCreatedProjects] = useState<Project[]>([]);
    
    const [investmentsLoading, setInvestmentsLoading] = useState(true);
    const [projectsLoading, setProjectsLoading] = useState(true); 
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setInvestmentsLoading(false);
                setProjectsLoading(false);
                return;
            }
            
            try {
                const userInvestments = await firestoreService.getUserInvestmentDetails(user.id);
                setInvestments(userInvestments);
            } catch (error) {
                console.error("Failed to fetch user investments:", error);
            } finally {
                setInvestmentsLoading(false);
            }
            
            if (user.role === 'creator') {
                setProjectsLoading(true);
                try {
                    const projects = await firestoreService.getCreatedProjects(user.id);
                    setCreatedProjects(projects);
                } catch (error) {
                    console.error("Failed to fetch created projects:", error);
                } finally {
                    setProjectsLoading(false);
                }
            } else {
                setProjectsLoading(false);
            }
        };

        if (user) fetchData();
        else if (!authLoading) {
            setInvestmentsLoading(false);
            setProjectsLoading(false);
        }
    }, [user, authLoading]);

    const handleDeleteProject = async (projectId: string, projectTitle: string, event: React.MouseEvent) => {
        event.stopPropagation(); 
        if (!window.confirm(`Are you sure you want to delete the project: "${projectTitle}"? This action cannot be undone.`)) return;

        try {
            await firestoreService.deleteProject(projectId);
            setCreatedProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Failed to delete project.");
        }
    };

    const KycStatusBadge: React.FC<{ user: User }> = ({ user }) => {
        let bgColor = 'bg-slate-500';
        let textColor = 'text-slate-100';
        let text = 'Unverified';

        switch (user.kycStatus) {
            case 'pending':
                bgColor = 'bg-yellow-500/20';
                textColor = 'text-yellow-400';
                text = 'Pending';
                break;
            case 'verified':
                bgColor = 'bg-green-500/20';
                textColor = 'text-green-400';
                text = 'Verified'; 
                break;
        }

        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
                {text}
            </span>
        );
    };

    const KycBanner: React.FC<{ user: User }> = ({ user }) => {
        if (user.kycStatus === 'verified') return null;
        return (
            <div className="bg-yellow-500 text-navy-900 p-4 rounded mb-6 text-center">
                Your KYC is **{user.kycStatus}**. Please complete verification to invest or create projects.
                <button
                    onClick={() => navigate('/kyc')}
                    className="ml-4 bg-navy-900 text-yellow-400 py-1 px-3 rounded hover:bg-navy-700"
                >
                    Complete KYC
                </button>
            </div>
        );
    };

    
    const renderCreatedProjects = () => {
        if (projectsLoading) return <div className="flex justify-center py-8"><Spinner /></div>;
        if (createdProjects.length === 0) return <p className="text-slate-400 text-center py-8">You haven't created any projects yet.</p>;

        return (
            <div className="space-y-4">
                {createdProjects.map(project => {
                    const isEnded = project.deadline < new Date(); 
                    
                    const treasuryBalance = (project as any).treasuryBalance || 0; 
                    const totalRaised = (project.currentAmount || 0) + (project.fundsInEscrow || 0);

                    return (
                        <div 
                            key={project.id}
                            onClick={() => { 
                                if (user.kycStatus !== 'verified') return alert("Complete KYC first.");
                                navigate(`/project/${project.id}`);
                            }}
                            className={`bg-navy-900 p-4 rounded-lg flex items-center space-x-4 hover:bg-navy-700/50 transition-colors ${user.kycStatus !== 'verified' ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <img src={project.imageUrl} alt={project.title} className="w-16 h-16 rounded-md object-cover" />
                            <div className="flex-grow">
                                <h4 className="font-bold text-slate-200">{project.title}</h4>
                                <p className="text-sm text-slate-400">Target: {project.targetAmount.toLocaleString()} HBAR</p>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/project/${project.id}/updates`); }}
                                        className="bg-teal-500 text-navy-900 py-1 px-2 rounded hover:bg-teal-400 text-sm font-semibold"
                                    >
                                        View Updates
                                    </button>
                                    <button
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            if (user.kycStatus !== 'verified') return alert("Complete KYC first.");
                                            navigate(`/project/${project.id}/edit`);
                                        }}
                                        className={`py-1 px-2 rounded text-sm font-semibold ${user.kycStatus !== 'verified' ? 'bg-yellow-400/40 text-slate-300 cursor-not-allowed' : 'bg-yellow-600 text-navy-900 hover:bg-yellow-500'}`}
                                    >
                                        Edit Project
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteProject(project.id, project.title, e)}
                                        className="p-2 rounded-full text-red-400 hover:bg-red-400/20 transition-colors"
                                        aria-label={`Delete project ${project.title}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="text-right">
                                    
                                    <p className="text-sm font-semibold text-slate-400">
                                        Total Raised: 
                                        <span className="font-bold text-teal-400 ml-1">
                                            { totalRaised.toLocaleString()} ℏ
                                        </span>
                                    </p>

                                    <p className="text-lg font-bold text-green-400 mt-1">
                                        <BriefcaseIcon className="inline w-4 h-4 mr-1 mb-1" />
                                        Treasury Balance: 
                                        <span className="ml-1">
                                            { treasuryBalance.toLocaleString() } ℏ
                                        </span>
                                    </p>
                                    
                                    <span className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${isEnded ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {isEnded ? 'Ended' : 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getInvestmentStatusBadge = (status: 'escrowed' | 'released' | 'refunded') => {
        let bgColor = 'bg-slate-500/20';
        let textColor = 'text-slate-400';
        
        switch (status) {
            case 'escrowed':
                bgColor = 'bg-yellow-500/20';
                textColor = 'text-yellow-400';
                break;
            case 'released':
                bgColor = 'bg-green-500/20';
                textColor = 'text-green-400';
                break;
            case 'refunded':
                bgColor = 'bg-red-500/20';
                textColor = 'text-red-400';
                break;
            default:
                break;
        }
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor} uppercase`}>
                {status}
            </span>
        );
    };

    
    const renderInvestments = () => {
        if (investmentsLoading) return <div className="flex justify-center py-8"><Spinner /></div>;
        if (investments.length === 0) return <p className="text-slate-400 text-center py-8">You haven't invested in any projects yet.</p>;

        return (
            <div className="space-y-4">
                {investments.map(({ investment, project }) => {
                    const isProjectEnded = project.deadline < new Date();
                    const projectStatusText = isProjectEnded ? 'Project Ended' : 'Project Active';
                    const projectStatusColor = isProjectEnded ? 'text-red-400' : 'text-green-400';

                    return (
                        <div 
                            key={investment.id}
                            onClick={() => {
                                if (user.kycStatus !== 'verified') return alert("Complete KYC first.");
                                navigate(`/project/${project.id}`);
                            }}
                            className={`bg-navy-900 p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-navy-700/50 transition-colors ${user.kycStatus !== 'verified' ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <img src={project.imageUrl} alt={project.title} className="w-16 h-16 rounded-md object-cover" />
                            
                            <div className="flex-grow">
                                <h4 className="font-bold text-slate-200">{project.title}</h4>
                                <p className="text-sm text-slate-400">by {project.creatorName}</p>
                                
                                <div className="mt-2 flex flex-wrap items-center space-x-3 text-sm">
                                    
                                    <span className="text-slate-300">Investment Status:</span>
                                    {getInvestmentStatusBadge(investment.status)}
                                    
                                    <span className="text-slate-500 hidden sm:inline">&bull;</span>
                                    
                                    <span className="text-slate-300">Project Status:</span>
                                    <span className={`font-semibold ${projectStatusColor}`}>
                                        {projectStatusText}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-right flex-shrink-0">
                                <p className="text-lg font-bold text-teal-400">
                                    {investment.amount.toLocaleString()} 
                                    <span className="text-sm text-slate-300">{investment.currency}</span>
                                </p>
                                <p className="text-xs text-slate-500">Your Investment</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const formatPrivateKey = (key: string | undefined) => {
        if (!key) return 'N/A';
        return `${key.substring(0, 5)}...${key.substring(key.length - 4)}`;
    };

    const handleCopy = useCallback((text: string, field: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert(`${field} copied to clipboard!`);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                alert(`Failed to copy ${field}.`);
            });
        } else {
            console.warn('Clipboard API not available.');
            alert(`Please manually copy the ${field}.`);
        }
    }, []);
    
    if (authLoading) return <Spinner message="Loading profile..." />;
    if (!user) return <p className="text-center py-10 text-slate-400">Please log in to view your profile.</p>;
    
    return (
        <div className="max-w-4xl mx-auto bg-navy-800 p-8 rounded-lg shadow-lg text-slate-200">
            <KycBanner user={user} />

            <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center text-navy-900 font-bold text-4xl flex-shrink-0">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-100">{user.name}</h2>
                    <p className="text-slate-400">{user.email}</p>

                    {}
                    <div className="mt-4 p-3 bg-navy-700 rounded-md">
                        
                        {/* 1. Account ID */}
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-slate-300">
                                Hedera Account ID: 
                                <span className="font-mono text-teal-400">
                                    {user.wallet?.accountId || 'N/A'} 
                                </span>
                            </p>
                            {user.wallet?.accountId && (
                                <button
                                    onClick={() => handleCopy(user.wallet!.accountId, 'Account ID')}
                                    className="p-1 rounded text-teal-400 hover:bg-navy-600 transition-colors flex items-center justify-center"
                                    aria-label="Copy Account ID"
                                >
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {}
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-sm font-semibold text-slate-300">
                                Private Key: 
                                <span 
                                    className="font-mono text-yellow-400 cursor-help" 
                                    title={user.wallet?.privateKey || 'N/A'}
                                >
                                    {formatPrivateKey(user.wallet?.privateKey)} 
                                </span>
                            </p>
                            {user.wallet?.privateKey && (
                                <button
                                    onClick={() => handleCopy(user.wallet!.privateKey, 'Private Key')}
                                    className="p-1 rounded text-yellow-400 hover:bg-navy-600 transition-colors flex items-center justify-center"
                                    aria-label="Copy Private Key"
                                >
                                    <CopyIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    {}

                    <div className="mt-2 flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-300 capitalize">{user.role}</span>
                        <span className="text-slate-500">&bull;</span>
                        <KycStatusBadge user={user} />
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center space-x-2"><BriefcaseIcon className="w-5 h-5" /> Your Projects</h3>
                {renderCreatedProjects()}
            </div>

            <div className="mt-10">
                <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center space-x-2"><WalletIcon className="w-5 h-5" /> Your Investments</h3>
                {renderInvestments()}
            </div>
        </div>
    );
};

export default Profile;