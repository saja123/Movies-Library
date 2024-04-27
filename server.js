'use strict';
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dataInfo = require("./Data/data.json");

const server = express();
server.use(cors());
server.use(express.json()); // Use JSON middleware if you plan to accept JSON data

require('dotenv').config(); // Load environment variables

const port = process.env.PORT || 3000;
const movieApiKey = "171644075fc781aded51ca5d30d64db8";
console.log(movieApiKey);
function Movie(title, poster_path, overview){
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

server.get("/", handleHomepage);
server.get("/favorite", handleFavoritePage);
server.get("/Recipes", handleRecipes); // Use lowercase for consistency

async function handleHomepage(req, res){
    const data = new Movie(dataInfo.title, dataInfo.poster_path, dataInfo.overview);
    res.status(200).json(data);
}

async function handleRecipes(req, res){
    try {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${movieApiKey}`;
        const recipesFromAPI = await axios.get(url);
        console.log(recipesFromAPI.data);
        
        // Adjust this based on the actual structure of the API response
        const movies = recipesFromAPI.data.results.map(item => new Movie(item.title, item.poster_path, item.overview));
        
        res.status(200).json(movies);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ error: "Something went wrong with fetching recipes" });
    }
}

server.get('/search', async (req, res) => { //the function have a time
    const { query } = req.query; // Get the query parameter from the request URL
    try { //if have any error go to the catch "to cutch the error"
        const response = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${movieApiKey}&query=${query}&language=en-US&page=2`);
        console.log('Search movies response:', response.data.results); // Log response data
        res.json(response.data.results);
    } catch (error) {
        console.error('Error searching for movie:', error);
        res.status(500).json({ error: 'Error searching for movie' });
    }
});

function handleFavoritePage(req, res){
    res.status(200).send("Welcome to Favorite Page");
}

function handle404page(req, res){
    res.status(404).send("Page not found error");
}

function handle500page(req, res){
    res.status(500).send({
        "status": 500,
        "responseText": "Sorry, something went wrong"
    })
}

server.use(handle404page);
server.use(handle500page);

server.listen(port, () => {
    console.log(`The server is up and listening on port ${port}`);
})