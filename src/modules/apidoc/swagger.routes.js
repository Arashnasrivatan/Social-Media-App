const SwaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const express = require('express');


const router = express.Router();

const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none;}'
};


router.use('/', SwaggerUi.serve, SwaggerUi.setup(swaggerDocument, swaggerOptions));


module.exports = router;