{% if add_folders -%}
drop trigger if exists {{ public_schema }}_create_folder_setup_trigger on {{ public_schema }}.folders;
{% endif %}