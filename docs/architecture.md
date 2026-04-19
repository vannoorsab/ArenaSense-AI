# System Architecture

## System Components

ArenaSense AI relies on a clean, scalable, service-oriented architecture designed to handle real-time simulation and AI orchestration.

- **/components**: Houses the React UI logic. It contains pure visual layers (Dashboard, Status Boards, and Heatmaps) that react exclusively to centralized state.
- **/lib/services**: Contains the core business logic engines representing the "brain" of the platform:
  - `CrowdService`: Maintains grid states, zone densities, and heat maps.
  - `GateService`: Handles automated pairing, routing throughput, and capacity constraints.
  - `VisionService`: Interfaces with simulated computer vision (Google Cloud Vision AI) to retrieve real-time density assessments.
  - `AlertService`: Generates and dispatches localized and system-wide threshold warnings.
- **/tests**: Pure testing module validating service boundaries, simulating varying loads, and ensuring robust fail-safes.
- **/app**: Next.js App Router routing structure.

---

## Service Interactions

Communication between services is orchestrated through cyclic simulation ticks.

1. **State Injection:** `VisionService` pulls structural imagery data and provides "density percentages" to the `CrowdService`.
2. **Analysis & Storage:** `CrowdService` caches this structural state to avoid duplicate computations and updates the central zone topology.
3. **Trigger Evaluation:** `AlertService` continuously polls `CrowdService` zones, evaluating metrics against safety thresholds.
4. **Resolution Routing:** If thresholds are breached or trending negatively, `GateService` accesses neighbor-gate matrices to reroute traffic dynamically.

---

## Data Flow

To map exactly how an action translates into system-wide UI rendering, observe the standard pipeline below:

**User Interaction → Crowd Service → Vision AI → Prediction Engine → UI Update**

1. **User Interaction**: An admin selects a specific event or simulation scenario.
2. **Crowd Service**: Bootstraps the baseline configuration and initiates cyclic state tracking.
3. **Vision AI**: Acts as external intelligence, passing "real-time" density factors back into the local state.
4. **Prediction Engine**: Synthesizes the Vision AI current density with previous interval logs, calculating future overflow risks.
5. **UI Update**: Redux/React State consumes the finalized prediction payload, rendering the visual heatmaps and alert banners.
