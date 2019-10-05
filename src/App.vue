<template>
  <v-app id="app" app>
    <div>
      <v-toolbar dense id="nav">
        <v-toolbar-title>Nitrate Levels and Cancer Incidence in Wisconsin</v-toolbar-title>
        <div class="flex-grow-1"></div>
        <v-toolbar-items>
          <router-link to="/">Home</router-link>
          <router-link to="/about">About</router-link>
        </v-toolbar-items>
      </v-toolbar>
    </div>
    <router-view />
  </v-app>
</template>

<script>
export default {
  async created() {
    const getWellsPromise = await this.$store.dispatch("wells/getData");
    const getCensusTractsPromise = await this.$store.dispatch("tracts/getData");
    Promise.all([getWellsPromise, getCensusTractsPromise]);
  },
  data: () => ({}),
};
</script>
<style>
@import url("https://fonts.googleapis.com/css?family=Muli");
#app {
  font-family: "Muli", sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--v-primary-base);
}

#nav a {
  font-weight: bold;
  color: var(--v-primary-base);
  display: block;
  padding: 10px;
}

#nav a.router-link-exact-active {
  color: var(--v-secondary-base);
}
</style>

