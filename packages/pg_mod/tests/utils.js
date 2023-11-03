const util = require('util');
const exec = util.promisify(require('child_process').exec);

function loginAsBuilder(client) {
  return async (userID) =>
    await client.query(`
      set local role authenticated;
      set local user_id to '${userID}';
    `);
}

function fileLoaderBuilder(client) {
  return async (file, data) => {
    // elevate scope to increase error context
    let sql;
    try {
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
