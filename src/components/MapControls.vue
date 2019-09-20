<template>
  <v-card>
    <v-navigation-drawer v-model="drawer" :mini-variant.sync="mini" permanent>
      <template v-slot:prepend>
        <v-list-item v-if="mini">
          <v-btn icon @click.stop="mini = !mini">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-list-item>
        <v-list-item v-if="!mini">
          <v-spacer></v-spacer>
          <v-btn small icon @click.stop="mini = !mini">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>
        <v-container v-if="!mini">
          <v-layout>
            <v-flex>
              <v-btn @click="interpolate">Submit</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
import { mapMutations, mapState } from "vuex";
const { featureCollection, point } = require("@turf/helpers");
const { interpolate } = require("@turf/turf");

export default {
  computed: {
    ...mapState({
      wellsData: state => state.wells.data,
    }),
  },
  data() {
    return {
      drawer: true,
      mini: false,
    };
  },
  methods: {
    interpolate() {
      const options = {
        gridType: "hex",
        property: "nitr_ran",
        units: "kilometers",
        weight: 6,
      };
      const hex = interpolate(this.wellsData, 15, options);
      this.setIDW(hex);
      this.displayWellsIDW(true);
    },
    ...mapMutations({
      displayTracts: "tracts/setDisplayStatus",
      displayWells: "wells/setDisplayStatus",
      displayWellsIDW: "wells/setDisplayStatusIDW",
      setIDW: "wells/setIDW",
    }),
  },
};
</script>


