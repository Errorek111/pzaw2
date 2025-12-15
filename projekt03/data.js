import { DatabaseSync} from "node:sqlite";
import { parse } from "path";
const db_path = "./database.sqlite";
const db = new  DatabaseSync(db_path);
db.exec(
    `CREATE TABLE if not exists board (
id integer primary key autoincrement,
rowLen integer not null default 4,
col1 text not null default [0],
col2 text not null default [0],
col3 text not null default [0],
col4 text not null default [0]);
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
)`
//rule_building_id może nie mieć sensu w nazwie ale służy do rozpoznania budynku z którym zasada jest związana np większośc budynków musi być obok ulicy
);
if (process.env.NEW_GAME) {
    console.log("tworzenie startowych danych");
    const createRow = db.prepare(
        `INSERT INTO board default VALUES;`
    )
    for(var i=0;i<4;i++){
        createRow.all();
    }
    const addBuildings = db.prepare(
        `INSERT INTO buildings VALUES (null,'House','H',4.5,2.5),
    (null,'Road','R',0,0.5);`
    )
    addBuildings.all();
    
    const createBuildingRules = db.prepare(
        `INSERT INTO placement_rules VALUES(null,1,'must_be_next_to',2);`
    )
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
};
function boardTile(x,y){
    var col = "col"+y.toString();
    const query = db.prepare(
        `SELECT ${col} from board where id = ?`
    );
    return query.all(x)[0][col];
}
function ColNames(table){
    const stmt = db.prepare(
        `PRAGMA table_info(${table});`
    );
    var colData = stmt.all();
    var colNames = []
    for(var i=0;i<colData.length;i++){
        colNames.push(colData[i].name);
    }
    return colNames;
}
const data = {
    "buildings": [
        { name: "House", mapSign :"H" },
        { name :"Road", mapSign :"R" },
    ],
}

export function validateBuilingTypeAndPosition(x,y,inputString){
    if(parseInt(x) == 21 && parseInt(y) == 37){
        console.log("Kremówkowy Budynek")
    }
    var errors = [];
    var boardSizeX = db_ops.get_board.all().length;
    var boardSizeY = ColNames("board").length - 2;
    if (parseInt(x).toString() == "NaN" || parseFloat(x).toString() != parseInt(x).toString()){
        errors.push("x musi być typu int");
    }
    else{
        if(x > boardSizeX){
            errors.push("x musi być w rozmiarze "+data.board.length-1);
        }
    }
    if (parseInt(y).toString() == "NaN" || parseFloat(y).toString() != parseInt(y).toString()){
        errors.push("y musi być typu int");
    }
    else{   
        if(y>boardSizeY){
            errors.push("y poza rozmiarem planszy");
        }
    }
    var counter = 0;
    var temp = db_ops.get_buildings.all();
    var buildings = [];
    for(var i=0;i<temp.length;i++){
        buildings.push(temp[i]["name"]);
    }
    if(parseInt(inputString).toString() == "NaN"){
        if(!buildings.includes(inputString)){
            errors.push("budynek nie istneje");
        }
    }
    else{
        errors.push("nazwa budynku jest liczbą a ma być stringiem");
    }
    if(boardTile(x,y) != '0'){
        errors.push("na tym polu już coś jest");
    }
    return errors;
};
export function addBuilding(x,y,inputString){
    var building = db_ops.get_buidling_sign.all(inputString)[0]["symbol"];
    var colName = "col"+y.toString();
    var colNames = ColNames('board');
    if(colNames.includes(colName)){
        const addBld = db.prepare(
            `UPDATE board SET ${colName} = ? WHERE id = ?`
        )
        addBld.all(building,parseInt(x));
    }
}
export function removeBuilding(x,y){
    var errors = [];
    var boardSizeX = db_ops.get_board.all().length;
    var boardSizeY = ColNames("board").length - 2;
    if (parseInt(x).toString() == "NaN" || parseFloat(x).toString() != parseInt(x).toString()){
        errors.push("x musi być typu int");
    }
    else{
        if(x > boardSizeX){
            errors.push("x musi być w rozmiarze "+data.board.length-1);
        }
    }
    if (parseInt(y).toString() == "NaN" || parseFloat(y).toString() != parseInt(y).toString()){
        errors.push("y musi być typu int");
    }
    if(errors.length <= 0){
        var colName = "col"+y.toString();    
        const query = db.prepare(
            `UPDATE board SET ${colName} = '0' WHERE id = ?`
        )
        query.all(x);
        return null;
    }
    else{
        return errors;
    }
}
export function getBoardData(){
    var boardOutput = [];
    var board = db_ops.get_board.all();
    for(var j=0;j<board.length;j++){
        var boardRowData = [];
        for(var i=1;i<=board[j].rowLen;i++){
            var e = "col"+i.toString();
            boardRowData.push(board[j][e]);
        }
        boardOutput.push(boardRowData);
    }
    return boardOutput;
}
export function increseBoardSize(){
    const addRowLen = db.prepare(
        `UPDATE board set rowLen = rowLen + 1;`
    )
    addRowLen.all();
    var rowLen = db_ops.get_row_len.get()["rowLen"];
    var newColName = "col"+rowLen.toString();
    const addCols = db.prepare(
        `ALTER TABLE board add column ${newColName} TEXT NOT NULL default '0';`
    )
    const addRow = db.prepare(
        `INSERT INTO board(rowLen) VALUES(${parseInt(rowLen)});`
    )
    addRow.all();
    addCols.all();
}
export default{
    validateBuilingTypeAndPosition,
    getBoardData,
};
