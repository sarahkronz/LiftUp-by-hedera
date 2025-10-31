import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { User, Project, Investment, Notification, Milestone, Update, Comment, UserInvestment } from '../types'; 
import { doc, updateDoc } from "firebase/firestore";
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
const fieldValue = firebase.firestore.FieldValue;
export const db = firestore;

const toDate = (ts: any): Date => (ts && typeof ts.toDate === 'function') ? ts.toDate() : ts instanceof Date ? ts : new Date(ts);

const convertProjectData = (doc: firebase.firestore.DocumentSnapshot): Project => {
    const data = doc.data()!;
    return {
        id: doc.id,
        creatorId: data.creatorId,
        creatorName: data.creatorName,
        title: data.title,
        description: data.description,
        currentAmount: data.currentAmount ?? 0,
        fundsInEscrow: data.fundsInEscrow ?? 0,
        deadline: toDate(data.deadline),
        createdAt: toDate(data.createdAt),
        imageUrl: data.imageUrl ?? '',       
        targetAmount: data.targetAmount ?? 0,
        tokenId: data.tokenId ?? '',
        tokenSymbol: data.tokenSymbol ?? '',
        category: data.category ?? '',
        treasuryAccountId: data.treasuryAccountId ?? '',
    } as unknown as Project; 
};


class FirestoreService {
    private db = firestore;

    // --- User Management ---
    async getUser(uid: string): Promise<User | null> {
        const userDoc = await this.db.collection('users').doc(uid).get();
        if (userDoc.exists) return { id: userDoc.id, ...userDoc.data() } as User;
        return null;
    }

    async createUser(uid: string, userData: Omit<User, 'id'>): Promise<void> {
        await this.db.collection('users').doc(uid).set(userData);
    }

    // --- Auth ---
    async signupUser(email: string, pass: string): Promise<firebase.User> {
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        if (!userCredential.user) throw new Error("User creation failed.");
        return userCredential.user;
    }

    async loginUser(email: string, pass: string): Promise<void> {
        await auth.signInWithEmailAndPassword(email, pass);
    }

    async logoutUser(): Promise<void> {
        await auth.signOut();
    }

