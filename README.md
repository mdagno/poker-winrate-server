#Poker WinRate
* Live version:
  * Demo username: admin
  * Demo password: pass
* Link to API endpoints: https://floating-headland-99877.herokuapp.com/api/user
* Client Repo: https://github.com/mdagno/poker-winrate-client
* Server Repo: https://github.com/mdagno/poker-winrate-server

##Author
*Marlon Agno

##Getting Started
* Clone the repository and install dependencies using ```npm install```
 Create the follow local PostgreSQL databases:
  *```poker-winrate```
  *```poker-winrate-test```
  *Create a ```.env``` file and store the database locations into environmental variables
  *Seed the database using the seed files with psql ```psql -U [username] -d nowplaying -f ./seeds/seed.poker_sessions.sql.sql```
* Run the local server using the command ```npm run dev```

##Description
This repository contains the server for handling the data for the Poker WinRate applications.


##Session Endpoints 
* ```GET /api/sessions```: Retrieves all sessions from the database with the matching user ID
* ```POST /api/sessions```: Posts a new session generating a session ID and automatically links to the user ID
* ```GET /api/sessions:id```: Returns an object containing session data with the matching session ID
* ```DELETE /api/sessions:id```: Deletes the session with the matching session ID
* ```PATCH /api/sessions:id```: Updates the session with the matching session ID

##Authentication Endpoints
* ```POST /api/auth/token```: Authenticates user when provided the correct username and password


##User Endpoints
* ```POST /api/user```: Endpoint for user registration where an email, user, and password is submitted


##Technologies used
* NodeJS
* Express
* PostgreSQL