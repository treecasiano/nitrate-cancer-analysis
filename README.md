# Nitrate Levels and Cancer Incidence Analysis

## About this Application

This app allows users to analyze the relationship between cancer incidence and nitrate levels in Wisconsin at the census tract level. It is one of two projects that satisfy requirements for the Capstone course in the University of Wisconsin-Madison's MS program in Cartography and GIS Development (a.k.a "Web Map Programmin").

## Technologies Used

The core front-end libraries/frameworks include the following:

- Vue (with Vuex and Vue Router)
- Leaflet (specifically, `vue2-leaflet`, which is a Vue wrapper around the Leaflet mapping library)
- Vuetify (a Material Design Component library)
- Turf.js

## Setting up the Development Environment

_Instructions are for Linux/Unix users._

### 1. Install Node with NVM

- If you have not done so already, install Node. The best way I've found is to use the Node Version Manager. See instructions at https://github.com/nvm-sh/nvm.
- After Node installation, run `npm install` from the root project folder.

Run the front-end server:

```
npm run serve
```

#### Automated Node Version Management

`.nvmrc` If you have automated Node version managemetn set up with NVM, the `.nvmrc` file will be read when you `cd` into the directory and your Node version will change automagically.

## Linting

Install Prettier for VS Code: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

## Testing

### Client-side Testing: End-to-End Testing with Cypress

With the app running, the Cypress tests will run with the command `npm run cypress`.
