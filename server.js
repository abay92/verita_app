const express = require("express");
const bodyParser = require("body-parser");
const Resource  = require('express-resource')
const cors = require("cors");

require('dotenv').config();

const app = express();
app.use(cors({
  origin: "*"
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Verita application." });
});

require("./app/routes/routes.js")(app);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
