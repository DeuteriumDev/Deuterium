
alter table public.folders disable trigger all;


{% set DEPTH = 3 %}
-- the growth rate is `n^3 + n^2 + n^1 + (n * 4)` (I think...)

with recursive document_ids(i, depth, document_id, parent_id) as (
	select 
		s.i,
        1,
		gen_random_uuid() document_id,
		null::uuid parent_id
    -- parse `START` and `STOP` into [int] from ENV variables
	from generate_series({{ env("START") | int }}, {{ env("STOP") | int }}) s(i)
	union all
	select
		document_ids.i * ({{ env("STOP") | int }} - ({{ env("START") | int }} - 1)) + s.i,
        depth + 1,
		gen_random_uuid() document_id,
		document_ids.document_id
	from document_ids
	cross join generate_series({{ env("START") | int }}, {{ env("STOP") | int }}) s(i)
	where document_ids.depth < {{ DEPTH }}
), ids as (
    select
        i,
        gen_random_uuid() group_id
    from generate_series({{ env("START") | int }}, {{ env("STOP") | int }}) s(i)

), _user_ids as (
    insert into {{ public_schema }}.users (id, email)
    select
        i,
        i || '@test.ca'
    from ids
    returning id
), _group_ids as (
    insert into {{ public_schema }}.groups (id, name, parent_id)
    select
        group_id,
        i || ' group',
        null
    from ids
    returning id
), _group_members as (
    insert into {{ public_schema }}.group_members (group_id, user_id)
    select
        group_id,
        i
    from ids
), _permissions as (
    insert into {{ public_schema }}.document_permissions (can_create, can_read, can_update, can_delete, document_id, group_id)
    select
        false,
        true,
        true,
        false,
        d.document_id,
        ii.group_id
    from ids ii
    join (select * from document_ids where parent_id is null) d on ii.i = d.i
), folder_ids as (
    select
        gen_random_uuid() id,
        i
    from document_ids
), _folders as (
    insert into folders (id, name, description)
    select
        id,
        i || ' folder',
        null
    from folder_ids
)
insert into {{ private_schema }}.documents (id, inherit_permissions_from_parent, parent_id, type, foreign_id)
select
	d.document_id id,
	case d.parent_id when null then
		false
	else
		true
	end as inherit_permissions_from_parent,
	d.parent_id,
	'folder' type,
	f.id as foreign_id
from document_ids d
join folder_ids f on d.i = f.i;


alter table public.folders enable trigger all;
