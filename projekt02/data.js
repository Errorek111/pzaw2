const data = {
    "board": [
        ["0","0","0","0","0","0","0","0"],
        ["0","0","0","0","0","0","0","0"],
        ["0","0","0","0","0","0","0","0"],
        ["0","0","0","0","0","0","0","0"],
        ["0","0","0","0","0","0","0","0"],
        ["0","0","0","0","0","0","0","0"],
        ["0","0","0","0","0","0","0","0"],
        ["0","0","0","0","0","0","0","0"],
    ],
    "buildings": [
        { name: "House", mapSign :"H" },
        { name :"Road", mapSign :"R" },
    ],
}

export function validateBuilingTypeAndPosition(x,y,inputString){
    var errors = [];
    if (parseInt(x).toString() == "NaN" || parseFloat(x).toString() != parseInt(x).toString()){
        errors.push("x musi być typu int");
    }
    else{
        if(x > data.board.length-1){
            errors.push("x musi być w rozmiarze "+data.board.length-1);
        }
    }
    if (parseInt(y).toString() == "NaN" || parseFloat(y).toString() != parseInt(y).toString()){
        errors.push("y musi być typu int");
    }
    else{
        for(var j=0;j<data.board.length;j++){
            if(y>data.board[j].length-1){
                errors.push("y poza rozmiarem planszy");
                break;
            }
        }
    }
    var counter = 0;
    if(parseInt(inputString).toString() == "NaN"){
        console.log("yes");
        console.log(data.buildings.length);
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
    var buildingID;
    for(var i=0;i<data.buildings.length;i++){
        if(inputString == data.buildings[i].name){
            var buildingID = i;
            break;
        }
    }
    data.board[x][y] = data.buildings[buildingID].mapSign;
}
export function getData(){
    return data.board;
}

export default{
    validateBuilingTypeAndPosition,
    getData,
};
