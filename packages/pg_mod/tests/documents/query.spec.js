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
    await fileLoader('templates/extra/cleanup.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/roles.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/schemas.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/tables.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/functions.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/views.sql', 'fixtures/postgres.json');
    await fileLoader('templates/core/policies.sql', 'fixtures/postgres.json');

    // seed test data
    await fileLoader('tests/seeds/postgres.sql', 'fixtures/postgres.json');
  }, 15000);

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
        select * from public.folders
      `);

      expect(results.rows).toEqual([]);
    });
  });
});
