# CrowdStrike Falcon Ingestion Connector

A high-fidelity, secure TypeScript connector designed to ingest threat telemetry from the CrowdStrike Falcon platform into the Lucid AI-native security ecosystem.

## Setup Instructions

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **TypeScript** (v5.x or higher)
- A CrowdStrike Falcon API Client (with `Alerts: Read` scopes)

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-link>
cd lucid-crowdstrike-connector

# Install dependencies
npm install
# Build the project (compiles TS to JS in /dist)
npm run build

# Start the ingestion process
npm start
```

### 3. Architecture & Design Decisions
1. Zero-Dependency Security
I implemented the connector using the Native Fetch API instead of Axios.

Reasoning: In cybersecurity development, minimizing the supply chain attack surface is critical. By using native Node.js capabilities, we reduce the risk of vulnerability inheritance from third-party libraries.

2. Dual-Stage Ingestion Logic
CrowdStrike’s API requires a two-step "Query then Describe" flow.

Decision: I architected the connector to first fetch unique detection IDs and then batch-request full summaries. This prevents excessive memory consumption and ensures we only process relevant alert data.

3. AI-Ready Data Normalization
Lucid's primary value is turning context into insights.

Decision: I built a normalization layer that maps raw vendor JSON into a consistent LucidAlert interface.

LLM Context: I deliberately preserved the raw_payload within the metadata. This allows downstream LLMs to perform deep behavioral analysis on vendor-specific fields that might not fit a standard schema.

4. Fail-Fast Validation (Zod)
I used Zod for runtime environment and schema validation.

Reasoning: It is safer for a security tool to crash immediately on a missing configuration than to attempt to run with partial or insecure settings.

### 4.Known Limitations & Assumptions

Pagination: This demo implements a basic limit of 10 detections. For production, a recursive pagination loop using the after token would be required.

Real-time Processing: This connector operates on a polling basis. For the Lucid production environment, I would recommend transitioning to Falcon Streaming APIs or Webhooks for sub-second threat response.
