import React, { useState, useEffect, useCallback } from 'react';
import { Project } from '../types';
import { useAuth } from '../hooks/useAuth';
import { hederaService } from '../services/hedera';
import { firestoreService } from '../services/firebase';
import Spinner from './Spinner';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface InvestmentModalProps {
    project: Project;
    onClose: () => void;
    onSuccess: () => void;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ project, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [currency, setCurrency] = useState<'HBAR' | 'TOKEN'>('HBAR');
    
    const [associating, setAssociating] = useState(false);
    const [isAssociated, setIsAssociated] = useState(false);
    
    const [hbarBalance, setHbarBalance] = useState<string | null>(null); 
    const [fetchingBalance, setFetchingBalance] = useState(false);

    const fetchHbarBalance = useCallback(async () => {
        if (!user || !user.wallet) return;

        setFetchingBalance(true);
        try {
            const balances = await hederaService.getAccountBalances(user.wallet.accountId);
            
            const hbarValue = balances.hbars.toTinybars()
                .divide(100000000)
                .toNumber()
                .toFixed(4);

            setHbarBalance(hbarValue);
            
        } catch (e) {
            console.error("Failed to fetch HBAR balance:", e);
            setHbarBalance('N/A');
        } finally {
            setFetchingBalance(false);
        }
    }, [user]);

    const checkAssociationStatus = useCallback(async () => {
        if (user && user.wallet && project.tokenId && currency === 'TOKEN') {
            try {
                const associated = await hederaService.checkTokenAssociation(user.wallet.accountId, project.tokenId);
                setIsAssociated(associated);
            } catch (e) {
                console.error("Failed to check token association status:", e);
                setIsAssociated(false);
            }
        }
    }, [user, project.tokenId, currency]);

    useEffect(() => {
        checkAssociationStatus();
        fetchHbarBalance();
    }, [checkAssociationStatus, fetchHbarBalance]);

    const handleAssociate = async () => {
        if (!user || !user.wallet || !project.tokenId) {
            setError("Cannot associate token. User wallet or token information is missing.");
            return;
        }
        setAssociating(true);
        setError('');
        try {
            await hederaService.associateToken(user.wallet, project.tokenId);
            alert("Token successfully associated! You can now invest with this token.");
            setIsAssociated(true);
        } catch (err: any) {
            if (err.message?.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
                setError('You have already associated this token.');
                setIsAssociated(true);
            } else {
                setError(err.message || 'Failed to associate token.');
                console.error(err);
            }
        } finally {
            setAssociating(false);
        }
    };

    const handleInvest = async () => {
        if (!user || !user.wallet) {
            setError('You must be logged in and have a wallet to invest.');
            return;
        }
        
        if (currency === 'TOKEN' && !isAssociated) {
             setError('Please associate the project token with your wallet before investing.');
             return;
        }
        
        const investmentAmount = parseFloat(amount); 
        if (isNaN(investmentAmount) || investmentAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            let txHash = '';
            let investmentCurrency: 'HBAR' | string = 'HBAR';

            if (currency === 'HBAR') {
                
                if (hbarBalance && parseFloat(hbarBalance) < investmentAmount) {
                     throw new Error("INSUFFICIENT_HBAR_BALANCE");
                }

                setStatusMessage('Processing HBAR transaction on Hedera...');
                
                txHash = await hederaService.investInProject(user.wallet, investmentAmount); 
                investmentCurrency = 'HBAR';
            } else {
                if (!project.tokenId || !project.treasuryAccountId) {
                    throw new Error("Missing Token ID or Treasury Account ID for token investment. Cannot proceed.");
                }

                setStatusMessage(`Processing ${project.tokenSymbol} transaction on Hedera...`);
                txHash = await hederaService.investWithProjectToken(user.wallet, project.treasuryAccountId, project.tokenId, investmentAmount);
                investmentCurrency = project.tokenSymbol;
            }
            
            setStatusMessage('Recording investment...');
            await firestoreService.recordInvestment({
                projectId: project.id,
                investorId: user.id,
                investorName: user.name,
                amount: investmentAmount,
                currency: investmentCurrency,
                timestamp: firebase.firestore.Timestamp.now(),
                txHash,
                status: 'escrowed'
            });

            setStatusMessage('Investment successful!');
            
            alert(`Investment of ${investmentAmount} ${investmentCurrency} in ${project.title} was successful!`);
            
            onSuccess();
            onClose();
            
        } catch (err: any) {
            console.error(err);
             if (err.message?.includes('INSUFFICIENT_HBAR_BALANCE')) {
                setError('Investment failed. Insufficient HBAR balance in your wallet.');
            } else if (err.message?.includes('INSUFFICIENT_TOKEN_BALANCE')) {
                setError('Investment failed. Insufficient token balance.');
            } else {
                setError(err.message || 'Investment failed. Please check your balance and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-navy-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-200 mb-4">Invest in {project.title}</h2>
                <div className="space-y-4">

                    <div className="flex justify-center mb-4 border border-navy-700 rounded-full p-1">
                        <button onClick={() => setCurrency('HBAR')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${currency === 'HBAR' ? 'bg-teal-500 text-navy-900' : 'text-slate-300 hover:bg-navy-700'}`}>
                            HBAR
                        </button>
                        <button onClick={() => setCurrency('TOKEN')} disabled={!project.tokenSymbol || !project.tokenId} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${currency === 'TOKEN' ? 'bg-teal-500 text-navy-900' : 'text-slate-300 hover:bg-navy-700'} disabled:text-slate-500 disabled:bg-transparent disabled:cursor-not-allowed`}>
                            {project.tokenSymbol || 'Project Token'}
                        </button>
                    </div>

                    {currency === 'TOKEN' && (
                        <div className={`text-center p-3 rounded-lg mb-4 ${isAssociated ? 'bg-green-500/10 border border-green-400' : 'bg-navy-900'}`}>
                            {isAssociated ? (
                                <p className="text-sm text-green-400 font-semibold">✅ Token **{project.tokenSymbol}** is associated with your wallet.</p>
                            ) : (
                                <>
                                    <p className="text-xs text-slate-400 mb-2">First time with this token? Associate it with your wallet.</p>
                                    <button 
                                        onClick={handleAssociate} 
                                        disabled={associating}
                                        className="bg-navy-700 text-teal-400 text-sm font-bold py-2 px-4 rounded hover:bg-navy-600 disabled:opacity-50 transition-colors w-full flex items-center justify-center"
                                    >
                                        {associating ? <Spinner size="sm" /> : `Associate ${project.tokenSymbol} Token`}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2" htmlFor="amount">Amount ({currency === 'HBAR' ? 'HBAR' : project.tokenSymbol})</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            min="0.00000001" 
                            className="w-full p-2 bg-navy-900 border border-navy-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="e.g., 100"
                        />
                        
                        {currency === 'HBAR' && (
                            <div className="mt-1 text-right">
                                {fetchingBalance ? (
                                    <p className="text-xs text-slate-500">Fetching balance...</p>
                                ) : (
                                    <p className="text-xs text-slate-400">
                                        Your HBAR Balance: <strong className="text-teal-400">{hbarBalance || '0.00'} ℏ</strong>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Spinner message={statusMessage} />
                        </div>
                    ) : (
                        <div className="flex justify-end space-x-4 pt-4">
                            <button onClick={onClose} className="bg-navy-700 text-slate-200 font-bold py-2 px-4 rounded hover:bg-navy-600 transition-colors">
                                Cancel
                            </button>
                            <button 
                                onClick={handleInvest} 
                                disabled={currency === 'TOKEN' && !isAssociated} 
                                className={`font-bold py-2 px-4 rounded transition-colors 
                                   ${(currency === 'TOKEN' && !isAssociated) ? 'bg-slate-500 cursor-not-allowed text-slate-300' : 'bg-teal-500 text-navy-900 hover:bg-teal-400'}`}
                            >
                                Confirm Investment
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvestmentModal;