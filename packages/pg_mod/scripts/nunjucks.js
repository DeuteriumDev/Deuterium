#! /usr/bin/env node

const { readFileSync } = require('fs');
const nunjucks = require('nunjucks');
const { argv } = require('yargs');

const context = {
  ...(argv._[1] ? JSON.parse(readFileSync(argv._[1], 'utf8')) : {}),
  ...process.env,
};

const nunjucksEnv = nunjucks.configure(process.cwd(), {
  trimBlocks: true,
  lstripBlocks: true,
  noCache: true,
});
const res = nunjucksEnv.render(argv._[0], context);
console.log(res);
