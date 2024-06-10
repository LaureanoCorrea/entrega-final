import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import morganLogger from "morgan";
import appRouter from "./routes/index.js";
import cors from "cors";
import handlebars from "express-handlebars";
import Handlebars from "handlebars"
import __dirname, { uploader } from "./utils.js";
import viewsRouter from "./routes/views.router.js";
import { initializeSocket } from "./utils/initializeSocket .js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import errorHandler from "./middleware/errors/index.js";
import { addLogger, logger } from "./utils/logger.js";
import swaggerUiExpress from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(morganLogger("dev"));
app.use(cookieParser(""));

initializePassport();
app.use(passport.initialize());
app.use(addLogger);


Handlebars.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});
app.engine("handlebars", handlebars.engine());
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "handlebars");
app.use("/", viewsRouter);

app.post("/upload", uploader.single("myFile"), (req, res) => {
  res.send("imagen subida");
});

const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'API Documentation',
      description: 'Documentación de la API de mi aplicación',
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};

const specs = swaggerJsdoc(swaggerOptions)

app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.use(appRouter);
app.use(errorHandler);


const httpServer = app.listen(PORT, (err) => {
	if (err) logger.log(err);
	logger.info(`Escuchando en el puerto ${PORT}`);
});

initializeSocket(httpServer);
