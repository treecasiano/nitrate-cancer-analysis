<template>
  <v-app id="app" app>
    <div id="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>|
      <router-link to="/map">Map</router-link>
    </div>
    <router-view />
  </v-app>
</template>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--v-primary-base);
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: var(--v-primary-base);
}

#nav a.router-link-exact-active {
  color: var(--v-secondary-base);
}
</style>
