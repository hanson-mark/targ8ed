# Targ8ed

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Initial Setup](#initial-setup)
- [Optional Site Configuration](#optional-site-configuration)
- [Deployment (Vercel)](#deployment-vercel)

---

## Overview

**Targ8ed** is a **multi-tenant framework** built with modern web technologies. It allows you to create and manage multiple organizations, each with their own applications, while handling authentication, email verification, and real-time data updates.

## Features

- Multi-organization & application management
- Secure authentication using Clerk (Email, Google)
- Email verification and notifications (via Resend)
- Real-time database with Convex
- Initial setup wizard for first-time configuration
- Prebuilt UI with Tailwind CSS & Shadcn UI

## Technologies Used

- **Next.js** – React framework for full-stack applications
- **Shadcn UI** – Reusable and accessible UI components
- **Tailwind CSS** – Utility-first CSS framework for styling
- **Clerk** – Authentication and user management
- **Convex** – Real-time database and backend functions
- **Resend** – Email delivery service
- **React Email** – Email templates with Tailwind CSS

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/targ8ed/targ8ed.git
cd targ8ed
```

### Install Dependencies

```bash
yarn install
```

### Configure Environment Variables

Copy `.env.example` → `.env.local` (or `.env`) and update it with your own keys.  
Each variable in `.env.example` includes a short guide to help you understand what it’s for.

#### Instructions of collecting required keys

1.  **Get Your Resend API Key**

    1. **Sign up / Log in** at [Resend](https://resend.com).
    2. **Add & verify your domain**
       - Go to **Domains** ([Add Domain](https://resend.com/domains/add))
       - Enter your domain (e.g., `example.com`) → **Add Domain**
       - Copy the DNS records provided and add them to your domain provider’s DNS settings
       - Click **Verify DNS Records** (may take a few minutes)
    3. **Create an API Key**
       - Go to **API Keys** ([Create API Key](https://resend.com/api-keys))
       - Click **Create API Key**, give it a name, set permissions, and click **Add**
       - Copy the generated key
    4. **Add to your environment file** (`.env.local` or `.env`)

       ```env
       RESEND_API_KEY=<your-resend-api-key>
       NEXT_PUBLIC_RESEND_DOMAIN=<your-verified-domain>
       ```

       > ⚠️ **Important:** Do **not** use `localhost:3000` for `NEXT_PUBLIC_RESEND_DOMAIN`. Only use a verified domain from Resend (e.g., `example.com`). Using localhost will fail validation and break email sending.

2.  **Set Up Clerk & Collect Keys**

    1. **Create a Clerk account**
       - Sign up or log in at [clerk.com](https://clerk.com).
       - Create a new **Application** with **Email** + **Google** sign-in enabled.
    2. **Disable password login**
       - Go to **Configure → User & Authentication → Password**
       - Turn off **Password sign-in** → click **Save**.
    3. **Restrict public sign-ups**
       - Go to **Configure → Restrictions**
       - Under **Sign-up Mode**, choose **Restricted** → click **Save**.
       - _(This ensures only invited users can sign up; others must be added manually in the Global App.)_
    4. **Add Convex JWT template**
       - Go to **Configure → JWT Templates → Add new template**
       - Select **Convex** from **Template** select box or option and click **Save**.
    5. **Copy API keys**

       - Go to [API Keys](https://dashboard.clerk.com/last-active?path=api-keys).
       - Copy the following and add them to your `.env.local` (or `.env`):

         ```env
         NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-key>
         CLERK_SECRET_KEY=<your-key>
         NEXT_PUBLIC_CLERK_FRONTEND_API_URL=<frontend-api-url>
         ```

3.  **Encryption Secret**
    Generate a 32-byte key:

    ```bash
    # OpenSSL
    openssl rand -base64 32
    # Or Node.js
    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
    ```

    Add to `.env.local`:

    ```
    ENCRYPTION_SECRET=<your-secret>
    ```

4.  **Setup Convex Keys**

    1.  Run the command:
        ```bash
        npx convex dev
        ```
    2.  **Login (only if not already logged in):**
        - Select **Login or create account**
        - Enter a **device name**
        - Type `Y` when asked to **open the browser**
        - In the browser: **Create an account** or **Login** to Convex
        - Confirm with the code if prompted
        - Accept the **terms & conditions** by typing `Y`
    3.  **Workspace & Project**
        - If you have multiple workspaces, select one
        - Enter a **new project name**
    4.  **Automatic Variables**<br/>
        Convex will add these to `.env.local`:

        - `CONVEX_DEPLOYMENT`
        - `NEXT_PUBLIC_CONVEX_URL`

    5.  **Add Missing Variables in Convex Dashboard**<br/>
        If you see an error about missing variables:

        - Go to [Convex Environment Settings](https://dashboard.convex.dev/deployment/settings) → **Environment Variables** → **Add**
          - `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`
          - `ENCRYPTION_SECRET`
        - Click **Save all**

    6.  **Action URL**

        - Go to [Convex Deployment Settings](https://dashboard.convex.dev/deployment/settings) → **URL and Deploy Key**
        - Click **Show credentials**
        - Copy **HTTP Action URL** and add it to `.env.local`:

          ```env
          NEXT_PUBLIC_CONVEX_ACTION_URL=<your-action-url>
          ```

## Initial Setup

1. Start dev server:

   ```bash
   yarn dev
   ```

2. Visit:

   ```
   http://localhost:3000/initial-setup
   ```

3. Complete the setup form → creates the first admin user, organization, and application.

---

## Optional Site Configuration

If you’d like to customize the project’s branding (name, title, description), update the **site configuration**:

- Open the project in your code editor.
- Navigate to:

  ```
  convex/constants/rootConfig.ts
  ```

- Inside this file, edit the following values:

  ```ts
  const SITE_NAME = 'Targ8ed' as const;

  export const ROOT_CONFIG = {
    site: {
      name: SITE_NAME, // Change this to your site’s name
      title: `${SITE_NAME} - Multi-tenant SaaS Starter Kit`, // Page title
      description: `${SITE_NAME} is a multi-tenant SaaS starter kit built with Next.js.`, // Meta description
    },
    ...
  };
  ```

⚠️ **Important:** Do **not** modify `org.subdomain` or `application.key` — changing these may break core framework functionality.

---

## Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com/)
2. Import the repo as a new project
3. Add environment variables from `.env.local`

   - Update `NEXT_PUBLIC_MAIN_DOMAIN` to your production domain (e.g. `example.com`)

4. Deploy project
5. Configure domains in Vercel settings:

   - Wildcard: `*.example.com`
   - Root: `example.com`
   - With `www`: `www.example.com`

---

✨ That’s it! Your multi-tenant app should now be live.
