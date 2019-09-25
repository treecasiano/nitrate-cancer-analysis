import wellsApi from "../api/wells";
import { ckmeans } from "simple-statistics";

const actions = {
  async displayData({ commit, status }) {
    return commit("setDisplayStatus", status);
  },
  async getData({ commit }) {
    commit("setLoadingStatus", true);
    const results = await wellsApi.getData();
    commit("setLoadingStatus", false);
    return commit("setData", results.data);
  },
};

const mutations = {
  setData(state, data) {
    state.data = data;
  },
  setDisplayStatus(state, status) {
    state.displayStatus = status;
  },
  setDisplayStatusIDW(state, status) {
    state.displayStatusIDW = status;
  },
  setIDW(state, data) {
    state.idw = data;
  },
  setLoadingStatus(state, loading) {
    state.loading = loading;
  },
};

const state = {
  data: {},
  displayStatus: true,
  displayStatusIDW: true,
  idw: {},
  loading: false,
};

const getters = {
  getClusters: state => {
    const { features } = state.idw;
    console.log(features);
    const nitrateRatesArray = features.map(feature => {
      const {
        properties: { nitr_ran },
      } = feature;
      return nitr_ran;
    });
    var clusters = ckmeans(nitrateRatesArray, 5);
    return clusters;
  },
};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state,
};
