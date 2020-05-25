import express from "express";
// import routes from "./src/routes/calenderRoute"; 
import mongoose from "mongoose";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import config from "./config"

const app = express();

//#region mongoose connection
mongoose.Promise = global.Promise;
mongoose
  .connect(config.local.database, { useNewUrlParser: true })
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.log(err));

//mongoose debugging
mongoose.set('debug', true);
//#endregion

//#region set crosse origin
const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};
app.use(allowCrossDomain);
//end
//#endregion

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static(path.join(__dirname, "public")));

// routes(app);

//====Port open to run application
app.listen(config.port, (err) => {
  if (err) {
      throw err;
  } else {
      console.log(`Trolly server is running and listening to http://localhost:${config.port} `);
  }
});
