/*
# Schemas.sql

This file contains the declarations for the different schemas used to secure the db
*/
create schema if not exists {{ public_schema }};
create schema if not exists {{ private_schema }};

set search_path to {{ public_schema }}, {{ private_schema }};
