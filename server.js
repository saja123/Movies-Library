'use strict';
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const pg = require("pg");
const dataInfo = require("./Data/data.json");
// const dataInfo = require("./Data/data.json");

const server = express();
server.use(cors());
server.use(express.json()); // Use JSON middleware if you plan to accept JSON data, if i use bodyparser i will stop express.json

require('dotenv').config(); // Load environment variables


const port = process.env.PORT || 3000;
const movieApiKey = process.env.API_KEY;
const pgUrl = process.env.PG_URL;

const client = new pg.Client(pgUrl); // here my client connect to this url and store url in .env

function Movie(title, release_date, poster_path, overview) {
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}
// Routs for the API
server.get("/", handleHomepage);
server.get("/favorite", handleFavoritePage);
server.get("/trending", handleTrendingMovies); // Use lowercase for consistency  

//routing CRUD for DB
server.post('/addMovie', handleAdd);
server.get("/getMovies", handleGetMovies);
server.put("/UPDATE/:id", handleUpdateid);
server.delete("/DELETE/:id", handleDeleteid);

// server.get('/search', (req, res) => { //example using query
//     // Accessing query parameters using req.query
//     const searchTerm = req.query.name;
//     res.send(`Search Query: ${searchTerm}`);
// });

server.use(handle404page);
server.use(handle500page);


// type of http url 
// qurey, params, body
//DB


function handleDeleteid(req, res) {
    const id = req.params.id;
    const sql = `DELETE FROM Movie WHERE id=${id};`
    client.query(sql).then((result) => {
        console.log(result.rows);
        return res.json("Delete the item successfull");
        // return res.json(result.rows)
    }).catch((error) => {
        handle500page(error, req, res);
    })
}


function handleUpdateid (req, res) {
    let id = req.params.id;
    let { comment } = req.body;
    let sql = `UPDATE movies SET comment=$1 WHERE id=$2 RETURNING *;`;
    const params = [comment, id];
    client.query(sql, params).then((result) => {
        return res.json(result.rows[0]);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
}


async function handleHomepage(req, res) {
    const data = new Movie(dataInfo.title, dataInfo.poster_path, dataInfo.overview);
    res.status(200).json(data);
}

function handleAdd(req, res) {
    console.log(req.body);
    const { title, release_date, poster_path, overview } = req.body;
    let sql = 'INSERT INTO Movie(title, release_date, poster_path, overview ) VALUES($1, $2, $3, $4) RETURNING *;' //RETURNING * Its mean return the value that was added in DB
    let values = [title, release_date, poster_path, overview];
    client.query(sql, values).then((result) => {
        console.log(result.rows);
        return res.status(201).json(result.rows); // result.rows If I type like this it return array of object || result.rows[0] if type like this it return the object that inside the array 
    }).catch((error) => {
        handle500page(error, req, res);
    })
}

function handleGetMovies(req, res) {
    let sql = 'SELECT * from Movie;'
    client.query(sql).then((result) => { //i but just sql beacuse i want to read data beacuse that i am not write like this (sql, values)
        // console.log(result);
        res.json(result.rows);
    }).catch((error) => {
        handle500page(error, req, res);
    })
}

async function handleTrendingMovies(req, res) {
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


function handleFavoritePage(req, res) {
    res.status(200).send("Welcome to Favorite Page");
}

function handle404page(req, res) {
    res.status(404).send("Page not found error");
}

function handle500page(error, req, res) {
    res.status(500).send(error);
}

client.connect().then(() => { //i write this to listen me after the user connect to db
    server.listen(port, () => {
        console.log(`The server is up and listening on port ${port}`);
    });
})

// client.connect().then(() => { //i write this to listen me after the user connect to db
//     server.listen(port, () => {
//         console.log(`The server is up and listening on port ${port}`);
//     });
// })
// client.connect().then(() => { //i write this to listen me after the user connect to db
//     server.listen(port, () => {
//         console.log(`The server is up and listening on port ${port}`);
//     });
// })

