with recursive docs_perms as (
	select 
		d.id,
		d.inherit_permissions_from_parent,
		d.parent_id,
		d.type,
		d.foreign_id,
		array[
			coalesce(p.can_create, false),
			coalesce(p.can_read, false),
			coalesce(p.can_update, false),
			coalesce(p.can_delete, false)
		] as crud_permissions,
		g.user_id
		
	from private.documents d
	left join document_permissions p on p.document_id = d.id
	left join group_members g on g.group_id = p.group_id
), docs_path(document_id, depth, path, inherit_path, type, foreign_id, crud_permissions, user_id) AS (
		SELECT
			d.id  as document_id,
			0 AS depth,
			ARRAY[d.id] AS path,
			ARRAY[d.inherit_permissions_from_parent] AS inherit_path,
			d.type,
			d.foreign_id,
			d.crud_permissions,
			d.user_id
		FROM docs_perms d
		WHERE (d.parent_id IS NULL)
	UNION
		SELECT
			docs.id as document_id,
			(d.depth + 1),
			(d.path || docs.id) AS path,
			(d.inherit_path || docs.inherit_permissions_from_parent) AS inherit_path,
			docs.type,
			docs.foreign_id,
			case docs.inherit_permissions_from_parent when true	then
				array[
					coalesce(docs.crud_permissions[1], d.crud_permissions[1]),
					coalesce(docs.crud_permissions[2], d.crud_permissions[2]),
					coalesce(docs.crud_permissions[3], d.crud_permissions[3]),
					coalesce(docs.crud_permissions[4], d.crud_permissions[4])
				]
			else
				docs.crud_permissions
			end as crud_permissions,
			coalesce(docs.user_id, d.user_id)
			
		FROM docs_perms docs
		JOIN docs_path d ON docs.parent_id = d.document_id
)
SELECT
	d.*
from docs_path as d
where d.crud_permissions[2] = true
