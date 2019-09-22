const { standardDeviation } = require("simple-statistics");

const mutations = {
  setDisplayStatus(state, status) {
    state.displayStatus = status;
  },
  setHexbins(state, hexbins) {
    const { features } = hexbins;
    const residualsArray = features.map(feature => {
      const {
        properties: { residual },
      } = feature;
      return residual;
    });
    state.standardDeviation = standardDeviation(residualsArray);
    state.hexbins = hexbins;
  },
  setLoadingStatus(state, loading) {
    state.loading = loading;
  },
};

const state = {
  displayStatus: true,
  hexbins: {},
  loading: false,
  standardDeviation: 0,
};

const getters = {};

export default {
  getters,
  mutations,
  namespaced: true,
  state,
};
