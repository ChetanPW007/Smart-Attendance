const app = require('../backend/server.js');

// Tell Vercel NOT to pre-parse the body — required for Multer file uploads
module.exports = app;
module.exports.config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
