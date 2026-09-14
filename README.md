# OmniWork — Interruptibility & Context Layer

Know before you interrupt. An intelligent interruptibility and context-sharing layer for remote and hybrid teams, powered by Google Gemini 2.5.

---

## 🚀 Quick Start (Running Locally from GitHub)

### Prerequisites
- Node.js 20+ or 22+
- npm (bundled with Node.js)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/omniwork.git
cd omniwork
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Running in GitHub Codespaces

OmniWork is configured for 1-click execution in **GitHub Codespaces**:
1. In your GitHub repository, click the green **<> Code** button.
2. Select the **Codespaces** tab.
3. Click **Create codespace on main**.
4. Once the terminal opens, run:
   ```bash
   npm run dev
   ```
5. Port `3000` will be automatically forwarded and a preview tab will open.

---

## 📦 Production Build & Run

To build both the React frontend and the bundled Express backend:

```bash
# Compile client and backend bundle into dist/
npm run build

# Start the production server
npm start
```
The production server will listen on `http://0.0.0.0:3000` (or the port specified in `process.env.PORT`).

---

## 🐳 Running with Docker

```bash
# Build Docker image
docker build -t omniwork .

# Run Docker container
docker run -p 3000:3000 -e GEMINI_API_KEY="your-key" omniwork
```

---

## 🛠 Available Scripts

- `npm run dev` — Starts the Vite dev server with integrated Express backend on port 3000
- `npm run build` — Compiles the Vite SPA and bundles `server.ts` into `dist/server.cjs`
- `npm start` — Runs the standalone production Node server from `dist/server.cjs`
- `npm run lint` — Runs TypeScript type-checking (`tsc --noEmit`)
- `npm run clean` — Removes build artifacts

---

## 🏗 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion)
- **Backend API**: Node.js, Express, esbuild
- **AI Engine**: Google Gemini API via `@google/genai` (Gemini 2.5 Flash)
- **CI / DevOps**: GitHub Actions (`.github/workflows/ci.yml`), GitHub Codespaces DevContainer, Dockerfile
