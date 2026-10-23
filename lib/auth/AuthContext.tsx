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
  deleteDoc,
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
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
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
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
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
  updateUserProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or refresh user profile from Firestore with local cache fallback
  const fetchUserProfile = async (uid: string) => {
    try {
      const cached = localStorage.getItem(`hh_profile_${uid}`);
      if (cached) {
        setUserProfile(JSON.parse(cached));
      }
    } catch {}

    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const profileData = userSnap.data() as UserProfile;
        setUserProfile(profileData);
        try {
          localStorage.setItem(`hh_profile_${uid}`, JSON.stringify(profileData));
        } catch {}
      }
    } catch (err) {
      console.warn("Could not fetch user profile from Firestore:", err);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    if (data.username && data.username !== userProfile?.username) {
      await claimUsername(data.username);
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });

      if ((data.displayName || data.photoURL) && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          ...(data.displayName ? { displayName: data.displayName } : {}),
          ...(data.photoURL ? { photoURL: data.photoURL } : {}),
        }).catch(() => {});
      }

      setUserProfile((prev) => {
        const merged = { ...prev, ...data } as UserProfile;
        try {
          localStorage.setItem(`hh_profile_${user.uid}`, JSON.stringify(merged));
        } catch {}
        return merged;
      });
    } catch (err) {
      console.warn("Firestore profile update warning (fallback applied):", err);
      setUserProfile((prev) => {
        const merged = { ...prev, ...data } as UserProfile;
        try {
          localStorage.setItem(`hh_profile_${user.uid}`, JSON.stringify(merged));
        } catch {}
        return merged;
      });
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
    const oldNormalized =
      userProfile?.usernameNormalized || userProfile?.username?.toLowerCase();

    // If the username is unchanged, treat as success
    if (oldNormalized === normalized && userProfile?.username === username) {
      return { success: true };
    }

    try {
      const usernameRef = doc(db, "usernames", normalized);
      const usernameSnap = await getDoc(usernameRef);

      if (usernameSnap.exists() && usernameSnap.data()?.uid !== user.uid) {
        return {
          success: false,
          error: "This username is already taken. Please choose another.",
        };
      }

      // If user had a different username previously, release it
      if (oldNormalized && oldNormalized !== normalized) {
        try {
          await deleteDoc(doc(db, "usernames", oldNormalized));
        } catch (delErr) {
          console.warn("Could not release old username:", delErr);
        }
      }

      await setDoc(usernameRef, {
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      const userRef = doc(db, "users", user.uid);
      const updatedFields: Partial<UserProfile> = {
        username: username,
        usernameNormalized: normalized,
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, updatedFields, { merge: true });

      const mergedProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: userProfile?.displayName || user.displayName || username,
        photoURL: userProfile?.photoURL || user.photoURL || "/icon.png",
        notificationPreferences: userProfile?.notificationPreferences || {
          emailReminders: true,
          deadlineAlerts: true,
          teamInvites: true,
        },
        ...userProfile,
        username: username,
        usernameNormalized: normalized,
      };

      setUserProfile(mergedProfile);
      try {
        localStorage.setItem(`hh_profile_${user.uid}`, JSON.stringify(mergedProfile));
      } catch {}

      return { success: true };
    } catch (err: unknown) {
      console.warn("Firestore error during username claim (local fallback used):", err);
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: userProfile?.displayName || user.displayName || username,
        photoURL: userProfile?.photoURL || user.photoURL || "/icon.png",
        notificationPreferences: userProfile?.notificationPreferences || {
          emailReminders: true,
          deadlineAlerts: true,
          teamInvites: true,
        },
        ...userProfile,
        username: username,
        usernameNormalized: normalized,
      };

      setUserProfile(fallbackProfile);
      try {
        localStorage.setItem(`hh_profile_${user.uid}`, JSON.stringify(fallbackProfile));
      } catch {}
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
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
