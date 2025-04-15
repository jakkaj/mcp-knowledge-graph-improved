.PHONY: build run npx-build clean test

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