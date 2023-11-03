drop function if exists {{ private_schema }}.reduce_permissions(
  permissions_inherit_chain_array_arg bool[], permissions_aggregate_array anyarray
);
drop function if exists {{ private_schema }}.reduce_permissions(
  permissions_inherit_chain_array_arg bool[], permissions_aggregate_array anyarray
);
drop function if exists {{ private_schema }}.is_member_of(
  user_id_arg uuid, group_id_arg uuid
);

drop table if exists {{ public_schema }}.group_permissions;
drop table if exists {{ public_schema }}.groups;
drop table if exists {{ private_schema }}.documents;
drop table if exists {{ private_schema }}.document_types;

drop schema if exists {{ private_schema }} cascade;

{% if include_authenticated_roles %}
{%- for role in authenticated_roles %}
drop role if exists {{ role }};
{% endfor %}
{% endif %}

