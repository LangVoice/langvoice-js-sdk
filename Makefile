.PHONY: help install clean lint format test build publish publish-test release all

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help:
	@echo "$(BLUE)LangVoice SDK - Available commands:$(NC)"
	@echo ""
	@echo "  $(GREEN)make install$(NC)        Install dependencies"
	@echo "  $(GREEN)make install-dev$(NC)    Install dev dependencies"
	@echo "  $(GREEN)make clean$(NC)          Remove build artifacts"
	@echo "  $(GREEN)make lint$(NC)           Run linters"
	@echo "  $(GREEN)make format$(NC)         Format code"
	@echo "  $(GREEN)make test$(NC)           Run tests"
	@echo "  $(GREEN)make build$(NC)          Build package"
	@echo "  $(GREEN)make publish-test$(NC)   Dry run publish"
	@echo "  $(GREEN)make publish$(NC)        Publish to npm"
	@echo "  $(GREEN)make release$(NC)        Full release workflow"
	@echo ""

install:
	npm install

install-dev:
	npm install
	npm install --save-dev

clean:
	rm -rf dist
	rm -rf node_modules/.cache
	rm -rf coverage

lint:
	npm run lint

format:
	npm run format

test:
	npm run test

test-watch:
	npm run test:watch

test-coverage:
	npm run test:coverage

build: clean
	npm run build

publish-test: build
	npm run publish:test

publish: build
	npm run publish:npm

# Version bumping
version-patch:
	npm version patch

version-minor:
	npm version minor

version-major:
	npm version major

# Full release workflow: clean, build, and publish
release: clean lint test build
	@echo "$(YELLOW)Ready to publish. Run 'npm publish --access public' to continue.$(NC)"
	npm publish --access public

# Quick release (skip tests)
release-quick: clean build
	npm publish --access public

# Development workflow
dev: format lint test

# All in one
all: clean format lint test build publish
