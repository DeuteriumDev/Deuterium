
-- document RLS policies
ALTER TABLE {{ private_schema }}.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY {{ private_schema }}_documents_create ON {{ private_schema }}.documents FOR insert to {{ authenticated_roles|join(', ') }} with check (
    parent_id is null or parent_id in (
        SELECT document_user_permissions.document_id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id() AND document_user_permissions.crud_permissions[1] = true
    )
);

CREATE POLICY {{ private_schema }}_documents_read ON {{ private_schema }}.documents FOR select to {{ authenticated_roles|join(', ') }} USING (
    id in (
        SELECT document_user_permissions.document_id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id() AND document_user_permissions.crud_permissions[2] = true
    )
);

CREATE POLICY {{ private_schema }}_documents_update ON {{ private_schema }}.documents FOR update to {{ authenticated_roles|join(', ') }} USING (
    id in (
        SELECT document_user_permissions.document_id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id() AND document_user_permissions.crud_permissions[3] = true
    )
);

CREATE POLICY {{ private_schema }}_documents_delete ON {{ private_schema }}.documents FOR delete to {{ authenticated_roles|join(', ') }} USING (
    id in (
        SELECT document_user_permissions.document_id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = {{ private_schema }}.get_user_id() AND document_user_permissions.crud_permissions[4] = true
    )
);


/*
Group members can only be "Created" or "Deleted". Read access is determined via crud permissions such that it's possible to make "hidden" groups.
*/
-- group_members RLS
ALTER TABLE {{ public_schema }}.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY {{ public_schema }}_group_members_create ON {{ public_schema }}.group_members for insert to {{ authenticated_roles|join(', ') }} with check (
    group_id in (
        select gp.owner_group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_create = true
    )
);

CREATE POLICY {{ public_schema }}_group_members_read ON {{ public_schema }}.group_members for select to {{ authenticated_roles|join(', ') }} USING (
    group_id in (
        select gp.owner_group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_read = true
    )
);

-- no update on group_members
CREATE POLICY {{ private_schema }}_group_members_update ON {{ private_schema }}.documents FOR update to {{ authenticated_roles|join(', ') }} USING (
    false
);

CREATE POLICY {{ public_schema }}_group_members_delete ON {{ public_schema }}.group_members for delete to {{ authenticated_roles|join(', ') }} USING (
    group_id in (
        select gp.owner_group_id
        from {{ public_schema }}.group_permissions gp
        where gp.can_delete = true
    )
);
