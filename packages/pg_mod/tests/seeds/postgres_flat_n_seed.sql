
alter table public.folders disable trigger all;

with ids as (
    select 
        i as index,
        gen_random_uuid() as group_id,
        gen_random_uuid() as folder_id,
        gen_random_uuid() as document_id
    from generate_series({{ env("START") | int }}, {{ env("STOP") | int }}) as s(i)
), group_ids as (
    insert into {{ public_schema }}.groups (id, name, parent_id)
    select
        group_id,
        'test group ' || index,
        null
    from ids
    returning id
), user_ids as (
    insert into {{ public_schema }}.users
    select
        index,
        index || '@test.ca'
    from ids
    returning id
), folder_ids as (
    insert into {{ public_schema }}.folders
    select
        folder_id,
        'test-folder-' || index,
        null
    from ids
    returning id
), document_ids as (
    insert into {{ private_schema }}.documents
    select
        document_id,
        false,
        null,
        'folder',
        folder_id
    from ids
    returning id
), _permission_ids as (
    insert into {{ public_schema }}.document_permissions (can_create, can_read, can_update, can_delete, document_id, group_id)
    select
        false,
        true,
        true,
        false,
        document_id,
        group_id
    from ids
    returning id
)
select 1;

alter table public.folders enable trigger all;

