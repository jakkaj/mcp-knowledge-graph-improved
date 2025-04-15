.PHONY: build run npx-build clean

build:
	npm run build

run:
	npm start

npx-build: build
	npm pack

clean:
	rm -rf dist