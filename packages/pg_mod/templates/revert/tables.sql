
drop table if exists {{ public_schema }}.document_permissions cascade;
drop table if exists {{ public_schema }}.group_permissions cascade;

drop table if exists {{ public_schema }}.group_members;
drop table if exists {{ public_schema }}.groups;

{% if create_users_table %}
drop table if exists {{ users_table }};
{% endif %}

drop table if exists {{ private_schema }}.documents;
drop table if exists {{ private_schema }}.document_types;