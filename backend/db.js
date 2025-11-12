const sql = require('mssql');

const config = {
    user: 'your_db_user',
    password: 'your_db_password',
    server: 'localhost', // desktop-hmrnjb
    database: 'ThesisSystemDB',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

module.exports = sql.connect(config);