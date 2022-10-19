const { USER_NAME, PASSWORD , DATABASE, HOST ,DIALECT,DB_PORT } = require("./constant.js");
exports.db = {
    development: {
        "username": USER_NAME,
        "password": PASSWORD,
        "database":  DATABASE,
        "host": HOST,
        "dialect": DIALECT,
        "port": DB_PORT
    },
    test: {
        "username": USER_NAME,
        "password": PASSWORD,
        "database":  DATABASE,
        "host": HOST,
        "dialect": DIALECT,
        "port": DB_PORT
    },
    production: {
        "username": USER_NAME,
        "password": PASSWORD,
        "database":  DATABASE,
        "host": HOST,
        "dialect": DIALECT,
        "port": DB_PORT
    }
}