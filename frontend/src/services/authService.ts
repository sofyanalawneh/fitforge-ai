import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

export class DuplicateEmailError extends Error {
  constructor() {
    super("An account with this email already exists.");
  }
}

export async function registerWithEmail(email: string, password: string): Promise<void> {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
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
