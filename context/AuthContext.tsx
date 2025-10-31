import React, { createContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth, firestoreService } from '../services/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { hederaService } from '../services/hedera';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    signup: (name: string, email: string, pass: string, role: 'creator' | 'investor') => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    signup: async () => {},
    logout: async () => {},
    refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: firebase.User | null) => {
            if (firebaseUser) {
                const userDoc = await firestoreService.getUser(firebaseUser.uid);
                if (userDoc) {
                    setUser(userDoc);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        await firestoreService.loginUser(email, pass);
    };

    const signup = async (name: string, email: string, pass: string, role: 'creator' | 'investor') => {
        setLoading(true);
        try {
            const firebaseUser = await firestoreService.signupUser(email, pass);
            console.log("Creating Hedera account...");
            const wallet = await hederaService.createNewAccount();
            console.log("Hedera account created:", wallet.accountId);
            
            alert(`Hedera account ${wallet.accountId} created. Please fund it with HBAR from the testnet faucet to enable transactions.`);

            const newUser: Omit<User, 'id'> = {
                name,
                email,
                role,
                wallet,
                kycStatus: 'unverified',
            };
            await firestoreService.createUser(firebaseUser.uid, newUser);
            const userDoc = await firestoreService.getUser(firebaseUser.uid);
            if (userDoc) setUser(userDoc);
        } catch (error) {
            console.error("Signup failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await firestoreService.logoutUser();
        setUser(null);
    };

    const refreshUser = async () => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            const userDoc = await firestoreService.getUser(firebaseUser.uid);
            if (userDoc) {
                setUser(userDoc);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
