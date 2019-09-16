import Vue from "vue";
import Router from "vue-router";
import About from "./views/About.vue";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/about",
      name: "about",
      component: About,
    },
  ],
});

// TODO: Implement a NotFoundComponent (catch-all route) to show a 404 page
// see: https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations
