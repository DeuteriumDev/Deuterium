drop function if exists {{ private_schema }}.reduce_permissions(
  permissions_inherit_chain_array_arg bool[], permissions_aggregate_array anyarray
);
drop function if exists {{ private_schema }}.reduce_permissions(
  permissions_inherit_chain_array_arg bool[], permissions_aggregate_array anyarray
);
drop function if exists {{ private_schema }}.is_member_of(
  user_id_arg uuid, group_id_arg uuid
);

drop schema if exists {{ private_schema }} cascade;

{% if not skip_authenticated_roles %}
{%- for role in authenticated_roles %}
drop role if exists {{ role }};
{% endfor %}
{% endif %}


