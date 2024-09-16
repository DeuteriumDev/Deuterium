drop policy if exists {{ private_schema }}_documents_create on {{ private_schema }}.documents;
drop policy if exists {{ private_schema }}_documents_read on {{ private_schema }}.documents;
drop policy if exists {{ private_schema }}_documents_update on {{ private_schema }}.documents;
drop policy if exists {{ private_schema }}_documents_delete on {{ private_schema }}.documents;

drop policy if exists {{ public_schema }}_document_permissions_create on {{ private_schema }}.documents;
drop policy if exists {{ public_schema }}_document_permissions_read ON {{ public_schema }}.document_permissions;
drop policy if exists {{ public_schema }}_document_permissions_update ON {{ public_schema }}.document_permissions;
drop policy if exists {{ public_schema }}_document_permissions_delete ON {{ public_schema }}.document_permissions;

drop policy if exists {{ public_schema }}_group_members_create ON {{ public_schema }}.group_members;
drop policy if exists {{ public_schema }}_group_members_read ON {{ public_schema }}.group_members;
drop policy if exists {{ private_schema }}_group_members_update ON {{ private_schema }}.documents;
drop policy if exists {{ public_schema }}_group_members_delete ON {{ public_schema }}.group_members;

drop policy if exists {{ public_schema }}_groups_create ON {{ public_schema }}.groups;
drop policy if exists {{ public_schema }}_groups_read ON {{ public_schema }}.group_members;
drop policy if exists {{ public_schema }}_groups_update ON {{ public_schema }}.group_members;
drop policy if exists {{ public_schema }}_groups_delete ON {{ public_schema }}.group_members;

drop policy if exists {{ public_schema }}_group_permissions_create ON {{ public_schema }}.group_permissions;
drop policy if exists {{ public_schema }}_group_permissions_read ON {{ public_schema }}.group_permissions;
drop policy if exists {{ public_schema }}_group_permissions_update ON {{ public_schema }}.group_permissions;
drop policy if exists {{ public_schema }}_group_permissions_delete ON {{ public_schema }}.group_permissions;

