

{% if add_folders -%}

-- create_folder_document_trigger
create or replace function {{ private_schema }}.create_folder_setup_trigger()
returns trigger
as $$
    declare
        group_id uuid := {{ private_schema }}.get_default_document_group();
        doc_id uuid;
    begin
        NEW.id := gen_random_uuid();

        {% if debug -%}raise notice 'new.id %', NEW.id;{% endif %}
        {% if debug -%}raise notice 'group_id %', group_id;{% endif %}
        
        if group_id is null then
            insert into {{ public_schema }}.groups (name) values ('' || new.id::text || '_group_' || {{ private_schema }}.get_user_id()::text) returning id into group_id;
            insert into {{ public_schema }}.group_permissions (can_create, can_read, can_update, can_delete, owner_group_id, target_group_id) values (false, false, false, true, group_id, group_id);
            insert into {{ public_schema }}.group_members values (group_id, {{ private_schema }}.get_user_id());
        end if;

        insert into {{ private_schema }}.documents (parent_id, type, foreign_id) values ({{ private_schema }}.get_default_document_parent(), 'folder', new.id) returning id into doc_id;
        insert into {{ public_schema }}.document_permissions (can_create, can_read, can_update, can_delete, document_id, group_id) values (true, true, true, true, doc_id, group_id);
        
        {% if debug -%}raise notice 'doc_id %', doc_id;{% endif %}
        
        return new;
    end;
$$ language plpgsql VOLATILE;

create trigger {{ public_schema }}_create_folder_setup_trigger
    before insert on {{ public_schema }}.folders
    for each row
    execute function {{ private_schema }}.create_folder_setup_trigger();

{% endif %}
