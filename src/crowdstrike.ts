import { z } from 'zod';
import { LucidAlert } from './type.js';

const envSchema = z.object({
  CS_CLIENT_ID: z.string(),
  CS_CLIENT_SECRET: z.string(),
  CS_BASE_URL: z.string().url().default("https://api.crowdstrike.com"),
});

const env = envSchema.parse(process.env);

export class CrowdStrikeConnector {
  private token: string | null = null;

  // Step 1: Secure OAuth2 Authentication
  async authenticate() {
    const params = new URLSearchParams();
    params.append('client_id', env.CS_CLIENT_ID);
    params.append('client_secret', env.CS_CLIENT_SECRET);

    const response = await fetch(`${env.CS_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Auth Failed: ${response.statusText}`);
    }

    const data = await response.json() as { access_token: string };
    this.token = data.access_token;
  }

  // Step 2: Ingest Detection Data
  async fetchDetections(): Promise<LucidAlert[]> {
    if (!this.token) await this.authenticate();

    // Fetch Detection IDs
    const idResponse = await fetch(`${env.CS_BASE_URL}/detects/queries/detects/v1`, {
      headers: { 
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json' 
      }
    });

    const idData = await idResponse.json();
    const ids = idData.resources?.slice(0, 10) || [];

    if (ids.length === 0) return [];

    // Fetch Full Detection Details
    const detailResponse = await fetch(`${env.CS_BASE_URL}/detects/entities/summaries/GET/v1`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ ids })
    });

    const detailData = await detailResponse.json();

    // Step 3: Normalization
    return detailData.resources.map((raw: any) => ({
      id: raw.detection_id,
      source: 'crowdstrike',
      severity: raw.max_severity_displayname,
      description: raw.description || "No description provided",
      detectedAt: raw.created_timestamp,
      metadata: {
        hostId: raw.device?.device_id,
        filePath: raw.behaviors?.[0]?.filepath,
        raw: raw 
      }
    }));
  }
}