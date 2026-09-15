# Kampus-QReady Backend Hosting Guide

## Overview

The Kampus-QReady backend is hosted on Render.

The backend uses:
- Node.js
- Express
- Render for hosting
- GitHub for version control and automatic deployment

## Current Hosting Status

The initial backend hosting environment has been successfully configured and tested.

The following have been confirmed:
- The Node.js/Express backend runs successfully on Render.
- The backend is accessible through a public Render URL.
- Render is connected to the Kampus-QReady GitHub repository.
- Automatic deployment after a GitHub push has been tested successfully.

## Hosted Backend

Backend URL:

[https://kampus-qready-api.onrender.com/]

Test endpoint:

GET /

Expected response:

Kampus-QReady API is running successfully

## Current Deployment Branch

During the initial hosting setup, Render is deployed from:

tumelo-hosting

This branch was used temporarily to test the hosting environment without affecting the shared backend branch.

The permanent deployment branch will be updated once the backend team agrees on whether `backend` or `dev` should be used.

## How Deployment Works

The general workflow is:

Developer branch
      ↓
Commit and push changes
      ↓
Create Pull Request
      ↓
Review and merge into deployment branch
      ↓
Render detects the new commit
      ↓
Render automatically redeploys the backend

Team members do not need to manually upload backend files to Render.

## Adding Backend Work

1. Make sure you are working on your own branch.
2. Make your backend changes.
3. Test the changes locally.
4. Commit the changes.
5. Push your branch to GitHub.
6. Create a Pull Request into the agreed shared backend branch.
7. Once the Pull Request is reviewed and merged, Render will automatically deploy the updated backend.

## Render Configuration

Current configuration:

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Root directory: repository root
- Hosting platform: Render

The application uses the port supplied by Render:

`process.env.PORT`

A local fallback port of `3000` is used during development.

## Environment Variables

Sensitive information must NOT be committed to GitHub.

Examples include:

- Database connection strings
- JWT secrets
- API keys

Local environment variables should be stored in a `.env` file.

The `.env` file is included in `.gitignore`.

Production environment variables will be configured securely through Render.

## Database

PostgreSQL integration has not yet been added to the hosted backend.

Once the project database is ready, the backend will be configured to connect to PostgreSQL using environment variables rather than hard-coded credentials.

## Support

For problems related to Render deployment or backend hosting, contact Tumelo.