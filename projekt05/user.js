import { DatabaseSync } from "node:sqlite";
import argon2 from "argon2";
import session, { createSession, deleteSession } from "./session.js";
import { constrainedMemory } from "process";
const db_path = "./database.sqlite";
const db = new DatabaseSync(db_path);


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
        createdAt integer,
        role text default "user"
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
    getAllUsernames: db.prepare(
        "select username from users;"
    ),
    getUserPrivelege: db.prepare(
        "select role from users where id = ?;"
    ),
}
export async function verifyLogin(username, password, res, req) {
    let errors = [];
    if (username != "") {
        let users = db_ops.getAllUsernames.all();
        let usernames = [];
        users.forEach(element => {
            usernames.push(element['username']);
        });
        if (!usernames.includes(username)) {
            errors.push("No user whith this username");
        }
        else {
            if (password != "") {
                let user = db_ops.getUserByName.get(username);
                if (user != null) {
                    let userLoginData = db_ops.getUserLoginData.get(user.id);
                    if (await argon2.verify(userLoginData.passhash, password, HASH_PARAMS)) {
                        return errors;
                    }
                    else {
                        errors.push("Incorrect password or username");
                    }
                }
                else {
                    errors.push("Incorrect password or username");
                }
            }
            else {
                errors.push("Password is required");
            }
        }
    }
    else {
        errors.push("Username is required");
    }
    return errors;
}
export function verifySignup(username, password, passwordRepeat, res, req) {
    let errors = [];
    if (username != "") {
        let users = db_ops.getAllUsernames.all();
        let usernames = [];
        users.forEach(element => {
            usernames.push(element['username']);
        });
        if (usernames.includes(username)) {
            errors.push("Username is taken");
        }
        else {
            if (password != "") {
                if (passwordRepeat != "") {
                    if (password == passwordRepeat) {
                        return errors;
                    }
                    else {
                        errors.push("Passwords don't match");
                    }
                }
                else {
                    errors.push("Password must be repeated");
                }
            }
            else {
                errors.push("Password is required");
            }
        }
    }
    else {
        errors.push("Username is required");
    }
    return errors;
}
export async function loginUser(username, password) {
    let user = db_ops.getUserByName.get(username);
    return user.id;
}
export async function createUser(username, password) {
    let createdAt = Date.now();
    let passhash = await argon2.hash(password, HASH_PARAMS);
    db_ops.addUser.run(username, passhash, createdAt);
}
export function sessionUserById(id) {
    let user = db_ops.getUser.get(id);
    return user.username;
}
export function logOut(req, res) {
    deleteSession(req.cookies.ses_id, res);
}
export function getRole(id){
    let role = db_ops.getUserPrivelege.get(id);
    return role.role;
}

export default {
    loginUser,
    createUser,
    sessionUserById,
    getRole,
}
