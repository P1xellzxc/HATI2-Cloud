# HATI² Cloud 💰
**Your Private "Manga-Style" Financial Sanctuary**

A privacy-focused, Notion-style, Manga-aesthetic Personal Finance PWA. Built with Next.js 16, Supabase, and Tailwind CSS v4.

![HATI² Cloud](public/icons/icon-512.png)

## 🌟 Key Features
- **Hub & Spoke Model**: Create isolated "Folders" (e.g., "Personal", "Japan Trip", "Office Expense") with distinct members
- **Manga x Notion Aesthetic**: High-contrast "Manga Panel" UI with neo-brutalist design
- **Privacy First**: No global social network - you track only what you want
- **Expense Splitting**: Split expenses equally or by custom amounts within folders
- **Folder-Specific Invites**: Invite members to specific folders only
- **PWA Ready**: Installable on mobile home screens
- **Android APK**: Native Android app via Capacitor

## 🔐 Authentication
Three login options available:
- **Email + Password** (Recommended) - No rate limits
- **Sign Up** - Create new account with password
- **Magic Link** - Passwordless email login (limited to 4/hour)

## 🛠️ Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4 (custom "Manga" utilities)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Password + Magic Link)
- **Mobile**: Capacitor (Android/iOS)

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/memefernando04-wq/HATI2-Cloud.git
cd hati2-cloud
npm install
```

### 2. Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 📱 Android Build

### Prerequisites
- Android Studio with SDK installed
- Java JDK (included with Android Studio)

### Build APK
```bash
# Set JAVA_HOME (Windows PowerShell)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Build debug APK
cd android
./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🌐 Vercel Deployment

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel URL (e.g., `https://hati-2-cloud.vercel.app`) |

## 🐛 Troubleshooting

### "Vercel showing old version?"
- Go to Vercel Dashboard -> Deployments
- Check if the latest commit failed to build.
- If it failed, click "Redeploy" on the latest commit.

### "Magic Link goes to localhost?"
- You must add `NEXT_PUBLIC_BASE_URL` to Vercel Environment Variables.
- Set it to `https://hati-2-cloud.vercel.app`.
- **After adding variables, you MUST redeploy** for changes to take effect.

## 📄 Documentation
- [**FAQ**](./FAQ.md) - Common questions about HATI² Cloud
- [**Privacy Policy**](./PRIVACY.md) - How we handle your data
- [**Native Build Guide**](./NATIVE_BUILD.md) - Android/iOS build instructions

## 🤝 Contributing
This is a private project, but suggestions are welcome!
