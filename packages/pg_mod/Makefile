#!make

install: ## Install pre-req software
	@pip3 install j2cli
	@yarn install --immutable
.PHONY: install

builds: ## Build all available framework migrations according to the basic data
	@./scripts/compile_sql.sh templates/frameworks/postgres.sql fixtures/postgres.json > ./builds/postgres.sql
	@./scripts/compile_sql.sh templates/frameworks/supabase.sql fixtures/supabase.json > ./builds/supabase.sql
.PHONY: builds
 
help: ## Show this help
	@echo "\nSpecify a command. The choices are:\n"
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[0;36m%-12s\033[m %s\n", $$1, $$2}'
	@echo ""
.PHONY: help

reset: ## Reset local DB
	include .env
	export
	@./scripts/compile_sql.sh templates/extra/cleanup.sql fixtures/postgres.json | psql $(DB_CONNECTION) > _reset.txt 2>&1
.PHONY: reset

load: reset ## Load local db
	include .env
	export
	@./scripts/compile_sql.sh templates/frameworks/postgres.sql fixtures/postgres.json | psql $(DB_CONNECTION) > _load.txt 2>&1
.PHONY: load

tests: ## Run available tests
	@yarn jest tests/unit/functions.spec.js --detectOpenHandles
.PHONY: tests
