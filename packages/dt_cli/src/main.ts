#! /usr/bin/env node
import yargs from 'yargs';
import fs from 'fs/promises';
import nunjucks from 'nunjucks';
import path from 'path';
import yaml from 'yaml';
import { Client } from 'pg';
import _ from 'lodash';
import proc from 'child_process';

import { Config } from './types';

const DEFAULT_CONFIG_FILE = '.dtrc.yml';
const CONFIGURATIONS_FOLDER = process.env.DT_CONFIGURATIONS_FOLDER
  ? `${process.env.DT_CONFIGURATIONS_FOLDER}`
  : `./configurations/`;
const VERSION = '0.1';
const CONFIG_TEMPLATE = 'config_template.yml';
const TEMPLATES_FOLDER = process.env.DT_TEMPLATES_FOLDER
  ? `${process.env.DT_TEMPLATES_FOLDER}`
  : './templates';

export async function getCliConfig(
  configFile: string = DEFAULT_CONFIG_FILE,
  fileReader: typeof fs.readFile,
): Promise<Config> {
  const cliConfig = yaml.parse(
    await fileReader(configFile, {
      encoding: 'utf-8',
    }),
  ) as Config;
  return cliConfig;
}

export async function getModConfig(
  cliConfig: Config,
): Promise<Record<string, string | string[]>> {
  const modConfig = require(
    path.join(__dirname, CONFIGURATIONS_FOLDER, `${cliConfig.preset}.json`),
  );

  return {
    ...modConfig,
    version: cliConfig.version,
    tables: _.sortBy(cliConfig.tables),
    ...cliConfig.overrides,
  };
}

export function parseRawConfig(
  config: Record<string, string>,
): Record<string, string | string[]> {
  return {
    ..._.fromPairs(
      _.map(_.keys(config), (k) => {
        if (/true|false/g.test(config[k])) {
          return [k, JSON.parse(config[k])];
        } else if (/,/g.test(config[k])) {
          return [k, config[k].split(',')];
        } else if (/[0-9]\.[0-9]/.test(config[k])) {
          return [k, parseFloat(config[k])];
        }

        return [k, config[k]];
      }),
    ),
    tables: config.tables.split(','),
    authenticated_roles: config.authenticated_roles.split(
      'authenticated_roles',
    ),
  };
}

export async function init(
  preset: string,
  configFile: string = DEFAULT_CONFIG_FILE,
  fileWriter: typeof fs.writeFile,
) {
  const nunjucksEnv = nunjucks.configure(process.cwd(), {
    trimBlocks: true,
    lstripBlocks: true,
    noCache: true,
  });
  await fileWriter(
    configFile,
    nunjucksEnv.render(path.join(__dirname, CONFIG_TEMPLATE), {
      ...require(path.join(__dirname, CONFIGURATIONS_FOLDER, `${preset}.json`)),
      config_version: VERSION,
      config_preset: preset,
    }),
  );
}

export async function sync(
  configFile: string = DEFAULT_CONFIG_FILE,
  fileReader: typeof fs.readFile,
  PgClient: typeof Client,
) {
  const cliConfig = await getCliConfig(configFile, fileReader);
  const modConfig = await getModConfig(cliConfig);

  const nunjucksEnv = nunjucks.configure(__dirname, {
    trimBlocks: true,
    lstripBlocks: true,
    noCache: true,
  });
  const client = new PgClient(cliConfig.connection_string);
  await client.connect();
  const isConfigSchemaInstalled = (
    await client.query(
      `
        SELECT EXISTS (
          SELECT FROM pg_tables
          WHERE  schemaname = '${modConfig.private_schema}'
          AND    tablename   = 'dt_configuration'
        );
      `,
    )
  ).rows[0].exists;
  // do full install from scratch
  if (!isConfigSchemaInstalled) {
    console.error('First install');
    await client.query(
      nunjucksEnv.render(
        path.join(
          __dirname,
          TEMPLATES_FOLDER,
          'frameworks',
          `${cliConfig.preset}.sql`,
        ),
        modConfig,
      ),
    );
    await client.query(
      nunjucksEnv.render(
        path.join(
          __dirname,
          TEMPLATES_FOLDER,
          'internal',
          'dt_configuration.sql',
        ),
        modConfig,
      ),
    );
    const configPresetNameValues = Object.keys(modConfig).map(
      (k) =>
        `('${k}','${_.isArray(modConfig[k]) ? (modConfig[k] as unknown as string[]).join(',') : modConfig[k]}')`,
    );
    await client.query(
      `
        insert into ${modConfig.private_schema}.dt_configuration values ${configPresetNameValues.join(', ')}
        on conflict (name) do update set value = EXCLUDED.value
      `,
    );
    await client.end();
  } else {
    console.error('Updating existing install');
    const dtResult = await client.query(
      `select * from ${modConfig.private_schema}.dt_configuration`,
    );
    const dBConfig = parseRawConfig(
      _.fromPairs(_.map(dtResult.rows, (r) => [r.name, r.value])),
    );

    // all synched up, do nothing
    if (_.isEqual(modConfig, dBConfig)) {
      console.error('DB already synchronized');
      return;
    }

    // if the tables are synched, but something else isn't, full resync
    if (_.isEqual(modConfig.tables, dBConfig.tables)) {
      console.error('Full re-synchronizing mod');
      await client.end();
      await uninstall(configFile, fileReader, PgClient);
      await sync(configFile, fileReader, PgClient);

      return;
    }

    // tables need synching
    console.error('Modding tables');
    const tablesToBeUnSynched = _.difference(modConfig.tables, dBConfig.tables);
    const tablesToBeSynched = _.difference(dBConfig.tables, modConfig.tables);

    await Promise.all(
      _.map(tablesToBeSynched, (t) =>
        client.query(
          nunjucksEnv.render(
            path.join(__dirname, TEMPLATES_FOLDER, 'core', 'add_table.sql'),
            {
              config: cliConfig,
              table: t,
            },
          ),
        ),
      ),
    );

    await Promise.all(
      _.map(tablesToBeUnSynched, (t) =>
        client.query(
          nunjucksEnv.render(
            path.join(
              __dirname,
              TEMPLATES_FOLDER,
              'revert',
              'remove_table.sql',
            ),
            {
              config: cliConfig,
              table: t,
            },
          ),
        ),
      ),
    );
  }
}

