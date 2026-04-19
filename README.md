# 🏟️ ArenaSense AI: Elite Stadium Crowd Intelligence

ArenaSense AI is a production-grade safety and crowd management platform designed for high-capacity stadiums. It leverages **Google Cloud Vision AI**, **Vertex AI Predictors**, and **Gemini-powered insights** to transform stadium operations into a proactive safety ecosystem.

---

## 🎯 OBJECTIVE
Maximize attendee safety and venue efficiency through real-time crowd monitoring, AI-driven routing, and automated emergency orchestration, achieving a high-fidelity operational awareness.

## ❗ PROBLEM STATEMENT
Modern stadiums face critical challenges during high-attendance events:
- **Fatal Bottlenecks**: Poorly managed transitions during Halftime or Exit Surges.
- **Data Blindness**: Traditional CCTV systems require manual monitoring, leading to delayed responses.
- **Inefficient Entry**: Static gate assignments lead to 40m+ wait times at one gate while others remain empty.

## 💡 SOLUTION APPROACH
ArenaSense AI solves these issues through a **Service-Oriented Architecture (SOA)** that digitizes the physical stadium:
1.  **Digitize**: Convert camera feeds into real-time density metrics via Vision AI.
2.  **Analyze**: Use predictive models to identify congestion 15 minutes before it happens.
3.  **Act**: Pulse dynamic routing instructions to attendee mobile devices and staff dashboards.

---

## 🏛️ PRODUCTION ARCHITECTURE

### 1. UI Layer (`components/`)
*   **Live Heatmap**: High-performance SVG visualization with WCAG 2.1 accessibility.
*   **AI Vision Panel**: Real-time telemetry feed from simulated Cloud Vision API.
*   **Predictive Dashboard**: Forward-looking interface showing expected crowd builds.

### 2. Service Layer (`lib/services/`) - *The Brain*
*   `CrowdService`: Logic for density physics, vector-based movement, and stochastic variance.
*   `GateService`: Non-linear wait-time modeling and dynamic routing suggestions.
*   `AlertService`: Global state sync for system-wide notifications and AI triggers.
*   `EmergencyService`: High-priority safety orchestration and evacuation routing.
*   `CloudAIEngine`: Integration with Google Cloud Vision for anomaly detection.
*   `GoogleCloudLogging`: Structured observability for GCP Cloud Logging.

### 3. Data & Schema (`lib/data/`)
*   Centralized venue definitions and event data ensure strict type safety and consistency.

---

## 🤖 AI DECISION LOGIC

### Prediction Flow
The system uses the `CrowdService` prediction engine:
1.  **Input**: Current Density (%) + Movement Trend (Increasing/Decreasing).
2.  **Process**: If $Density > 65\%$ AND $Trend = Rising$, calculate $TimeToImpact$ based on current flow velocity.
3.  **Output**: `PredictionData` object ingested by the UI and Alert systems.

### Routing Logic
Gate recommendations are calculated using a **Paired-Node Optimization**:
- Each gate is mapped to a "Buddy Gate" (e.g., North Entry pairs with South Entry).
- If Gate A is `High` status, the system checks Gate B.
- If Gate B is `Low` status, a `GateSuggestion` is generated with a calculated `TimeSavingsMinutes`.

---

## ☁️ GOOGLE CLOUD INTEGRATION

- **Google Cloud Vision AI**: Used for automated density estimation and anomaly detection (e.g., bottleneck detection).
- **Cloud Run**: Optimized for stateless, containerized deployment with horizontal auto-scaling.
- **Cloud Logging**: Structured JSON telemetry published via `GoogleCloudLogging` for audit trails and BigQuery analysis.
- **Environment Variables**: Uses `NEXT_PUBLIC_GCP_PROJECT_ID` for secure resource targeting.

---

## 🧪 STRUCTURED TESTING
Run the elite test suite using `npm test`:
- `crowd.test.ts`: Validates crowd physics and edge-case saturation.
- `gate.test.ts`: Ensures routing logic correctly identifies optimal exits.
- `alert.test.ts`: Tests real-time synchronization and AI trigger logic.

---

## ♿ ACCESSIBILITY (WCAG 2.1)
- **Aria-Labels**: Comprehensive labeling for all interactive and visual components.
- **Keyboard Navigation**: Full support for Tab, Enter, and Space keys.
- **Live Regions**: `aria-live="polite"` used for real-time alert updates.

---

## 🚀 DEPLOYMENT (CLOUD RUN)

### 1. Build and Tag
```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/arenasense-ai
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy arenasense-ai \
  --image gcr.io/[PROJECT_ID]/arenasense-ai \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_GCP_PROJECT_ID=[PROJECT_ID]
```

---
**ArenaSense AI** - *Engineering Stadium Safety through Intelligence.*
