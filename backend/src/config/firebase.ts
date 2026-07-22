import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function loadServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials: set FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (see .env.example)",
    );
  }

  return { projectId, clientEmail, privateKey };
}

function configureEmulators(): void {
  const useEmulator = process.env.USE_FIREBASE_EMULATOR === "true";

  if (useEmulator) {
    return;
  }

  // Google's Admin SDK auto-connects to the emulator whenever these host env
  // vars are present, regardless of application code. Strip them unless the
  // emulator flag is explicitly enabled, so a stray leftover value in the
  // environment can never silently redirect production traffic.
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
}

function initFirebaseApp(): App {
  configureEmulators();

  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }
  return initializeApp({ credential: cert(loadServiceAccount()) });
}

const app = initFirebaseApp();

export const firebaseAuth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);
