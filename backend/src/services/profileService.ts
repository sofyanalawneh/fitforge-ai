import { firestore } from "../config/firebase";
import type { FitnessProfile, FitnessProfileInput } from "../models/types";

function userDoc(uid: string) {
  return firestore.collection("users").doc(uid);
}

export async function getProfile(uid: string): Promise<FitnessProfile | null> {
  const snapshot = await userDoc(uid).get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as FitnessProfile;
}

export async function upsertProfile(
  uid: string,
  input: FitnessProfileInput,
): Promise<FitnessProfile> {
  const now = new Date().toISOString();
  const existing = await getProfile(uid);

  const profile: FitnessProfile = {
    ...input,
    profileCompletedAt: existing?.profileCompletedAt ?? now,
    updatedAt: now,
  };

  await userDoc(uid).set(profile, { merge: true });
  return profile;
}
