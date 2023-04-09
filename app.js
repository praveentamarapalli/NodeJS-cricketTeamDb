const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");

//initialize DB and Server
const initiateDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initiateDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// GET Players
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT
   *
   FROM 
      cricket_team
   ORDER BY
      player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// POST Player Details
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const postPlayerQuery = `INSERT INTO
        cricket_team (player_name, jersey_number, role)
     VALUES
    (
       '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

//GET Player Details
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT
     *
    FROM 
        cricket_team
    WHERE
        player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(playerDetails));
});

// Update Player Details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}', 
    jersey_number = ${jerseyNumber}, 
    role = '${role}'
  WHERE 
    player_id = ${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

// Delete Player Details
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
