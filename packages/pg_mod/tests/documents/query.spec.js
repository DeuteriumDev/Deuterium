require('dotenv').config();
const { Client } = require('pg');

const { fileLoaderBuilder, loginAsBuilder } = require('../utils');

const client = new Client(process.env.DB_CONNECTION);
const fileLoader = fileLoaderBuilder(client);
const loginAs = loginAsBuilder(client);

/*
Steps:
- connect to db
- reset and clean any stale config / data
- load `function_tests.sql`
- run each test
- disconnect
*/

describe('query.spec.js', () => {
  beforeAll(async () => {
    await client.connect();

    // setup db
    await fileLoader(
      [
        'templates/extra/cleanup.sql',
        'templates/core/roles.sql',
        'templates/core/schemas.sql',
        'templates/core/tables.sql',
        'templates/core/functions.sql',
        'templates/core/views.sql',
        'templates/core/policies.sql',
        'tests/seeds/postgres_seed.sql',
      ],
      'fixtures/postgres.json'
    );
  }, 20000);

  afterAll(async () => {
    await client.end();
  });

  beforeEach(async () => {
    await client.query('begin;');
  });

  afterEach(async () => {
    await client.query('rollback;');
  });

  describe('documents', () => {
    it('should return a single doc as user#1', async () => {
      await loginAs(1);

      const results = await client.query(`
        select * from folders;
      `);
      expect(results.rowCount).toEqual(1);
    });

    it('should return a single, specific doc as user#2', async () => {
      await loginAs(2);

      const results = await client.query(`
        select * from folders;
      `);
      expect(results.rows[0].id).toEqual('d74580e0-a180-4cec-89da-b609e10f6a7d');
    });

    it('should return no docs as user#3', async () => {
      await loginAs(3);

      const results = await client.query(`
        select * from folders;
      `);
      expect(results.rowCount).toEqual(0);
    });
  });
});
