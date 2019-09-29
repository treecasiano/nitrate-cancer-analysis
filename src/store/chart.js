const mutations = {
  setInterpolatedValues(state, status) {
    state.interpolatedValues = status;
  },
  setDisplayStatus(state, status) {
    state.displayStatus = status;
  },
};

const state = {
  displayStatus: false,
  interpolatedValues: [],
};

const getters = {};

export default {
  getters,
  mutations,
  namespaced: true,
  state,
};
