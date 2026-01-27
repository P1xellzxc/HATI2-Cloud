# HATI² Cloud 👺
**Your Private "Manga-Style" Financial Sanctuary**

A privacy-focused, Notion-style, Manga-aesthetic Personal Finance PWA (Progressive Web App). Built with Next.js 16 (App Router), Supabase (Auth & DB), and Tailwind CSS v4.

## 🌟 Key Features
*   **Hub & Spoke Model**: Create isolated "Folders" (e.g., "Personal", "Japan Trip", "Office Expense") with distinct members.
*   **Manga x Notion Aesthetic**: High-contrast "Manga Panel" UI with pastel/paper backgrounds (`index.css` / `globals.css`).
*   **Privacy First**: No "Global Social Network". You track *only* what you want, where you want.
*   **Expense Splitting**: Split expenses equally or by percentage (coming soon) within folders.
*   **PWA Ready**: Installable on mobile home screens.

## 🛠️ Tech Stack
*   **Frontend**: Next.js 16, React 19, TypeScript
*   **Styling**: Tailwind CSS v4 (with custom "Manga" utilities)
*   **Database**: Supabase (PostgreSQL)
*   **Auth**: Supabase Auth (Magic Link / Passwordless)
*   **State**: Server Actions & URL State

## 🚀 Getting Started

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/hati2-cloud.git
    cd hati2-cloud
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 📄 Documentation
*   [**FAQ**](./FAQ.md) - Common questions about HATI² Cloud.
*   [**Privacy Policy**](./PRIVACY.md) - How we handle your data (or rather, how we *don't*).

## 🤝 Contributing
This is a private project, but suggestions are welcome!
