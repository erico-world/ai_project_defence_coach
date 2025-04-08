# Project Defence AI Coach - User Guide

This guide will help you set up and use the Project Defence AI Coach effectively.

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- A Firebase account (for authentication and database)
- A VAPI account (for voice AI interactions)
- A Google AI API key (for generating questions and feedback)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ai_project_defence_coach.git
   cd ai_project_defence_coach
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   # Generate a sample environment file
   npm run check-env -- --generate-env

   # Rename and edit with your actual credentials
   mv .env.local.sample .env.local
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   For testing without API keys:

   ```bash
   npm run dev-fallback
   ```

## Setting Up Environment Variables

### Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Add the configuration to your `.env.local` file:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"
   ```

5. Generate a service account key for Firebase Admin:
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Add to `.env.local`:
   ```
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"
   ```

### VAPI Configuration

1. Create an account at [VAPI](https://vapi.ai/)
2. Create a new assistant/workflow
3. Get your Web Token and add it to `.env.local`
   ```
   NEXT_PUBLIC_VAPI_WEB_TOKEN="your-vapi-web-token"
   NEXT_PUBLIC_VAPI_WORKFLOW_ID="your-workflow-id"
   ```

### Google AI API Key

1. Get a Google AI API key from [Google AI Studio](https://ai.google.dev/)
2. Add to `.env.local`
   ```
   GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
   ```

## Using the Application

### Creating a Defence Session

1. Sign up/login to the application
2. Go to the "Project Defence" page
3. Fill in the form with your project details:

   - Project Title
   - Academic Level
   - Focus Type (Theory/Implementation balance)
   - Technologies Used (comma-separated)
   - Number of Questions
   - Optional: Upload project documentation

4. Click "Create Defence Session"
5. You'll be redirected to the interview page

### During the Defence Session

1. Click "Start Defence" to begin the AI interview
2. Speak clearly into your microphone when answering questions
3. The AI will evaluate your responses in real-time
4. Click "End" when you want to finish the session

### Reviewing Feedback

After completing a defence session:

1. You'll automatically be redirected to the feedback page
2. Review your performance across different categories:
   - Technical Depth
   - Methodology Rigor
   - Presentation Skills
   - Critical Analysis
   - Documentation Alignment
3. Read strengths and areas for improvement
4. Use this feedback to prepare for your real defence

## Troubleshooting

If you encounter issues, try the following:

1. Check environment variables:

   ```bash
   npm run check-env
   ```

2. Clear the cache:

   ```bash
   npm run clean
   ```

3. Restart in development fallback mode:

   ```bash
   npm run dev-fallback
   ```

4. Check browser console (F12) for detailed error messages

5. Refer to `TROUBLESHOOTING.md` for common issues and solutions

## Development Mode

When running in development fallback mode (`npm run dev-fallback`), the application will:

- Use mock data for Firebase operations
- Generate placeholder questions instead of calling the Google AI API
- Skip VAPI authentication and provide mock defense experience
- Create mock feedback without calling external APIs

This is useful for:

- Development without API keys
- Testing the application flow
- Debugging UI issues

## Support

If you need help with the application, please:

1. Check the documentation
2. Look for answers in `TROUBLESHOOTING.md`
3. Submit an issue on GitHub
4. Contact the development team
