require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const routes = require("./routes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["*"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (corsOrigins.includes("*") || corsOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
});

const swaggerDocsDir = path.join(__dirname, "swagger");
if (fs.existsSync(swaggerDocsDir)) {
  const files = fs.readdirSync(swaggerDocsDir).filter((f) => f.endsWith(".json"));
  files.forEach((file) => {
    const doc = JSON.parse(fs.readFileSync(path.join(swaggerDocsDir, file), "utf8"));

    if (doc.paths) {
      swaggerSpec.paths = { ...swaggerSpec.paths, ...doc.paths };
    }
    if (doc.tags) {
      swaggerSpec.tags = [...(swaggerSpec.tags || []), ...doc.tags];
    }
    if (doc.components) {
      swaggerSpec.components = {
        ...swaggerSpec.components,
        ...doc.components,
      };
    }
  });
}

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(limiter);
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
