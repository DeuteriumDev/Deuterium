/*
# Tables.sql

This file contains the public and private tables for usage in securing and organizing data.

## Table Template

Each table needs:
- to use *snake_case*
- an escaped (E'', allows newlines) comment describing what it does and potentially smart tags
- a grant for authenticated users / roles

*/

-- document_types
create table {{ private_schema }}.document_types (
    value text PRIMARY KEY,
    comment text
);

alter table {{ private_schema }}.document_types owner to {{ owner }};

comment on table {{ private_schema }}.document_types is E'ENUM for documents. For each child table it should have an entry to represent the types of documents. It is currently not meant to be accessed by a user, and thus it is declared privately.\nIt uses an explicit table as per [hasura enum guidelines](https://hasura.io/docs/latest/schema/postgres/enums/).';


-- documents
create table {{ private_schema }}.documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    inherit_permissions_from_parent boolean DEFAULT true NOT NULL,
    parent_id uuid,
    type text
);

alter table {{ private_schema }}.documents ADD CONSTRAINT
  document_types_fkey FOREIGN KEY (type) REFERENCES {{ private_schema }}.document_types;

alter table {{ private_schema }}.documents ADD CONSTRAINT
  document_parent_fkey FOREIGN KEY (parent_id) REFERENCES {{ private_schema }}.documents;

alter table {{ private_schema }}.documents ENABLE ROW LEVEL SECURITY;

alter table {{ private_schema }}.documents owner to {{ owner }};

comment on table {{ private_schema }}.documents is E'Core tree for organizing documents and folders. For each table that we want to secure we create a [documents] row of the new table [document_type]. We also add a link to the [documents] table in the child such that we can relate it to the tree.\n This allows us to create a recursive view that organizes the documents into a tree-folder structure with CRUD permissions.';

-- groups
CREATE TABLE {{ public_schema }}.groups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    {% if include_timestamps %}
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    {% endif %}
    name text DEFAULT ''::text NOT NULL,
    parent_id uuid
);

alter table {{ public_schema }}.groups ADD CONSTRAINT
  groups_parent_fkey FOREIGN KEY (parent_id) REFERENCES {{ public_schema }}.groups;

alter table {{ public_schema }}.groups owner to {{ owner }};

alter table {{ public_schema }}.groups ENABLE ROW LEVEL SECURITY;

comment on table {{ public_schema }}.groups is E'Groups to organize our users into hierarchies.';

-- group_permissions
create table {{ public_schema }}.group_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    can_create boolean default true not null,
    can_read boolean default true not null,
    can_update boolean default true not null,
    can_delete boolean default true not null,
    {% if include_timestamps %}
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    {% endif %}
    owner_group_id uuid,
    target_group_id uuid
);

alter table {{ public_schema }}.group_permissions ADD CONSTRAINT
  group_permission_owner_fkey FOREIGN KEY (owner_group_id) REFERENCES {{ public_schema }}.groups;

alter table {{ public_schema }}.group_permissions ADD CONSTRAINT
  group_permission_target_fkey FOREIGN KEY (target_group_id) REFERENCES {{ public_schema }}.groups;

alter table {{ public_schema }}.group_permissions owner to {{ owner }};

alter table {{ public_schema }}.group_permissions ENABLE ROW LEVEL SECURITY;

comment on table {{ public_schema }}.group_permissions is E'Permission levels for editing a group. The `owner_group_id` is the owner-group of permissions, and the `target_group_id` is the group that permission applies to. Both can be the same group to give its members access to their own group.';

{% if create_users_table -%}
-- users, optional table
CREATE TABLE {{ users_table }} (
    id {{ user_id_type }} PRIMARY KEY,
    email text
);

alter table {{ users_table }} owner to {{ owner }};

alter table {{ users_table }} ENABLE ROW LEVEL SECURITY;

comment on table {{ users_table }} is E'TODO';

{% endif %}

-- group_members
create table {{ public_schema }}.group_members (
    group_id uuid,
    user_id {% if user_id_type == 'serial' -%}
    int
    {% else %}
    {{ user_id_type }}
    {% endif %}
    PRIMARY KEY
);

alter table {{ public_schema }}.group_members ADD CONSTRAINT
    group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES {{ public_schema }}.groups;

alter table {{ public_schema }}.group_members ADD CONSTRAINT
    group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES {{ users_table }};

alter table {{ public_schema }}.group_members owner to {{ owner }};

alter table {{ public_schema }}.group_members ENABLE ROW LEVEL SECURITY;

comment on table {{ public_schema }}.group_members is E'TODO';

-- document_permissions
create table {{ public_schema }}.document_permissions (
    id uuid DEFAULT gen_random_uuid() primary key,
    {% if include_timestamps %}
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    {% endif %}
    can_create boolean default true not null,
    can_read boolean default true not null,
    can_update boolean default true not null,
    can_delete boolean default true not null,
    document_id uuid,
    group_id uuid NOT NULL
);

alter table {{ public_schema }}.document_permissions ADD CONSTRAINT
    document_permissions_fkey FOREIGN KEY (document_id) REFERENCES {{ private_schema }}.documents;

alter table {{ public_schema }}.document_permissions ADD CONSTRAINT
    group_fkey FOREIGN KEY (group_id) REFERENCES {{ public_schema }}.groups;

alter table {{ public_schema }}.document_permissions owner to {{ owner }};

alter table {{ public_schema }}.document_permissions ENABLE ROW LEVEL SECURITY;

comment on table {{ public_schema }}.document_permissions is E'TODO';



{% if add_folders -%}
-- folders
create table {{ public_schema }}.folders (
    id uuid DEFAULT gen_random_uuid() primary key,
    document_id uuid unique,
    {% if include_timestamps %}
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    {% endif %}
    name text,
    description text
);

alter table {{ public_schema }}.folders ADD CONSTRAINT
    folders_document_id_fkey FOREIGN KEY (document_id) REFERENCES {{ private_schema }}.documents;

alter table {{ public_schema }}.folders owner to {{ owner }};

alter table {{ public_schema }}.folders ENABLE ROW LEVEL SECURITY;

comment on table {{ public_schema }}.folders is E'DT generated folders table for organizing data in a typical user friendly manner';

{% endif %}
