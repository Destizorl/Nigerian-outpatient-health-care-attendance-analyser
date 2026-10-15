/**
 * Authentication Context & Security Management for Nigerian Public Hospital Analytics.
 * Handles Email/Password, Google OAuth, Rate Limiting, Credential Hardening, and Profile Sync.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'Epidemiologist' | 'Public Health Analyst' | 'Hospital Medical Director' | 'Clinical Records Officer';
  facilityAffiliation: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  lockoutRemainingSeconds: number;
  signUpWithEmail: (email: string, pass: string, name: string, role: UserProfile['role'], facility: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserAffiliation: (role: UserProfile['role'], facility: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60000; // 60 seconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Rate Limiting & Brute Force Defense
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutUntil <= Date.now()) {
      setLockoutRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutRemainingSeconds(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        setFailedAttempts(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Auth State Listener
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            setUserProfile(userSnapshot.data() as UserProfile);
          } else {
            // First time login (e.g. via Google or fresh auth)
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Analyst',
              role: 'Public Health Analyst',
              facilityAffiliation: 'University College Hospital (UCH) Ibadan',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const verifyRateLimit = () => {
    if (Date.now() < lockoutUntil) {
      const waitSec = Math.ceil((lockoutUntil - Date.now()) / 1000);
      throw new Error(`Security Lockout: Too many failed attempts. Please wait ${waitSec} seconds.`);
    }
  };

  const registerFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockTime = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutUntil(lockTime);
      setLockoutRemainingSeconds(60);
      throw new Error('Security Notice: 5 consecutive failed attempts. Authentication locked for 60 seconds to prevent credential stuffing.');
    }
  };

  const signUpWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    role: UserProfile['role'], 
    facility: string
  ) => {
    verifyRateLimit();

    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const createdUser = userCredential.user;

    await updateProfile(createdUser, {
      displayName: name.trim()
    });

    const profileData: UserProfile = {
      uid: createdUser.uid,
      email: createdUser.email || email.trim(),
      displayName: name.trim(),
      role,
      facilityAffiliation: facility,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', createdUser.uid), profileData);
      setUserProfile(profileData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${createdUser.uid}`);
    }

    setFailedAttempts(0);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    verifyRateLimit();

    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      setFailedAttempts(0);
    } catch (err: any) {
      registerFailedAttempt();
      // Generic error message without revealing if email exists (security best practice)
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password combination. Please verify your credentials.');
      }
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    verifyRateLimit();
    await signInWithPopup(auth, googleProvider);
    setFailedAttempts(0);
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserAffiliation = async (role: UserProfile['role'], facility: string) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const updated = {
      ...userProfile,
      role,
      facilityAffiliation: facility
    } as UserProfile;

    try {
      await setDoc(docRef, updated, { merge: true });
      setUserProfile(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      lockoutRemainingSeconds,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOutUser,
      updateUserAffiliation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
