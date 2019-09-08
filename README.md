# Nitrate Levels and Cancer Incidence Analysis

## About this Application

This app allows users to analyze the relationship between cancer incidence and nitrate levels in Wisconsin at the census tract level. It is one of two projects that satisfy requirements for the Capstone course in the University of Wisconsin-Madison's MS program in Cartography and GIS Development (a.k.a "Web Map Programmin").

## Technologies Used

This is a Node app which runs locally with a Postgres development database in a Docker container.

The core front-end libraries/frameworks in include the following:

- Vue (with Vuex and Vue Router)
- Leaflet (specifically, `vue2-leaflet`, which is a Vue wrapper around the Leaflet mapping library)
- Vuetify (a Material Design Component library)

## Setting up the Development Environment

_Instructions are for Linux/Unix users._

### 1. Set up the config folder

Before you install node modules or try to run the application, you will need to create a config folder. The `config` folder is not kept in version control. It's a place to store API keys or other secrets.

From the root of the project, create a folder called `config`:

```bash
mkdir config
```

```
cd config
```

Create a file in `config` for storing postgres configuration values.

```
touch default.json
```

Add the following code to `default.json`. These values are for the local development database.

```javascript
{
    "pg": {
    "database": "dev",
    "host": "localhost",
    "user": "postgres",
    "password": "docker",
    "port": 5433
    }
}
```

### 2. Install Node with NVM

- If you have not done so already, install Node. The best way I've found is to use the Node Version Manager. See instructions at https://github.com/nvm-sh/nvm.
- After Node installation, run `npm install` from both the project root folder and the `client` folder.
- There are two sets of node_modules and package.json files, one in the project root and another in the `client` folder. so you will need to run Node in two separate terminal windows, one for the client-side code and one for the server-side code.
- Install the global nodemon package:

```
npm install -g nodemon
```

- Run the backend web server:

```
nodemon app.js
```

- In another terminal window, run the front-end server:

```
npm run serve
```

#### Automated Node Version Management

`.nvmrc` If you have automated Node version managemetn set up with NVM, the `.nvmrc` file will be read when you `cd` into the directory and your Node version will change automagically.

### 3. Docker and Database Setup

#### Install Docker.

https://docs.docker.com/install/

#### Create a custom Docker network. In this case, the network name is `pg`.

```
docker network create pg
```

#### Database Management Scripts

Change directories to the `db` folder and use the following commands to make sure you have the right permissions for executing the following scripts. These scripts are used to manage the development database.

`chmod u+x create.sh`

`chmod u+x restore.sh`

`chmod u+x login.sh`

`chmod u+x dump.sh`

From the `db` folder, run the command `./create.sh` to create the Docker container.

To check that the container was successfully creaeted, you can check the list of running docker containers using `docker ps`.

Restore the database from a dumpfile by running `./restore.sh`.

You will see errors that say `schema "tiger" already exists` and similar errors for `tiger_data` and `topology`, but these do not seem to becausing any trouble. (I'll be investigating them more in the future, but so far they seem harmless and are expected.)

The image used is called `mdillon/postgis` and includes PostGIS 2.5. (This container is based on the )official Postgres Docker container. For more information: https://hub.docker.com/r/mdillon/postgis.)

In this project, the container has been named `nitrate-cancer-analysis` and the local development database within it is called `dev`.

#### Run pgAdmin in another Docker container.

```
docker run -d -p 5050:5050 --name pgadmin --network=pg thajeztah/pgadmin4
```

If you've already done this step and need to restart this pgAdmin Docker container use the command `docker start pgadmin` instead.

For more details about this pgAdmin instance:
https://hub.docker.com/r/thajeztah/pgadmin4

Visit http://[your-docker-host]:5050

When creating a server in pgAdmin to connect to `nitrate-cancer-analysis`, use the defaults for the user and maintenance database. The port should be changed to `5433`. The password is `docker` and the host name is the IP address of the Docker container with the PostgreSQL instance. This IP address can be found by using the following Docker command and looking for the property “IPAddress” after running this command:

```
docker inspect nitrate-cancer-analysis
```

## Linting

Install Prettier for VS Code: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

## Testing

### Client-side Testing: End-to-End Testing with Cypress

With the app running, the Cypress tests will run with the command `npm run cypress`.

### Server-side Testing: Unit and API Integration Testing with Jest

Unit tests: `npm run test`

Integration tests: `npm run integration` (make sure back-end of app is running)
