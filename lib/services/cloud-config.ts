/**
 * cloud-config.ts
 * Centralized configuration for Google Cloud services and environment variables.
 */

export const CloudConfig = {
  projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'arenasense-ai-prod',
  region: process.env.NEXT_PUBLIC_GCP_REGION || 'asia-south1',
  
  // AI Service Simulation Parameters
  ai: {
    modelVersion: 'gemini-1.5-pro-stadium-v2',
    visionEndpoint: `https://vision.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'arenasense-ai-prod'}`,
    enableAdvancedTelemetry: true,
  },
  
  // App Config
  isProduction: process.env.NODE_ENV === 'production',
  apiVersion: 'v1.2.0',
};
