import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import data, { addBuilding, getBoardData, increseBoardSize, removeBuilding } from "./data.js";
import settings from "./settings.js";
//ponieważ używam 2 (tak naprawde to 3) różnych locahostów musze mieć różne porty
const port = 2137;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());
app.use(morgan("dev"));
app.use(cookieParser());

const settingsRouter = express.Router();
settingsRouter.use("/toggle-theme", settings.themeToggle);
app.use("/settings", settingsRouter);

function settingsLocals(req, res, next) {
  res.locals.app = settings.getSettings(req);
  res.locals.page = req.path;
  next();
}
app.use(settingsLocals);

app.get("/", (req, res) =>{
    const board = getBoardData()
    res.render("main-page",{
        board,
    });
    console.info(res.locals.user);
});

app.post("/add-building", (req, res) =>{
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
    removeBuilding(req.body.x,req.body.y,req.body.buildingType);
    res.redirect("/");
});
app.get("/add-space", (req,res) =>{
    increseBoardSize();
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
