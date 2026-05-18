import { DatabaseSync } from "node:sqlite";
import user, { createUser, GetAciveSave, SetAciveSave } from "./user.js";
import { getSessionUser } from "./session.js";
const db_path = "./database.sqlite";
const db = new DatabaseSync(db_path);
const ACTIVE_SAVE = "active_save";
db.exec(
    `CREATE TABLE if not exists board (
id integer primary key autoincrement,
rowLen integer not null default 4);
CREATE TABLE IF NOT EXISTS buildings (
id integer primary key autoincrement,
name text not null,
symbol text not null,
income real not null,
upkeep real not null
);
create table if not exists placement_rules(
id integer primary key autoincrement,
builling_id integer not null, 
rule text not null,
rule_building_id integer
);
create table if not exists save_games (
    id integer primary key autoincrement,
    user_id integer,
    name text unique,
    save_data text not null
);`
    //rule_building_id może nie mieć sensu w nazwie ale służy do rozpoznania budynku z którym zasada jest związana np większośc budynków musi być obok ulicy
);
if (process.env.NEW_GAME) {
    console.log("tworzenie startowych danych");
    const addBuildings = db.prepare(
        `INSERT INTO buildings VALUES (null,'House','H',4.5,2.5),
    (null,'Road','R',0,0.5);`
    )
    addBuildings.all();

    const createBuildingRules = db.prepare(
        `INSERT INTO placement_rules VALUES(null,1,'must_be_next_to',2);`
    )
    //bezpieczne hasła
    let users = [['admin','1234567890'],['john','qwerty'],['joe','ytrewq']];
    for(const newUser of users){
        await createUser(newUser[0],newUser[1]);
    }
    const adminPriveleges = db.prepare(
        `update users set role = 'admin' where username = 'admin';`
    )
    adminPriveleges.run();
    createBuildingRules.all();
}
const db_ops = {
    get_board: db.prepare(
        `SELECT * FROM board;`
    ),
    get_buildings: db.prepare(
        `SELECT name FROM buildings;`
    ),
    get_buidling_sign: db.prepare(
        `select symbol from buildings where name = ?`
    ),
    get_row_len: db.prepare(
        `select rowLen from board;`
    ),
    setSaveName: db.prepare(
        "update save_games set name = ? where user_id = ?;"
    ),
    addSaveName: db.prepare(
        "insert into save_games (name,user_id) values (?,?);"
    ),
    getSaveGameName: db.prepare(
        "select name from save_games where user_id = ?;"
    ),
    selectSaves: db.prepare(
        "select * from save_games;"
    ),
    selectUserSaves: db.prepare(
        "select * from save_games where user_id = ?;"
    ),
    deleteSave: db.prepare(
        "delete from save_games where id = ?;"
    ),
    newSave: db.prepare(
        "insert into save_games (name,user_id,save_data) values (?,?,?);"       
    ),
    overwriteSave: db.prepare(
        "update save_games set save_data = ? where name=? and user_id = ?;"
    ),
    selectActiveSave :db.prepare(
        "select save_data from save_games where name = ? and user_id = ?;"
    ),
    deleteBoard: db.prepare(
        "drop table board;"
    ),
    createBoard: db.prepare(
        "CREATE TABLE if not exists board (id integer primary key autoincrement,rowLen integer not null default 4);"
    ),
    insertRow: db.prepare(
        "INSERT INTO board(rowLen) VALUES(?);"
    ),
};
export function DeleteActiveSave(res){
    res.cookie(ACTIVE_SAVE, "agemasen", {
        maxAge: 0,
        httpOnly: true,
        secure: true,
    });   
}
function boardTile(x, y) {
    var col = "col" + y.toString();
    const query = db.prepare(
        `SELECT ${col} from board where id = ?`
    );
    return query.all(x)[0][col];
}
function ColNames(table) {
    const stmt = db.prepare(
        `PRAGMA table_info(${table});`
    );
    var colData = stmt.all();
    var colNames = [];
    for (var i = 0; i < colData.length; i++) {
        colNames.push(colData[i].name);
    }
    return colNames;
}
export function ConvertBoardToSave(){
    var boardSizeX = db_ops.get_board.all().length;
    var boardSizeY = ColNames("board").length - 2;
    let save = "";
    for(var i=1;i<=boardSizeX;i++){
        for(var j=1;j<=boardSizeY;j++){
            var col = "col"+j.toString();
            const query = db.prepare(
                `SELECT ${col} from board where id = ?`
            );
            var cell = query.all(i); 
            save += cell[0][col];;
        }
        if(i != boardSizeX){
            save += ",";
        }
    }
    return save;
}
export function ConvertSaveToBoard(req){
    if(req.cookies.active_save != "NewSave"){
        let save = db_ops.selectActiveSave.get(req.cookies.active_save,getSessionUser(req.cookies.ses_id));
        let saveData = save.save_data.split(",");
        db_ops.deleteBoard.get();
        db_ops.createBoard.get();
        for(let i=0;i<saveData.length;i++){
            db_ops.insertRow.get(saveData[i].length);
            if(i==0){
                for(let j=1;j<=saveData[i].length;j++){
                    let colName = "col"+j.toString();
                    console.log(colName);
                    const addCols = db.prepare(
                        `ALTER TABLE board add column ${colName} TEXT NOT NULL default '0';`
                    )
                    addCols.get();
                }
            }
        }
        return getBoardData();
    }
    else{
        //
    }
}
export function selectSave(saveName,res){
    res.cookie(ACTIVE_SAVE, saveName.toString(), {
        maxAge: 60*60*24*7,
        httpOnly: true,
        secure: true,
    });
}
export function validateBuilingTypeAndPosition(x, y, inputString) {
    if (parseInt(x) == 21 && parseInt(y) == 37) {
        console.log("Kremówkowy Budynek")
    }
    var errors = [];
    var boardSizeX = db_ops.get_board.all().length;
    var boardSizeY = ColNames("board").length - 2;
    if (parseInt(x).toString() == "NaN" || parseFloat(x).toString() != parseInt(x).toString()) {
        errors.push("x musi być typu int");
    }
    else {
        if (x > boardSizeX) {
            errors.push("x musi być w rozmiarze " + data.board.length - 1);
        }
    }
    if (parseInt(y).toString() == "NaN" || parseFloat(y).toString() != parseInt(y).toString()) {
        errors.push("y musi być typu int");
    }
    else {
        if (y > boardSizeY) {
            errors.push("y poza rozmiarem planszy");
        }
    }
    var temp = db_ops.get_buildings.all();
    var buildings = [];
    for (var i = 0; i < temp.length; i++) {
        buildings.push(temp[i]["name"]);
    }
    if (parseInt(inputString).toString() == "NaN") {
        if (!buildings.includes(inputString)) {
            errors.push("budynek nie istneje");
        }
    }
    else {
        errors.push("nazwa budynku jest liczbą a ma być stringiem");
    }
    if (boardTile(x, y) != '0') {
        errors.push("na tym polu już coś jest");
    }
    return errors;
};
export function addBuilding(x, y, inputString) {
    var building = db_ops.get_buidling_sign.all(inputString)[0]["symbol"];
    var colName = "col" + y.toString();
    var colNames = ColNames('board');
    if (colNames.includes(colName)) {
        const addBld = db.prepare(
            `UPDATE board SET ${colName} = ? WHERE id = ?`
        )
        addBld.all(building, parseInt(x));
    }
}
export function removeBuilding(x, y, inputString) {
    var errors = [];
    var boardSizeX = db_ops.get_board.all().length;
    var boardSizeY = ColNames("board").length - 2;
    if (parseInt(x).toString() == "NaN" || parseFloat(x).toString() != parseInt(x).toString()) {
        errors.push("x musi być typu int");
    }
    else {
        if (x > boardSizeX) {
            errors.push("x musi być w rozmiarze " + data.board.length - 1);
        }
    }
    if (parseInt(y).toString() == "NaN" || parseFloat(y).toString() != parseInt(y).toString()) {
        errors.push("y musi być typu int");
    }
    var colName = "col" + y.toString();
    var temp = db_ops.get_buildings.all();
    var buildings = [];
    for (var i = 0; i < temp.length; i++) {
        buildings.push(temp[i]["name"]);
    }
    if (parseInt(inputString).toString() == "NaN") {
        if (!buildings.includes(inputString)) {
            errors.push("budynek nie istneje");
        }
    }
    if (errors.length <= 0) {
        var replacer;
        if (inputString != '0') {
            replacer = db_ops.get_buidling_sign.all(inputString)[0]["symbol"];
        }
        else {
            replacer = '0';
        }
        const query = db.prepare(
            `UPDATE board SET ${colName} = ? WHERE id = ?`
        )
        query.all(replacer, x);
        return null;
    }
    else {
        return errors;
    }
}
export function getBoardData() {
    var boardOutput = [];
    var board = db_ops.get_board.all();
    for (var j = 0; j < board.length; j++) {
        var boardRowData = [];
        for (var i = 1; i <= board[j].rowLen; i++) {
            var e = "col" + i.toString();
            boardRowData.push(board[j][e]);
        }
        boardOutput.push(boardRowData);
    }
    return boardOutput;
}
export function increseBoardSize() {
    const addRowLen = db.prepare(
        `UPDATE board set rowLen = rowLen + 1;`
    )
    addRowLen.all();
    var rowLen = db_ops.get_row_len.get()["rowLen"];
    var newColName = "col" + rowLen.toString();
    const addCols = db.prepare(
        `ALTER TABLE board add column ${newColName} TEXT NOT NULL default '0';`
    )
    const addRow = db.prepare(
        `INSERT INTO board(rowLen) VALUES(${parseInt(rowLen)});`
    )
    addRow.all();
    addCols.all();
}
export function setSaveName(save_name, id){
    if(save_name == "" && GetAciveSave(id) != null){
        let activeSave = GetAciveSave(id);
        console.log(activeSave);
        db_ops.overwriteSave.get(ConvertBoardToSave(),activeSave,id)
    }
    else if(save_name != ""){
        db_ops.newSave.get(save_name,id,ConvertBoardToSave());
        SetAciveSave(save_name,id);
    }
}
export function deleteSave(id){
    db_ops.deleteSave.get(id);
}
export function getSaveName(id){
    let save = db_ops.getSaveGameName.get(parseInt(id));
    if(save != undefined){
        return save.name;
    }
    else{ return null };
}
export function getSaves(){
    let saves = [];
    let dbsaves = db_ops.selectSaves.all();
    dbsaves.forEach(save =>{
        saves.push([save.id,save.user_id,save.name]);
    });
    return saves;
}
export function getUserSaves(id){
    let saves = [];
    let dbsaves = db_ops.selectUserSaves.all(id);
    dbsaves.forEach(save =>{
        saves.push([save.id,save.user_id,save.name,save.save_data]);
    });
    return saves;
}
export default {
    validateBuilingTypeAndPosition,
    getBoardData,
    getUserSaves,
};
