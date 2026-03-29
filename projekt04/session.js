import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
const db_path = "./database.sqlite";
const db = new DatabaseSync(db_path, { readBigInts: true });

const SESSION_COOKIE = "ses_id";
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
id INTEGER PRIMARY KEY,
user_id INTEGER,
created_at INTEGER
) STRICT;`
);

const db_ops = {
    create_session: db.prepare(
    `INSERT INTO sessions (id, user_id, created_at)
    VALUES (?, ?, ?) RETURNING id, user_id, created_at;`
    ),
    get_session: db.prepare(
    "SELECT id, user_id, created_at from sessions WHERE id = ?;"
    ),
    deleteSesson: db.prepare(
        "delete from sessions where id = ?;"
    ),
};

export async function createSession(user, res) {
    let sessionId = randomBytes(8).readBigInt64BE();
    let createdAt = Date.now();
    let session = db_ops.create_session.get(sessionId, user, createdAt);
    res.cookie(SESSION_COOKIE, session.id.toString(), {
        maxAge: 1000*60*10,
        httpOnly: true,
        secure: true,
    });
    return session;
}
export function deleteSession(id,res){
    let session = db_ops.get_session.get(id);
    res.cookie(SESSION_COOKIE, session.id.toString(),{
        maxAge: 0,
        httpOnly: true,
        secure: true,
    });
}

export default{
    createSession,
    deleteSession,
}
