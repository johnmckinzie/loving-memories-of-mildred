.PHONY: help build serve clean install

PORT ?= 8000

help:
	@echo "Loving Memories of Mildred - Available Commands"
	@echo ""
	@echo "  make install     Install dependencies"
	@echo "  make build       Build the site"
	@echo "  make serve       Build and serve the site locally (set PORT to change the port; default 8000)"
	@echo "  make clean       Remove the _site directory"
	@echo "  make help        Show this help message"

install:
	npm install

build:
	npm run build

serve: build
	PORT=$(PORT) node scripts/serve.js

clean:
	rm -rf _site
