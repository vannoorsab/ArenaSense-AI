# ArenaSense AI — Smart Stadium Platform

**ArenaSense AI** is a cutting-edge, AI-driven stadium management platform designed to optimize public safety and the fan experience for large-scale sporting events. Built for the Google Antigravity Challenge, it demonstrates the power of Gemini-inspired intelligence and Google Cloud integration.

## 🏆 Project Overview

*   **Vertical**: Smart Cities / Public Infrastructure
*   **Persona**: Stadium Operations & Attendee Experience
*   **Mission**: Transform raw crowd data into actionable safety intelligence.

## 🚀 Key Features

### 1. Real-Time Crowd Intelligence
*   **Cloud Vision AI Integration**: Analyzes density across 10+ major stadium zones.
*   **LOS Modeling**: Uses the Fruin Level-of-Service model to calculate risk levels.
*   **Heatmap Visualization**: Dynamic color-coded representation of "Yellow Army" (CSK) fan density.

### 2. Intelligent Gate Routing
*   **Load Balancing**: Automatically detects gate bottlenecks.
*   **Smart Suggestions**: Recommends alternate entry/exit gates to balance crowd loads.
*   **Wait Time Prediction**: Continuous wait-time estimation based on queue physics.

### 3. 🛡️ Emergency Intelligence (WOW Feature)
*   **Panic Detection**: AI detects abnormal movement patterns indicative of emergencies.
*   **Safe Evacuation**: One-touch evacuation mode that highlights danger zones and suggests the safest routes to assembly points.

### 4. 💎 Gemini AI Assistant
*   **Natural Language Support**: A conversational concierge powered by simulated Gemini response logic.
*   **Zero-Auth Accessibility**: Frictionless access for peak-load events.

## 🏛️ Architectural Excellence

*   **Code Quality**: Modular architecture split into `components`, `services`, and `utils`. Typed with **TypeScript** and documented with **JSDoc**.
*   **Security**: Centralized `InputValidator` service ensures all data is sanitized. Environment-based `CloudConfig` prevents configuration leaks.
*   **Efficiency**: Memoized React components and optimized `useMemo` hooks ensure smooth performance under high update frequency.
- **Testing**: Dedicated **System Validation Suite** providing PASS/FAIL logging for all core modules.
*   **Accessibility**: **WCAG 2.1 AA** compliant with `aria-labels`, keyboard navigation, and high-contrast support.

## ☁️ Google Cloud Services

*   **Google Cloud Run**: Highly scalable container hosting for the Next.js frontend and edge logic.
*   **Google Cloud Vision AI**: Simulated API signatures for real-time crowd density analysis.
*   **Google Cloud Logging**: Structured telemetry logging to ensure production visibility.

## 🛠️ Deployment & Setup

1.  **Clone the Repository**: `git clone https://github.com/vannoorsab/ArenaSense-AI.git`
2.  **Install Dependencies**: `npm install`
3.  **Configure Environment**: Create `.env.local` with `NEXT_PUBLIC_GCP_PROJECT_ID`.
4.  **Run Development**: `npm run dev`
5.  **Build Production**: `npm run build`
6.  **Deploy to Cloud Run**: `bash deploy.sh`

---

*Built with passion for the Yellow Army by Dudekula Vannoor Sab.*