    async updateUserKycStatus(uid: string, status: 'pending' | 'verified'): Promise<void> {
        await this.db.collection('users').doc(uid).update({ kycStatus: status });
    }
    async updateUserKyc(userId: string, data: { kycStatus: string; kycId?: string; fullName?: string; address?: string; }): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
  }
    // --- Project Management ---
    async createProject(projectData: Omit<Project, 'id' | 'currentAmount' | 'createdAt' | 'fundsInEscrow'>): Promise<void> {
        await this.db.collection('projects').add({
            ...projectData,
            currentAmount: 0,
            fundsInEscrow: 0,
            createdAt: fieldValue.serverTimestamp(),
        });
    }
      async updateProjectDescription(projectId: string, newDescription: string): Promise<void> {
        await this.db.collection('projects').doc(projectId).update({
            description: newDescription,
        });
    }
    async updateProject(projectId: string, updatedData: Partial<Project>): Promise<void> {
        await this.db.collection('projects').doc(projectId).update(updatedData);
    }
    async getCreatedProjects(creatorId: string): Promise<Project[]> {
        const snapshot = await this.db.collection("projects")
            .where("creatorId", "==", creatorId)
            .orderBy("deadline", "asc")
            .get();

        return snapshot.docs.map(doc => {
            const data = doc.data();

            const deadline = data.deadline?.toDate ? data.deadline.toDate() : new Date(data.deadline);
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);

            return {
    id: doc.id,
    creatorId: data.creatorId,
    creatorName: data.creatorName,
    title: data.title,
    description: data.description,
    currentAmount: data.currentAmount ?? 0,
    fundsInEscrow: data.fundsInEscrow ?? 0,
    deadline,
    createdAt,
    imageUrl: data.imageUrl ?? "",
    targetAmount: data.targetAmount ?? 0,
    tokenId: data.tokenId ?? "",
    tokenSymbol: data.tokenSymbol ?? "",
    treasuryAccountId: data.treasuryAccountId ?? "",
    category: data.category ?? "",
    treasuryBalance: data.treasuryBalance ?? 0,
} as unknown as Project;
        });
    }

    
    async getProjects(): Promise<Project[]> {
        const snapshot = await this.db.collection('projects').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(convertProjectData);
    }

    async getProject(projectId: string): Promise<Project | null> {
        const doc = await this.db.collection('projects').doc(projectId).get();
        if (!doc.exists) return null;
        return convertProjectData(doc);
    }

    async deleteProject(projectId: string): Promise<void> {
        await this.db.collection('projects').doc(projectId).delete();
    }

    // --- Investment Management ---
    async recordInvestment(investmentData: Omit<Investment, 'id'>): Promise<void> {
        const projectRef = this.db.collection('projects').doc(investmentData.projectId);

        await this.db.runTransaction(async transaction => {
            const projectDoc = await transaction.get(projectRef);
            if (!projectDoc.exists) throw new Error("Project not found!");
            const project = convertProjectData(projectDoc);

            if (investmentData.currency === 'HBAR') {
                transaction.update(projectRef, { fundsInEscrow: (project.fundsInEscrow || 0) + investmentData.amount });
            }
            
            const investmentRecord = {
                ...investmentData,
                status: 'escrowed' 
            };

            const investmentRef = this.db.collection('investments').doc();
            transaction.set(investmentRef, investmentRecord);
        });
    }

    async getInvestmentsForProject(projectId: string): Promise<Investment[]> {
        const snapshot = await this.db.collection('investments').where('projectId', '==', projectId).get();
        const investments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
        investments.sort((a, b) => toDate(b.timestamp).getTime() - toDate(a.timestamp).getTime());
        return investments;
    }

    async getUserInvestmentDetails(userId: string): Promise<UserInvestment[]> {
        const investmentsSnapshot = await this.db.collection('investments').where('investorId', '==', userId).get();
        if (investmentsSnapshot.empty) return [];

        const investments = investmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Investment));
        const projectIds = [...new Set(investments.map(inv => inv.projectId))];
        if (projectIds.length === 0) return [];

        const projectsSnapshot = await this.db.collection('projects').where(firebase.firestore.FieldPath.documentId(), 'in', projectIds).get();
        const projectsMap = new Map<string, Project>();
        projectsSnapshot.docs.forEach(doc => {
            projectsMap.set(doc.id, convertProjectData(doc));
        });

        return investments
            .map(investment => {
                const project = projectsMap.get(investment.projectId);
                return project ? { investment, project } : null;
            })
            .filter((item): item is UserInvestment => item !== null)
            .sort((a, b) => toDate(b.investment.timestamp).getTime() - toDate(a.investment.timestamp).getTime());
    }

    // --- Creator Updates ---
    getProjectUpdates(projectId: string, callback: (updates: Update[]) => void): () => void {
        const updatesRef = this.db.collection('projects').doc(projectId).collection('updates').orderBy('createdAt', 'desc');
        return updatesRef.onSnapshot(snapshot => {
            const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Update));
            callback(updates);
        });
    }

    async createProjectUpdate(projectId: string, projectTitle: string, updateData: Omit<Update, 'id' | 'createdAt'>): Promise<void> {
        const update = { ...updateData, createdAt: fieldValue.serverTimestamp() };
        await this.db.collection('projects').doc(projectId).collection('updates').add(update);
        const investments = await this.getInvestmentsForProject(projectId);
        const investorIds = [...new Set(investments.map(inv => inv.investorId))];
        const creatorId = (await this.getProject(projectId))?.creatorId;
        const allUserIds = creatorId ? [...investorIds, creatorId] : investorIds;

        for (const userId of allUserIds) {
            await this.createNotification(userId, `Project '${projectTitle}' has a new update: "${updateData.title}"`);
        }
    }

    // --- Comments ---
    getComments(projectId: string, callback: (comments: Comment[]) => void): () => void {
        const commentsRef = this.db.collection('projects').doc(projectId).collection('comments').orderBy('createdAt', 'desc');
        return commentsRef.onSnapshot(snapshot => {
            const comments = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    authorId: data.authorId,
                    authorName: data.authorName,
                    content: data.content,
                    createdAt: toDate(data.createdAt)
                } as Comment;
            });
            callback(comments);
        });
    }

    async createComment(projectId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<void> {
        await this.db.collection('projects').doc(projectId).collection('comments').add({
            ...commentData,
            createdAt: fieldValue.serverTimestamp(),
        });
    }

    // --- Notifications ---
    async createNotification(userId: string, message: string): Promise<void> {
        await this.db.collection('notifications').add({
            userId,
            message,
            isRead: false,
            createdAt: fieldValue.serverTimestamp(),
        });
    }
    async getMilestonesForProject(projectId: string): Promise<Milestone[]> {
    const snapshot = await this.db.collection('projects').doc(projectId).collection('milestones').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone));
}



// Add this in your FirestoreService class
async addMilestoneToProject(projectId: string, milestoneData: Omit<Milestone, 'id'>): Promise<void> {
    await this.db.collection('projects').doc(projectId).collection('milestones').add(milestoneData);
}
// Add this in your FirestoreService class
async updateMilestoneStatus(
    projectId: string, 
    milestoneId: string, 
    status: Milestone['status'], 
    isPaid?: boolean 
): Promise<void> {
    
    const updateData: { status: Milestone['status'], isPaid?: boolean } = {
        status: status
    };
    
    if (typeof isPaid === 'boolean') {
        updateData.isPaid = isPaid;
    }
    
    await this.db.collection('projects')
        .doc(projectId)
        .collection('milestones')
        .doc(milestoneId)
        .update(updateData); 
}

async releaseFundsForMilestone(projectId: string, milestone: Milestone): Promise<void> {
    const projectRef = this.db.collection('projects').doc(projectId);
    await this.db.runTransaction(async transaction => {
        const projectDoc = await transaction.get(projectRef);
        if (!projectDoc.exists) throw new Error("Project not found!");
        
        const data = projectDoc.data()!;
        const fundsInEscrow = data.fundsInEscrow || 0;
        const currentTreasuryBalance = data.treasuryBalance || 0; 
        
        if (fundsInEscrow >= milestone.targetAmount) {
            
            
            transaction.update(projectRef, { 
                fundsInEscrow: fundsInEscrow - milestone.targetAmount,
                treasuryBalance: currentTreasuryBalance + milestone.targetAmount, 
            });
            
            
        } else {
            throw new Error("Insufficient funds in escrow");
        }
    });
}

}

export const firestoreService = new FirestoreService();