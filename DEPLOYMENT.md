# Kishan Seva — Deployment Guide

This guide provides instructions on how to deploy the Kishan Seva platform to production environments like Vercel and Netlify.

## Prerequisites

1.  **Supabase Project:** You need a Supabase project set up.
    *   Create a new project at [Supabase](https://supabase.com/).
    *   Get your Project URL and anon/publishable key from **Project Settings -> API**.
    *   Enable **Email Provider** in **Authentication -> Providers -> Email**.
2.  **GitHub Repository:** Push your local repository to a remote GitHub repository.

## Environment Variables

For any deployment platform, you will need to set the following environment variables:

*   `VITE_SUPABASE_URL`: Your Supabase Project URL (e.g., `https://your-project-ref.supabase.co`).
*   `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/publishable key.

Do **NOT** commit your actual `.env` file to the repository. The `.gitignore` is already configured to prevent this. Use the `.env.example` as a template for what keys are needed.

## Option 1: Deploying to Vercel (Recommended)

The project includes a `vercel.json` configuration file tailored for Single Page Applications (SPAs) with proper routing and caching headers.

1.  Log in to [Vercel](https://vercel.com/) and click **Add New -> Project**.
2.  Import your GitHub repository.
3.  Vercel will automatically detect the framework as Vite.
4.  In the **Environment Variables** section, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5.  Click **Deploy**.

Vercel will build and deploy your application. The routing rules in `vercel.json` will ensure that all paths correctly serve the `index.html` file, preventing 404 errors on page refreshes.

## Option 2: Deploying to Netlify

The project includes a `netlify.toml` configuration file to handle SPA routing and caching on Netlify.

1.  Log in to [Netlify](https://www.netlify.com/) and click **Add new site -> Import an existing project**.
2.  Connect to your GitHub provider and select your repository.
3.  Netlify will read the `netlify.toml` file and automatically configure the build settings.
4.  Click on **Site settings -> Environment variables** and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5.  Go to the **Deploys** tab and click **Trigger deploy**.

## Finalizing Deployment

Once deployed:

1.  **Update Supabase Redirect URLs:** Go to your Supabase Dashboard -> **Authentication -> URL Configuration**.
    *   Update the **Site URL** to your new production domain (e.g., `https://kishan-seva.vercel.app`).
    *   Add the domain to the **Redirect URLs** list as well.
2.  **Test the Application:** Open your deployed URL and test the farmer registration/login flow to ensure the Supabase connection is working correctly and emails are being sent.

## Key Optimizations Included

*   **PWA Disabled in Dev:** The Vite config disables the Service Worker in development mode to prevent caching issues while coding. It is fully enabled for the production build.
*   **Asset Caching:** Both `vercel.json` and `netlify.toml` configure aggressive caching (`max-age=31536000, immutable`) for hashed assets in the `/assets/` directory to improve load times.
*   **Chunk Splitting:** The Vite build process is configured to suppress chunk size warnings, as SPAs generally result in slightly larger initial chunks which are then heavily cached.
*   **Security Headers:** Both deployment configs include headers to prevent clickjacking (`X-Frame-Options`), XSS attacks (`X-XSS-Protection`), and MIME-type sniffing (`X-Content-Type-Options`).
