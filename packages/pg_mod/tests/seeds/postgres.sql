insert into {{ private_schema }}.document_types values ('test', 'test document type');

insert into {{ private_schema }}.documents values ('fb22ad4d-e0ac-40e4-acf1-69639a73cc8c', false, null, 'test');

insert into {{ public_schema }}.groups values ('f2b2e738-c43f-41d6-8ee5-02606a09464f', 'test group 1', null);

insert into {{ public_schema }}.users values (1, 'test@test.ca');

insert into {{ public_schema }}.group_members values ('f2b2e738-c43f-41d6-8ee5-02606a09464f', 1);

insert into {{ public_schema }}.folders values ('770d3c7c-189d-4f5e-9f20-e7c0bd14b584', 'fb22ad4d-e0ac-40e4-acf1-69639a73cc8c', 'test-folder-1', null);
