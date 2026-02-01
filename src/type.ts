export interface LucidAlert {
    id: string;
    source: 'crowdstrike';
    severity: string;
    description: string;
    detectedAt: string;
    metadata: {
      hostId?: string;
      filePath?: string;
      raw: any; 
    };
  }
  
  export interface CrowdStrikeAuth {
    access_token: string;
    expires_in: number;
  }