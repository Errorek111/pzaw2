import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import data, { addBuilding, deleteSave, getBoardData, getSaveName, getSaves, increseBoardSize, removeBuilding, setSaveName } from "./data.js";
import settings from "./settings.js";
import user, { createUser, getRole, loginUser, logOut, sessionUserById, verifyLogin, verifySignup } from "./user.js";
import session, { createSession, deleteSession, getSessionUser } from "./session.js";
//ponieważ używam 2 (tak naprawde to 3) różnych locahostów musze mieć różne porty
const port = 2137;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
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

function getUserBySession(id){
    return sessionUserById(getSessionUser(id));
}
function getUserRole(id){
    return getRole(getSessionUser(id));
}
function saveNameGet(id){
    console.log(getSaveName(getSessionUser(id)));
    return getSaveName(getSessionUser(id));
}
app.get("/", (req, res) =>{
    if(req.cookies.ses_id != null){
        const board = getBoardData()
        res.render("main-page",{
            saveNameGet,
            getUserBySession,
            board,
            req,
        });
    }
    else{
        res.redirect("/login");
    }
});
app.get("/login", (req,res)=>{
    let errors = [];
    res.render("login",{
        getUserBySession,
        req,
        errors,
    });
})
app.post("/login", async (req,res)=>{
    let errors = await verifyLogin(req.body.username,req.body.password,res,req);
    if(errors.length < 1){
        let user = await loginUser(req.body.username,req.body.password,res,req);
        console.log(user);
        createSession(user,res);
        res.redirect("/");
    }
    else{
        res.render("login", {
            getUserBySession,
            req,
            errors,
        });
    }
})
app.get("/signup", (req,res)=>{
    let errors = [];
    res.render("signup",{
        getUserBySession,
        req,
        errors,
    });
})
app.post("/signup", async (req,res)=>{
    let errors = verifySignup(req.body.username,req.body.password,req.body.passwordRepeat,req,res) ;
    if(errors.length < 1){
        await createUser(req.body.username,req.body.password);
        res.redirect("/login");
    }
    else{
        res.render("signup",{
            getUserBySession,
            req,
            errors,
        });
    }
});
app.get("/logout", (req,res)=>{
    if(req.cookies.ses_id != null){
        logOut(req,res);
        res.redirect("/login");
    }
});
app.get("/user-panel", (req,res)=>{
    if(req.cookies.ses_id != null){
        res.render("userPanel",{
            getUserRole,
            getUserBySession,
            req,
        });
    }
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
app.post("/save_name", (req,res) =>{
    setSaveName(req.body.save_name,getSessionUser(req.cookies.ses_id));
    res.redirect("/");
});
app.get("/about", (req, res) =>{
    res.render("about",{
        getUserBySession,
        req,
    });
});
app.get("/user-manager", (req,res)=>{
    let saves = getSaves();
    res.render("admin_panel",{
        saves,
        sessionUserById,
        getUserBySession,
        req,
    });
});
app.post("/delete-save", (req,res)=>{
    deleteSave(req.body.id);
    res.redirect("/user-manager");
});
app.get("/redirect", (req, res) =>{
    res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
})
