import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Register new user
    const register = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Login user
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Logout user
    const logout = () => {
        return signOut(auth);
    };

    // Check if user has completed onboarding
    const checkOnboardingStatus = async (userId) => {
        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const userDoc = await getDoc(doc(db, 'userProfiles', userId));
            if (userDoc.exists()) {
                return userDoc.data().hasCompletedOnboarding || false;
            }
            return false;
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            return false;
        }
    };

    // Mark onboarding as complete and save user data
    const markOnboardingComplete = async (userId, formData) => {
        try {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            await setDoc(doc(db, 'userProfiles', userId), {
                ...formData,
                hasCompletedOnboarding: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error marking onboarding complete:', error);
            return false;
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        register,
        login,
        logout,
        loading,
        checkOnboardingStatus,
        markOnboardingComplete
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
