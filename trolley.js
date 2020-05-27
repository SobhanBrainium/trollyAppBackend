import express from "express";
import fs from "fs"
import http from "http"
import https from "https"
import commonRoutes from "./routes/common";
import customerRoutes from "./routes/customers";
// import adminRoutes from "./routes/admin";
import mongoose from "mongoose";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import config from "./config"

const app = express();

//#region server create localhost
let server = http.createServer(app); 
//#endregion

//#region  create server for production with https
// let credentials = {
//     key: fs.readFileSync('/etc/letsencrypt/live/nodeserver.brainiuminfotech.com/privkey.pem', 'utf8'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/nodeserver.brainiuminfotech.com/fullchain.pem', 'utf8')
// };

// let server = https.createServer(credentials, app);
//#endregion

//#region mongoose connection
const productionDBString = `mongodb://${config.productionDB.username}:${config.productionDB.password}@${config.productionDB.host}:${config.productionDB.port}/${config.productionDB.dbName}?authSource=${config.productionDB.authDb}`

console.log(productionDBString,'productionDBString')

mongoose.Promise = global.Promise;
mongoose
  .connect(productionDBString, { useNewUrlParser: true })
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

//#region Load router
//==== Load Router =====//
app.use('/api', commonRoutes);
// app.use('/api/admin', adminRoutes);
app.use('/api/customer',customerRoutes);
//#endregion

//====Port open to run application
server.listen(config.port, (err) => {
  if (err) {
      throw err;
  } else {
      console.log(`Trolley server is running and listening to http://localhost:${config.port} `);
  }
});
