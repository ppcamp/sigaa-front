const express = require('express'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  dotenv = require('dotenv'),
  logger = require('./utils/logger'),
  nodemailer = require("nodemailer"),
  http = require('http-status-codes');

// Program shortcuts
const { StatusCodes } = http;

// Configure env
dotenv.config()


// App
let app = express();

// Configure app
// support parsing of application/json type post data
app.use(bodyParser.json());
// Suport cors
app.use(cors());


// Routes
app.post('', (req, res) => {
  const body = req.body;
  // Check if keys exists (Deny, otherwise)
  for (i of ['Nome', 'Email', 'Matriz']) {
    if (!(i in body)) {
      const msg = `Key: ${i} not exist in requisition`;
      res.status(StatusCodes.BAD_REQUEST).send(msg);
      logger.error(msg);
      return; // Force to end this requisition in server (not send)
    }
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Sigaa Form <sigaaForm@noreplay.com>', // sender address
    to: "p.augustocampos@gmail.com",
    subject: "[Formulário Sigaa] Compentências",
    text: JSON.stringify(body),
  };

  logger.info("Sending emails");
  transporter.sendMail(mailOptions, function (error) {
    if (error) {
      const msg = `Some error ocurred with nodemailer: ${error}`;
      res.status(StatusCodes.SERVICE_UNAVAILABLE).send(msg);
      logger.error(msg);
    }
    else {
      res.status(StatusCodes.OK).send('Email sent!');
      logger.info('Email sent');
    }
  });

});


process.env.PORT = 3000;
app.listen(process.env.PORT, () => {
  logger.info(`Api listening in http://localhost:${process.env.PORT}`);
});