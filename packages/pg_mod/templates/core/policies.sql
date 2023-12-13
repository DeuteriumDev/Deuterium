
/*
Documents RLS

Documents are tables or collections that act as distinct units.
The permissions inherit bottom up, using the "closest" permission available as it's own.
*/
ALTER TABLE {{ private_schema }}.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY {{ private_schema }}_documents_create ON {{ private_schema }}.documents FOR insert to {{ authenticated_roles|join(', ') }} with check (
    parent_id is null or parent_id in (
        SELECT document_user_permissions.document_id as id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id()
            AND document_user_permissions.crud_permissions[1] = true
    )
);

CREATE POLICY {{ private_schema }}_documents_read ON {{ private_schema }}.documents FOR select to {{ authenticated_roles|join(', ') }} USING (
    id in (
        SELECT document_user_permissions.document_id as id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id()
            AND document_user_permissions.crud_permissions[2] = true
    )
);

CREATE POLICY {{ private_schema }}_documents_update ON {{ private_schema }}.documents FOR update to {{ authenticated_roles|join(', ') }} USING (
    id in (
        SELECT document_user_permissions.document_id as id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id()
            AND document_user_permissions.crud_permissions[3] = true
    )
);

CREATE POLICY {{ private_schema }}_documents_delete ON {{ private_schema }}.documents FOR delete to {{ authenticated_roles|join(', ') }} USING (
    id in (
        SELECT document_user_permissions.document_id as id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id()
            AND document_user_permissions.crud_permissions[4] = true
    )
);


/*
Permissions RLS

Permissions' stem from their target document & the groups they target.
- doc read access -> permission read access
- doc update access -> permission create, update, ad delete access
*/

CREATE POLICY {{ public_schema }}_document_permissions_create ON {{ public_schema }}.document_permissions FOR insert to {{ authenticated_roles|join(', ') }} with check (
    document_id in (
        select dup.document_id
        FROM {{ private_schema }}.document_user_permissions dup
        where dup.user_id = {{ private_schema }}.get_user_id() 
            and dup.crud_permissions[3] = true
    )
);

CREATE POLICY {{ public_schema }}_document_permissions_read ON {{ public_schema }}.document_permissions FOR select to {{ authenticated_roles|join(', ') }} using (
    document_id in (
        select dup.document_id
        FROM {{ private_schema }}.document_user_permissions dup
        where dup.user_id = {{ private_schema }}.get_user_id() 
            and dup.crud_permissions[2] = true
    )
);

CREATE POLICY {{ public_schema }}_document_permissions_update ON {{ public_schema }}.document_permissions FOR update to {{ authenticated_roles|join(', ') }} using (
    document_id in (
        select dup.document_id
        FROM {{ private_schema }}.document_user_permissions dup
        where dup.user_id = {{ private_schema }}.get_user_id() 
            and dup.crud_permissions[3] = true
    )
);

CREATE POLICY {{ public_schema }}_document_permissions_delete ON {{ public_schema }}.document_permissions FOR delete to {{ authenticated_roles|join(', ') }} using (
    document_id in (
        select dup.document_id
        FROM {{ private_schema }}.document_user_permissions dup
        where dup.user_id = {{ private_schema }}.get_user_id() 
            and dup.crud_permissions[3] = true
    )
);

