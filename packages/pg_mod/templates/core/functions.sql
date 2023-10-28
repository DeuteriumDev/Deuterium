create or replace function {{ private_schema }}.get_user_id() returns uuid as $$
  select 1
$$ language sql stable;

comment on function {{ private_schema }}.get_user_id() is '**Needs to be overridden by framework** Returns framework user id.';

{% for auth_role in authenticated_roles %}
grant execute on function {{ private_schema }}.get_user_id to to {{ auth_role }};
{% endfor %}



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
) is 'Returns T/F if user is member of group. Does not include child-groups as members.';

alter function {{ private_schema }}.is_member_of owner to {{ owner_role }};

{% for auth_role in authenticated_roles %}
grant execute on function {{ private_schema }}.is_member_of to {{ auth_role }};
{% endfor %}
