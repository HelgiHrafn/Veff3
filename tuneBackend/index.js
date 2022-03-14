//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');
const req = require('express/lib/request')

const app = express();


//Port environment variable already set up to run on Heroku
let port = process.env.PORT || 3000;
const path = '/api/v1/'
//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  

//Set Cors-related headers to prevent blocking of local requests
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//The following is an example of an array of two tunes.  Compared to assignment 2, I have shortened the content to make it readable
var nextTuneId = 2
var tunes = [
    { id: '0', name: "Für Elise", genreId: '1', content: [{note: "E5", duration: "8n", timing: 0},{ note: "D#5", duration: "8n", timing: 0.25},{ note: "E5", duration: "8n", timing: 0.5},{ note: "D#5", duration: "8n", timing: 0.75},
    { note: "E5", duration: "8n", timing: 1}, { note: "B4", duration: "8n", timing: 1.25}, { note: "D5", duration: "8n", timing: 1.5}, { note: "C5", duration: "8n", timing: 1.75},
    { note: "A4", duration: "4n", timing: 2}] },

    { id: '3', name: "Seven Nation Army", genreId: '0', 
    content: [{note: "E5", duration: "4n", timing: 0}, {note: "E5", duration: "8n", timing: 0.5}, {note: "G5", duration: "4n", timing: 0.75}, {note: "E5", duration: "8n", timing: 1.25}, {note: "E5", duration: "8n", timing: 1.75}, {note: "G5", duration: "4n", timing: 1.75}, {note: "F#5", duration: "4n", timing: 2.25}] }
];
var newGenreId = 2
let genres = [
    { id: '0', genreName: "Rock"},
    { id: '1', genreName: "Classic"}
];

//Your endpoints go here
app.get(path + 'tunes', (req, res) =>{
    const genreName = req.query.filter;
    const genre = genres.find(genre => genre.genreName === genreName);
    if (genreName && !genre) {
        return res.status(404).json({'message': `Error ${genreName} not found in list of available genres`})
    }
    if (genre) {
        return res.status(200).json(tunes.filter(tune => tune.genreId === genre.id));
    }
    return res.status(200).json(tunes);
});

app.get(path + 'genres/:genreid/tunes/:id', (req, res) =>{
    if (isNaN(req.params.id)){
        return res.status(400).json({'message': 'Error: id must be a number'})
    }
    if (isNaN(req.params.genreid)){
        return res.status(400).json({'message': 'Error: genreid must be a number'})
    }
    for (let i = 0; i < tunes.length; i++) {
        if (tunes[i].id == req.params.id) {
            return res.status(200).json(tunes[i])
        }
    }
    return res.status(404).json({'message':'Error: Event with id '+ req.params.id + ' not found.'})
});

app.post(path + "genres/:genreid/tunes", (req, res) => {
    if (req.body == undefined ||
        req.body.name == undefined ||
        req.body.content == undefined){
            return res.status(400).json({'Message': 'tune name and content (notes) required'})
        }
    let newTune = {
        id: nextTuneId,
        name: req.body.name,
        genreId: req.params.genreid,
        content: req.body.content
    }
    tunes.push(newTune)

    nextTuneId++

    return res.status(201).json(newTune)
});

app.get(path + 'genres', (req, res) =>{ // error handling
    return res.status(200).json(genres)
})

app.post(path + 'genres', (req, res) =>{
    if (req.body == undefined ||
        req.body.genreName == undefined)
        {
            return res.status(400).json({'Message': 'genre name required'})
        }
    for (let i = 0; i < genres.length; i++){
        if(genres[i].genreName.toLowerCase() == req.body.genreName.toLowerCase()){ //         check case sensitivity
            return res.status(400).json({'Message': 'genre already exists'})
        }
    }
    let newGenre = {
        id: newGenreId,
        genreName: req.body.genreName
    }
    genres.push(newGenre);
    newGenreId++;
    return res.status(201).json(newGenre);
})

app.delete(path + 'genres', (req, res) => {
    if (req.body == undefined ||
        req.body.genreId == undefined)
        {
            return res.status(400).json({'Message': 'genre id required'})
        }
    var genreid = req.body.genreId
    for (let i = 0; i < genres.length; i++){
        if(genres[i].id == genreid){
            for(let j = 0; j < tunes.length; j++){
                if(tunes[j].genreId == genreid){
                    return res.status(400).json({'Message': 'Cannot delete genre that has tunes'})
                }
                let removedGenre = genres[i] 
                genres.splice(i, 1)
                return res.status(200).json({removedGenre})
            }
        }
    return res.status(404).json({'Message': `genre with id ${genreid} not found`})
    }

})
app.use('*', (req, res) =>{
    res.status(405).send('Operation not supported.')
})
//Start the server
app.listen(port, () => {
    console.log('Tune app listening on port + ' + port);
});


// app.patch(path + 'tunes/:id', (req,res) => {//id !change,
//     const { id, genreID } = req.parameter;
//     const changes = req.body;

//     const original = tunes.find(tune => tune.id === id);

//     const updateTune = {...original, ...changes};

//     console.log(JSON.stringify(updateTune));

//     return res.status(200).json(updateTune);
// })