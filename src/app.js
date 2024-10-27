const express = require("express");
const path = require("path");
const flash = require("express-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const { setHeaders } = require("./middlewares/headers");
const { errorHandler } = require("./middlewares/errorHandler");
const homeRoutes = require("./modules/home/home.routes");
const authRoutes = require("./modules/auth/auth.routes");
const postRoutes = require("./modules/post/post.routes");
const pageRoutes = require("./modules/page/page.routes");
const userRoutes = require("./modules/user/user.routes");
const apiDocRoutes = require("./modules/apidoc/swagger.routes");

const app = express();

//* BodyParser
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

//* CookieParser
app.use(cookieParser());

//* Cors Policy
app.use(setHeaders);

//* Express-flash
app.use(
  session({
    secret: "|DSHODDW*YHW:D^WDTW*D(P*D:IHDWWDDF|WWDD?WDD|+d0d=-D;wfj)",
    resave: false,
    saveUninitialized: false
  })
);
app.use(flash());

//* Static Folders
app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/fonts", express.static(path.join(__dirname, "public/fonts")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

//* Template Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//* Routes

app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/pages", pageRoutes);
app.use("/users", userRoutes);
app.use("/api-docs", apiDocRoutes);

//* 404 Error Handler
app.use((req, res) => {
  console.log("this path is not found:", req.path);
  return res
    .status(404)
    .json({ message: "404! Path Not Found. Please check the path/method" });
});

// TODO: Needed Feature
app.use(errorHandler)  

module.exports = app;
