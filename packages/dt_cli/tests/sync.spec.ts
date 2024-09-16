import fs from 'fs/promises';

process.env.DT_CONFIGURATIONS_FOLDER = '../../pg_mod/configurations';

import { sync } from '../src/main';
import yaml from 'yaml';
import { Client } from 'pg';
import nunjucks from 'nunjucks';

const config = {
  version: 0.1,
  connection_string:
    'postgresql://<USER_NAME>:<PASSWORD>@<SERVER_ADDR>:<PORT?>/<SCHEMA>',
  preset: 'postgres',
  tables: ['schema.table'],
};

const pgPreset = {
  version: 0.1,
  add_folders: true,
  authenticated_roles: ['authenticated'],
  configuration: 'postgres',
  create_users_table: true,
  debug: true,
  include_authenticated_roles: true,
  owner: 'postgres',
  private_schema: 'private',
  public_schema: 'public',
  user_id_type: 'serial',
  users_table: 'public.users',
  tables: ['schema.table'],
};
const fakeReader = jest.fn(async () => yaml.stringify(config));
const fakePath = 'fake_config.yml';
const fakeQuery = jest.fn(() => ({ rows: ['any'] }));
const fakeConnect = jest.fn();
const fakeRender = jest.fn();
const fakeEnd = jest.fn();
class FakeClient {
  query = fakeQuery;
  connect = fakeConnect;
  end = fakeEnd;
}

describe('main#sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed in reading a yaml template to json', async () => {
    await sync(
      fakePath,
      fakeReader as unknown as typeof fs.readFile,
      FakeClient as unknown as typeof Client,
      fakeRender as unknown as typeof nunjucks.render,
    );
    expect(fakeReader.mock.calls[0]).toEqual([
      'fake_config.yml',
      { encoding: 'utf-8' },
    ]);
    expect(fakeConnect).toHaveBeenCalled();
    expect(fakeRender).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/src\/templates\/frameworks\/postgres.sql/gi),
      {
        // ...config,
        ...pgPreset,
      },
    );
  });
});
