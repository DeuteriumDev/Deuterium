/*
# Functions.sql

This file contains all the functions used for securing data and helping queries.
When implementing a framework, `get_user_id` has to re-declared to match whatever framework is being used.

## Function Template

Each function needs:
- to use *snake_case*
- an escaped (E'', allows newlines) comment describing what it does and potentially smart tags
- a grant for authenticated users / roles

```sql
-- <snake_case_name>
create or replace function {{ private_schema }}.<snake_case_name>(<arg>_arg <type>, <...>) returns <type> as $$
  <...>
$$ language sql stable;

comment on function {{ private_schema }}.<snake_case_name>(<arg>_arg <type>, <...>) is E'...';

grant execute on function function {{ private_schema }}.<snake_case_name> to {{ authenticated_roles|join(', ') }};
```

*/

-- get_user_id
create or replace function {{ private_schema }}.get_user_id() returns int as $$
  select nullif(current_setting('dt.user_id', true), '')::int
$$ language sql stable;

comment on function {{ private_schema }}.get_user_id() is E'**Needs to be overridden by framework** Returns framework user id.';

grant execute on function {{ private_schema }}.get_user_id to {{ authenticated_roles|join(', ') }};


-- is_member_of
create or replace function {{ private_schema }}.is_member_of(
  user_id_arg {% if user_id_type == 'serial' -%}
    int
    {% else %}
    {{ user_id_type }}
    {% endif %}, group_id_arg uuid
) returns bool as $$
select exists (
	SELECT *
	FROM {{ public_schema }}.group_members m
	WHERE m.group_id = group_id_arg
	AND m.user_id = user_id_arg
);
$$ language sql security definer;

comment on function {{ private_schema }}.is_member_of(
  user_id_arg {% if user_id_type == 'serial' -%}
    int
    {% else %}
    {{ user_id_type }}
    {% endif %}, group_id_arg uuid
) is E'Given [user_id] and [group_id], returns boolean indicating if user is member of group. Does not include child-groups as members.';

alter function {{ private_schema }}.is_member_of owner to {{ owner }};

grant execute on function {{ private_schema }}.is_member_of to {{ authenticated_roles|join(', ') }};


-- reduce_permissions
create or replace function {{ private_schema }}.reduce_permissions(
  permissions_inherit_chain_array_arg bool[], permissions_aggregate_array_arg anyarray
) returns bool[] AS $$
	select array_agg(b)
	from (
	select v
	from unnest(
		permissions_aggregate_array_arg[:coalesce(array_position(permissions_inherit_chain_array_arg, false), array_length(permissions_aggregate_array_arg, 1))]
	) u(v)
	where v is not null
	limit 4
	) cruds(b)
$$ language sql stable;

comment on function {{ private_schema }}.reduce_permissions(
  permissions_inherit_chain_array_arg bool[], permissions_aggregate_array_arg anyarray
) is E'Given the [permissions_inherit_chain_array_arg] and [permissions_aggregate_array_arg], returns a reduced `bool[]` of C,R,U,D permissions';

alter function {{ private_schema }}.reduce_permissions owner to {{ owner }};

grant execute on function {{ private_schema }}.reduce_permissions to {{ authenticated_roles|join(', ') }};
