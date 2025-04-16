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

test-cli: build
	echo '{"jsonrpc":"2.0","id":"1","method":"listTools","params":{}}' | node dist/index.js --server

query-memory:
	node query-memory.js "modern_conversion_result_widget.dart"

docker-build:
	docker build -t mcp-knowledge-graph .

docker-test: docker-build
	echo '{"jsonrpc":"2.0","id":"1","method":"list_tools","params":{}}' | docker run -i --rm mcp-knowledge-graph

docker-test-full:
	@echo "Testing Docker container with MCP protocol..."
	@echo "1. Listing tools..."
	@echo '{"jsonrpc":"2.0","id":"1","method":"list_tools","params":{}}' | docker run -i --init mcp-knowledge-graph
	@echo "2. Reading graph..."
	@echo '{"jsonrpc":"2.0","id":"2","method":"call_tool","params":{"name":"read_graph","arguments":{}}}' | docker run -i --init mcp-knowledge-graph
	@echo "Docker test complete"

# MCP-compatible Docker test using StdioClientTransport
docker-test-mcp: docker-build
	@echo "Testing Docker container with MCP StdioClientTransport..."
	node test-list-tools-docker.js


test-mcp: build
	@echo "Testing with MCP StdioClientTransport..."
	node test-list-tools.js