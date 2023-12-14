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

describe('mutation.spec.js', () => {
  beforeAll(async () => {
    await client.connect();
    // optional 1-at-a-time debugging for isolating a buggy :pirate: template
    if (process.env.DEBUG) {
      for (const file of TEST_SQL_FILES) {
        await fileLoader(file, 'fixtures/postgres.json');
      }
    } else {
      await fileLoader(TEST_SQL_FILES, 'fixtures/postgres.json');
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

  describe('mutations', () => {
    describe('folders', () => {
      it('should allow edit on a folder for user#1', async () => {
        await loginAs(1);
        const results = await client.query(`
          update folders set name = 'update-test-1' where id = '770d3c7c-189d-4f5e-9f20-e7c0bd14b584';
        `);
        expect(results.rowCount).toEqual(1);
      });

      it('should not allow edit on a folder from another group for user#2', async () => {
        await loginAs(2);
        const results = await client.query(`
          update folders set name = 'update-test-1' where id = '770d3c7c-189d-4f5e-9f20-e7c0bd14b584';
        `);
        expect(results.rowCount).toEqual(0);
      });

      it('should not allow delete on a folder with read,update permissions for user#1', async () => {
        await loginAs(1);
        const results = await client.query(`
          delete from folders where id = '770d3c7c-189d-4f5e-9f20-e7c0bd14b584';
        `);
        expect(results.rowCount).toEqual(0);
      });

      it('should not allow delete on a folder from another group for user#2', async () => {
        await loginAs(2);
        const results = await client.query(`
          delete from folders where id = '770d3c7c-189d-4f5e-9f20-e7c0bd14b584';
        `);
        expect(results.rowCount).toEqual(0);
      });

      it('should allow creating a folder for user#2', async () => {
        await loginAs(2);
        const results = await client.query(`
          insert into folders values ('35c1c4a9-2bde-4ab8-9f6b-6b495696e3a0', 'people 2 folder');
        `);
        expect(results.rowCount).toEqual(1);
      });
    });
  });
});
