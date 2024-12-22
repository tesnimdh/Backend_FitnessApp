const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");


const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));


const setupSwagger = (app) => {
 
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

 
  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocument);
  });
};

module.exports = setupSwagger;