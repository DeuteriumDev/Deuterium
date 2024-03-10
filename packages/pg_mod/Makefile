#!make
SHELL:=/bin/bash

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

reset: ## Reset local DB to bare installation
	@clear
	@./scripts/compile_sql.sh templates/extra/cleanup.sql fixtures/postgres.json | psql $(DB_CONNECTION) > ./builds/_reset.txt 2>&1
.PHONY: reset

load: reset ## Reset, then Load the postgres-fixture schema into the local db
	@./scripts/compile_sql.sh templates/frameworks/postgres.sql fixtures/postgres.json | psql $(DB_CONNECTION) > ./builds/_load.txt 2>&1
.PHONY: load

seed: load ## Reset, Load schema, then use "postgres" seed to fil in data
	@clear
	@./scripts/compile_sql.sh tests/seeds/postgres_seed.sql fixtures/postgres.json | psql $(DB_CONNECTION) > ./builds/_seed.txt 2>&1
.PHONY: seed

dump: ## Dump current DB to `out.tar`
	@clear
	@rm out.tar
	@pg_dump -a -O -f out.tar -Ft -d $(DB_CONNECTION) > ./builds/_dump.txt 2>&1
.PHONY: dump

seed-200k: load ## Load the 200k-matrix seed into db
	@clear
	@pg_restore -a -d $(DB_CONNECTION) --disable-triggers ./tests/seeds/200k.tar > ./builds/_restore.txt 2>&1
.PHONY: seed-200k

BENCHMARK_FILE:="./builds/_$(shell date +"%s")_benchmark.json"
PERFORMANCE_SQL=./tests/performance/query.sql

benchmark: ## Run query against current db and record the output timming, print avg timming
	@echo '[' > $(BENCHMARK_FILE)
	@psql $(DB_CONNECTION) -1 -A < $(PERFORMANCE_SQL) | sed 's/SET//' | sed 's/QUERY PLAN//' | sed 's/(1 row)//' | tr '\n' ' ' | jq '.[0]' >> $(BENCHMARK_FILE)
	@echo ',' >> $(BENCHMARK_FILE)
	@psql $(DB_CONNECTION) -1 -A < $(PERFORMANCE_SQL) | sed 's/SET//' | sed 's/QUERY PLAN//' | sed 's/(1 row)//' | tr '\n' ' ' | jq '.[0]' >> $(BENCHMARK_FILE)
	@echo ',' >> $(BENCHMARK_FILE)
	@psql $(DB_CONNECTION) -1 -A < $(PERFORMANCE_SQL) | sed 's/SET//' | sed 's/QUERY PLAN//' | sed 's/(1 row)//' | tr '\n' ' ' | jq '.[0]' >> $(BENCHMARK_FILE)
	@echo ',' >> $(BENCHMARK_FILE)
	@psql $(DB_CONNECTION) -1 -A < $(PERFORMANCE_SQL) | sed 's/SET//' | sed 's/QUERY PLAN//' | sed 's/(1 row)//' | tr '\n' ' ' | jq '.[0]' >> $(BENCHMARK_FILE)
	@echo ',' >> $(BENCHMARK_FILE)
	@psql $(DB_CONNECTION) -1 -A < $(PERFORMANCE_SQL) | sed 's/SET//' | sed 's/QUERY PLAN//' | sed 's/(1 row)//' | tr '\n' ' ' | jq '.[0]' >> $(BENCHMARK_FILE)
	@echo ',' >> $(BENCHMARK_FILE)
	@psql $(DB_CONNECTION) -1 -A < $(PERFORMANCE_SQL) | sed 's/SET//' | sed 's/QUERY PLAN//' | sed 's/(1 row)//' | tr '\n' ' ' | jq '.[0]' >> $(BENCHMARK_FILE)
	@echo ',' >> $(BENCHMARK_FILE)
	@psql $(DB_CONNECTION) -1 -A < $(PERFORMANCE_SQL) | sed 's/SET//' | sed 's/QUERY PLAN//' | sed 's/(1 row)//' | tr '\n' ' ' | jq '.[0]' >> $(BENCHMARK_FILE)
	@echo ',' >> $(BENCHMARK_FILE)
	@psql $(DB_CONNECTION) -1 -A < $(PERFORMANCE_SQL) | sed 's/SET//' | sed 's/QUERY PLAN//' | sed 's/(1 row)//' | tr '\n' ' ' | jq '.[0]' >> $(BENCHMARK_FILE)
	@echo ',' >> $(BENCHMARK_FILE)
	@psql $(DB_CONNECTION) -1 -A < $(PERFORMANCE_SQL) | sed 's/SET//' | sed 's/QUERY PLAN//' | sed 's/(1 row)//' | tr '\n' ' ' | jq '.[0]' >> $(BENCHMARK_FILE)
	@echo ']' >> $(BENCHMARK_FILE)
	@yarn run prettier -w $(BENCHMARK_FILE) --log-level silent
	@cat $(BENCHMARK_FILE) | jq '[.[]["Execution Time"]] | add/length'
.PHONY: benchmark

tests: ## Run available tests
	@clear
	@yarn jest tests/unit/functions.spec.js --detectOpenHandles
	@yarn jest tests/documents/query.spec.js --detectOpenHandles
	@yarn jest tests/documents/mutation.spec.js --detectOpenHandles
.PHONY: tests