export async function uninstall(
  configFile: string = DEFAULT_CONFIG_FILE,
  fileReader: typeof fs.readFile,
  PgClient: typeof Client,
) {
  console.error('Uninstalling');
  const cliConfig = await getCliConfig(configFile, fileReader);
  const modConfig = await getModConfig(cliConfig);
  const client = new PgClient(cliConfig.connection_string);
  const nunjucksEnv = nunjucks.configure(__dirname, {
    trimBlocks: true,
    lstripBlocks: true,
    noCache: true,
  });

  await client.connect();
  await client.query(
    nunjucksEnv.render(
      path.join(__dirname, TEMPLATES_FOLDER, 'revert', 'dt_configuration.sql'),
      modConfig,
    ),
  );
  await client.query(
    nunjucksEnv.render(
      path.join(__dirname, TEMPLATES_FOLDER, 'revert', 'all.sql'),
      modConfig,
    ),
  );
  await client.end();
}

export async function dashboard() {
  let dashboard: ReturnType<typeof proc.exec>;
  if (process.env.NODE_ENV === 'development') {
    dashboard = proc.exec('make dev', {
      cwd: path.join('..', '..', 'services', 'nextjs_admin_dashboard'),
    });
  } else {
    dashboard = proc.exec('node standalone/server.js', {
      cwd: __dirname,
    });
  }
  await new Promise((accept, reject) => {
    dashboard.on('spawn', (sig: unknown) => console.error(`Server started: http://${process.env.HOSTNAME || '0.0.0.0'}:${process.env.PORT || 3000}`));
    // dashboard.on('message', (sig: unknown) => console.error('message', sig));
    dashboard.on('error', reject);
    dashboard.on('exit', accept);
  });
}

async function main() {
  const configurations = _.filter(
    await fs.readdir(path.join(__dirname, CONFIGURATIONS_FOLDER)),
    (ff) => /\.json/.test(ff),
  ) as string[];
  const parser = yargs(process.argv.slice(2)).options({
    c: {
      alias: 'configFile',
      describe: `config file if not "${DEFAULT_CONFIG_FILE}"`,
      default: DEFAULT_CONFIG_FILE,
      type: 'string',
    },
    init: {
      alias: 'initialize',
      describe: 'Init the configuration file in the current directory',
      choices: configurations,
      type: 'string',
    },
    sync: {
      describe: 'Synchronize the configuration file and the db',
      type: 'boolean',
      default: false,
    },
    uninstall: {
      describe: 'Uninstall the mod from the db',
      type: 'boolean',
      default: false,
    },
    dashboard: {
      describe: 'Start the admin dashboard for the db',
      type: 'boolean',
      default: false,
    },
  });
  try {
    const argv = await parser.parse();
    if (argv.init) await init(argv.init, argv.c, fs.writeFile);
    else if (argv.sync) await sync(argv.c, fs.readFile, Client);
    else if (argv.uninstall) await uninstall(argv.c, fs.readFile, Client);
    else if (argv.dashboard) await dashboard();
    else {
      console.error(await parser.getHelp());
      process.exit(1);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
