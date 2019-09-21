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
          <v-layout column>
            <v-flex>
              <v-slider
                v-model="hexSize"
                :max="maxHex"
                :min="minHex"
                thumb-label="always"
                label="Hexbin size in km"
              ></v-slider>
            </v-flex>
            <v-flex>
              <v-text-field v-model="idwWeight" label="Power"></v-text-field>
            </v-flex>
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
const { interpolate } = require("@turf/turf");

export default {
  computed: {
    ...mapState({
      tractCentroids: state => state.tracts.centroids,
      tractsData: state => state.tracts.data,
      wellsData: state => state.wells.data,
    }),
  },
  data() {
    return {
      drawer: true,
      mini: false,
      hexSize: 15,
      idwWeight: 2,
      maxHex: 50,
      minHex: 15,
      minWeight: 1.1,
    };
  },
  methods: {
    interpolate() {
      this.displayWellsIDW(false);
      this.displayTractsIDW(false);
      const wellOptions = {
        gridType: "hex",
        property: "nitr_ran",
        units: "kilometers",
        weight: parseFloat(this.idwWeight),
      };
      const tractsOptions = {
        gridType: "hex",
        property: "canrate",
        units: "kilometers",
        weight: parseFloat(this.idwWeight),
      };
      const tractGridOptions = {
        gridType: "point",
        property: "canrate",
        units: "kilometers",
        weight: parseFloat(this.idwWeight),
      };
      const hexWells = interpolate(this.wellsData, this.hexSize, wellOptions);
      const hexTracts = interpolate(
        this.tractCentroids,
        this.hexSize,
        tractsOptions
      );
      const tractGrid = interpolate(
        this.tractCentroids,
        this.hexSize,
        tractGridOptions
      );

      // TODO: Collect the tractGrid points into the nitrate hexbins
      // TODO: Replace the displayed Cancer IDW layer with a dupe of the nitrate layer that displays only the cancer rates
      this.setWellsIDW(hexWells);
      this.setTractsIDW(hexTracts);
      this.displayWellsIDW(true);
    },
    ...mapMutations({
      displayTracts: "tracts/setDisplayStatus",
      displayWells: "wells/setDisplayStatus",
      displayWellsIDW: "wells/setDisplayStatusIDW",
      displayTractsIDW: "tracts/setDisplayStatusIDW",
      setWellsIDW: "wells/setIDW",
      setTractsIDW: "tracts/setIDW",
    }),
  },
};
</script>


