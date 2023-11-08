/*
# Views.sql

This file contains the private views for usage in securing and organizing data.

## View Template

Each view needs:
- to use *snake_case*
- an escaped (E'', allows newlines) comment describing what it does and potentially smart tags
- a grant for authenticated users / roles

*/

-- document_user_permissions
CREATE VIEW {{ private_schema }}.document_user_permissions WITH (security_barrier='true') AS
 WITH RECURSIVE docs_path_reversed(id, depth, path, inherit_path, cruds_path, permission_id) AS (
         SELECT d.id,
            0 AS depth,
            ARRAY[d.id] AS path,
            ARRAY[d.inherit_permissions_from_parent] AS inherit_path,
            ARRAY[ARRAY[p.can_create, p.can_read, p.can_update, p.can_delete]] AS cruds_path,
            p.id AS permission_id
           FROM ({{ private_schema }}.documents d
             LEFT JOIN {{ public_schema }}.document_permissions p ON ((d.id = p.document_id)))
          WHERE (d.parent_id IS NULL)
        UNION ALL
         SELECT docs.id,
            (d.depth + 1),
            (docs.id || d.path) AS path,
            (docs.inherit_permissions_from_parent || d.inherit_path) AS inherit_path,
            (ARRAY[p.can_create, p.can_read, p.can_update, p.can_delete] || d.cruds_path) AS cruds_path,
            p.id AS permission_id
           FROM (({{ private_schema }}.documents docs
             JOIN docs_path_reversed d ON ((docs.parent_id = d.id)))
             LEFT JOIN {{ public_schema }}.document_permissions p ON ((docs.id = p.document_id)))
        )
 SELECT d.id AS document_id,
    d.depth,
    g.user_id,
    {{ private_schema }}.reduce_permissions(d.inherit_path, d.cruds_path) AS crud_permissions,
    d.path
   FROM ((docs_path_reversed d
     JOIN {{ public_schema }}.document_permissions p ON ((array_position(d.path, p.document_id) > 0)))
     JOIN {{ public_schema }}.group_members g ON ((p.group_id = g.group_id)))
  WHERE (d.permission_id IS NULL)
UNION
 SELECT d.id AS document_id,
    d.depth,
    g.user_id,
    {{ private_schema }}.reduce_permissions(d.inherit_path, d.cruds_path) AS crud_permissions,
    d.path
   FROM ((docs_path_reversed d
     JOIN {{ public_schema }}.document_permissions p ON ((d.permission_id = p.id)))
     JOIN {{ public_schema }}.group_members g ON ((p.group_id = g.group_id)));
