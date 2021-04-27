const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const morgan = require("morgan");  //modules //
const UserData = require("./models/userInfo");
const json = require("../source/Json/latest_html.json")  //to get latest data (post)//
require("./db/conn");
const latest_data = require("C:/Users/Naveen/Desktop/Blogging/app/html_picker.js")

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));   //static folder//
app.set("view engine", "hbs"); //to set view engine path//

app.set("views", path.join(__dirname, "../templates/views"));  //path//
hbs.registerPartials(path.join(__dirname, "../templates/partials")); 

app.use(cookieParser());

app.use(
    session(
        {
            key: "manju",
            secret: "anything",
            resave: false,
            saveUninitialized: false,
            cookie: {
                expires: 60000000    //syntax of section //
            }
        }
    )
)

var sessionChecker = (req, res, next) => {  
    if (req.session.user && req.cookies.manju) {  // checks login or logout//
        res.redirect("/Home");
    }
    else {
        next();
    }
}



app.route("/account").get(sessionChecker, (req, res) => {  //singn up route//
    res.render("creatingUser");

}).post(async (req, res) => {  //help store data in manodb//
    try {
        var user = new UserData.UserLogin(req.body)
        user.save();
        await res.status(201).redirect("/")
    }
    catch (error) {  //shows error//
        res.send(error)
    }
});


app.route("/Home").get((req, res) => {  //checks login or logout//

    if (req.session.user && req.cookies.manju) {
        res.render("author");//login rediret //
    }
    else {
        res.redirect("/login");
    }

})


app.route("/contact").get((req, res) => {  // contact page renders//server side //
    res.render("contact");
}).post(async (req, res) => {  //metod //clinent side//

    try {
        var messages = new UserData.User(req.body);
        messages.save();
        if(req.session.user && req.cookies.manju)
        {
            res.status(201).redirect("/Home");
        }
        else{
            res.redirect("/");
        }  //

    } catch (error) {
        res.send(error);
    }
})


app.route("/login").get(sessionChecker, (req, res) => {  //get login -author.login =login//
    res.render("login");
}).post(async (req, res) => {

    try {
        const user = await UserData.UserLogin.findOne({ email: req.body.username }).exec();  //checks emailid //
        if (user == null) {
            res.render("invalid");
        }
        else {

            let bool = bcrypt.compareSync(req.body.password, user.password);

            if (bool == false) {
                res.status(401).render("invalid");
            }
            else {
                req.session.user = user;
                res.redirect("/Home");
            }
        }
    }
    catch (err) {  // not lonig give invalid page//

        res.render("invalid");
    }

})

app.route("/post").get((req,res)=>{  // create post//
    if(req.session.user && req.cookies.manju)
    {
        res.redirect("http://localhost:8000/");
    }
    else{
        res.redirect("/login");
    }
})

app.get("/logout", (req, res) => {  //click logout sectio clear//
    if (req.session.user && req.cookies.manju) {
        res.clearCookie("manju");
        res.redirect("/");
    } else {
        res.redirect("/login");
    }
});


setInterval(()=>{latest_data.create_json()},5000);  //to get data about latest post//5 sec run each time //

var keys = [];
var count = 0;
for (var k in json) {
    count = count + 1;
    keys.push(k);
}

var img1 =json[keys[count-1]][1];
var img2 =json[keys[count-2]][1];
var img3 =json[keys[count-3]][1];
var img4 =json[keys[count-4]][1];
var img5 =json[keys[count-5]][1];

var msg1 =json[keys[count-1]][0];
var msg2 =json[keys[count-2]][0];
var msg3 =json[keys[count-3]][0];
var msg4 =json[keys[count-4]][0];
var msg5 =json[keys[count-5]][0];

var link1 = keys[count-1];
var link2 = keys[count-2];
var link3 = keys[count-3];
var link4 = keys[count-4];
var link5 = keys[count-5];  // all code for picking latest article details in front page//

app.get("/",sessionChecker, (req, res) => {  //home page//
    res.render("news",{img1,img2,img3,img4,img5,msg1,msg2,msg3,msg4,msg5,link1,link2,link3,link4,link5});
});


app.listen(9000, (req, res) => {  //run entire server //
    console.log("Listening to the port Number 9000");  // port no 9000//
})
