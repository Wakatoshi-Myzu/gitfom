# 🐙 GitHub Follower Management & Unfollow Tracker Dashboard

An interactive, high-performance web dashboard built to analyze your GitHub follower vs. following relationships. Easily identify **non-reciprocal accounts (users who don't follow you back)**, protect important connections with a **Safe Whitelist**, and execute rate-controlled **Bulk Unfollows** safely without triggering GitHub API rate limits.

---

## 📸 Screenshots

<!-- Place your application screenshots here -->
<div align="center">
  <img src="./public/screenshots/dashboard-preview.png" alt="Dashboard Preview" width="100%" />
</div>

<details>
  <summary>🔍 <b>Click to expand additional screenshots & features</b></summary>
  <br/>
  
  | Feature | Screenshot |
  | :--- | :--- |
  | **PAT Authentication & Demo Mode** | `![Auth Card](./public/screenshots/auth-card.png)` |
  | **Batch Queue Unfollow Processor** | `![Batch Unfollow Modal](./public/screenshots/batch-modal.png)` |
  | **Safe Whitelist & Dark Mode** | `![Whitelist View](./public/screenshots/whitelist-view.png)` |

</details>

---

## ✨ Key Features

- **📊 Relationship Analytics**: Automatically analyzes and categorizes your GitHub profile into 4 distinct groups:
  - 🚨 **Not Following Back**: Accounts you follow that don't follow you back (*Primary Target*).
  - 🤝 **Mutual Connections**: Accounts where both users follow each other.
  - ⭐ **Fans**: Followers you haven't followed back yet.
  - 👥 **All Following**: Complete list of accounts you follow.
- **🛡️ Safe Whitelist Protection**: Pin/star essential accounts (e.g., maintainers, colleagues, organizations) to permanently protect them from batch unfollow actions.
- **⚡ Anti-Abuse Rate-Controlled Queue**: Sequential batch runner with artificial delays (800ms per request), pause/resume controls, and real-time progress logging to strictly comply with GitHub REST API rate limits.
- **🎮 Interactive Demo Mode**: Instant preview with full dummy data—no Personal Access Token required to test UI capabilities.
- **🎨 Modern Design System**: Pure CSS semantic tokens (HSL/OKLCH), responsive layout, glassmorphism, Framer Motion animations, and seamless Light/Dark mode toggling.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **State Management & Caching**: [TanStack Query v5](https://tanstack.com/query/latest) (`@tanstack/react-query`)
- **Data Tables**: [TanStack Table v8](https://tanstack.com/table/latest) (`@tanstack/react-table`)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + Pure CSS Variables
- **Icons & Animations**: [Lucide React](https://lucide.dev/) + [Framer Motion](https://www.framer.com/motion/) + `canvas-confetti`
- **Package Manager**: [Bun](https://bun.sh/) / `npm` / `pnpm`

---

## 🚀 Quick Start & Setup

### Prerequisites

Ensure you have **Node.js 18+** or **Bun** installed on your system.

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com-myzu:Wakatoshi-Myzu/gitfom.git
   cd gitfom
   ```

2. **Install dependencies**:
   ```bash
   # Using Bun (Recommended)
   bun install

   # Or using npm
   npm install
   ```

3. **Start the development server**:
   ```bash
   # Using Bun
   bun run dev

   # Or using npm
   npm run dev
   ```

4. Open your browser at `http://localhost:5173` (or `http://localhost:5174`).

---

## 🔑 GitHub Personal Access Token (PAT) Setup

No backend setup or hardcoded API keys are required! You can enter your GitHub Personal Access Token directly in the web interface (stored securely in `sessionStorage` only).

### How to Create a Token:

1. Go to [GitHub Developer Settings - Personal Access Tokens](https://github.com/settings/tokens).
2. Choose **Tokens (classic)** or **Fine-grained tokens**:
   - **Tokens (classic)**: Select scope **`user`** (or `user:follow` & `read:user`).
   - **Fine-grained tokens**: Under **Account permissions**, set **Followers** to **Read and write**.
3. Copy your generated token (`ghp_...` or `github_pat_...`) and paste it into the dashboard input.

*Alternatively, click **"Coba Demo Mode"** on the login screen to test the app without a token.*

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts Vite local development server |
| `bun run build` | Compiles TypeScript & builds production bundle to `/dist` |
| `bun run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `bun run preview` | Previews the production build locally |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
