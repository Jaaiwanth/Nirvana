import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚨 NIRVANA Emergency Dispatch Coordinator running on port ${PORT}`);
  console.log(`📡 SSE Stream active at http://localhost:${PORT}/api/events`);
  console.log(`🚑 Fleet resources ready: In-memory datastore initialized with 20 municipal units.`);
});

export default app;
