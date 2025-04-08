import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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

      // Basic fallback implementation of Firestore
      const mockDb = {
        collection: (name: string) => ({
          add: async (data: any) => {
            console.log(`[MOCK FIRESTORE] Adding to ${name}:`, data);
            return { id: `mock-${Date.now()}` };
          },
          doc: (id: string) => ({
            get: async () => ({
              exists: true,
              data: () => ({ id, ...data }),
            }),
            set: async (data: any) => {
              console.log(`[MOCK FIRESTORE] Setting ${name}/${id}:`, data);
            },
          }),
        }),
      };

      return {
        auth: {} as any,
        db: mockDb as any,
      };
    }

    throw error; // Re-throw the error in production
  }
}

export const { auth, db } = initFirebaseAdmin();
