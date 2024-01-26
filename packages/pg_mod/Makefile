#!make

include .env
export $(shell sed 's/=.*//' .env)

install: ## Install pre-req software
	@pip3 install j2cli
	@yarn install --immutable
.PHONY: install

builds: ## Build all available framework migrations according to the basic data
	@clear
	@./scripts/compile_sql.sh templates/frameworks/postgres.sql fixtures/postgres.json > ./builds/_postgres.sql
	@./scripts/compile_sql.sh templates/frameworks/supabase.sql fixtures/supabase.json > ./builds/_supabase.sql
.PHONY: builds
 
help: ## Show this help
	@echo "\nSpecify a command. The choices are:\n"
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[0;36m%-12s\033[m %s\n", $$1, $$2}'
	@echo ""
.PHONY: help

reset: ## Reset local DB
	@clear
	@./scripts/compile_sql.sh templates/extra/cleanup.sql fixtures/postgres.json | psql $(DB_CONNECTION) > ./builds/_reset.txt 2>&1
.PHONY: reset

load: reset ## Load local db
	@clear
	@./scripts/compile_sql.sh templates/frameworks/postgres.sql fixtures/postgres.json | psql $(DB_CONNECTION) > ./builds/_load.txt 2>&1
.PHONY: load

seed: load
	@clear
	@./scripts/compile_sql.sh tests/seeds/postgres_seed.sql fixtures/postgres.json | psql $(DB_CONNECTION) > ./builds/_seed.txt 2>&1
.PHONY: seed


tests: ## Run available tests
	@clear
	@yarn jest tests/unit/functions.spec.js --detectOpenHandles
	@yarn jest tests/documents/query.spec.js --detectOpenHandles
	@yarn jest tests/documents/mutation.spec.js --detectOpenHandles
.PHONY: tests
