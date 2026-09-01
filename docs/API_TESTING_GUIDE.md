# 📡 NIRVANA: Backend API Testing & Verification Guide

> **Base URL:** `http://localhost:5000`  
> **Environment:** Node.js 20+, Express, TypeScript, Groq / Gemini, OSRM  
> **Companion Documents:** [IMPLEMENTATION.md](IMPLEMENTATION.md) | [CONTRIBUTION.md](CONTRIBUTION.md) | [PROGRESS_TRACKER.md](PROGRESS_TRACKER.md)

This comprehensive guide covers how to test, benchmark, and debug all endpoints and real-time streams in the NIRVANA emergency response backend.

---

## ⚡ 1. Instant Automated Verification (1 Command)

Before testing manually, run the built-in automated test suites from the `backend/` directory:

### A. End-to-End Pipeline Integration Test
```bash
cd backend
npm test
```
**What it tests:**
- ✅ Health endpoint (`/health`)
- ✅ Resource inventory loading (all 20 municipal units)
- ✅ Autonomous incident intake & AI triage (`POST /api/incidents`)
- ✅ Real road distance & route polyline calculation via OSRM
- ✅ Autonomous unit selection & dispatch plan generation
- ✅ Real-time telemetry simulation tick (`POST /api/simulate/tick`)
- ✅ Full system reset (`POST /api/simulate/reset`)

---

### B. 10 Disaster Benchmark Stress Test Suite
```bash
cd backend
npm run test:scenarios
```
**What it tests:**
- Sequentially executes all 10 standardized disaster scenarios (structural collapse, chlorine gas leak, highway pileup, high-rise fire, flash flood, cardiac arrest, transformer explosion, lost child search, gas rupture, and fleet stress).
- Benchmarks end-to-end execution latency (averaging **$< 300\text{ms}$** with sub-50ms deterministic fallback).
- Verifies specialized unit matching and fleet exhaustion re-planning.
- Generates a formatted terminal benchmark audit table.

---

### C. AI Latency, Throughput & Cost Optimization Profiler
```bash
cd backend
npm run test:benchmark
```
**What it tests:**
- Profiles Groq LPU inference latency across multiple runs.
- Compares live LLM performance against the deterministic rule engine.
- Calculates token throughput and estimated cost per dispatch ($/1k tokens).

---

## 🚀 2. Starting the Backend Server

```bash
cd backend
npm run dev
```

Expected startup logs:
```text
🚨 NIRVANA Emergency Dispatch Coordinator running on port 5000
📡 SSE Stream active at http://localhost:5000/api/events
🚑 Fleet resources ready: In-memory datastore initialized with 20 municipal units.
```

---

## 📋 3. Complete Endpoint Reference & cURL Examples

> [!NOTE]
> On **Windows PowerShell**, use `curl.exe` instead of `curl` (to avoid PowerShell's built-in `Invoke-WebRequest` alias).

---

### 3.1 Health Check

#### `GET /health`
Verifies that the API server is online and operational.

**cURL:**
```bash
curl -X GET http://localhost:5000/health
```

**Expected Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "NIRVANA Emergency Dispatch Coordinator",
  "timestamp": "2026-09-01T23:15:00.000Z"
}
```

---

### 3.2 Fleet & Resource Management

#### `GET /api/resources`
Lists all 20 municipal emergency response units, their current coordinates, capabilities, and status (`AVAILABLE`, `DISPATCHED`, `EN_ROUTE`, `ON_SCENE`).

**cURL:**
```bash
curl -X GET http://localhost:5000/api/resources
```

**Sample Response Item:**
```json
[
  {
    "id": "team_usar_01",
    "callsign": "Task Force Alpha",
    "baseStationName": "Central Heavy Rescue Depot",
    "vehicleType": "Heavy Rescue Tender",
    "status": "AVAILABLE",
    "capabilities": ["heavy_rescue", "extrication_tools", "structural_shoring", "search_dogs"],
    "equipmentList": ["Hydraulic Cutters", "Pneumatic Rams", "Acoustic Listening Device", "Concrete Saw"],
    "currentLocation": { "lat": 12.978, "lng": 77.585 },
    "speedFactor": 1.0,
    "currentIncidentId": null
  }
]
```

#### `GET /api/resources/available`
Filters the fleet to return only units ready for dispatch (`status === 'AVAILABLE'`).

**cURL:**
```bash
curl -X GET http://localhost:5000/api/resources/available
```

#### `GET /api/resources/:id`
Retrieves a specific rescue team by its identifier.

**cURL:**
```bash
curl -X GET http://localhost:5000/api/resources/team_medic_01
```

---

### 3.3 Autonomous Emergency Incident Dispatch

#### `POST /api/incidents`
The primary engine endpoint. Receives raw emergency text or caller info, executes AI triage, filters available units by geography and capability, queries OSRM for road routes, and autonomously commits a dispatch plan.

#### Scenario A: Structural Collapse with Trapped Victims
**cURL:**
```bash
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "reportText": "Four-story building partially collapsed on 4th Main. At least 3 people trapped under concrete slabs.",
    "coordinates": { "lat": 12.9716, "lng": 77.5946 }
  }'
