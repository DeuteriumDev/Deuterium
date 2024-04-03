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
  where d.crud_permissions[2] = true; -- drop rows where read is false, since it's the same as not existing



grant select on {{ private_schema }}.document_user_permissions to {{ authenticated_roles|join(', ') }};


create view {{ public_schema }}.recent_nodes_view as
  select * 
  from (
      select
      u.id::text,
      u.email as name,
      'user' as type,
      gm.group_id as parent_id,
      created_at
    from users u
    left join group_members gm on gm.user_id = u.id
    union
    select
      p.id::text,
      g.name::text || ' - ' || p.can_create || '-' || p.can_read || '-' || p.can_update || '-' || p.can_delete as name,
      'permission' as type,
      null as parent_id,
      p.created_at
    from document_permissions p
    join groups g on g.id = p.group_id
    union
    select
      id::text,
      name,
      'group' as type,
      parent_id,
      created_at
    from groups
    union
    select
      f.id::text,
      f.name,
      'folder' as type,
      d.parent_id as parent_id,
      d.created_at
    from folders f
    join private.documents d on d.foreign_id = f.id
  )
  order by created_at desc;

grant select on {{ public_schema }}.recent_nodes_view to {{ authenticated_roles|join(', ') }};

create view {{ public_schema }}.node_growth_view as 
  select 
    total,
    count_this_month,
    type
  from (
    select
      count(id) as total,
      (
        select
        count(id) as count_per_month
        from public.users
        where extract (month from created_at) = extract (month from now())
      )	as count_this_month,
      'users' as type,
      0 as position
    from public.users
    union
    select
      count(id) as total,
      (
      select
        count(id) as count_per_month
      from public.groups
      where extract (month from created_at) = extract (month from now())
      )	as count_this_month,
      'groups' as type,
      1 as position
    from public.groups
    union
    select
      count(id) as total,
      (
        select
        count(id) as count_per_month
        from public.document_permissions
        where extract (month from created_at) = extract (month from now())
      )	as count_this_month,
      'permissions' as type,
      2 as position
    from public.document_permissions
    union
    select
      count(id) as total,
      (
        select
        count(id) as count_per_month
        from private.documents
        where extract (month from created_at) = extract (month from now())
      )	as count_this_month,
      'documents' as type,
      3 as position
    from private.documents
  )
  order by position;

grant select on {{ public_schema }}.node_growth_view to {{ authenticated_roles|join(', ') }};


create view {{ public_schema }}.document_permissions_view as 
  select 
    p.id,
    p.can_create,
    p.can_read,
    p.can_update,
    p.can_delete,
    p.created_at,
    g.name as group_name,
    g.id as group_id,
    d.type as document_type,
    f.name as document_name,
    f.id as document_id
  from public.document_permissions p
  join public.groups g on p.group_id = g.id
  join private.documents d on p.document_id = d.id
  left join public.folders f on f.id = d.foreign_id;

grant select on {{ public_schema }}.document_permissions_view to {{ authenticated_roles|join(', ') }};


create view {{ public_schema }}.documents_view as 
  select 
    f.id,
    f.name as name,
    d.created_at,
    d.type as type
  from private.documents d
  left join public.folders f on f.id = d.foreign_id;

grant select on {{ public_schema }}.documents_view to {{ authenticated_roles|join(', ') }};

