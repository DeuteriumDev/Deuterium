{% if add_folders -%}
drop function if exists {{ public_schema }}.create_folder_setup_trigger();
drop trigger if exists {{ public_schema }}_create_folder_setup_trigger on {{ public_schema }}.folders;
{% endif %}