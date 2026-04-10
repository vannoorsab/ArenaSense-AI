#!/usr/bin/env bash
# ============================================================
#  ArenaSense AI — Google Cloud Run Deployment Script
#  Usage: bash deploy.sh
# ============================================================
set -euo pipefail

# ─── Config ────────────────────────────────────────────────
PROJECT_ID="${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project)}"
REGION="${GOOGLE_CLOUD_REGION:-asia-south1}"
SERVICE="areansense-ai"
REPO="areansense-ai"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/${SERVICE}"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║        ArenaSense AI — Cloud Run Deployment          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Project:  ${PROJECT_ID}"
echo "  Region:   ${REGION}"
echo "  Service:  ${SERVICE}"
echo "  Image:    ${IMAGE}"
echo ""

# ─── Prerequisite checks ───────────────────────────────────
command -v gcloud >/dev/null 2>&1 || { echo "❌  gcloud CLI not found. Install from https://cloud.google.com/sdk"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌  Docker not found. Install from https://docs.docker.com/get-docker/"; exit 1; }

# ─── Enable Required APIs ──────────────────────────────────
echo "▶ Enabling required GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  --project="${PROJECT_ID}" \
  --quiet

# ─── Create Artifact Registry Repository ──────────────────
echo "▶ Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories create "${REPO}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="ArenaSense AI container images" \
  --project="${PROJECT_ID}" \
  --quiet 2>/dev/null || echo "  (Repository already exists)"

# ─── Configure Docker auth ────────────────────────────────
echo "▶ Configuring Docker authentication..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# ─── Build Docker Image ────────────────────────────────────
echo "▶ Building Docker image..."
docker build \
  --tag "${IMAGE}:latest" \
  --tag "${IMAGE}:$(git rev-parse --short HEAD 2>/dev/null || echo 'local')" \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from "${IMAGE}:latest" \
  .

# ─── Push to Artifact Registry ────────────────────────────
echo "▶ Pushing image to Artifact Registry..."
docker push "${IMAGE}:latest"

# ─── Deploy to Cloud Run ──────────────────────────────────
echo "▶ Deploying to Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}:latest" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80 \
  --set-env-vars="NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1" \
  --project="${PROJECT_ID}" \
  --quiet

# ─── Get Service URL ──────────────────────────────────────
SERVICE_URL=$(gcloud run services describe "${SERVICE}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)")

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║           ✅  Deployment Successful!                  ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  URL: ${SERVICE_URL}"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
