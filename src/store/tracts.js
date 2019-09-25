import tractsApi from "../api/tracts";
const { centroid } = require("@turf/turf");
const { featureCollection } = require("@turf/helpers");
import { ckmeans } from "simple-statistics";

const actions = {
  async displayData({ commit, status }) {
    return commit("setDisplayStatus", status);
  },
  async getData({ commit }) {
    commit("setLoadingStatus", true);
    const results = await tractsApi.getData();
    const { data } = results;
    const { features } = data;
    const centroids = features.map(feature => {
      const { properties } = feature;
      return centroid(feature, properties);
    });
    const centroidsFeatureCollection = featureCollection(centroids);
    commit("setCentroids", centroidsFeatureCollection);
    commit("setLoadingStatus", false);
    return commit("setData", data);
  },
};

const mutations = {
  setCentroids(state, centroids) {
    state.centroids = centroids;
  },
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
  centroids: [],
  data: {},
  displayStatus: false,
  displayStatusIDW: false,
  idw: {},
  loading: false,
};

const getters = {
  getClusters: state => {
    const { features } = state.idw;
    console.log(features);
    const cancerRatesArray = features.map(feature => {
      const {
        properties: { cancerRate },
      } = feature;
      return cancerRate;
    });
    var clusters = ckmeans(cancerRatesArray, 5);
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
