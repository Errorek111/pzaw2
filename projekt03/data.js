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
income real not null,
upkeep real not null
);
create table if not exists placement_rules(
id integer primary key autoincrement,
builling_id integer not null references buildings(id) on delete no action,
rule text not null,
rule_building_id integer references buildings(id) on delete no action
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
        `INSERT INTO buildings VALUES (null,'House',4.5,2.5);
        INSERT INTO buildings VALUES (null,'Road',0,0.5);`
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
    )
};
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
        if(y>data.board[j].length-1){
            errors.push("y poza rozmiarem planszy");
        }
    }
    var counter = 0;
    if(parseInt(inputString).toString() == "NaN"){
        for(var i=0;i<data.buildings.length;i++){
            if(inputString != data.buildings[i].name){
                counter++;
            }
            else{
                break;
            }
        }
    }
    else{
        errors.push("nazwa budynku jest liczbą a ma być stringiem");
    }
    if(counter == data.buildings.length){
        errors.push("budynek nie istneje");
    }       
    if(data.board[x][y] != 0){
        errors.push("na tym polu już coś jest");
    }
    return errors;
};
export function addBuilding(x,y,inputString){
    var dbX = parseInt(x);
    var dbY = parseInt(y);
    var buildingID;
    for(var i=0;i<data.buildings.length;i++){
        if(inputString == data.buildings[i].name){
            var buildingID = i;
            break;
        }
    }
    var colName = "col"+dbY.toString();
    var colNames = ColNames('board');
    if(colNames.includes(colName)){
        const addBld = db.prepare(
            `UPDATE board SET ${colName} = ? WHERE id = ?`
        )
        addBld.all('H',dbX);
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

export default{
    validateBuilingTypeAndPosition,
    getBoardData,
};
