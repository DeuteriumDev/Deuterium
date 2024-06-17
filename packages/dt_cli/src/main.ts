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
const SCHEMA_FILE = 'schema.json';

const parser = yargs(process.argv.slice(2)).options({
  c: {
    alias: 'configFile',
    describe: `config file if not "${DEFAULT_CONFIG_FILE}"`,
    default: DEFAULT_CONFIG_FILE,
  },
  init: {
    alias: 'initialize',
    describe: 'Init the configuration file in the current directory',
    choices: ['postgres', 'supabase'],
  },
});

export async function init(
  preset: string,
  configFile: string = DEFAULT_CONFIG_FILE,
  fileWriter: typeof fs.writeFile,
) {
  await fileWriter(
    configFile,
    nunjucks.render(path.join(__dirname, CONFIG_TEMPLATE), {
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

  const client = new PgClient(cliConfig.connection_string);
  const modConfig = require(
    path.join(__dirname, CONFIGURATIONS_FOLDER, `${cliConfig.preset}.json`),
  );
  await client.connect();
  const result = await client.query(`select 1`);
  console.log(result);
}

export async function dashboard() {}

async function main() {
  const argv = await parser.parse();
  if (argv.init) await init(argv.init, argv.c, fs.writeFile);
  else if (argv.sync) await sync(argv.c, fs.readFile, Client);
  else if (argv.dashboard) dashboard();
  else {
    console.error(await parser.getHelp());
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
