
/*
# Function Template

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
create or replace function {{ private_schema }}.get_user_id() returns integer as $$
  select 1
$$ language sql stable;

comment on function {{ private_schema }}.get_user_id() is E'**Needs to be overridden by framework** Returns framework user id.';

grant execute on function {{ private_schema }}.get_user_id to {{ authenticated_roles|join(', ') }};


-- is_member_of
create or replace function {{ private_schema }}.is_member_of(
  user_id_arg uuid, group_id_arg uuid
) returns bool as $$
select exists (
	SELECT *
	FROM {{ public_schema }}.group_members m
	WHERE m.group_id = group_id_arg
	AND m.user_id = user_id_arg
);
$$ language sql security definer;

comment on function {{ private_schema }}.is_member_of(
  user_id_arg uuid, group_id_arg uuid
) is E'Returns boolean indicating if user is member of group. Does not include child-groups as members.';

alter function {{ private_schema }}.is_member_of owner to {{ owner_role }};

grant execute on function {{ private_schema }}.is_member_of to {{ authenticated_roles|join(', ') }};


-- reduce_permissions
create or replace function {{ private_schema }}.reduce_permissions(
  permissions_tree_arg bool[], cruds_tree_arg anyarray
) returns bool[] AS $$
	select array_agg(v)
	from unnest(
		cruds_tree_arg[1: coalesce(array_position(permissions_tree_arg, false), array_length(cruds_tree_arg, 1))],
		(
			select array_agg(v) from generate_series(1,array_length(cruds_tree_arg[1: coalesce(array_position(permissions_tree_arg, false), array_length(cruds_tree_arg))], 1)) x(v)
		)	   
	) u(v, i)
	where v is not null
	limit 4
$$ language sql stable;

comment on function {{ private_schema }}.reduce_permissions(
  permissions_tree_arg bool[], cruds_tree_arg anyarray
) is E'Given the permissions aggregate arrays, returns a reduced tuple[bool] of C,R,U,D permissions';

alter function {{ private_schema }}.reduce_permissions owner to {{ owner_role }};

grant execute on function {{ private_schema }}.reduce_permissions to {{ authenticated_roles|join(', ') }};
