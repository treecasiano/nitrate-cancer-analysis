<template>
  <v-app id="app" app>
    <div>
      <v-toolbar dense id="nav">
        <v-toolbar-title>Nitrate Levels and Cancer Incidence in Wisconsin</v-toolbar-title>

        <div class="flex-grow-1"></div>

        <v-toolbar-items>
          <v-btn text>
            <router-link to="/">Home</router-link>
          </v-btn>
          <v-btn text>
            <router-link to="/about">About</router-link>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </div>
    <router-view />
  </v-app>
</template>

<script>
export default {
  async created() {
    // TODO: Implement promise.all
    await this.$store.dispatch("wells/getData");
    await this.$store.dispatch("tracts/getData");
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
}

#nav a.router-link-exact-active {
  color: var(--v-secondary-base);
}
</style>

