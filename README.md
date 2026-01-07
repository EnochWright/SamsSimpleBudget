# SamsSimpleBudget

A simple budget tracker application built with HTML, CSS, JavaScript, compiled with Vite, and wrapped for mobile using Capacitor.

## Prerequisites

- Node.js and npm installed.
- Android Studio (for Android development).

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm start
    ```
    This will start the app at `http://localhost:5173` (or similar).

3.  **Build for production:**
    ```bash
    npm run build
    ```
    The output will be in the `dist` directory.

## Mobile Development (Capacitor)

### Android

1.  Sync the web code to the native project:
    ```bash
    npx cap sync
    ```

2.  Open in Android Studio:
    ```bash
    npx cap open android
    ```
