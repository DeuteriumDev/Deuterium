#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)

install: ## Install pre-req software
	# @pip3 install j2cli
	@yarn install --immutable
	# @brew install gnuplot
	# @brew install sqlfluff
	# @brew install git-lfs
.PHONY: install

builds: ## Build all available framework migrations according to the basic data
	@clear
	@./scripts/compile_sql.sh templates/frameworks/postgres.sql configurations/postgres.json > ./builds/_postgres.sql
	@./scripts/compile_sql.sh templates/frameworks/supabase.sql configurations/supabase.json > ./builds/_supabase.sql
.PHONY: builds
 
help: ## Show this help
	@echo "\nSpecify a command. The choices are:\n"
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[0;36m%-12s\033[m %s\n", $$1, $$2}'
	@echo ""
.PHONY: help

reset: ## Reset local DB to bare installation
	@clear
	@./scripts/compile_sql.sh templates/revert/all.sql configurations/postgres.json | psql $(DB_CONNECTION) > ./builds/_reset.txt 2>&1
.PHONY: reset

reset-config: ## Reset local DB config
	@clear
	@./scripts/compile_sql.sh templates/revert/dt_configuration.sql configurations/postgres.json | psql $(DB_CONNECTION) > ./builds/_reset.txt 2>&1
.PHONY: reset

load: reset ## Reset, then Load the postgres-fixture schema into the local db
	@./scripts/compile_sql.sh templates/frameworks/postgres.sql configurations/postgres.json | psql $(DB_CONNECTION) > ./builds/_load.txt 2>&1
.PHONY: load

seed: load ## Reset, Load schema, then use "postgres" seed to fil in data
	@clear
	@./scripts/compile_sql.sh tests/seeds/postgres_seed.sql configurations/postgres.json | psql $(DB_CONNECTION) > ./builds/_seed.txt 2>&1
.PHONY: seed

dump: ## Dump current DB to `out.tar`
	@clear
	@rm -f out.tar
	@pg_dump -a -O -f out.tar -Ft -d $(DB_CONNECTION) > ./builds/_dump.txt 2>&1
.PHONY: dump

FLAT_SEED=./tests/seeds/postgres_flat_100k_seed.tar
seed-flat: load ## Load the n*5 flat seed into db
	@clear
	@pg_restore -a -d $(DB_CONNECTION) --disable-triggers $(FLAT_SEED) > ./builds/_seed_flat.txt 2>&1
.PHONY: seed-200k

NESTED_SEED=./tests/seeds/nested_100.tar
seed-nested: load ## Load the n^3 nested seed into db
	@clear
	@pg_restore -a -d $(DB_CONNECTION) --disable-triggers $(NESTED_SEED) > ./builds/_seed_nested.txt 2>&1
.PHONY: seed-200k

BENCHMARK_NAME=query
DATE:=$(shell date +"%s")
BENCHMARK_FILE="./builds/_$(DATE)_$(BENCHMARK_NAME)_benchmark.json"
PERFORMANCE_SQL=./tests/performance/query.sql
QUERY:=$(shell cat $(PERFORMANCE_SQL) | tr '\n' ' ')
benchmark: ## Run query against current db and record the output timming, print avg timming
	@echo '{ "benchmarks": [' > $(BENCHMARK_FILE)
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
	@echo '],' >> $(BENCHMARK_FILE)
	@echo '"date": "$(DATE)", "name": "$(BENCHMARK_NAME)", "query": "$(QUERY)"' >> $(BENCHMARK_FILE)
	@echo '}' >> $(BENCHMARK_FILE)
	@yarn run prettier -w $(BENCHMARK_FILE) --log-level silent
	@cat $(BENCHMARK_FILE) | jq '[.benchmarks[]["Execution Time"]] | add / length'
.PHONY: benchmark

tests: ## Run available tests
	@clear
	@yarn run jest "tests\/.*\/.*\.spec\.js" --detectOpenHandles
.PHONY: tests
