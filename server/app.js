let express = require("express");
let session = require("express-session");
let path = require("path");
let logger = require("morgan");
let cookieParser = require("cookie-parser");
let bodyParser = require("body-parser");
let cors = require("cors");

base_path = __dirname;
let auth = require("./api/utils/auth");

if (process.env.RAWBOT_ADDRESS === "" || process.env.DEVICE_SPAWNER_ADDRESS === "" || process.env.IPFS_ADDRESS === "") {
    console.error("Please fill the authentic rawbot, device spawner and ipfs addresses.");
    process.exit(1);
} else {
    console.log("Rawbot & device manager addresses are available.");
}

let app = express();

function nodeStarted(req, res, next) {
    if (nodeStarted) next();
}

app.use(
    session({
        secret: "2C44-4D44-WppQ38S",
        resave: true,
        saveUninitialized: true
    })
);

app.use(
    cookieParser("2C44-4D44-WppQ38S", {
        maxAge: 60 * 60 * 1,
        httpOnly: true
    })
);

app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/index"));
app.use("/ipfs", require("./routes/ipfs"));
app.use("/devices", require("./routes/devices"));
app.use("/p2d", require("./routes/p2d"));
app.use("/device", require("./routes/device"));
app.use("/api", require("./routes/api"));
app.post("/sign-in", auth.validateSignature);
app.post("/device_description", require('./routes/device_description'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;