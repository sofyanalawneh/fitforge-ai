import { randomUUID } from "node:crypto";
import { firestore } from "../config/firebase";
import type { FitnessProfile, Plan, PlanContent, PlanType } from "../models/types";

function plansCollection(uid: string) {
  return firestore.collection("users").doc(uid).collection("plans");
}

export async function createPlan(
  uid: string,
  type: PlanType,
  content: PlanContent,
  profileSnapshot: Partial<FitnessProfile>,
): Promise<Plan> {
  const planId = randomUUID();
  const plan: Plan = {
    planId,
    type,
    content,
    profileSnapshot,
    createdAt: new Date().toISOString(),
  };

  await plansCollection(uid).doc(planId).set(plan);
  return plan;
}

export async function listPlans(uid: string): Promise<Plan[]> {
  const snapshot = await plansCollection(uid).orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => doc.data() as Plan);
}

export async function getPlan(uid: string, planId: string): Promise<Plan | null> {
  const doc = await plansCollection(uid).doc(planId).get();
  return doc.exists ? (doc.data() as Plan) : null;
}

export async function deletePlan(uid: string, planId: string): Promise<boolean> {
  const doc = plansCollection(uid).doc(planId);
  const snapshot = await doc.get();
  if (!snapshot.exists) {
    return false;
  }
  await doc.delete();
  return true;
}
