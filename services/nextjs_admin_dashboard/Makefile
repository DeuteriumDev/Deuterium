#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)

install: ## Install pre-req software
	@yarn install --immutable
.PHONY: install
 
help: ## Show this help
	@echo "\nSpecify a command. The choices are:\n"
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[0;36m%-12s\033[m %s\n", $$1, $$2}'
	@echo ""
.PHONY: help

dev: ## startup the app for local use
	@yarn run next dev
.PHONY: dev

clean:
	@rm -rf .next
.PHONY: clean

build: clean ## build the app
	@clear
	@yarn run next build
	@mv .next/static .next/standalone/.next/
	@mv .next/public .next/standalone || true
.PHONY: build

start: ## Run the built version of the app
	@PORT=4004 node .next/standalone/server.js
.PHONY: start

lint: ## Lint the app, should run before build since it's more terse and faster
	@yarn run next lint
.PHONY: lint

