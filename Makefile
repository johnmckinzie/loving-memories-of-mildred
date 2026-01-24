.PHONY: help build serve clean install

help:
	@echo "Loving Memories of Mildred - Available Commands"
	@echo ""
	@echo "  make install     Install dependencies"
	@echo "  make build       Build the site"
	@echo "  make serve       Build and serve the site locally on port 8000"
	@echo "  make clean       Remove the _site directory"
	@echo "  make help        Show this help message"

install:
	npm install

build:
	npm run build

serve: build
	cd _site && python3 -m http.server 8000

clean:
	rm -rf _site
