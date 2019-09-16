import Vue from "vue";
import Vuex from "vuex";

import tracts from "./tracts";
import wells from "./wells";

Vue.use(Vuex);

const vuexStore = new Vuex.Store({
  modules: {
    tracts,
    wells,
  },
});

if (window.Cypress) {
  window.__store__ = vuexStore;
}

export default vuexStore;
