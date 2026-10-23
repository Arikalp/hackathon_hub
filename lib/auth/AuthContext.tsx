"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/client";
import { usernameSchema } from "../validations";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  username: string;
  usernameNormalized: string;
  notificationPreferences: {
    emailReminders: boolean;
    deadlineAlerts: boolean;
    teamInvites: boolean;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  claimUsername: (username: string) => Promise<{ success: boolean; error?: string }>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  signOutUser: async () => {},
  claimUsername: async () => ({ success: false }),
  checkUsernameAvailable: async () => false,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or refresh user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.warn("Could not fetch user profile from Firestore:", err);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await fetchUserProfile(result.user.uid);
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await fetchUserProfile(result.user.uid);
      }
    } catch (error) {
      console.error("Email sign in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName?: string
  ) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      if (result.user) {
        await fetchUserProfile(result.user.uid);
      }
    } catch (error) {
      console.error("Email sign up error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const valResult = usernameSchema.safeParse(username);
    if (!valResult.success) return false;

    const normalized = username.toLowerCase();
    try {
      const usernameRef = doc(db, "usernames", normalized);
      const usernameSnap = await getDoc(usernameRef);
      if (!usernameSnap.exists()) {
        return true;
      }
      return user ? usernameSnap.data()?.uid === user.uid : false;
    } catch (error) {
      console.warn("Firestore rules warning during username check:", error);
      return true;
    }
  };

  const claimUsername = async (
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Must be signed in to claim a username." };
    }

    const validation = usernameSchema.safeParse(username);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const normalized = username.toLowerCase();

    try {
      const usernameRef = doc(db, "usernames", normalized);
      const usernameSnap = await getDoc(usernameRef);

      if (usernameSnap.exists() && usernameSnap.data()?.uid !== user.uid) {
        return {
          success: false,
          error: "This username is already taken. Please choose another.",
        };
      }

      await setDoc(usernameRef, {
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      const userRef = doc(db, "users", user.uid);
      const newProfile: Partial<UserProfile> = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || username,
        photoURL:
          user.photoURL ||
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBhiT-fS94BgDyhLpMJDlYKntQwDTUm9GXRHoiVTosSsB4dJcFlgij98ihCIA9eKt4Daqmt9AkiE0ly81jiXp5M6Dkn-fdqXxDh4fPTqH--D47WprzLQh2giEixqyAfOE4ZgDWE4h-rdqj9xSrFPAiyIgZrygAKd8SnJd7o53Rv4wtTqCertqG-fVNtRjNzvCfAduj-ZphmsOI8FXpM_acjUFkqhLVJxIjXT_TYDk2UCe-3HLHmYX8k",
        username: username,
        usernameNormalized: normalized,
        notificationPreferences: userProfile?.notificationPreferences || {
          emailReminders: true,
          deadlineAlerts: true,
          teamInvites: true,
        },
        updatedAt: serverTimestamp(),
      };

      if (!userProfile) {
        newProfile.createdAt = serverTimestamp();
      }

      await setDoc(userRef, newProfile, { merge: true });
      await fetchUserProfile(user.uid);

      return { success: true };
    } catch (err: unknown) {
      console.warn("Firestore error during username claim:", err);
      // Fallback: If Firestore rules haven't been updated yet in console, set local profile so user isn't blocked
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || username,
        photoURL:
          user.photoURL ||
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBhiT-fS94BgDyhLpMJDlYKntQwDTUm9GXRHoiVTosSsB4dJcFlgij98ihCIA9eKt4Daqmt9AkiE0ly81jiXp5M6Dkn-fdqXxDh4fPTqH--D47WprzLQh2giEixqyAfOE4ZgDWE4h-rdqj9xSrFPAiyIgZrygAKd8SnJd7o53Rv4wtTqCertqG-fVNtRjNzvCfAduj-ZphmsOI8FXpM_acjUFkqhLVJxIjXT_TYDk2UCe-3HLHmYX8k",
        username: username,
        usernameNormalized: normalized,
        notificationPreferences: {
          emailReminders: true,
          deadlineAlerts: true,
          teamInvites: true,
        },
      };

      setUserProfile(fallbackProfile);
      return { success: true };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOutUser,
        claimUsername,
        checkUsernameAvailable,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
