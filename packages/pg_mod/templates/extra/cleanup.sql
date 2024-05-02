drop trigger if exists {{ public_schema }}_create_folder_setup_trigger on {{ public_schema }}.folders;

drop function if exists {{ private_schema }}.get_default_document_parent();
drop function if exists {{ private_schema }}.get_default_document_group();

drop policy if exists {{ private_schema }}_documents_create on {{ private_schema }}.documents;
drop policy if exists {{ private_schema }}_documents_read on {{ private_schema }}.documents;
drop policy if exists {{ private_schema }}_documents_update on {{ private_schema }}.documents;
drop policy if exists {{ private_schema }}_documents_delete on {{ private_schema }}.documents;

drop policy if exists {{ public_schema }}_document_permissions_create on {{ private_schema }}.documents;
drop policy if exists {{ public_schema }}_document_permissions_read ON {{ public_schema }}.document_permissions;
drop policy if exists {{ public_schema }}_document_permissions_update ON {{ public_schema }}.document_permissions;
drop policy if exists {{ public_schema }}_document_permissions_delete ON {{ public_schema }}.document_permissions;

drop policy if exists {{ public_schema }}_group_members_create ON {{ public_schema }}.group_members;
drop policy if exists {{ public_schema }}_group_members_read ON {{ public_schema }}.group_members;
drop policy if exists {{ private_schema }}_group_members_update ON {{ private_schema }}.documents;
drop policy if exists {{ public_schema }}_group_members_delete ON {{ public_schema }}.group_members;

drop policy if exists {{ public_schema }}_groups_create ON {{ public_schema }}.groups;
drop policy if exists {{ public_schema }}_groups_read ON {{ public_schema }}.group_members;
drop policy if exists {{ public_schema }}_groups_update ON {{ public_schema }}.group_members;
drop policy if exists {{ public_schema }}_groups_delete ON {{ public_schema }}.group_members;

drop policy if exists {{ public_schema }}_group_permissions_create ON {{ public_schema }}.group_permissions;
drop policy if exists {{ public_schema }}_group_permissions_read ON {{ public_schema }}.group_permissions;
drop policy if exists {{ public_schema }}_group_permissions_update ON {{ public_schema }}.group_permissions;
drop policy if exists {{ public_schema }}_group_permissions_delete ON {{ public_schema }}.group_permissions;

drop policy if exists {{ public_schema }}_folders_create ON {{ public_schema }}.folders;
drop policy if exists {{ public_schema }}_folders_read ON {{ public_schema }}.folders;
drop policy if exists {{ public_schema }}_folders_update ON {{ public_schema }}.folders;
drop policy if exists {{ public_schema }}_folders_delete ON {{ public_schema }}.folders;

drop view if exists {{ public_schema }}.groups_view;
drop view if exists {{ public_schema }}.recent_nodes_view;
drop view if exists {{ public_schema }}.node_growth_view;
drop view if exists {{ public_schema }}.document_permissions_view;
drop view if exists {{ public_schema }}.documents_view;

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
