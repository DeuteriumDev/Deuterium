/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  detectOpenHandles: true,
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
};
