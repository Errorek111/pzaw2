const data = {
    "texts": {
        texts: [
            "Kasane Teto",
            "Hatsune Miku"
        ]
    }
}

export function addData(inputString){
    data.texts.texts.push(inputString);
};
export function getData(){
    return data.texts.texts;
}

export default{
    addData,
    getData,
};
