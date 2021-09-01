const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const databasePath = path.join(__dirname, "backend.db");

const app = express();

app.use(express.json());
app.use(cors());

let database = null;

const initializeDbAndServer = async () => {
    try {
      database = await open({
        filename: databasePath,
        driver: sqlite3.Database,
      });
  
      app.listen(process.env.PORT || 3000, () =>
        console.log("Server Running at http://localhost:5004/")
      );
    } catch (error) {
      console.log(`DB Error: ${error.message}`);
      process.exit(1);
    }
  };

initializeDbAndServer();

// registering person

app.post("/register",async(req,res) => {
    const {userName,password} = req.body;
    const hashedPassword = await bcrypt.hash(password,10);
    const query = `
    INSERT INTO logs (NAME,PASSWORD) VALUES ("${userName}", "${hashedPassword}")
    `;
    const dbres = await database.run(query);
    const fid = dbres.lastID
    res.send(`added ${fid}`);
});


app.post("/login",async(req, res) => {
    const {userName,password} = req.body;
    const checkUserQuery = `SELECT * FROM logs WHERE name = '${userName}'`;
    const checkUser = await database.get(checkUserQuery);
    if(checkUser === undefined){
        res.status(400);
        res.send("Invalid User");
    }
    else{
        const isMatched = await bcrypt.compare(password, checkUser.PASSWORD);
        if (isMatched) {
            const payload = {
              username: userName,
            };
            const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
            res.send({ jwtToken });
          } else {
            res.status(400);
            res.send("Invalid password");
          }
    }
});


app.post("/posts",async(req, res) => {
  const {BAS,HRA,LTA,FA,INV,RENT,CITY,MED,TAXABLE} = req.body;
  /* console.log(BAS,HRA,LTA,FA,INV,RENT,CITY,MED,TAXABLE); */
  const query = `
  INSERT INTO usercontent (BAS,HRA,LTA,FA,INV,RENT,CITY,MED,TAXABLE) 
  VALUES (${BAS},${HRA},${LTA},${FA},${INV},${RENT},"${CITY}",${MED},${TAXABLE})`;
  const dbRes = await database.run(query);
  const lastId = dbRes.lastID;
  res.send(`Data Injected at ID:- ${lastId}`);
});


/* app.post("/posts",async (req,res) => {
  const {BAS,HRA,LTA,FA,INV,RENT,CITY,MED,TAXABLE} = req.body;
  console.log(BAS,HRA,LTA,FA,INV,RENT,CITY,MED,TAXABLE);
  const query = `
  insert into usercontent (BAS,HRA,LTA,FA,INV,RENT,CITY,MED,TAXABLE)
  VALUES (BAS,HRA,LTA,FA,INV,RENT,CITY,MED,TAXABLE)
  `;
  const dbbres = await database.run(query);
  const fid = dbbres.lastID
  res.send(`ID:-${fid}`);
}) */