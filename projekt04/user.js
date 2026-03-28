import { DatabaseSync } from "node:sqlite";
import argon2 from "argon2";

const PEPPER = process.env.PEPPER;
if (PEPPER == null) {
  console.error(
    `PEPPER environment variable missing.
     Please create an env file or provide SECRET via environment variables.`,
  );
  process.exit(1);
}

const HASH_PARAMS = {
  secret: Buffer.from(PEPPER, "hex"),
};

const db_path = "./database.sqlite";
const db = new DatabaseSync(db_path);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY,
    name         TEXT UNIQUE,
    passwdHash TEXT,
    created_at      INTEGER
  ) STRICT;
  `);
const db_ops = {
  create_user: db.prepare(
    `INSERT INTO users (name, passwdHash, created_at)
            VALUES (?, ?, ?) RETURNING id, name, passwdHash, created_at;`
  ),
  get_user: db.prepare(
    "SELECT id, name  from users WHERE id = ?;"
  ),
  get_user_by_name: db.prepare(
    "SELECT id, name  from users WHERE name = ?;"
  ),
    get_password: db.prepare(
        "SELECT id, passwdHash from users WHERE name = ?;"
    ),
};

export async function createUser(name, password){
    let existing_user = db_ops.get_user_by_name.get(name);
    if (existing_user != null) {
        return null;
    }
    let createdAt = Date.now();
    let passhash = await argon2.hash(password, HASH_PARAMS);
    return db_ops.create_user.get(name, passhash, createdAt);
}

export async function validatePassword(username, password) {
    let auth_data = db_ops.get_password.get(username);
    if (auth_data != null) {
        if (await argon2.verify(auth_data.passwdHash, password, HASH_PARAMS)) {
            return auth_data.id;
        }
    }
    return null;
}

export function getUser(name){
    return db_ops.get_user_by_name.get(name);
}
export default{
    createUser,
    validatePassword,
    getUser,
}