/*
Group_members RLS

Group members can only be "Created" or "Deleted".
- Read access is determined via crud permissions such that it's possible to make "hidden" groups.
*/
ALTER TABLE {{ public_schema }}.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY {{ public_schema }}_group_members_create ON {{ public_schema }}.group_members for insert to {{ authenticated_roles|join(', ') }} with check (
    group_id in (
        select gp.target_group_id as group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_create = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);

CREATE POLICY {{ public_schema }}_group_members_read ON {{ public_schema }}.group_members for select to {{ authenticated_roles|join(', ') }} USING (
    group_id in (
        select gp.target_group_id  as group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_read = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);

-- no update on group_members
CREATE POLICY {{ private_schema }}_group_members_update ON {{ private_schema }}.documents FOR update to {{ authenticated_roles|join(', ') }} USING (
    false
);

CREATE POLICY {{ public_schema }}_group_members_delete ON {{ public_schema }}.group_members for delete to {{ authenticated_roles|join(', ') }} USING (
    group_id in (
        select gp.target_group_id  as group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_delete = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);


/*
Groups RLS

Groups permissions are direct grants only, and do not inherit from their parents. The reason for this is because groups serve to track relationships, not actual documents.
Each sub-group is a new relationship, and therefore should include new permissions.

If you belong to the [owner_group], then you get the following permissions' on the [target_group]
- create access -> can add users to [target_group]
- read access -> can "see" [target_group]
- update access -> can update [target_group] metadata
- delete access -> can delete [target_group]
*/
CREATE POLICY {{ public_schema }}_groups_create ON {{ public_schema }}.groups for insert to {{ authenticated_roles|join(', ') }} with check (
    parent_id is null or parent_id in (
        select gp.target_group_id as group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_create = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);

CREATE POLICY {{ public_schema }}_groups_read ON {{ public_schema }}.group_members for select to {{ authenticated_roles|join(', ') }} USING (
    group_id in (
        select gp.target_group_id as group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_read = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);

CREATE POLICY {{ public_schema }}_groups_update ON {{ public_schema }}.group_members for update to {{ authenticated_roles|join(', ') }} USING (
    group_id in (
        select gp.target_group_id as group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_update = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);

CREATE POLICY {{ public_schema }}_groups_delete ON {{ public_schema }}.group_members for delete to {{ authenticated_roles|join(', ') }} USING (
    group_id in (
        select gp.target_group_id as group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_delete = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);

/*
Group_permissions RLS

If you belong to the [owner_group], then you get the following permissions' on the [target_group]
- read access -> can "see" [target_group] permissions
- update access -> can create, and delete [target_group] permissions
*/


CREATE POLICY {{ public_schema }}_group_permissions_create ON {{ public_schema }}.group_permissions for insert to {{ authenticated_roles|join(', ') }} with check (
    target_group_id in (
        select gp.target_group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_update = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);

CREATE POLICY {{ public_schema }}_group_permissions_read ON {{ public_schema }}.group_permissions for select to {{ authenticated_roles|join(', ') }} using (
    target_group_id in (
        select gp.target_group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_read = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);

-- no "updates", only creates and deletes
CREATE POLICY {{ public_schema }}_group_permissions_update ON {{ public_schema }}.group_permissions for update to {{ authenticated_roles|join(', ') }} using (
    false
);

CREATE POLICY {{ public_schema }}_group_permissions_delete ON {{ public_schema }}.group_permissions for delete to {{ authenticated_roles|join(', ') }} using (
    target_group_id in (
        select gp.target_group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_update = true and {{ private_schema }}.is_member_of({{ private_schema }}.get_user_id(), gp.owner_group_id)
    )
);


{% if add_folders -%}
/*
Folder RLS

Each folder has a foreign key to a document which lets it relate back to the master `document_user_permissions` view.

*/

ALTER TABLE {{ public_schema }}.folders ENABLE ROW LEVEL SECURITY;


CREATE POLICY {{ public_schema }}_folders_create ON {{ public_schema }}.folders FOR insert to {{ authenticated_roles|join(', ') }} with check (
    document_id in (
        SELECT docp.document_id as document_id
        FROM {{ private_schema }}.document_user_permissions docp
        WHERE docp.user_id = {{ private_schema }}.get_user_id()
            AND docp.crud_permissions[1] = true
    )
);

CREATE POLICY {{ public_schema }}_folders_read ON {{ public_schema }}.folders FOR select to {{ authenticated_roles|join(', ') }} USING (
    document_id in (
        SELECT docp.document_id as id
        FROM {{ private_schema }}.document_user_permissions docp
        WHERE docp.user_id = {{ private_schema }}.get_user_id()
            AND docp.crud_permissions[2] = true
    )
);

CREATE POLICY {{ private_schema }}_folders_update ON {{ public_schema }}.folders FOR update to {{ authenticated_roles|join(', ') }} USING (
    document_id in (
        SELECT document_user_permissions.document_id as id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id()
            AND document_user_permissions.crud_permissions[3] = true
    )
);

CREATE POLICY {{ private_schema }}_folders_delete ON {{ public_schema }}.folders FOR delete to {{ authenticated_roles|join(', ') }} USING (
    document_id in (
        SELECT document_user_permissions.document_id as id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id()
            AND document_user_permissions.crud_permissions[4] = true
    )
);

{% endif %}
