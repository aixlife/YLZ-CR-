#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# GCP Cloud Run 프로젝트 초기 설정 스크립트
# 사용법: ./scripts/setup-gcp.sh <PROJECT_ID> <SERVICE_NAME>
# 예시:   ./scripts/setup-gcp.sh my-gcp-project ylz-crm
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_ID="${1:?프로젝트 ID를 입력하세요: ./scripts/setup-gcp.sh <PROJECT_ID> <SERVICE_NAME>}"
SERVICE_NAME="${2:-ylz-crm}"
REGION="asia-northeast3"
REPOSITORY="docker-repo"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 GCP Cloud Run 초기 설정"
echo "  프로젝트: $PROJECT_ID"
echo "  서비스:   $SERVICE_NAME"
echo "  리전:     $REGION (서울)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 프로젝트 설정
echo ""
echo "📌 [1/5] GCP 프로젝트 설정..."
gcloud config set project "$PROJECT_ID"

# 2. 필수 API 활성화
echo ""
echo "📌 [2/5] 필수 API 활성화..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --quiet

# 3. Artifact Registry 저장소 생성 (이미 있으면 건너뜀)
echo ""
echo "📌 [3/5] Docker 이미지 저장소 확인..."
if ! gcloud artifacts repositories describe "$REPOSITORY" --location="$REGION" &>/dev/null; then
  gcloud artifacts repositories create "$REPOSITORY" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker images for Cloud Run services"
  echo "  ✅ 저장소 생성 완료"
else
  echo "  ⏭️  저장소가 이미 존재합니다 (Doctor Engine과 공유)"
fi

# 4. Secret Manager에 환경변수 등록
echo ""
echo "📌 [4/5] Secret Manager 환경변수 등록..."
echo "  (YLZ CRM 전용 시크릿을 등록합니다 — Doctor Engine과 분리)"

declare -A SECRETS=(
  ["YLZ_CRM_SUPABASE_URL"]="YLZ CRM Supabase 프로젝트 URL (https://xxx.supabase.co)"
  ["YLZ_CRM_SUPABASE_ANON_KEY"]="YLZ CRM Supabase Anon Key"
)

for SECRET_NAME in "${!SECRETS[@]}"; do
  DESCRIPTION="${SECRETS[$SECRET_NAME]}"

  if gcloud secrets describe "$SECRET_NAME" &>/dev/null; then
    echo "  ⏭️  $SECRET_NAME 이미 존재 — 건너뜁니다"
    continue
  fi

  read -rp "  $DESCRIPTION ($SECRET_NAME): " SECRET_VALUE
  if [ -z "$SECRET_VALUE" ]; then
    echo "    ⏭️  건너뜀"
    continue
  fi

  echo -n "$SECRET_VALUE" | gcloud secrets create "$SECRET_NAME" \
    --data-file=- \
    --replication-policy=automatic
  echo "    ✅ $SECRET_NAME 등록 완료"
done

# 5. 서비스 계정에 Secret 접근 권한 부여
echo ""
echo "📌 [5/5] 서비스 계정 권한 설정..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')

CLOUDRUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

for SECRET_NAME in "${!SECRETS[@]}"; do
  if gcloud secrets describe "$SECRET_NAME" &>/dev/null; then
    gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
      --member="serviceAccount:${CLOUDRUN_SA}" \
      --role="roles/secretmanager.secretAccessor" \
      --quiet &>/dev/null
    gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
      --member="serviceAccount:${CLOUDBUILD_SA}" \
      --role="roles/secretmanager.secretAccessor" \
      --quiet &>/dev/null
  fi
done
echo "  ✅ Cloud Run + Cloud Build 서비스 계정 권한 설정 완료"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ GCP 초기 설정 완료!"
echo ""
echo "다음 단계:"
echo "  1. Cloud Build 트리거 연결:"
echo "     gcloud builds triggers create github \\"
echo "       --repo-name=YLZ-CR- --repo-owner=aixlife \\"
echo "       --branch-pattern='^main$' \\"
echo "       --build-config=cloudbuild.yaml"
echo "  2. 또는 수동 첫 배포: ./scripts/deploy.sh $PROJECT_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
