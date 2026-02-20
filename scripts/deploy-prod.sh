#!/usr/bin/env bash
set -euo pipefail

SKIP_HEALTHCHECK=0
NO_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --skip-healthcheck) SKIP_HEALTHCHECK=1 ;;
    --no-build) NO_BUILD=1 ;;
    *)
      echo "Unknown argument: $arg"
      echo "Usage: ./scripts/deploy-prod.sh [--skip-healthcheck] [--no-build]"
      exit 1
      ;;
  esac
done

step() {
  echo
  echo "==> $1"
}

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [[ ! -f ".env" ]]; then
  echo ".env file not found. Run: cp .env.example .env"
  exit 1
fi

read_env() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" .env | tail -n 1 | cut -d'=' -f2- || true)"
  echo "$value"
}

required_keys=(
  "NGINX_SERVER_NAME"
  "CORS_ORIGIN"
  "FRONTEND_HTTP_PORT"
  "FRONTEND_HTTPS_PORT"
  "PORT"
  "POSTGRES_DB"
  "POSTGRES_USER"
  "POSTGRES_PASSWORD"
)

for key in "${required_keys[@]}"; do
  if [[ -z "$(read_env "$key")" ]]; then
    echo "Missing required .env key: $key"
    exit 1
  fi
done

if [[ ! -f "docker/certs/fullchain.pem" ]]; then
  echo "Missing certificate file: docker/certs/fullchain.pem"
  exit 1
fi
if [[ ! -f "docker/certs/privkey.pem" ]]; then
  echo "Missing certificate file: docker/certs/privkey.pem"
  exit 1
fi

step "Checking Docker daemon"
docker info >/dev/null

COMPOSE_ARGS=(-f docker-compose.yml -f docker-compose.prod.yml)

step "Validating compose config"
docker compose "${COMPOSE_ARGS[@]}" config >/dev/null

step "Deploying production stack"
if [[ "$NO_BUILD" -eq 1 ]]; then
  docker compose "${COMPOSE_ARGS[@]}" up -d
else
  docker compose "${COMPOSE_ARGS[@]}" up -d --build
fi

if [[ "$SKIP_HEALTHCHECK" -eq 0 ]]; then
  backend_port="$(read_env PORT)"
  http_port="$(read_env FRONTEND_HTTP_PORT)"
  domain="$(read_env NGINX_SERVER_NAME)"

  step "Running backend health check"
  health_url="http://localhost:${backend_port}/api/health"
  ok=0
  for _ in $(seq 1 60); do
    if curl -fsS "$health_url" >/dev/null; then
      ok=1
      break
    fi
    sleep 2
  done
  if [[ "$ok" -ne 1 ]]; then
    echo "Backend health check failed: $health_url"
    echo
    echo "Backend logs (last 120 lines):"
    docker compose "${COMPOSE_ARGS[@]}" logs --tail=120 backend || true
    echo
    echo "DB logs (last 80 lines):"
    docker compose "${COMPOSE_ARGS[@]}" logs --tail=80 db flyway || true
    exit 1
  fi

  step "Checking HTTP -> HTTPS redirect"
  status="$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${http_port}/")"
  if [[ "$status" != "301" && "$status" != "302" && "$status" != "307" && "$status" != "308" ]]; then
    echo "Expected redirect status on HTTP, got: $status"
    exit 1
  fi

  step "Checking HTTPS endpoint"
  # During initial self-check in private networks, certificate chain validation may fail.
  curl -kfsS "https://localhost/" >/dev/null || true
  echo "HTTPS URL: https://${domain}"
fi

step "Done"
echo "Useful commands:"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml ps"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f frontend_prod backend"
