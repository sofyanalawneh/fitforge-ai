import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with this email already exists.");
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  fullName: string,
): Promise<void> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: fullName.trim() });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/email-already-in-use") {
      throw new DuplicateEmailError();
    }
    throw err;
  }
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
