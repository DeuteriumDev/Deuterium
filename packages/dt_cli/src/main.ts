#! /usr/bin/env node
import yargs from 'yargs';
import fs from 'fs/promises';
import nunjucks from 'nunjucks';
import path from 'path';
import yaml from 'yaml';
import { Client } from 'pg';

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
    choices: ['postgres', 'supabase'],
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
  let cliConfig;
  try {
    cliConfig = yaml.parse(
      await fileReader(configFile, {
        encoding: 'utf-8',
      }),
    ) as Config;
  } catch (err) {
    console.log(err);
    console.error((err as Error).message);
    process.exit(1);
  }

  const nunjucksEnv = nunjucks.configure(__dirname, {
    trimBlocks: true,
    lstripBlocks: true,
    noCache: true,
  });
  const client = new PgClient(cliConfig.connection_string);
  const modConfig = require(
    path.join(__dirname, CONFIGURATIONS_FOLDER, `${cliConfig.preset}.json`),
  );
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
    console.log('First install');
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
      (k) => `('${k}','${modConfig[k]}')`,
    );
    await client.query(
      `
        insert into ${modConfig.private_schema}.dt_configuration values ${configPresetNameValues.join(', ')}
         on conflict (name) do update set value = EXCLUDED.value
        `,
    );
  } else {
    console.log('Updating existing install');
  }
}

export async function uninstall(
  configFile: string = DEFAULT_CONFIG_FILE,
  fileReader: typeof fs.readFile,
  PgClient: typeof Client,
) {
  console.log('Uninstalling');
  let cliConfig;
  try {
    cliConfig = yaml.parse(
      await fileReader(configFile, {
        encoding: 'utf-8',
      }),
    ) as Config;
  } catch (err) {
    console.log(err);
    console.error((err as Error).message);
    process.exit(1);
  }
  const modConfig = require(
    path.join(__dirname, CONFIGURATIONS_FOLDER, `${cliConfig.preset}.json`),
  );
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
}

export async function dashboard() {}

async function main() {
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
}

if (require.main === module) {
  main();
}
