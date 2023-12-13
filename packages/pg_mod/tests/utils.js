const util = require('util');
const exec = util.promisify(require('child_process').exec);
const _ = require('lodash');

function loginAsBuilder(client) {
  return async (userID) =>
    await client.query(`
      set local role authenticated;
      set local dt.user_id to '${userID}';
    `); // cant use params in a multi-query command
}

function fileLoaderBuilder(client) {
  return async (fileArg, dataArg) => {
    let file = fileArg;
    let data = dataArg;
    // elevate scope to increase error context
    let sql;

    try {
      if (_.isArray(fileArg)) {
        file = './tests/_concat.sql';
        await exec(`cat ${_.join(fileArg, ' ')} > ${file}`);
      }

      const { stdout } = await exec(`./scripts/compile_sql.sh ${file} ${data}`);
      sql = stdout;
      return await client.query(sql);
    } catch (error) {
      throw Error('FileLoaderError', {
        cause: `
          file: ${file}
          data: ${data}
          sqlError: ${error}
          sql: ${sql}
        `,
      });
    }
  };
}

module.exports = {
  loginAsBuilder,
  fileLoaderBuilder,
};
