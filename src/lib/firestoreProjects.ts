import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { auth } from "@/firebase";
import { Project } from "@/components/dashboard/Features/YourProject";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/firebase";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PROJECTS_COLLECTION = "projects";

export async function getUserProjects(userId: string): Promise<Project[]> {
  const q = query(collection(db, PROJECTS_COLLECTION), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
}

export async function addUserProject(userId: string, project: Omit<Project, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), { ...project, userId });
  return docRef.id;
}

export async function updateUserProject(projectId: string, project: Partial<Project>) {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await updateDoc(docRef, project);
}

export async function deleteUserProject(projectId: string) {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId);
  await deleteDoc(docRef);
}
