require('dotenv').config();
const { Client } = require('pg');

const { fileLoaderBuilder } = require('../utils');

const client = new Client(process.env.DB_CONNECTION);
const fileLoader = fileLoaderBuilder(client);

/*
Steps:
- connect to db
- reset and clean any stale config / data
- load `function_tests.sql`
- run each test
- disconnect
*/

describe('functions.sql', () => {
  beforeAll(async () => {
    await client.connect();
    await fileLoader('templates/extra/cleanup.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/roles.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/schemas.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/tables.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/functions.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/views.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/policies.sql', 'fixtures/postgres.json');
  }, 15000);

  afterAll(() => {
    client.end();
  });

  beforeEach(async () => {
    await client.query('begin');
  });

  afterEach(async () => {
    await client.query('rollback;');
  });

  describe('reduce_permissions', () => {
    const permissions = [
      {
        input: `'{true,true}'::bool[], array[array[true,true,true,true],array[true,false,false,false],array[true,true,true,true]]`,
        output: [true, true, true, true],
      },
      {
        input: `'{true,true}'::bool[], array['{null,null,null,null}',array[true,false,false,false],array[true,true,true,true]]`,
        output: [true, false, false, false],
      },
      {
        input: `'{false,true}'::bool[], array[array[true,true,false,true],array[true,false,false,false],'{null,null,null,null}']`,
        output: [true, true, false, true],
      },
    ];

    permissions.forEach((perm) => {
      it(`should return ${JSON.stringify(perm.output)}`, async () => {
        const results = await client.query(`
        select private.reduce_permissions(${perm.input});
        `);
        expect(results.rows[0].reduce_permissions).toEqual(perm.output);
      });
    });
  });

  describe('is_member_of', () => {});
});
