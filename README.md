# LiftUp by Hedera: A Decentralized Crowdfunding Platform

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Hedera](https://img.shields.io/badge/Hedera-SDK-green?logo=hedera)](https://hedera.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v9-orange?logo=firebase)](https://firebase.google.com/)
[![Gemini API](https://img.shields.io/badge/Google-Gemini_API-blueviolet?logo=google)](https://ai.google.dev/)

**LiftUp** is a feature-rich, decentralized crowdfunding and micro-investment platform built on the Hedera network. It is designed to bridge the gap between innovative project creators seeking capital and a community of investors who want to support new ideas. By leveraging the power of blockchain technology, LiftUp offers a transparent, secure, and efficient environment for funding and growing projects from the ground up.

---

## 💡 Project Idea & Vision

The core mission of LiftUp is to empower creators by giving them the tools to launch their ideas and to provide investors with a trusted system to back projects they believe in. All financial transactions are recorded on the Hedera public ledger, ensuring accountability and building a foundation of trust.

-   **For Creators:** An easy way to tokenize an idea, raise funds through HBAR, and manage the project with milestone-based payouts.
-   **For Investors:** A secure platform to discover and invest in promising projects, knowing their funds are held in escrow and released only upon tangible progress.

## ✨ Key Features

### For Project Creators
-   **Effortless Project Creation:** A streamlined, step-by-step process to define a project, funding goals, and campaign deadline.
-   **AI-Powered Assistant:** Integrated with the Gemini API, an "AI Project Assistant" helps creators enhance their project proposals by generating more compelling and professional titles and descriptions.
-   **Automatic Tokenization:** On project creation, a unique fungible token is minted on the Hedera Token Service (HTS).
-   **Milestone-Based Funding:** Creators can structure their projects into milestones, allowing for a phased release of funds from escrow as progress is made.
-   **Investor Engagement:** A dedicated "Updates" section enables creators to post regular updates and maintain transparent communication.

### For Investors
-   **Project Discovery Dashboard:** A central dashboard to browse, filter, and sort all active projects.
-   **Secure Escrow System:** All HBAR investments are transferred to a secure, platform-managed escrow account, protecting investor funds.
-   **Flexible Investment Options:** Investors can contribute to projects using either HBAR or the project's unique custom token.
-   **On-Chain Transparency:** Every investment and fund release is a verifiable transaction on the Hedera network, viewable on HashScan.
-   **Portfolio Tracking:** A profile page provides a complete history of all investments made by the user.

---

## 🛠️ Technology Stack

-   **Frontend:** React 19, TypeScript, React Router, Chart.js
-   **Styling:** TailwindCSS (simulated via global styles)
-   **Blockchain:** Hedera SDK for JavaScript (@hashgraph/sdk)
    -   Account Creation
    -   Token Creation (HTS)
    -   HBAR & Token Transfers
-   **Backend & Database:** Firebase
    -   **Firestore:** NoSQL database for storing user, project, and investment data.
    -   **Firebase Authentication:** For user management (signup/login).
-   **Artificial Intelligence:** Google Gemini API for the "AI Project Assistant" feature to improve project descriptions.

---

## 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/)
-   A Hedera Testnet account (to act as the platform operator). You can create one on the [Hedera Portal](https://portal.hedera.com/).
-   A Firebase project. You can create one on the [Firebase Console](https://console.firebase.google.com/).

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/liftup-by-hedera.git
cd liftup-by-hedera
```

### 2. Install Dependencies
This project uses an `importmap`, so no `npm install` is required for the provided code structure. If you migrate to a standard build tool like Vite or Create React App, you would run:
```bash
npm install
```

### 3. Set Up Environment Variables

You need to create a `.env` file in the root of the project and add your credentials.

**Required Hedera Variables:**
-   Go to the [Hedera Portal](https://portal.hedera.com/), get your Testnet `Account ID` and `Private Key`.

**Required Firebase Variables:**
-   In your Firebase project, go to Project Settings > General.
-   Register a new web app and copy the `firebaseConfig` object values.
-   Enable Authentication (Email/Password), Firestore Database, and Storage in the Firebase Console.

**Required Gemini API Key:**
-   Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

Create a file named `.env` and add the following, replacing the placeholders with your actual keys:

```
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=1:...

# Hedera Testnet Operator Account
REACT_APP_HEDERA_OPERATOR_ID=0.0.12345
REACT_APP_HEDERA_OPERATOR_KEY=302...

# Google Gemini API Key
API_KEY=your_gemini_api_key...
```

### 4. Run the Application
Start the development server provided by your local environment.

---

## ✅ Good Coding Practices

This project was developed with clean, maintainable, and scalable code in mind.

-   **Modular Architecture:** The application is broken down into logical, reusable components (e.g., `ProjectCard`, `InvestmentModal`, `Spinner`) located in the `components` directory.
-   **Separation of Concerns:**
    -   **Services:** All external API interactions (Firebase, Hedera, Gemini AI) are abstracted into dedicated service files (`services`). This keeps business logic separate from the UI.
    -   **Context API:** Global state management for authentication (`AuthContext`) is handled cleanly, providing user data throughout the app without prop-drilling.
    -   **Custom Hooks:** The `useAuth` hook provides a simple and clean interface to access the authentication context.
-   **Strongly Typed Code:** TypeScript is used throughout the project (`.tsx`, `.ts`) to ensure type safety, reduce runtime errors, and improve developer experience with better autocompletion. All data structures are defined in `types.ts`.
-   **Component-Based UI:** The user interface is built entirely with React, promoting reusability and a declarative programming style.

---
⚠️ Important Note: If you encounter an error during signup (e.g., auth/weak-password), please check the browser console for details. Always ensure your password meets the 6-character minimum.
## 📜 License

This project is licensed under the MIT License.
