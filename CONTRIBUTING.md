# Contributing to AuthenTick

First off, thank you for considering contributing to AuthenTick! It's people like you that make it such a great tool.

## 🤝 Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/Phantom8420/AuthenTick.git
   cd AuthenTick
   ```
3. **Set up the upstream remote**:
   ```bash
   git remote add upstream https://github.com/Phantom8420/AuthenTick.git
   ```

## 🛠️ Development Environment

We use a mono-repo structure with npm workspaces. To install all dependencies across the frontend, backend, and smart contracts:

```bash
npm install
```

Copy `backend/.env.example` to `backend/.env` if you want to change the defaults. Without MongoDB the API uses an in-memory store, so this is enough to start:
```bash
npm run dev
```

Before opening a pull request, run everything CI runs:
```bash
npm run lint && npm test && npm run build
```

## 🧑‍💻 Code Style & Standards

- **TypeScript Standard**: We use TypeScript across the entire off-chain stack. Ensure you compile successfully before committing (`npm run lint`).
- **Smart Contracts**: Solidity files should adhere strictly to standard conventions; run `npm run test:contracts` to ensure all tests pass. Maintain security standard methodologies using standard OpenZeppelin extensions.
- **Commit Messages**: We encourage conventional commit messages (e.g., `feat: Add ZK Verifier`, `fix: Patch metadata ingestion bug`).

## 🚀 Submitting a Pull Request

1. **Branch out** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit your changes**: Document your changes thoroughly.
3. **Push up the changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
4. **Open a Pull Request** against the upstream `main` branch. Provide a comprehensive PR description detailing *what* the changes do and *why* they were needed.

## 🐛 Bug Reports & Feature Requests

If you encounter an issue or have a feature in mind, please open an Issue in our GitHub repository! 
Please include as much detail as possible: steps to reproduce, console logs, your OS, and your browser/Node version.
