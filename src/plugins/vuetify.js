import Vue from "vue";
import Vuetify from "vuetify/lib";
import "vuetify/dist/vuetify.min.css";
import colors from "vuetify/lib/util/colors";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "@fortawesome/fontawesome-free/css/all.css";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "fa",
  },
  theme: {
    themes: {
      light: {
        primary: colors.cyan.darken3,
        secondary: colors.lightGreen.darken1,
        accent: colors.lime,
        anchor: colors.blue,
        error: colors.red,
        warning: colors.deepOrange,
        info: colors.lightBlue,
        success: colors.lightBlue,
      },
    },
    options: {
      customProperties: true,
    },
  },
});
