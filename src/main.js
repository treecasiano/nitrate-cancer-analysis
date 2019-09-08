import "babel-polyfill";
import Vue from "vue";
import App from "./App.vue";
import "../node_modules/vuetify/dist/vuetify.min.css";
import "../node_modules/leaflet/dist/leaflet.css";
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
import "material-design-icons-iconfont/dist/material-design-icons.css";
import router from "./router";
import store from "./store/index";

// register Vue2Leaflet components
import {
  LControl,
  LControlScale,
  LControlZoom,
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
} from "vue2-leaflet";

import vuetify from "@/plugins/vuetify";

Vue.component("l-control", LControl);
Vue.component("l-control-scale", LControlScale);
Vue.component("l-control-zoom", LControlZoom);
Vue.component("l-map", LMap);
Vue.component("l-tile-layer", LTileLayer);
Vue.component("l-marker", LMarker);
Vue.component("l-popup", LPopup);

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

Vue.config.productionTip = false;

Vue.use(L);

init();

function init() {
  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App),
  }).$mount("#app");
}
