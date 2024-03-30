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

dev: ## startup the app
	@yarn dev
.PHONY: dev