import fs from 'fs/promises';
import proc from 'child_process';
import yaml from 'yaml';

process.env.DT_CONFIGURATIONS_FOLDER = '../../pg_mod/configurations';

import { dashboard } from '../src/main';

const fakePath = 'fake_config.yml';
const fakeReader = jest.fn(async (filePath) => {
  if (filePath === fakePath)
    return JSON.stringify({ dashboard: { host: 'host', port: 'port' } });
});

describe('main#dashboard', () => {
  beforeEach(() => {});

  it('should call exec with sub-command', async () => {
    const fakeProc = jest.fn((event, cb) => {
      if (event === 'exit') cb();
    });
    const fakeExec = jest.fn(() => ({ on: fakeProc }));

    await dashboard(
      fakePath,
      fakeReader as unknown as typeof fs.readFile,
      fakeExec as unknown as typeof proc.exec,
    );
    expect(fakeReader.mock.calls[0][0]).toEqual('fake_config.yml');
    expect(fakeExec).toHaveBeenCalledWith(
      'HOST=host PORT=port node standalone/server.js',
      {
        cwd: expect.stringMatching(/.*/gi),
      },
    );
  });
});
