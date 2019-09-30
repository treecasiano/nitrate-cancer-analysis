const mutations = {
  setInterpolatedValues(state, status) {
    state.interpolatedValues = status;
  },
  setDisplayStatus(state, status) {
    state.displayStatus = status;
  },
  setPredictedValues(state, status) {
    state.predictedValues = status;
  },
};

const state = {
  displayStatus: false,
  interpolatedValues: [],
  predictedValues: [],
};

const getters = {};

export default {
  getters,
  mutations,
  namespaced: true,
  state,
};
