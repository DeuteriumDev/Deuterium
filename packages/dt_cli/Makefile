#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)

clean: ## Remove all contents from build folder
	@rm -rf ./build/*
.PHONY: clean

install: ## Install pre-req software
	@yarn install --immutable
.PHONY: install
 
help: ## Show this help
	@echo "\nSpecify a command. The choices are:\n"
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[0;36m%-12s\033[m %s\n", $$1, $$2}'
	@echo ""
.PHONY: help

build: clean ## build cli by compiling ts files and copying deps from neighboring projects
	@yarn tsc -p ./tsconfig.build.json
	@cp ./src/config_template.yml ./build
	@cp -r ../pg_mod/configurations ./build/
	@cp -r ../pg_mod/templates ./build/
	@yarn run typescript-json-schema ./src/types.ts Config > ./build/schema.json
.PHONY: build

tests: ## Run available tests
	@clear
	@yarn run jest
.PHONY: tests

run-init-pg: build ## Run the cli tool
	@node ./build/main.js --init postgres
.PHONY: run-init-pg


run-sync-pg: run-init-pg
	@node ./build/main.js --sync
.PHONY: run-sync-pg

