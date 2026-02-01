import 'dotenv/config';
import { CrowdStrikeConnector } from './crowdstrike.js';

async function main() {
  console.log("🚀 Starting Lucid Connector: CrowdStrike...");
  
  const connector = new CrowdStrikeConnector();
  
  try {
    const alerts = await connector.fetchDetections();
    console.table(alerts.map(a => ({ ID: a.id, Severity: a.severity, Time: a.detectedAt })));
    console.log(`✅ Successfully ingested ${alerts.length} alerts.`);
  } catch (error) {
    console.error("❌ Ingestion Failed:", error);
    process.exit(1);
  }
}

main();