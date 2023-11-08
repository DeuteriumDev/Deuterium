
-- document RLS policies
ALTER TABLE {{ private_schema }}.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY {{ private_schema }}_documents_create ON {{ private_schema }}.documents FOR insert to {{ authenticated_roles|join(', ') }} with check (
    parent_id is null or parent_id in (
        SELECT document_user_permissions.document_id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = private.get_user_id() AND document_user_permissions.crud_permissions[1] = true
    )
);

CREATE POLICY {{ private_schema }}_documents_select ON {{ private_schema }}.documents FOR select to {{ authenticated_roles|join(', ') }} USING (
    id in (
        SELECT document_user_permissions.document_id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = private.get_user_id() AND document_user_permissions.crud_permissions[2] = true
    )
);

CREATE POLICY {{ private_schema }}_documents_update ON {{ private_schema }}.documents FOR update to {{ authenticated_roles|join(', ') }} USING (
    id in (
        SELECT document_user_permissions.document_id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = private.get_user_id() AND document_user_permissions.crud_permissions[3] = true
    )
);

CREATE POLICY {{ private_schema }}_documents_delete ON {{ private_schema }}.documents FOR delete to {{ authenticated_roles|join(', ') }} USING (
    id in (
        SELECT document_user_permissions.document_id
        FROM {{ private_schema }}.document_user_permissions
        WHERE document_user_permissions.user_id = private.get_user_id() AND document_user_permissions.crud_permissions[4] = true
    )
);
