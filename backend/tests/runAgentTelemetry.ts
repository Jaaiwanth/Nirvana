import http from 'http';
import { app } from '../src/app.js';

const PORT = 5097;
const BASE_URL = `http://localhost:${PORT}`;

async function runLiveAgentTelemetry() {
  console.log(`\n================================================================================`);
  console.log(`🛰️  NIRVANA: REAL-TIME LANGGRAPH AGENT TELEMETRY TRACER`);
  console.log(`================================================================================\n`);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, () => resolve()));
  console.log(`📡 Connected to NIRVANA Emergency Dispatch Coordinator on port ${PORT}.\n`);

  // 1. Subscribe to SSE Stream
  const sseReq = http.request(`${BASE_URL}/api/events`, (res) => {
    let buffer = '';

    res.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const block of lines) {
        if (!block.trim()) continue;

        const eventMatch = block.match(/event:\s*(.+)/);
        const dataMatch = block.match(/data:\s*(.+)/);

        if (eventMatch && dataMatch) {
          const eventName = eventMatch[1].trim();
          try {
            const data = JSON.parse(dataMatch[1].trim());

            if (eventName === 'agent:telemetry') {
              const nodeIcons: Record<string, string> = {
                triageNode: '🧠 [Triage Agent]',
                spatialPruningNode: '🌐 [Spatial Pruner]',
                osrmRoutingNode: '🛣️  [OSRM Router]',
                decisionNode: '⚖️  [Decision Agent]',
                replanningNode: '⚠️  [Replanner]',
                commitAndTelemetryNode: '🚀 [Commit & Track]',
              };

              const icon = nodeIcons[data.nodeName] || `⚙️ [${data.nodeName}]`;
              const timing = data.durationMs !== undefined ? `[${data.durationMs}ms]` : '';

              console.log(`${icon.padEnd(24)} ${timing.padEnd(10)} ➜ ${data.summary}`);
            } else if (eventName === 'team:dispatched') {
              console.log(`\n🚒 DISPATCH BROADCAST: Team ${data.dispatchPlan?.primaryTeam?.callsign} (${data.dispatchPlan?.primaryTeam?.vehicleType}) is en route! ETA: ${data.dispatchPlan?.primaryTeam?.etaMinutes}m\n`);
            }
          } catch {
            // Ignore parse errors on raw heartbeat
          }
        }
      }
    });
  });

  sseReq.end();

  // Wait 300ms for SSE connection handshake
  await new Promise((r) => setTimeout(r, 300));

  console.log(`🚨 Injecting Live Emergency Incident into LangGraph StateGraph...`);
  console.log(`   Report: "Structural collapse at industrial warehouse on 8th Cross. 4 workers trapped under iron beam."\n`);

  // 2. Trigger an Incident
  const payload = JSON.stringify({
    reportText: 'Structural collapse at industrial warehouse on 8th Cross. 4 workers trapped under iron beam.',
    coordinates: { lat: 12.9716, lng: 77.5946 },
  });

  const postReq = http.request(
    `${BASE_URL}/api/incidents`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    (res) => {
      let body = '';
      res.on('data', (d) => (body += d.toString()));
      res.on('end', async () => {
        // Wait for trailing telemetry events to flush
        await new Promise((r) => setTimeout(r, 800));

        console.log(`================================================================================`);
        console.log(`✅ LANGGRAPH AGENT TELEMETRY TRACE COMPLETED SUCCESSFULLY`);
        console.log(`================================================================================\n`);

        sseReq.destroy();
        server.close();
        process.exit(0);
      });
    }
  );

  postReq.write(payload);
  postReq.end();
}

runLiveAgentTelemetry().catch((err) => {
  console.error('Fatal error during agent telemetry tracer:', err);
  process.exit(1);
});
