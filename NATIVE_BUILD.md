# Building the Native App

This document provides instructions for building the Android APK and iOS App for HATI² Cloud.

## Prerequisites

### For Android:
- [Android Studio](https://developer.android.com/studio) installed
- Android SDK and Build Tools configured

### For iOS:
- macOS with Xcode installed
- Apple Developer Account (for device testing/distribution)

---

## How It Works (Hybrid Shell)

HATI² Cloud uses **Capacitor** to wrap the web application in a native shell. 

> [!IMPORTANT]
> This app loads your **live, deployed website** inside a native WebView. It requires an **active internet connection** to function. It is NOT an offline-capable app.

---

## Build Steps

### 1. Deploy Your Web App
First, deploy your Next.js app to a hosting provider (Netlify, Vercel, etc.). Get the production URL.

### 2. Update `capacitor.config.ts`
Open `capacitor.config.ts` in your project root and update the `server.url`:

```typescript
server: {
  url: 'https://YOUR-PRODUCTION-URL.netlify.app', // <-- Your live URL here
  cleartext: true
}
```

### 3. Sync Capacitor
Run the sync command to update native projects:

```bash
npx cap sync android
```

### 4. Open in Android Studio
Open the Android project in Android Studio:

```bash
npx cap open android
```

### 5. Build the APK
In Android Studio:
1.  Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2.  Wait for the build to complete.
3.  Click "Locate" to find the generated `app-debug.apk` or `app-release.apk`.

---

## For iOS (macOS Only)

### 1. Add iOS Platform
```bash
npx cap add ios
npx cap sync ios
```

### 2. Open in Xcode
```bash
npx cap open ios
```

### 3. Build and Run
Select your target device in Xcode and click the "Play" button.

---

## Development Tips

### Local Development
For testing on a physical device during development:

1.  Find your computer's local IP (e.g., `192.168.0.108`).
2.  Update `capacitor.config.ts`:
    ```typescript
    server: {
      url: 'http://192.168.0.108:3000',
      cleartext: true
    }
    ```
3.  Run `npx cap sync android`.
4.  Run `npx cap open android`.
5.  Build and install on your device.

> [!WARNING]
> Your phone and computer must be on the **same Wi-Fi network** for this to work.
