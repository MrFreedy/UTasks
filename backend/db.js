const { Pool } = require('pg');
const pool = new Pool({
    user: 'admin',
    host: 'db',
    database: 'utasks',
    password: 'utasks',
    port: 5432,
});

module.exports = pool;