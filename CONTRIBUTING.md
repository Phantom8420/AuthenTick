# Contributing to AuthenTick

First off, thank you for considering contributing to AuthenTick! It's people like you that make it such a great tool.

## 🤝 Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/authentick.git
   cd authentick
   ```
3. **Set up the upstream remote**:
   ```bash
   git remote add upstream https://github.com/your-org/authentick.git
   ```

## 🛠️ Development Environment

We use a mono-repo structure with npm workspaces. To install all dependencies across the frontend, backend, and smart contracts:

```bash
npm install
```

Make sure you copy `.env.example` to `.env` and configure any necessary external credentials (such as your Firebase settings or Gemini keys).

You can run the entire local testing stack (including the database) with:
```bash
npm run dev:stack
```

## 🧑‍💻 Code Style & Standards

- **TypeScript Standard**: We use TypeScript across the entire off-chain stack. Ensure you compile successfully before committing (`npm run lint`).
- **Formatting**: Please adhere to the configured Prettier formatting standard.
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
