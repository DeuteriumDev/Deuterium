{% macro random_string(len) -%}{% for i in range(0,len) -%}{{ [0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f"]|random }}{% endfor %}{%- endmacro -%}
{% macro random_guid() -%} {{ random_string(8) + "-" + random_string(4) + "-" + random_string(4) + "-" + random_string(4) + "-" + random_string(12) }}{%- endmacro -%}

alter table public.folders disable trigger all;

{% for i in range(env("START") | int, env("STOP") | int) %}
{% set group_id = random_guid() %}
{% set folder_id = random_guid() %}
{% set document_id = random_guid() %}
insert into {{ public_schema }}.groups (id, name, parent_id) values ('{{ group_id }}', 'test group {{ i }}', null);
-- insert into {{ public_schema }}.group_permissions () values ();
insert into {{ public_schema }}.users (id, email) values ({{ i }}, 'test-{{ i }}@test.ca');
insert into {{ public_schema }}.group_members (group_id, user_id) values ('{{ group_id }}', {{ i }});
insert into {{ public_schema }}.folders (id, name, description) values ('{{ folder_id }}', 'test-folder-{{ i }}', null);
insert into {{ private_schema }}.documents (id, inherit_permissions_from_parent, parent_id, type, foreign_id) values ('{{ document_id }}', false, null, 'folder', '{{ folder_id }}');
insert into {{ public_schema }}.document_permissions (can_create, can_read, can_update, can_delete, document_id, group_id) values (false, true, true, false, '{{ document_id }}', '{{ group_id }}');
{% endfor %}


alter table public.folders enable trigger all;
