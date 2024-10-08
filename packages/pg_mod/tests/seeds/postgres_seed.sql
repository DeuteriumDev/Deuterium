alter table {{ public_schema }}.folders disable trigger all;

insert into {{ public_schema }}.groups (id, name, parent_id, created_at) values ('f2b2e738-c43f-41d6-8ee5-02606a09464f', 'test group 1', null, '2024-01-24 13:04:54.357442+00');
insert into {{ public_schema }}.groups (id, name, parent_id, created_at) values ('12153362-ccfe-4eb1-ab5d-1ac8706ecd78', 'test group 1-1', 'f2b2e738-c43f-41d6-8ee5-02606a09464f', '2024-03-24 13:04:54.357442+00');
insert into {{ public_schema }}.groups (id, name, parent_id, created_at) values ('99ec64b9-486b-4fff-b7dd-28c31c6d5b18', 'test group 2', null, '2024-02-24 13:04:54.357442+00');

insert into {{ public_schema }}.users (id, email, created_at) values (1, 'test@test.ca', '2024-01-24 13:04:54.357442+00');
insert into {{ public_schema }}.users (id, email, created_at) values (2, 'people@people.ca', '2024-02-24 13:04:54.357442+00');
insert into {{ public_schema }}.users (id, email, created_at) values (3, 'outside@outside.ca', '2024-03-24 13:04:54.357442+00');


insert into {{ public_schema }}.group_members (group_id, user_id) values ('f2b2e738-c43f-41d6-8ee5-02606a09464f', 1);
insert into {{ public_schema }}.group_members (group_id, user_id) values ('99ec64b9-486b-4fff-b7dd-28c31c6d5b18', 2);
insert into {{ public_schema }}.group_members (group_id, user_id) values ('12153362-ccfe-4eb1-ab5d-1ac8706ecd78', 1);

insert into {{ public_schema }}.folders (id, name, description) values ('770d3c7c-189d-4f5e-9f20-e7c0bd14b584', 'test-folder-1', null);
insert into {{ public_schema }}.folders (id, name, description) values ('d74580e0-a180-4cec-89da-b609e10f6a7d', 'test-folder-2', null);
insert into {{ public_schema }}.folders (id, name, description) values ('70b49845-19d7-49ce-b5bd-f98a912edfd3', 'test-folder-1-1', null);
insert into {{ public_schema }}.folders (id, name, description) values ('01d00230-596b-4523-a900-45c0f863b48e', 'test-folder-1-1-1', null);

insert into {{ private_schema }}.document_types (value, comment) values ('folder', null);

insert into {{ private_schema }}.documents (id, inherit_permissions_from_parent, parent_id, type, foreign_id, created_at) values ('fb22ad4d-e0ac-40e4-acf1-69639a73cc8c', false, null, 'folder', '770d3c7c-189d-4f5e-9f20-e7c0bd14b584', '2024-01-24 13:04:54.357442+00');
insert into {{ private_schema }}.documents (id, inherit_permissions_from_parent, parent_id, type, foreign_id, created_at) values ('c8ce6a26-707f-43c8-9e43-b717a994a5c2', false, null, 'folder', 'd74580e0-a180-4cec-89da-b609e10f6a7d', '2024-02-24 13:04:54.357442+00');
insert into {{ private_schema }}.documents (id, inherit_permissions_from_parent, parent_id, type, foreign_id, created_at) values ('2e57764e-feff-4e4a-a2fc-bf28571be2ef', true, 'fb22ad4d-e0ac-40e4-acf1-69639a73cc8c', 'folder', '70b49845-19d7-49ce-b5bd-f98a912edfd3', '2024-03-24 13:04:54.357442+00');
insert into {{ private_schema }}.documents (id, inherit_permissions_from_parent, parent_id, type, foreign_id, created_at) values ('e1f94cbb-6d0e-48ee-8485-f85e8673303f', true, '2e57764e-feff-4e4a-a2fc-bf28571be2ef', 'folder', '01d00230-596b-4523-a900-45c0f863b48e', '2024-03-24 13:04:54.357442+00');

insert into {{ public_schema }}.document_permissions (id, can_create, can_read, can_update, can_delete, document_id, group_id, created_at) values ('7f3c25ba-799d-40b1-9942-b68a1ff74969', false, true, true, false, 'fb22ad4d-e0ac-40e4-acf1-69639a73cc8c', 'f2b2e738-c43f-41d6-8ee5-02606a09464f', '2024-01-24 13:04:54.357442+00');
insert into {{ public_schema }}.document_permissions (id, can_create, can_read, can_update, can_delete, document_id, group_id, created_at) values ('81f02df8-1e2e-433f-8c5d-2054852e5dcc', true, true, false, true, 'c8ce6a26-707f-43c8-9e43-b717a994a5c2', '99ec64b9-486b-4fff-b7dd-28c31c6d5b18', '2024-02-24 13:04:54.357442+00');

alter table {{ public_schema }}.folders enable trigger all;
