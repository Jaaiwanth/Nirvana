import { app } from '../src/app.js';
import axios from 'axios';

async function runVerification() {
  const PORT = 5099;
  const server = app.listen(PORT, async () => {
    console.log(`[Test Server] Running on port ${PORT}`);

    try {
      // 1. Health check
      const health = await axios.get(`http://localhost:${PORT}/health`);
      console.log('✅ Health Check:', health.data.status);

      // 2. Fetch fleet resources
      const resources = await axios.get(`http://localhost:${PORT}/api/resources`);
      console.log(`✅ Fleet Resources: Retrieved ${resources.data.length} units.`);

      // 3. Dispatch an incident
      console.log('🚑 Testing Autonomous Emergency Dispatch Pipeline...');
      const dispatchRes = await axios.post(`http://localhost:${PORT}/api/incidents`, {
        reportText: 'Severe structural collapse at 4th and Main St. At least 3 people trapped under concrete.',
        coordinates: { lat: 12.9716, lng: 77.5946 },
      });

      console.log(`✅ Incident Created: ${dispatchRes.data.incidentId}`);
      console.log(`   - Triage: ${dispatchRes.data.triage.severity} ${dispatchRes.data.triage.incidentType}`);
      console.log(`   - Primary Dispatched: ${dispatchRes.data.dispatchPlan.primaryTeam.callsign} (${dispatchRes.data.dispatchPlan.primaryTeam.vehicleType})`);
      console.log(`   - Distance: ${dispatchRes.data.dispatchPlan.primaryTeam.distanceKm} km, ETA: ${dispatchRes.data.dispatchPlan.primaryTeam.etaMinutes} min`);
      console.log(`   - Execution Latency: ${dispatchRes.data.executionLatencyMs} ms`);

      // 4. Test simulation tick
      console.log('🛰️ Testing Real-Time Simulation Telemetry Tick...');
      const tickRes = await axios.post(`http://localhost:${PORT}/api/simulate/tick`);
      console.log(`✅ Simulation Tick: Updated ${tickRes.data.updatedMissionsCount} active vehicle missions.`);

      // 5. Test simulation reset
      const resetRes = await axios.post(`http://localhost:${PORT}/api/simulate/reset`);
      console.log('✅ Simulation Reset:', resetRes.data.message);

      console.log('\n🎉 ALL BACKEND HIGH-PRIORITY CHECKS PASSED SUCCESSFULLY!');
      server.close();
      process.exit(0);
    } catch (err: any) {
      console.error('❌ Verification failed:', err.response?.data || err.message);
      server.close();
      process.exit(1);
    }
  });
}

runVerification();
