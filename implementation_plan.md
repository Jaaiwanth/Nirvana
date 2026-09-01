# Implementation Plan: NIRVANA 

This document outlines the technical implementation plan for building the NIRVANA emergency response coordination agent. The goal is to build a high-performance, focused MVP (Minimum Viable Product) for the hackathon that strictly adheres to the core architecture: Incident Analysis, Resource Search, Route Analysis, and Decision Making.

## Open Questions

1. **Tech Stack**: Do you have a preferred language/framework? (e.g., Python with FastAPI is excellent for AI/Agent tasks, or Node.js/TypeScript). 
2. **AI Provider**: Which LLM provider should we use for the Incident Analysis and Decision Agent?
3. **Maps API**: Do you want to integrate a real maps API (like Google Maps or Mapbox) for the hackathon demo, or use a mock distance/ETA calculator (e.g., straight-line distance + simulated traffic multiplier) to save time?
4. **Frontend**: Do you want to build a visual dashboard to demonstrate the system, or just the backend API/CLI?

## Proposed Architecture & Stack

**Recommended Stack:**
- **Backend:** Python (FastAPI) or Node.js (Express/Vite). Python is highly recommended for building LLM-based reasoning agents.
- **Database:** SQLite or in-memory JSON data for the Rescue Resource Database to keep the hackathon setup zero-friction.

## Proposed Modules

### 1. Incident Analysis Module
This module takes raw text input (e.g., "Person trapped in a collapsed building") and extracts structured data.
- **Approach**: Use an LLM with structured output (e.g., Pydantic models in Python) to extract:
  - `incident_type` (e.g., Building collapse)
  - `severity_level` (e.g., Critical, High, Low)
  - `required_equipment` (e.g., [Search & Rescue, Extrication, Ambulance])
  - `location_coordinates`

### 2. Rescue Resource Database
A fast, queryable database of available teams.
- **Approach**: Create a seed script that loads a list of mock teams into an in-memory datastore.
  - Team attributes: `id`, `name`, `status` (Available/Busy), `location` (lat, lng), `equipment_list`, `vehicle_type`.

### 3. Route & GPS Analysis Module
Calculates distance and ETA between the incident and available teams.
- **Approach**: 
  - *Phase 1 (Mock)*: Use the Haversine formula for straight-line distance and a simulated "traffic multiplier" to generate realistic ETAs.
  - *Phase 2 (Real - Optional)*: Integrate a real Distance Matrix API.

### 4. Decision Agent Module
The core logic that ties it all together and makes the final call.
- **Approach**: 
  1. Fetch structured incident details from Module 1.
  2. Query Module 2 for teams that possess the `required_equipment` and are currently `available`.
  3. Send the filtered teams and incident location to Module 3 to calculate ETAs.
  4. Select the team with the lowest ETA (and optionally nearest ambulance/backup).
  5. Output a structured "Dispatch Plan" containing the selected team, route, and ETA.

## Verification Plan

### Automated Tests
- Create unit tests for the Incident Analysis extraction (ensuring the LLM parses severity and equipment correctly).
- Create unit tests for the Route Analysis (ensuring distance/ETA calculations are accurate and account for the mock traffic factor).

### Manual Verification
- We will run end-to-end tests through the API/CLI using 5-10 different emergency scenarios (e.g., "Fire at the docks", "Car crash on highway 9", "Heart attack in apartment 4B").
- We will manually verify that the Decision Agent consistently dispatches the closest, most well-equipped team for each unique scenario.
