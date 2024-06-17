require('dotenv').config();
const { Client } = require('pg');
const _ = require('lodash');

const { fileLoaderBuilder, loginAsBuilder } = require('../utils');
const { TEST_TIME_OUT, TEST_SQL_FILES } = require('../config');

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
    // optional 1-at-a-time debugging for isolating a buggy :pirate: template
    if (process.env.DEBUG) {
      for (const file of TEST_SQL_FILES) {
        await fileLoader(file, 'configurations/postgres.json');
      }
    } else {
      await fileLoader(TEST_SQL_FILES, 'configurations/postgres.json');
    }
  }, TEST_TIME_OUT);

  afterAll(async () => {
    await client.end();
  });

  beforeEach(async () => {
    await client.query('begin;');
  });

  afterEach(async () => {
    await client.query('rollback;');
  });

  describe('queries', () => {
    describe('folders', () => {
      it('should return a single doc as user#1', async () => {
        await loginAs(1);

        const results = await client.query(`
          select * from folders;
        `);
        expect(results.rowCount).toEqual(3);
      });

      it('should return a single child doc as user#1', async () => {
        await loginAs(1);

        const results = await client.query(`
          select * from folders f join private.documents d on d.foreign_id = f.id  where d.parent_id = 'fb22ad4d-e0ac-40e4-acf1-69639a73cc8c';
        `);
        expect(results.rowCount).toEqual(1);
      });

      it('should return a single, specific doc as user#2', async () => {
        await loginAs(2);

        const results = await client.query(`
          select * from folders;
        `);
        expect(results.rows[0].id).toEqual(
          'd74580e0-a180-4cec-89da-b609e10f6a7d'
        );
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
});
