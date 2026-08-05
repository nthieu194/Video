import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut,
  User
} from 'firebase/auth';
import { 
  initializeFirestore,
  memoryLocalCache,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize core Firebase App safely
export const app = initializeApp(firebaseConfig);
const dbId = (firebaseConfig as any).firestoreDatabaseId || "ai-studio-video-3faa1b26-c69b-4d89-9b65-9b7386b550ad";

export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
  ignoreUndefinedProperties: true
}, dbId); /* CRITICAL: Required for cloud databases */

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// Configure Google Workspace integration scopes dynamically
googleProvider.addScope('https://www.googleapis.com/auth/docs');
googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const firebaseInitialized = true;

// In-memory caching layer for Google Workspace authorized token
let cachedAccessToken: string | null = null;

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}

// Sign-In using popup - Recommended for sandboxed workspace iframe environment
export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error("Đăng nhập Google hiện không khả dụng do chính sách bảo mật trình duyệt chặn cookie bên thứ ba trong iframe.");
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

// Sign-In using redirect - Ideal alternative when popups are blocked by browser/sandboxes
export async function signInWithGoogleRedirect() {
  if (!auth || !googleProvider) {
    throw new Error("Đăng nhập Google Redirect hiện không khả dụng trong môi trường bảo mật này.");
  }
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Google Redirect Sign-In Error:", error);
    throw error;
  }
}

// Sign-Out
export async function signOutUser() {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
}

// ----------------------------------------------------
// Hardened Firestore Error Handling (from guidelines)
// ----------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function isOfflineError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || String(error)).toLowerCase();
  return msg.includes("offline") || msg.includes("network") || msg.includes("unavailable") || msg.includes("failed-precondition") || msg.includes("internet");
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const isPermissionError = 
    errorMsg.toLowerCase().includes("permission") || 
    errorMsg.toLowerCase().includes("insufficient") || 
    (error && typeof error === "object" && (error as any).code === "permission-denied");

  if (!isPermissionError) {
    // If it's not a permission error, throw the original error or a simple error
    throw error instanceof Error ? error : new Error(errorMsg);
  }

  const currentUserId = auth ? auth.currentUser?.uid : null;
  const currentUserEmail = auth ? auth.currentUser?.email : null;
  const currentEmailVerified = auth ? auth.currentUser?.emailVerified : null;
  const currentIsAnonymous = auth ? auth.currentUser?.isAnonymous : null;
  const currentTenantId = auth ? auth.currentUser?.tenantId : null;
  const currentProviderData = auth ? auth.currentUser?.providerData : [];

  const errInfo: FirestoreErrorInfo = {
    error: errorMsg,
    authInfo: {
      userId: currentUserId,
      email: currentUserEmail,
      emailVerified: currentEmailVerified,
      isAnonymous: currentIsAnonymous,
      tenantId: currentTenantId,
      providerInfo: currentProviderData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Hardened Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on startup (Critical Constraint)
export async function testConnection() {
  if (!db) {
    console.warn("Firestore service is inactive or offline.");
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline. Local caching and offline mode enabled.");
    } else {
      console.warn("Firestore initial connection warning:", error);
    }
  }
}

// Trigger initial validation safely
try {
  testConnection();
} catch (e) {
  console.warn("Connection test failed to initiate:", e);
}
