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
  displayStatusIDW: false,
  idw: {},
  loading: false,
};

const getters = {
  getClassesIDW: state => {
    const { features } = state.idw;
    const nitratesArray = features.map(feature => {
      const {
        properties: { nitr_ran },
      } = feature;
      return nitr_ran;
    });
    var clusters = ckmeans(nitratesArray, 5);
    var classBreakPoints = clusters.map(cluster => {
      return Math.min(...cluster);
    });
    classBreakPoints.shift();
    return { classBreakPoints, clusters };
  },
};

export default {
  actions,
  getters,
  mutations,
  namespaced: true,
  state,
};
