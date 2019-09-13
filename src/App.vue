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

        <template v-if="$vuetify.breakpoint.smAndUp">
          <v-btn icon color="primary">
            <v-icon>mdi-printer</v-icon>
          </v-btn>
        </template>
      </v-toolbar>
    </div>
    <router-view />
  </v-app>
</template>

<script>
export default {
  computed: {
    wellsData() {
      return this.$store.state.wells.data;
    },
  },
  async created() {
    await this.$store.dispatch("wells/getData");
  },
  data: () => ({}),
};
</script>
<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
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

