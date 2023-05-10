// ===================imports===================
// ======express js setup======
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

// ===================Configs===================
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// ======swagger======
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express")
const options = {
    explorer: true,
    definition:{
        openapi:"3.0.0",
        info:{
            title:"Hylo API",
            version:"1.0.0"
        },
        servers:[
            {
                url:'http://localhost:8000'
            }
        ]
    },
    apis:[
        './app.js',
        './Routes/UserRoutes.js',
        './Routes/LinkRoutes.js'
    ]
}
const swaggerSpec = swaggerJSDoc(options)
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerSpec))

// ===================Endpoints===================
// ============default============
/**
 * @swagger
 * /: 
 *  get:
 *      summary: This API is used as a health check :)
 *      description: This API is used to check if get method is working
 *      responses:
 *          200:
 *              description: To test Get method
 */

app.get("/", (req, res) => {
    res.send("OK");
});

// ============for user============
app.use("/users",require("./Routes/UserRoutes"))

// ============for links============
app.use("/links",require("./Routes/LinkRoutes"))
module.exports = app;
