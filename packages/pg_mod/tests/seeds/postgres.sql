insert into {{ private_schema }}.document_types values ('test', 'test document type');

insert into {{ private_schema }}.documents values ('fb22ad4d-e0ac-40e4-acf1-69639a73cc8c', false, null, 'test');
insert into {{ private_schema }}.documents values ('c8ce6a26-707f-43c8-9e43-b717a994a5c2', false, null, 'test');

insert into {{ public_schema }}.groups values ('f2b2e738-c43f-41d6-8ee5-02606a09464f', 'test group 1', null);
insert into {{ public_schema }}.groups values ('99ec64b9-486b-4fff-b7dd-28c31c6d5b18', 'test group 2', null);

insert into {{ public_schema }}.users values (1, 'test@test.ca');
insert into {{ public_schema }}.users values (2, 'people@people.ca');

insert into {{ public_schema }}.group_members values ('f2b2e738-c43f-41d6-8ee5-02606a09464f', 1);
insert into {{ public_schema }}.group_members values ('99ec64b9-486b-4fff-b7dd-28c31c6d5b18', 2);

insert into {{ public_schema }}.folders values ('770d3c7c-189d-4f5e-9f20-e7c0bd14b584', 'fb22ad4d-e0ac-40e4-acf1-69639a73cc8c', 'test-folder-1', null);
insert into {{ public_schema }}.folders values ('d74580e0-a180-4cec-89da-b609e10f6a7d', 'c8ce6a26-707f-43c8-9e43-b717a994a5c2', 'test-folder-2', null);
