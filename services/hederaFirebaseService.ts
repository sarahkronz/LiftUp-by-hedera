// /services/hederaFirebaseService.ts

import { hederaService } from './hedera';
import { firestoreService } from './firebase';
import { HederaWallet } from '../types';
import firebase from 'firebase/compat/app';

class HederaFirebaseService {

    async investInProject(userWallet: HederaWallet, projectId: string, amount: number) {
        const txId = await hederaService.investInProject(userWallet, amount);

        await firestoreService.recordInvestment({
            projectId,
            investorId: userWallet.accountId,
            amount,
            currency: 'HBAR',
            timestamp: firebase.firestore.Timestamp.now(),
            transactionId: txId,
            investorName: userWallet.accountId, 
            txHash: 'hash-placeholder', 
        });

        
        const project = await firestoreService.getProject(projectId);
        if (project) {
            const message = `New investment of ${amount} HBAR in project "${project.title}"`;
            // investor
            await firestoreService.createNotification(userWallet.accountId, message);
            // creator
            if (project.creatorId !== userWallet.accountId) {
                await firestoreService.createNotification(project.creatorId, message);
            }
        }

        return txId;
    }

    async releaseMilestoneFunds(projectId: string, milestoneId: string) {
        const project = await firestoreService.getProject(projectId);
        if (!project) throw new Error("Project not found");

const milestones = await firestoreService.getMilestonesForProject(projectId);        
        const milestone = milestones.find(m => m.id === milestoneId);
        if (!milestone) throw new Error("Milestone not found");

        const txId = await hederaService.releaseMilestoneFunds(project.fundsEscrowAccountId, milestone.targetAmount);

        await firestoreService.updateMilestoneStatus(projectId, milestoneId, 'completed');

        await firestoreService.createNotification(project.creatorId, `Milestone "${milestone.title}" released: ${milestone.targetAmount} HBAR`);

        return txId;
    }

    async investWithProjectToken(userWallet: HederaWallet, projectId: string, tokenId: string, amount: number) {
        const project = await firestoreService.getProject(projectId);
        if (!project) throw new Error("Project not found");

        const txId = await hederaService.investWithProjectToken(userWallet, project.treasuryAccountId, tokenId, amount);

        await firestoreService.recordInvestment({
            projectId,
            investorId: userWallet.accountId,
            amount,
            currency: 'TOKEN',
            tokenId,
            timestamp: firebase.firestore.Timestamp.now(),
            transactionId: txId,
            investorName: userWallet.accountId, 
            txHash: 'hash-placeholder', 
        });

        const message = `New token investment: ${amount} ${tokenId} in "${project.title}"`;
        await firestoreService.createNotification(userWallet.accountId, message);
        await firestoreService.createNotification(project.creatorId, message);

        return txId;
    }
}

export const hederaFirebaseService = new HederaFirebaseService();