const initOptions = {
  capSQL: true,
};

// See: http://vitaly-t.github.io/pg-promise/module-pg-promise.html
const pgp = require("pg-promise")(initOptions);

const config = require("config");

function factory({ config }) {
  // one-time connection pool to set up the postgres connection
  const db = pgp(config);
  async function query(sqlQuery, sqlParams) {
    try {
      const data = await db.any(sqlQuery, sqlParams);
      console.log("data:\n", data);
      return data;
    } catch (e) {
      console.log("ERROR:", e.message);
      throw e;
    }
    db.$pool.end;
  }

  return {
    query,
  };
}

module.exports = factory;
