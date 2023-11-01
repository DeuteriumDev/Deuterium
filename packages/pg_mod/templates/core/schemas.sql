create schema if not exists {{ public_schema }} authorization {{ authenticated_roles|join(', ') }};
create schema if not exists {{ private_schema }} authorization {{ authenticated_roles|join(', ') }};

set search_path to {{ public_schema }}, {{ private_schema }};
