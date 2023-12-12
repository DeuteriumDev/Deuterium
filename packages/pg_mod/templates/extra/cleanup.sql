
drop policy if exists {{ private_schema }}_documents_create ON {{ private_schema }}.documents;
drop policy if exists {{ private_schema }}_documents_read ON {{ private_schema }}.documents;
drop policy if exists {{ private_schema }}_documents_update ON {{ private_schema }}.documents;
drop policy if exists {{ private_schema }}_documents_delete ON {{ private_schema }}.documents;

{% if add_folders -%}
drop table if exists {{ public_schema }}.folders;
{% endif %}

drop view if exists {{ private_schema }}.document_user_permissions cascade;

drop function if exists {{ private_schema }}.reduce_permissions(
  permissions_inherit_chain_array_arg bool[], permissions_aggregate_array anyarray
);
drop function if exists {{ private_schema }}.get_user_id();
drop function if exists {{ private_schema }}.is_member_of(
  user_id_arg uuid, group_id_arg uuid
);

drop table if exists {{ public_schema }}.document_permissions cascade;
drop table if exists {{ public_schema }}.group_permissions cascade;

drop table if exists {{ public_schema }}.group_members;
drop table if exists {{ public_schema }}.groups;

{% if create_users_table %}
drop table if exists {{ users_table }};
{% endif %}

drop table if exists {{ private_schema }}.documents;
drop table if exists {{ private_schema }}.document_types;
drop schema if exists {{ private_schema }} cascade;

{% if include_authenticated_roles %}
{%- for role in authenticated_roles %}
drop role if exists {{ role }};
{% endfor %}
{% endif %}
