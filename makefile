.PHONY: build run npx-build clean test docker-build docker-test docker-test-full docker-test-mcp

build:
	npm run build

run:
	npm start

test:
	npm test

npx-build: build
	npm pack

clean:
	rm -rf dist

# Docker targets for building and testing the Docker image


query-memory:
	node query-memory.js "modern_conversion_result_widget.dart"

docker-build: build
	docker build -t jakkaj/mcp-knowledge-graph .

# MCP-compatible Docker test using StdioClientTransport
docker-test-mcp: docker-build
	@echo "Testing Docker container with MCP StdioClientTransport..."
	node test-list-tools-docker.js

docker-push: docker-build
	docker push jakkaj/mcp-knowledge-graph

