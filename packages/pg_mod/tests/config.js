const TEST_TIME_OUT = Number(process.env.TEST_TIME_OUT) || 20000;

const TEST_SQL_FILES = [
  'templates/extra/cleanup.sql',
  'templates/core/roles.sql',
  'templates/core/schemas.sql',
  'templates/core/tables.sql',
  'templates/core/functions.sql',
  'templates/core/views.sql',
  'templates/core/policies.sql',
  'templates/core/triggers.sql',
  'tests/seeds/postgres_seed.sql',
];

module.exports = {
  TEST_TIME_OUT,
  TEST_SQL_FILES,
};
