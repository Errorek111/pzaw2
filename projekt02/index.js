import express from "express";
import data, { getData } from "./data.js";
//ponieważ używam 2 (tak naprawde to 3) różnych locahostów musze mieć różne porty
const port = 2137;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded());

app.get("/", (req, res) =>{
    res.render("main-page",{
        text: getData(),
    });
});
app.post("/input", (req, res) =>{
    data.addData(req.body.input);
    res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
})
