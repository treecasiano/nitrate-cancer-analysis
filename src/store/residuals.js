const mutations = {
  setDisplayStatus(state, status) {
    state.displayStatus = status;
  },
  setHexbins(state, hexbins) {
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
};

const getters = {};

export default {
  getters,
  mutations,
  namespaced: true,
  state,
};
