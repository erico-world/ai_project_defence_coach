import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

interface MockFirestoreData {
  id: string;
  [key: string]: any;
}

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  try {
    const apps = getApps();

    // Check if required environment variables are present
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Missing Firebase Admin SDK credentials.");
      console.error(`Project ID: ${projectId ? "✓" : "✗"}`);
      console.error(`Client Email: ${clientEmail ? "✓" : "✗"}`);
      console.error(`Private Key: ${privateKey ? "✓" : "✗"}`);

      // Create fallback in-memory instance for development if missing credentials
      if (!apps.length && process.env.NODE_ENV === "development") {
        console.warn(
          "Creating fallback Firebase Admin instance for development"
        );
        initializeApp({
          projectId: "development-fallback",
        });
      }
    } else if (!apps.length) {
      // Initialize with the credentials
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          // Replace newlines in the private key
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
      console.log("Firebase Admin SDK initialized successfully");
    }

    return {
      auth: getAuth(),
      db: getFirestore(),
    };
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);

    // Return fallback implementations for development
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Returning fallback Firebase Admin services for development"
      );

      // Define type for our mock firestore
      type MockFirestore = {
        collection: (name: string) => {
          add: (data: Record<string, unknown>) => Promise<{ id: string }>;
          doc: (id: string) => {
            get: () => Promise<{
              exists: boolean;
              data: () => MockFirestoreData;
            }>;
            set: (data: Record<string, unknown>) => Promise<void>;
          };
        };
      };

      // Basic fallback implementation of Firestore
      const mockDb: MockFirestore = {
        collection: (name: string) => ({
          add: async (data: Record<string, unknown>) => {
            console.log(`[MOCK FIRESTORE] Adding to ${name}:`, data);
            return { id: `mock-${Date.now()}` };
          },
          doc: (id: string) => ({
            get: async () => ({
              exists: true,
              data: () => ({ id, ...data }),
            }),
            set: async (data: Record<string, unknown>) => {
              console.log(`[MOCK FIRESTORE] Setting ${name}/${id}:`, data);
            },
          }),
        }),
      };

      // We need a mock variable for the document data in the doc().get().data() function
      const data: MockFirestoreData = { id: "mock-id" };

      return {
        auth: {} as ReturnType<typeof getAuth>,
        db: mockDb as unknown as ReturnType<typeof getFirestore>,
      };
    }

    throw error; // Re-throw the error in production
  }
}

export const { auth, db } = initFirebaseAdmin();
