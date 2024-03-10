create index {{ public_schema }}_document_permissions_group_id
on {{ public_schema }}.document_permissions
using btree (group_id);

create index {{ public_schema }}_document_permissions_document_id
on {{ public_schema }}.document_permissions
using btree (document_id);

create index {{ public_schema }}_group_members_group_id
on {{ public_schema }}.group_members
using btree (group_id);

create index {{ public_schema }}_group_members_user_id
on {{ public_schema }}.group_members
using btree (user_id);

