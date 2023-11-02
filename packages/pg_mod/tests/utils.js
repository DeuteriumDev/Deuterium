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
    const { stdout: sql } = await exec(
      `./scripts/compile_sql.sh ${file} ${data}`
    );
    return await client.query(sql);
  };
}

module.exports = {
  loginAsBuilder,
  fileLoaderBuilder,
};
