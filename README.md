# Project-based To-Do App

A modern, project-based To-Do App built with React Native, Expo SDK 53, and local storage (AsyncStorage). Includes authentication, project/task management, and a clean UI.

## Features
- User authentication (sign up, login, logout)
- Project management (add, view, delete projects)
- Task management within projects (add, complete, delete tasks)
- Project status auto-updates ("In Progress" or "Completed")
- Manual "Save Progress" button for each project
- Local data persistence (no backend required)
- Clean, minimal UI with SafeArea support

## Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/):
  ```sh
  npm install -g expo-cli
  ```
- [Git](https://git-scm.com/)

### 2. Clone the Repository
```sh
git clone https://github.com/SouvikDee/To-Do-App.git
cd To-Do-App
```

### 3. Install Dependencies
```sh
npm install
```

### 4. Start the App
```sh
npm start
```
- Scan the QR code with [Expo Go](https://expo.dev/client) on your phone, or run on an emulator.

## Usage
- **Sign up** for a new account or **login** with an existing one.
- **Add projects** from the Home screen.
- **Tap a project** to view/add tasks.
- **Mark tasks as complete**; project status updates automatically.
- **Tap "Save"** to manually save project progress.
- **All data is stored locally** on your device.

## Tech Stack
- React Native (Expo SDK 53)
- AsyncStorage for local data
- React Navigation
- Functional components & hooks
- TypeScript (for type safety)
