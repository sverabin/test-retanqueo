# PDF Uploader

A single-page application hosted on AWS Amplify that lets authenticated users upload PDF documents to a private S3 bucket. Authentication is handled by Amazon Cognito (email + name registration).

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **AWS Amplify Gen 2** — infrastructure as code (Cognito + S3)
- **@aws-amplify/ui-react** — pre-built auth UI components
- **Node 20**

## Project structure

```
├── amplify/
│   ├── auth/resource.ts      # Cognito User Pool (email login, name attribute)
│   ├── storage/resource.ts   # S3 bucket (per-user private access)
│   └── backend.ts            # Combines auth + storage
├── src/
│   ├── components/
│   │   └── FileUpload.tsx    # PDF upload UI with progress bar
│   ├── App.tsx               # Authenticator wrapper + layout
│   ├── main.tsx              # Entry point
│   └── index.css             # Styles
├── amplify.yml               # Amplify Hosting build config
└── vite.config.ts
```

## Prerequisites

- Node 20+
- An AWS account with the [AWS CLI configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)

## Local development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the sandbox** (deploys Cognito + S3 to your AWS account and generates `amplify_outputs.json`)
   ```bash
   npm run sandbox
   ```
   Leave this running in a separate terminal. It watches for backend changes.

3. **Start the dev server**
   ```bash
   npm run dev
   ```

## Deploy to Amplify Hosting

1. Push this repository to GitHub (or another Git provider).
2. Open the [AWS Amplify console](https://console.aws.amazon.com/amplify/) and choose **Create new app**.
3. Connect your repository and branch.
4. Amplify automatically detects `amplify.yml` and runs:
   - **Backend build**: deploys Cognito + S3 via `npx ampx pipeline-deploy`
   - **Frontend build**: `npm run build` → serves the `dist/` folder
5. Grant Amplify the required IAM permissions when prompted (the console will guide you).

## How it works

| Feature | Implementation |
|---|---|
| Sign up | Cognito User Pool — collects **name** + **email**, sends a verification code |
| Sign in | Email + password; Cognito manages sessions and JWTs |
| PDF upload | `uploadData` from `aws-amplify/storage` streams the file directly to S3 |
| Isolation | Each file is stored under `uploads/{identityId}/` — users can only access their own files |
| Progress | `onProgress` callback drives a live progress bar |
