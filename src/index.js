const express = require("express");
const app = express();
const PORT = 8080;

const tg = require("./tg");

app.get("/", (req, res) => {
  tg.grab();
  res.status(200).sendFile("index.html", { root: __dirname });
});

app.listen(PORT, () => console.log(`it's active on https://localhost:${PORT}`));
