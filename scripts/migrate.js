const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_URL.replace('file:', '');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Create migrations table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS ___migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );
`);

const migrationsDir = path.join(__dirname, '../migrations');

if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    const existingMigrations = db.prepare('SELECT name FROM ___migrations').all().map(m => m.name);

    for (const file of files) {
        if (!existingMigrations.includes(file)) {
            console.log(`Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
            db.transaction(() => {
                db.exec(sql);
                db.prepare('INSERT INTO ___migrations (name) VALUES (?)').run(file);
            })();
        }
    }
} else {
    console.log('No migrations found in dizzle folder.');
}

console.log('Database initialized.');
