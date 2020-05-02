const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite')

db.run(`
CREATE TABLE IF NOT EXISTS Artist (
    id INTEGER NOT NULL, 
    name TEXT NOT NULL, 
    date_of_birth TEXT NOT NULL, 
    biography TEXT NOT NULL, 
    is_currently_employed INTEGER DEFAULT 1,
    PRIMARY KEY('id'));
`, function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log('Table Artist created');
    }
});

// db.run("INSERT INTO Artist (name,date_of_birth, biography, is_currently_employed) VALUES (1,'nikita', '4/3/1996', 'test', 1);");

db.run(`
CREATE TABLE IF NOT EXISTS Series (
    id INTEGER NOT NULL, 
    name TEXT NOT NULL, 
    description TEXT NOT NULL,
    PRIMARY KEY ('id'));
`, function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log('Table Series created');
    }
});