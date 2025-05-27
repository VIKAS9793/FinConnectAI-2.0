# 🚀 FinConnectAI 2.0
> 🔍 AI-Powered Insights Platform for Financial Health, Risk Profiling, and Fraud Detection  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Built with Vite](https://img.shields.io/badge/Built%20With-Vite-blueviolet)](https://vitejs.dev/) [![Powered by React](https://img.shields.io/badge/Powered%20by-React-61DAFB?logo=react)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 🧠 Overview
**FinConnectAI 2.0** is an AI-enhanced financial advisor dashboard that empowers users with intelligent decision-making tools. Designed for fintech developers and financial professionals, it offers a sleek UI and AI-powered modules to:
- 🧮 Generate investor risk profiles
- 🕵️ Detect and explain potential fraud cases
- 📊 Visualize portfolio and customer performance
- 🤖 Present insights through modular AI agent cards

## 🔧 System Requirements
| Requirement       | Minimum Version         |
|-------------------|-------------------------|
| Node.js           | >= 18.x                 |
| npm or Yarn       | npm >= 9.x or Yarn >= 1.22 |
| Modern Browser    | Chrome, Firefox, Edge   |
| OS Compatibility  | macOS, Linux, Windows   |  
> ⚠️ Ensure Node.js is installed before setup. [Download Node.js](https://nodejs.org)

## ⚙️ Setup Instructions
1. **Clone the Repository**
```bash
git clone https://github.com/VIKAS9793/FinConnectAI-2.0.git
cd FinConnectAI-2.0
```
2. **Install Dependencies**
```bash
npm install
# or
yarn install
```
3. **Run Development Server**
```bash
npm run dev
# or
yarn dev
```
4. **Access the App**  
Visit: `http://localhost:5173`

## 📁 Project Structure
```
FinConnectAI-2.0/
├── src/
│   ├── components/               # Reusable components
│   │   ├── AgentCard.tsx
│   │   └── FeedbackRating.tsx
│   ├── pages/                    # Page-level views
│   │   ├── Dashboard.tsx
│   │   ├── FraudExplainer.tsx
│   │   ├── RiskProfileGenerator.tsx
│   │   ├── Performance.tsx
│   │   └── Settings.tsx
│   ├── App.tsx                   # App routing
│   └── main.tsx                  # Entry point
├── index.html                    # Base HTML
├── tailwind.config.js            # Tailwind configuration
├── vite.config.ts                # Vite build configuration
└── package.json                  # Dependencies & scripts
```

## 🧩 Core Features
- ✅ **AI Risk Profiler** – Generates financial risk profiles for investors  
- ✅ **Fraud Explainer** – Highlights suspicious activity with context  
- ✅ **Performance Dashboard** – Visual insights into user/portfolio data  
- ✅ **Agent Cards** – Personalized insights from smart assistant modules  
- ✅ **User Feedback** – Collects and displays user sentiment interactively  
- ✅ **Modular Layout** – Clean architecture using `react-router-dom`

## 🛠️ Developer Notes
### Linting
```bash
npm run lint
```

### Styling
Tailwind CSS is used for utility-first styling. Configured via:  
- `tailwind.config.js`  
- `postcss.config.js`

## 📜 License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## 👤 Author
**Developed by:** Vikas  
**GitHub:** [github.com/VIKAS9793](https://github.com/VIKAS9793)  
**Domain Expertise:** Financial Services, AI-Driven Product Development  
**Tech Stack:** React, TypeScript, TailwindCSS, Vite, Modular Architecture
