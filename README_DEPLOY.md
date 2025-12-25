# RoV SN Tournament Hub - Deployment Guide

This guide provides instructions for building and deploying the integrated React (client) and Node.js (server) application.

The project is configured to be deployed as a single unit, where the Node.js server handles both the API requests and serves the compiled React application.

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)
- A `.env` file in the root directory containing your `MONGODB_URI`.

Example `.env` file:
```
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"
```

## Option 1: Manual Build & Local Production Run

Follow these steps to run the application locally in a production-like environment.

### 1. Build the React Client

From the **root directory** of the project, run the build script defined in the main `package.json` (inside the `json` folder):

```bash
npm run build --prefix json
```

This command does two things:
1.  It runs `npm install` inside the `client` directory.
2.  It runs `npm run build` inside the `client` directory, which compiles the React app into the `client/dist` folder.

### 2. Start the Production Server

Once the build is complete, start the Node.js server from the **root directory**:

```bash
npm start --prefix json
```

This will launch the Express server, which will now serve the static files from `client/dist` in addition to handling all API calls.

Your application should now be running at `http://localhost:3001` (or the port specified in your environment).

---

## Option 2: Deploying to a Hosting Service (Render, Vercel, etc.)

Hosting services like Render can automatically build and deploy your application using the scripts in `json/package.json`.

Here are the typical settings you would use for a "Web Service" on a platform like Render:

- **Repository**: Connect your GitHub repository.
- **Root Directory**: Leave this blank if your `package.json` is in a subdirectory (`json` in this case), or configure it if the platform requires pointing to the root. Some platforms auto-detect the setup.
- **Build Command**: `npm run build --prefix json`
- **Start Command**: `npm start --prefix json`
- **Environment Variables**: Add your `MONGODB_URI` and any other secrets from your `.env` file to the service's environment settings.

The platform will use these commands to build the frontend and start the backend server, resulting in a fully deployed application. Vercel deployment would be similar, though it might require a `vercel.json` for a combined backend/frontend setup like this. The provided `vercel.json` in the project is likely configured for this purpose.
