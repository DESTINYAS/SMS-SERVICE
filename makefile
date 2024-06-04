run:
	docker compose -f docker/docker-compose.yml up -d

down:
	docker compose -f docker/docker-compose.yml down

follow-logs:
	docker compose -f docker/docker-compose.yml logs -f


build:
	docker compose -f docker/docker-compose.yml build --no-cache