import { app } from '../src/app.js';
import axios from 'axios';

interface BenchmarkResult {
  id: string;
  title: string;
  category: string;
  severity: string;
  primaryTeam: string;
  vehicleType: string;
  distanceKm: number;
  etaMin: number;
  latencyMs: number;
  isExhaustionSubstitute: boolean;
  status: 'PASSED' | 'FAILED';
}

async function runBenchmark() {
  const PORT = 5098;
  const server = app.listen(PORT, async () => {
    console.log(`\n================================================================================`);
    console.log(`🚀 NIRVANA AUTONOMOUS EMERGENCY DISPATCH: 10-SCENARIO STRESS BENCHMARK`);
    console.log(`================================================================================\n`);

    const results: BenchmarkResult[] = [];

    try {
      // 1. Fetch scenario catalog
      const scenariosRes = await axios.get(`http://localhost:${PORT}/api/scenarios`);
      const scenarios: any[] = scenariosRes.data;

      console.log(`📋 Loaded ${scenarios.length} Standardized Disaster Scenarios from Catalog.\n`);

      // Reset fleet initially
      await axios.post(`http://localhost:${PORT}/api/simulate/reset`);

      for (let i = 0; i < scenarios.length; i++) {
        const scen = scenarios[i];
        const t0 = Date.now();

        try {
          // For scenario 10 (Fleet Stress Test), do NOT reset between 9 and 10 to test exhaustion!
          if (i !== 9 && i > 0 && i % 2 === 0) {
            await axios.post(`http://localhost:${PORT}/api/simulate/reset`);
          }

          const response = await axios.post(`http://localhost:${PORT}/api/scenarios/${scen.id}/trigger`);
          const latency = Date.now() - t0;
          const plan = response.data.dispatchPlan;

          results.push({
            id: scen.id,
            title: scen.title,
            category: response.data.triage.incidentType,
            severity: response.data.triage.severity,
            primaryTeam: plan.primaryTeam.callsign,
            vehicleType: plan.primaryTeam.vehicleType,
            distanceKm: plan.primaryTeam.distanceKm,
            etaMin: plan.primaryTeam.etaMinutes,
            latencyMs: latency,
            isExhaustionSubstitute: !!plan.isExhaustionSubstitute,
            status: 'PASSED',
          });

          const substituteFlag = plan.isExhaustionSubstitute ? ' [⚠️ FLEET RE-PLAN]' : '';
          console.log(`  [${i + 1}/${scenarios.length}] ✅ ${scen.title.padEnd(35)} -> ${plan.primaryTeam.callsign} (${plan.primaryTeam.vehicleType})${substituteFlag} | ETA: ${plan.primaryTeam.etaMinutes}m | ${latency}ms`);
        } catch (err: any) {
          const latency = Date.now() - t0;
          results.push({
            id: scen.id,
            title: scen.title,
            category: scen.category,
            severity: scen.severity,
            primaryTeam: 'N/A',
            vehicleType: 'N/A',
            distanceKm: 0,
            etaMin: 0,
            latencyMs: latency,
            isExhaustionSubstitute: false,
            status: 'FAILED',
          });
          console.error(`  [${i + 1}/${scenarios.length}] ❌ ${scen.title} FAILED:`, err.response?.data || err.message);
        }
      }

      // Reset fleet at end
      await axios.post(`http://localhost:${PORT}/api/simulate/reset`);

      // Summary Table
      console.log(`\n================================================================================`);
      console.log(`📊 BENCHMARK SUMMARY & PERFORMANCE AUDIT`);
      console.log(`================================================================================`);

      const passedCount = results.filter((r) => r.status === 'PASSED').length;
      const totalLatency = results.reduce((sum, r) => sum + r.latencyMs, 0);
      const avgLatency = Math.round(totalLatency / results.length);
      const subSecondPass = results.filter((r) => r.latencyMs <= 1500).length;

      console.table(
        results.map((r) => ({
          Scenario: r.title,
          Triage: `${r.severity} ${r.category}`,
          Dispatched: `${r.primaryTeam} (${r.vehicleType})`,
          ETA: `${r.etaMin} min`,
          Latency: `${r.latencyMs} ms`,
          Substitute: r.isExhaustionSubstitute ? '⚠️ Yes' : 'No',
          Result: r.status,
        }))
      );

      console.log(`\n🎯 Total Scenarios Run: ${scenarios.length}`);
      console.log(`✅ Success Rate:        ${passedCount}/${scenarios.length} (${Math.round((passedCount / scenarios.length) * 100)}%)`);
      console.log(`⏱️ Average Latency:     ${avgLatency} ms (Target: < 1000 ms)`);
      console.log(`⚡ Sub-1.5s Rate:       ${subSecondPass}/${scenarios.length} (${Math.round((subSecondPass / scenarios.length) * 100)}%)`);
      console.log(`\n🏁 BENCHMARK RUN COMPLETED SUCCESSFULLY!\n`);

      server.close();
      process.exit(passedCount === scenarios.length ? 0 : 1);
    } catch (fatal: any) {
      console.error('Fatal benchmark execution failure:', fatal.message);
      server.close();
      process.exit(1);
    }
  });
}

runBenchmark();
