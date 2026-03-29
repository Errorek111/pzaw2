import { DatabaseSync} from "node:sqlite";
import argon2 from "argon2";
import session, { createSession, deleteSession } from "./session.js";
const db_path = "./database.sqlite";
const db = new  DatabaseSync(db_path);


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

db.exec(
    `CREATE TABLE if not exists users (
        id INTEGER primary key autoincrement,
        username text unique,
        passhash text,
        createdAt integer
    );`
);
const db_ops = {
    getUser: db.prepare(
        "select id, username from users where id = ?;"
    ),
    getUserByName: db.prepare(
        "select id, username from users where username = ?;"
    ),
    getUserLoginData: db.prepare(
        "select username, passhash from users where id = ?;"
    ),
    addUser: db.prepare(
        "insert into users (username,passhash,createdAt) values (?,?,?);"
    ),
}

export async function loginUser(username,password,res,req){
    let user = db_ops.getUserByName.get(username);
    if(user != null){
        let userLoginData = db_ops.getUserLoginData.get(user.id);
        if(await argon2.verify(userLoginData.passhash,password, HASH_PARAMS)){
            return user.id;
        }
    }
}
export async function createUser(username,password){
    let createdAt = Date.now();
    let passhash = await argon2.hash(password, HASH_PARAMS);
    db_ops.addUser.run(username,passhash,createdAt);
}
export function logOut(req,res){
    deleteSession(req.cookies.ses_id,res);
}

export default{
    loginUser,
    createUser,
}