```

**Expected Response (201 Created):**
```json
{
  "incidentId": "inc_mtiy...12",
  "executionLatencyMs": 350,
  "triage": {
    "incidentType": "structural_collapse",
    "severity": "CRITICAL",
    "requiredCapabilities": ["heavy_rescue", "extrication_tools", "structural_shoring", "als_medical"],
    "estimatedVictims": 3,
    "trappedVictims": true,
    "summary": "Categorized as CRITICAL structural_collapse requiring heavy_rescue..."
  },
  "dispatchPlan": {
    "primaryTeam": {
      "id": "team_usar_01",
      "callsign": "Task Force Alpha",
      "vehicleType": "Heavy Rescue Tender",
      "distanceKm": 2.44,
      "etaMinutes": 3.2,
      "routeCoordinates": [
        [12.978, 77.585],
        [12.975, 77.59],
        [12.9716, 77.5946]
      ]
    },
    "secondarySupport": [
      {
        "id": "team_medic_01",
        "callsign": "Medic 1 (ALS)",
        "vehicleType": "ALS Ambulance",
        "distanceKm": 1.2,
        "etaMinutes": 2.1
      }
    ],
    "reasoning": "Dispatched Task Force Alpha with estimated ETA 3.2 min based on maximum capability match. Assigned Medic 1 for emergency medical support.",
    "priority": "CRITICAL",
    "isFallback": false,
    "isExhaustionSubstitute": false
  }
}
```

#### Scenario B: Industrial Toxic Chlorine Gas Leak
**cURL:**
```bash
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "reportText": "500-liter toxic chlorine cylinder leaking vapor at industrial chemical depot. Workers coughing blood.",
    "coordinates": { "lat": 12.9850, "lng": 77.5700 }
  }'
```
*Dispatches: `Hazmat Unit 1` (Hazmat Response Tender) with decon & chemical detection.*

#### Scenario C: High-Rise Apartment Fire
**cURL:**
```bash
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "reportText": "Flames and black smoke billowing from 12th floor apartment high-rise, occupants trapped on balcony.",
    "coordinates": { "lat": 12.9730, "lng": 77.6010 }
  }'
```
*Dispatches: `Ladder 1` (105ft Aerial Ladder Tender).*

---

### 3.4 Multimodal Audio & Vision Intake

#### `POST /api/incidents/media`
Ingests an emergency scene photograph (e.g., structural collapse, vehicle crash) or a 911 audio distress recording, analyzes visual and acoustic features via Google Gemini (`gemini-3-flash-preview`), and executes autonomous dispatch.

**cURL:**
```bash
curl -X POST http://localhost:5000/api/incidents/media \
  -H "Content-Type: application/json" \
  -d '{
    "mediaBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "mimeType": "image/png",
    "callerNote": "Photo from 5th floor balcony showing collapsed parking garage deck with 2 cars crushed.",
    "coordinates": { "lat": 12.9716, "lng": 77.5946 }
  }'
```

**Expected Response (201 Created):**
Returns structured triage, calculated OSRM route, primary dispatched unit (`Task Force Alpha`), and registers real-time telemetry simulation.

---

### 3.4 1-Click Preset Disaster Scenarios API

#### `GET /api/scenarios`
Returns the catalog of 10 standardized disaster scenarios for frontend 1-click action buttons.

**cURL:**
```bash
curl -X GET http://localhost:5000/api/scenarios
```

#### `POST /api/scenarios/:id/trigger`
Immediately triggers a preset scenario into the dispatch pipeline.

**cURL:**
```bash
# Trigger Urban Structural Collapse
curl -X POST http://localhost:5000/api/scenarios/scen_collapse_01/trigger

