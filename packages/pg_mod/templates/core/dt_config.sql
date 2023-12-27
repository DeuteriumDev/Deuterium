/*
Internal configuration setup
*/

-- dt_config
create table if not exists {{ private_schema }}.dt_config (
    name text primary key,
    value text
);

alter table {{ private_schema }}.dt_config owner to {{ owner }};

grant all on table {{ private_schema }}.dt_config to {{ owner }};

comment on table {{ private_schema }}.dt_config is E'Private [name], [value] config used internally by deuterium';

insert into {{ private_schema }}.dt_config values ('configuration', '{{ configuration }}');
