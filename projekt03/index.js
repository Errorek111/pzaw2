import express from "express";
import morgan from "morgan";
import data, { addBuilding, getBoardData, removeBuilding } from "./data.js";
//ponieważ używam 2 (tak naprawde to 3) różnych locahostów musze mieć różne porty
const port = 2137;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());
app.use(morgan("dev"));

app.get("/", (req, res) =>{
    const board = getBoardData()
    res.render("main-page",{
        board,
    });
});
app.post("/add", (req, res) =>{
    var errors = data.validateBuilingTypeAndPosition(req.body.x,req.body.y,req.body.buildingType);
    if(errors.length == 0){
        addBuilding(req.body.x,req.body.y,req.body.buildingType);    
        res.redirect("/");
    }
    else{
        res.render("addBuildingError",{
            errors,
        });
    }
});
app.post("/remove", (req, res) =>{
    removeBuilding(req.body.x,req.body.y);
    res.redirect("/");
});
app.get("/about", (req, res) =>{
    res.render("about",{

    });
});
app.get("/redirect", (req, res) =>{
    res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
})