# Trigger Industrial Chlorine Gas Leak
curl -X POST http://localhost:5000/api/scenarios/scen_hazmat_02/trigger

# Trigger High-Speed Highway Pileup
curl -X POST http://localhost:5000/api/scenarios/scen_highway_03/trigger

# Trigger Flash Flood & Stranded River Boat
curl -X POST http://localhost:5000/api/scenarios/scen_flood_05/trigger
```

---

### 3.5 Real-Time Telemetry & Simulation

#### `POST /api/simulate/tick`
Manually advances all active dispatched vehicles by 1 step along their physical OSRM road polylines, updating coordinates and broadcasting SSE telemetry.

**cURL:**
```bash
curl -X POST http://localhost:5000/api/simulate/tick
```

**Expected Response (200 OK):**
```json
{
  "message": "Simulation tick executed successfully.",
  "updatedMissionsCount": 2,
  "activeMissions": [
    {
      "incidentId": "inc_mtiy...12",
      "teamId": "team_usar_01",
      "currentStepIndex": 1,
      "totalSteps": 15,
      "initialDistanceKm": 2.44,
      "isComplete": false
    }
  ]
}
```

#### `GET /api/simulate/missions`
Returns all vehicles currently moving on active calls.

**cURL:**
```bash
curl -X GET http://localhost:5000/api/simulate/missions
```

#### `POST /api/simulate/reset`
Resets all vehicles back to their initial base stations and clears active incidents.

**cURL:**
```bash
curl -X POST http://localhost:5000/api/simulate/reset
```

---

### 3.6 Real-Time Server-Sent Events (SSE) Stream

#### `GET /api/events`
Persistent unidirectional HTTP event stream pushing real-time emergency events to dashboards.

**Testing via Terminal:**
```bash
# Using curl with unbuffered output (-N)
curl -N http://localhost:5000/api/events
```

**Testing via Browser Developer Console:**
Open any browser tab (e.g. `http://localhost:5000/health`), press `F12`, and paste:
```javascript
const es = new EventSource('http://localhost:5000/api/events');

es.addEventListener('incident:created', (e) => {
  console.log('🚨 NEW INCIDENT:', JSON.parse(e.data));
});

es.addEventListener('team:dispatched', (e) => {
  console.log('🚒 TEAM DISPATCHED:', JSON.parse(e.data));
});

es.addEventListener('telemetry:update', (e) => {
  const data = JSON.parse(e.data);
  console.log(`🛰️ TELEMETRY: Unit ${data.teamId} at (${data.currentCoordinates.lat}, ${data.currentCoordinates.lng}) - ETA: ${data.etaMinutes}m (${data.progressPercentage}%)`);
});

es.addEventListener('incident:resolved', (e) => {
  console.log('✅ INCIDENT RESOLVED:', JSON.parse(e.data));
});
```

---

## 🛡️ 4. Edge Cases & Safety Verifications

### 1. Fleet Exhaustion Re-planning
**How to test:**
1. Trigger `scen_collapse_01` (dispatches `Task Force Alpha`).
2. Trigger `scen_collapse_01` a second time without resetting (dispatches `Task Force Bravo`).
3. Trigger a third structural collapse:
   - Since both dedicated USAR units are busy, NIRVANA automatically dispatches the nearest cross-trained unit (`Engine 1` or `Ladder 1`).
   - The response includes `isExhaustionSubstitute: true` and an explicit notice:
     ```text
     "⚠️ FLEET EXHAUSTION NOTICE: All specialized units for required capabilities are currently committed. Dispatched nearest available unit Engine 1 as emergency cross-trained substitute."
     ```

### 2. AI Failsafe Fallback
**How to test:**
- Temporarily change `GROQ_API_KEY=invalid_key` in `.env`.
- Trigger any incident.
- **Result:** The system catches the 401 error, activates the sub-50ms rule engine, and safely returns a valid dispatch plan with `isFallback: true` in under $60\text{ms}$.

### 3. Zod Input Schema Validation
**How to test:**
```bash
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{ "reportText": "hi" }'
```
**Result:** Returns `400 Bad Request` with structured Zod errors explaining that `reportText` must be at least 3 characters.
