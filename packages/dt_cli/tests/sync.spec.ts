import fs from 'fs/promises';

process.env.DT_CONFIGURATIONS_FOLDER = '../../pg_mod/configurations';

import { sync } from '../src/main';
import yaml from 'yaml';
import { Client } from 'pg';

let fakeReader: jest.Mock<unknown, any[], unknown>;

describe('main#sync', () => {
  beforeEach(() => {
    fakeReader = jest.fn(async () =>
      yaml.stringify({
        version: 0.1,
        connection_string:
          'postgresql://<USER_NAME>:<PASSWORD>@<SERVER_ADDR>:<PORT?>/<SCHEMA>',
        preset: 'postgres',
        tables: ['schema.table'],
      }),
    );
  });

  it('should succeed in reading a yaml template to json', async () => {
    const fakePath = 'fake_config.yml';
    const fakeQuery = jest.fn();
    const fakeConnect = jest.fn();
    class FakeClient {
      query = fakeQuery;
      connect = fakeConnect;
    }

    await sync(
      fakePath,
      fakeReader as unknown as typeof fs.readFile,
      FakeClient as unknown as typeof Client,
    );
    expect(fakeReader.mock.calls[0][0]).toEqual(fakePath);
    expect(fakeConnect).toHaveBeenCalled();
  });
});
