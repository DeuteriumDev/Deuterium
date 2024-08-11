import fs from 'fs/promises';

process.env.DT_CONFIGURATIONS_FOLDER = '../../pg_mod/configurations';

import { init } from '../src/main';
import yaml from 'yaml';

let fakeWriter: jest.Mock<unknown, any[], unknown>;

describe('main#init', () => {
  beforeEach(() => {
    fakeWriter = jest.fn(async () => null);
  });

  it('should succeed in rendering a yaml template to json', async () => {
    await init(
      'postgres',
      undefined,
      fakeWriter as unknown as typeof fs.writeFile,
    );
    expect(yaml.parse(fakeWriter.mock.calls[0][1])).toEqual({
      version: 0.1,
      connection_string:
        'postgresql://<USER_NAME>:<PASSWORD>@<SERVER_ADDR>:<PORT?>/<SCHEMA>',
      preset: 'postgres',
      // tables: ['schema.table'],
    });
  });
});
