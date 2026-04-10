# ArenaSense AI — Smart Stadium Platform

**ArenaSense AI** is a production-ready, AI-driven stadium management platform designed to handle peak crowd loads and optimize the fan experience for large-scale sporting events, with a specific focus on **Chennai Super Kings (CSK)** Indian Premier League (IPL) matches.

## 🏆 Project Overview

- **Vertical**: Smart Cities / Public Infrastructure (Smart Stadiums)
- **Primary Goal**: Enhance public safety and operational efficiency through real-time AI crowd intelligence.
- **Core Technology**: Next.js 15, Tailwind CSS, Google Cloud Run, and Simulated Google Cloud AI (Vision/Vertex).

## 🚀 How the Solution Works

### 1. Real-Time Crowd Intelligence
The system uses the **Fruin Level-of-Service (LOS)** model to calculate pedestrian flow and density.
- **AI-Vision Integration**: The `CloudAIEngine` simulates high-fidelity responses from Google Cloud Vision API, analyzing video feeds from 10+ stadium zones to detect bottlenecks or rapid movements.
- **Heatmap Visualization**: Dynamic heatmaps provide administrators with an instant visual representation of stadium density.

### 2. Intelligent Gate Management
The platform manages 4 Entry and 4 Exit gates simultaneously.
- **Smart Routing**: When a gate reaches the "High" crowd threshold (Density > 75%), the system automatically recommends alternate routes (e.g., "Gate 1 is busy, use Gate 3") to balance the load.
- **Wait Time Prediction**: Continuous analysis provides attendees with estimated wait times, reducing frustration and preventing entry-rush bottlenecks.

### 3. Real-Time Alert Synchronization
Using a simulated real-time pub/sub system, stadium administrators can broadcast critical safety alerts and operational updates instantly to all user devices without requiring a page refresh.

### 4. Immersion for CSK Fans
Designed specifically for the "Yellow Army," the platform dynamically loads stadium layouts (Chepauk, Wankhede, Eden Gardens) based on the match venue, providing fans with sector-specific navigation and density info.

## 🛠️ Approach & Logic

- **No-Login Architecture**: To maximize accessibility during high-traffic events, the system operates as a zero-auth platform, ensuring fans can access safety data in seconds.
- **Multi-Stage Processing**: 
  1. **Capture**: Simulated camera frames mapped to `VISION_ZONES`.
  2. **Analyze**: `CloudAIEngine` performs density estimation and anomaly detection.
  3. **Optimize**: `RouteOptimizer` evaluates wait-score metrics to suggest alternatives.
  4. **Broadcast**: `AlertSync` pushes updates to the `LiveAlertBanner` UI.

## 🔍 Assumptions Made

1. **Sensor Coverage**: The stadium is assumed to be equipped with high-resolution CCTV or IoT sensors covering all major entry/exit and concourse areas.
2. **Connectivity**: Fans are assumed to have mobile internet or stadium Wi-Fi access to receive live updates.
3. **Simulated AI**: In a production environment, the simulated `CloudAIEngine` would be replaced with actual Google Cloud Vision API calls or custom Vertex AI models trained on crowd datasets.

## 📦 Deployment

The application is containerized and optimized for **Google Cloud Run**, utilizing:
- **Environment Variables**: For region-specific configurations (`asia-south1`).
- **Cloud Build**: For automated CI/CD pipeline integration.
- **Multi-Stage Docker**: Ensuring a minimal footprint with Next.js standalone output.
