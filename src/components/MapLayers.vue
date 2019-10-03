<template>
  <v-card>
    <v-navigation-drawer v-model="drawer" :mini-variant.sync="mini" permanent width="250">
      <template v-slot:prepend>
        <div v-if="mini">
          <v-btn icon @click.stop="mini = !mini">
            <v-icon>mdi-layers</v-icon>
          </v-btn>
        </div>
        <v-list-item v-if="!mini" dense>
          <v-spacer></v-spacer>
          <v-btn small icon @click.stop="mini = !mini">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item>
        <v-container v-if="!mini">
          <v-layout>
            <v-flex>
              <div class="mapLayers__heading">
                <v-divider></v-divider>
                <div>BASE LAYERS</div>
                <v-divider class="mb-4"></v-divider>
              </div>
              <v-checkbox
                v-model="displayStatusWells"
                :label="`Well Locations`"
                data-cy="checkbox--wells"
                color="primary"
              ></v-checkbox>
              <v-checkbox
                v-model="displayStatusTracts"
                :label="`Census Tracts`"
                data-cy="checkbox--tracts"
                color="primary"
                @change="hideAllResultsLayers"
              ></v-checkbox>
              <div v-if="wellsIDW.features">
                <div class="mapLayers__heading">
                  <v-divider></v-divider>
                  <div>RESULT LAYERS</div>
                  <v-divider class="mb-4"></v-divider>
                </div>
                <v-checkbox
                  v-if="wellsIDW.features"
                  v-model="displayStatusWellsIDW"
                  :label="`Interpolated Nitrate Levels`"
                  data-cy="checkbox--idwNitrate"
                  color="primary"
                  @change="showOnlyWellsIDW"
                ></v-checkbox>
                <v-checkbox
                  v-if="tractsIDW.features"
                  v-model="displayStatusTractsIDW"
                  :label="`Interpolated Cancer Rates`"
                  data-cy="checkbox--idwCancer"
                  color="primary"
                  @change="showOnlyTractsIDW"
                ></v-checkbox>
                <v-checkbox
                  v-if="residuals.features"
                  v-model="displayResidualsHexbins"
                  :label="`Residuals`"
                  data-cy="checkbox--residuals"
                  color="primary"
                  @change="showOnlyResidualsIDW"
                ></v-checkbox>
              </div>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  computed: {
    displayResidualsHexbins: {
      get() {
        return this.$store.state.residuals.displayStatus;
      },
      set(value) {
        this.displayResiduals(value);
      },
    },
    displayStatusTracts: {
      get() {
        return this.$store.state.tracts.displayStatus;
      },
      set(value) {
        this.displayTracts(value);
      },
    },
    displayStatusWells: {
      get() {
        return this.$store.state.wells.displayStatus;
      },
      set(value) {
        this.displayWells(value);
      },
    },
    displayStatusWellsIDW: {
      get() {
        return this.$store.state.wells.displayStatusIDW;
      },
      set(value) {
        this.displayWellsIDW(value);
      },
    },
    displayStatusTractsIDW: {
      get() {
        return this.$store.state.tracts.displayStatusIDW;
      },
      set(value) {
        this.displayTractsIDW(value);
      },
    },

    ...mapState({
      residuals: state => state.residuals.hexbins,
      tractsIDW: state => state.tracts.idw,
      wellsIDW: state => state.wells.idw,
    }),
  },
  data() {
    return {
      drawer: true,
      mini: false,
    };
  },
  methods: {
    hideAllResultsLayers(e) {
      if (e) {
        this.displayTractsIDW(false);
        this.displayResiduals(false);
        this.displayWellsIDW(false);
      }
    },
    showOnlyResidualsIDW(e) {
      if (e) {
        this.displayTracts(false);
        this.displayTractsIDW(false);
        this.displayWellsIDW(false);
      }
    },
    showOnlyTractsIDW(e) {
      if (e) {
        this.displayTracts(false);
        this.displayResiduals(false);
        this.displayWellsIDW(false);
      }
    },
    showOnlyWellsIDW(e) {
      if (e) {
        this.displayTracts(false);
        this.displayTractsIDW(false);
        this.displayResiduals(false);
      }
    },
    ...mapMutations({
      displayResiduals: "residuals/setDisplayStatus",
      displayTracts: "tracts/setDisplayStatus",
      displayWells: "wells/setDisplayStatus",
      displayWellsIDW: "wells/setDisplayStatusIDW",
      displayTractsIDW: "tracts/setDisplayStatusIDW",
    }),
  },
};
</script>

<style>
.mapLayers__heading {
  font-weight: bold;
}
@media only screen and (max-height: 500px) {
  .mapLayers__heading {
    display: none;
  }
}
</style>

