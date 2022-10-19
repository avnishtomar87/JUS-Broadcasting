const express = require("express");
const app = express();
require("dotenv").config();
const { PORT, API_PREFIX } = require("./helpers/constant")
const port = PORT || 3001;
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
var favicon = require("serve-favicon");
const createHttpError = require("http-errors");
const globalErrorHandler = require("./helpers/errorHandler");


//middlewares
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.set('view engine', 'hbs')
app.set('views','./views');
app.use(express.static(`${__dirname}/public/images/channels`)); 

//Routes
const routes = require("./routes/routes");
app.set("base", API_PREFIX);
app.use(`/${API_PREFIX}`, routes);


//handled no route url error
app.all("*", (req, res, next) => {
  throw createHttpError(`cant found the ${req.originalUrl} on this server`);
});

// Global Error Handler
app.use(globalErrorHandler);

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

