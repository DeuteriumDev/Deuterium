-- drop function if exists {{ private_schema }}.reduce_permissions(
--   permissions_inherit_chain_array_arg bool[], permissions_aggregate_array anyarray
-- );
drop function if exists {{ private_schema }}.get_user_id();
drop function if exists {{ private_schema }}.is_member_of(
  user_id_arg {% if user_id_type == 'serial' -%}
    int
    {% else %}
    {{ user_id_type }}
    {% endif %}, group_id_arg uuid
);
drop function if exists {{ private_schema }}.get_default_document_parent();
drop function if exists {{ private_schema }}.get_default_document_group();