const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json())

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`DBError:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const conversionOfMovieData = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const conversionOfDirectorData = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
     movie_name
    FROM
     movie;`;
  const moviesList = await db.all(getMoviesQuery);
  response.send(
    {
        moviesList.map((eachItem)=>{
             {
                movieName:movie_name
            }
        })
    }
  );
});

app.get("/movies/:movieId/",async (request, response)=>{
    const {movieId}=request.params
    const getMovieQuery=`
    SELECT
     *
    FROM
     movie
    WHERE 
     movie_id=${movieId};`;
    const movie=db.get(getMovieQuery);
    response.send(conversionOfMovieData(movie))
});

app.post("/movies/",async (request, response)=>{
    const {directorId,movieName,leadActor}=request.body;
    const addMovieQuery=`
    INSERT INTO
     movie (director_id,movie_name,lead_actor)
    VALUES
      (${directorId},'${movieName}','${leadActor}');`;
    await db.run(addMovieQuery);
    response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/",async (request, response)=>{
    const {movieId}=request.params
    const {directorId,movieName,leadActor}=request.body;
    const updateMovieQuery=`
    UPDATE
     movie
    SET
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
    WHERE
     movie_id=${movieId};`;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");

});

app.delete("/movies/:movieId/",async (request, response)=>{
    const {movieId}=request.params
    const deleteQuery=`
    DELETE FROM
     movie
    WHERE
     movie_id=${movieId};`;
    await db.run(deleteQuery);
    response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
     *
    FROM
    director;`;
  const directorsList = await db.all(getDirectorsQuery);
  response.send(
    directorsList.map((eachItem)=>conversionOfDirectorData(eachItem))
  );
});

app.get("/directors/:directorId/movies/",async (request, response)=>{
    const {directorId}=request.params
    const getMovieByDirectorQuery=`
    SELECT
     movie_name
    FROM
     movie
    WHERE 
     director_id=${directorId};`;
    const movies=await db.all(getMovieByDirectorQuery);
    response.send(
        movies.map((eachItem)=>{
             {
                movieName:eachItem.movie_name
            }
        })
    );
});
module.exports=app;

