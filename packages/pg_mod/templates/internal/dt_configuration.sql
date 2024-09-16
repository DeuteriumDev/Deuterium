/*
Internal configuration setup
*/

-- dt_configuration
create table if not exists {{ private_schema }}.dt_configuration (
    name text primary key,
    value text
);

alter table {{ private_schema }}.dt_configuration owner to {{ owner }};

grant all on table {{ private_schema }}.dt_configuration to {{ owner }};

comment on table {{ private_schema }}.dt_configuration is E'Private [key: string], [value: string] config used internally by deuterium';

insert into {{ private_schema }}.dt_configuration values ('configuration', '{{ configuration }}');
insert into {{ private_schema }}.dt_configuration values ('version', '1');
