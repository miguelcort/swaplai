# 🎨 Swaplai Frontend

## 📖 Overview

The **Swaplai Frontend** is a modern, responsive single-page application built with **React**, **Vite**, and **TypeScript**. It serves as the user interface for the Swaplai mutual assistance marketplace, offering a seamless experience for users to manage projects, exchange habits, and interact with the AI agent.

The UI is designed with a **Glassmorphism** aesthetic using **Tailwind CSS**, supporting both **Light** and **Dark** modes with smooth transitions.

---

## 🛠️ Tech Stack

-   **Core**: React 18, Vite, TypeScript
-   **Styling**: Tailwind CSS (Custom configuration for themes)
-   **State Management**: Zustand (Persisted stores for Auth, Settings, Profile)
-   **Routing**: React Router DOM v6
-   **Data/Auth**: Supabase Client (Auth, Realtime, Database)
-   **Internationalization**: i18next (English/Spanish support)
-   **Icons**: Lucide React
-   **Animations**: CSS Keyframes, Transitions
-   **Onboarding**: Driver.js (Guided product tour)

---

## ✨ Key Features

### 🔐 Authentication & Security
-   **Secure Login/Register**: Integrated with Supabase Auth.
-   **Protected Routes**: Automatic redirection for unauthenticated users.
-   **Smart Redirects**: Authenticated users are automatically redirected to the Dashboard from login pages.
-   **Email Verification**: Clear UI feedback for registration and email confirmation.

### 🎛️ Dashboard & Project Management
-   **Overview Stats**: Real-time tracking of credits, streaks, and active projects.
-   **Project Hub**: Create, manage, and track progress of collaborative projects.
-   **Kanban/List Views**: Visualize tasks and workflow.
-   **Community Tasks**: Explore and apply for tasks posted by other users.

### 🤖 AI Integration
-   **Floating Chat Widget**: Always-accessible AI assistant for quick help or coaching.
-   **Full Chat Interface**: Dedicated page for deep conversations with history persistence.
-   **Contextual Assistance**: The AI understands project context and user history.

### ⚙️ Personalization & UX
-   **Theme System**: Toggle between **Light**, **Dark**, and System preferences.
-   **Gamification**: "Journey" page tracking daily streaks and rewards.
-   **Onboarding Tour**: Interactive guide for new users to discover features (auto-starts on first visit).
-   **Responsive Design**: Fully optimized for mobile and desktop, including a collapsible sidebar and mobile headers.

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+ recommended)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd swaplai/frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_API_URL=http://localhost:8000/api/v1
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`

---

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components (Auth, Chat, Dashboard, Layout, UI kit)
├── hooks/          # Custom React hooks (useAuth, useTour, useToast, etc.)
├── lib/            # Utilities and API clients (Supabase, Projects API)
├── pages/          # Main application pages (Dashboard, Projects, Login, etc.)
├── stores/         # Zustand state stores (Auth, Settings, Profile)
├── styles/         # Global styles and CSS variables
└── types/          # TypeScript type definitions
```

---

## 🎨 Theming

The application uses CSS variables for theming, defined in `src/styles/globals.css`.
-   **Primary Color**: Gold/Sand tone (`#C9A962`)
-   **Backgrounds**: Adaptive to Light/Dark mode.
-   **Text**: High contrast for readability.

To customize colors, modify the `:root` variables in `globals.css` or use the Settings store.

---

> *Built with ❤️ for the Swaplai Community.*
