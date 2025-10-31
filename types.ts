import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export interface HederaWallet {
    accountId: string;
    privateKey: string;
    publicKey: string;
}

export type UserRole = 'creator' | 'investor';
export type KycStatus = 'unverified' | 'pending' | 'verified';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    wallet: HederaWallet;
    kycStatus: KycStatus;
}

export const projectCategories = [
    'Technology',
    'Art',
    'Community',
    'Environment',
    'Health',
    'Education',
    'Gaming',
] as const;

export type ProjectCategory = typeof projectCategories[number];

export interface Project {
    id: string;
    creatorId: string;
    creatorName: string;
    title: string;
    description: string;
    imageUrl: string;
    targetAmount: number;
    currentAmount: number; // Represents funds RELEASED to creator
    fundsInEscrow: number; // Represents funds HELD by the platform
    deadline: firebase.firestore.Timestamp;
    createdAt: firebase.firestore.Timestamp;
    fundsEscrowAccountId?: string; 
    tokenId: string;
    tokenSymbol: string;
    treasuryBalance: number;
    treasuryAccountId: string;
    category: ProjectCategory;
    tokenomics?: {
        team: number;
        advisors: number;
        publicSale: number;
    };
    milestones?: Milestone[]; // This will likely be deprecated in favor of sub-collections
}

export interface Investment {
    id: string;
    projectId: string;
    investorId: string;
    investorName: string;
    amount: number;
    currency: 'HBAR' | string; // HBAR or token symbol
    timestamp: firebase.firestore.Timestamp;
    transactionId?: string;
    txHash: string;
    tokenId?: string;
    status?: 'escrowed' | 'released' | 'refunded';
}

export type MilestoneStatus = 'pending' | 'in-progress' | 'completed';

export interface Milestone {
    id: string;
    title: string;
    description: string;
    targetAmount: number;
    status: MilestoneStatus;
    deadline?: firebase.firestore.Timestamp;
    isPaid?: boolean;
}

export interface Update {
    id: string;
    title: string;
    content: string;
    createdAt: firebase.firestore.Timestamp;
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
createdAt: Date;}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    isRead: boolean;
    createdAt: firebase.firestore.Timestamp;
}

export interface UserInvestment {
    investment: Investment;
    project: Project;
}
export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: firebase.firestore.Timestamp;
}