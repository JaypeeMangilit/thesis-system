import sql from "mssql";

const config = {
    user: "patnubayadmin",
    password: "Patnubay#402260",
    server: "patnubay-server.database.windows.net",
    database: "free-sql-db-0752246",
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// We export the connection promise and the sql object itself
export const poolPromise = sql.connect(config)
    .then(pool => {
        console.log("Connected to SQL Server Azure (mssql driver)");
        return pool;
    })
    .catch(err => {
        console.error("Database connection failed:", err.message);
    });

// Make sure to export sql if your controllers need it
export { sql }; 

export const db = {
    query: async (text, params) => {
        const pool = await poolPromise;
        const request = pool.request();
        
        if (params) {
            params.forEach((val, index) => {
                request.input(`param${index}`, val);
                text = text.replace('?', `@param${index}`);
            });
        }
        
        const result = await request.query(text);
        return [result.recordset];
    }
};