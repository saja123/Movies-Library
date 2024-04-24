'use strict';

const express = require("express");
const cors = require("cors");

 const PORT = 3000;
 const axios = require("axios");
 const dataInfo = require("./Data/data.json");   
 require('dotenv').config(); //to play require
const server = express();
server.use(cors());
 
 server.get("/", handleHomepage);
 server.get("/favorite", handleFavoritePage);
 server.use(handle404page);
 server.use(handle500page);


 function handleHomepage(req, res){
    let data = new Movie(dataInfo.title, dataInfo.poster_path, dataInfo.overview);
    res.status(200).json(data);
 }

function  handleFavoritePage(req, res){
    res.status(200).send("Welcome to Favorite Page");
}

 function Movie(title, poster_path, overview){
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
 }

 function handle404page(req, res){
    res.status(404).send("Page not found error");
 }

 function handle500page(req, res){
    res.status(505).send({
        "status": 500,
        "responseText": "Sorry, something went wrong"
    })
 }

 server.listen(PORT, () => {
    console.log(`The server is up to listen in ${PORT}`);
 }) 





    

  
    




 