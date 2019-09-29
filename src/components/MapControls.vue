<template>
  <v-card>
    <v-navigation-drawer v-model="drawer" :mini-variant.sync="mini" permanent bottom>
      <template v-slot:prepend>
        <v-list-item v-if="mini" dense>
          <v-btn icon @click.stop="mini = !mini">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-list-item>
        <v-list-item v-if="!mini" dense>
          <v-spacer></v-spacer>
          <v-btn small icon @click.stop="mini = !mini">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>
        <v-form v-model="valid">
          <v-container v-if="!mini" class="grey lighten-5">
            <v-divider></v-divider>
            <div>
              <strong>LINEAR REGRESSION PARAMETERS</strong>
            </div>
            <v-divider></v-divider>
            <v-row>
              <v-col cols="12" class="mt-2" style="margin-bottom: -10px;">
                <div class="text-left">Select power (k) between 1.5 and 3.5.</div>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="idwWeightCancer" label="k: cancer rate" :rules="powerRules"></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="idwWeightNitrate"
                  label="k: nitrate level"
                  :rules="powerRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-slider
                  v-model="hexSize"
                  color="secondary"
                  :thumb-size="22"
                  label="Hexbin size (km): "
                  :max="maxHex"
                  :min="minHex"
                  thumb-label="always"
                ></v-slider>
                <v-btn @click="interpolate" color="secondary" :disabled="!valid" small>Submit</v-btn>
              </v-col>
              <v-col>
                <v-divider></v-divider>
                <div>
                  <strong>RESULTS</strong>
                </div>
                <v-divider></v-divider>
              </v-col>
              <v-col cols="12">
                <v-flex v-if="residualsLoading">
                  <div
                    v-if="hexSize<5"
                    class="text-left"
                  >If hexbin size is less than 5km, the calculation can take several minutes.</div>
                  <div>
                    <v-icon color="primary">fas fa-spin fa-spinner</v-icon>
                  </div>
                </v-flex>
                <div v-else class="text-left">
                  R Squared Value:
                  <span>{{rSquaredResults.toFixed(4)}}</span>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
// TODO: Add legends
// TODO: Add text to About page

import { mapMutations, mapState } from "vuex";
const { centroid, collect, interpolate, nearestPoint } = require("@turf/turf");
const { cloneDeep } = require("lodash");
const {
  linearRegression,
  linearRegressionLine,
  rSquared,
} = require("simple-statistics");

export default {
  computed: {
    ...mapState({
      residualsLoading: state => state.residuals.loading,
      tractCentroids: state => state.tracts.centroids,
      tractsData: state => state.tracts.data,
      wellsData: state => state.wells.data,
      wellsIDW: state => state.wells.idw,
    }),
  },
  data() {
    return {
      drawer: true,
      hexSize: 6,
      idwWeightCancer: 2,
      idwWeightNitrate: 2,
      maxHex: 10,
      minHex: 3,
      mini: false,
      minWeight: 1.1,
      powerRules: [
        v => !!v || "k is required",
        v => v <= 3.5 || "k must be a value between 1.5 and 3.5 ",
        v => v >= 1.5 || "k must be a value between 1.5 and 3.5 ",
      ],
      rSquaredResults: 0,
      valid: true,
    };
  },
  methods: {
    async interpolate() {
      this.setResidualsLoading(true);
      this.$forceNextTick(() => {
        this.displayWellsIDW(false);
        this.displayTractsIDW(false);
        this.displayResiduals(false);
        const wellOptions = {
          gridType: "hex",
          property: "nitr_ran",
          units: "kilometers",
          weight: parseFloat(this.idwWeightNitrate),
        };
        const tractGridOptions = {
          gridType: "point",
          property: "canrate",
          units: "kilometers",
          weight: parseFloat(this.idwWeightCancer),
        };
        const hexWells = interpolate(this.wellsData, this.hexSize, wellOptions);
        const tractGrid = interpolate(
          this.tractCentroids,
          this.hexSize,
          tractGridOptions
        );

        // collect the interpolated tractGrid points into the nitrate hexbins
        const cancerRatesAggregatedToNitrateHexbins = collect(
          hexWells,
          tractGrid,
          "canrate",
          "cancerRate"
        );

        const { features } = cancerRatesAggregatedToNitrateHexbins;
        // clone features so as to not change the original array of features
        const clonedFeatures = cloneDeep(features);
        clonedFeatures.forEach(feature => {
          const { properties } = feature;
          const { cancerRate } = properties;
          if (cancerRate.length === 0) {
            // handle cases where small hexbins don't have any cancer rate values/
            // Find the center of the tract and get the nearest value from tract grid
            const center = centroid(feature, properties);
            const nearest = nearestPoint(center, tractGrid);
            feature.properties.cancerRate = nearest.properties.canrate;
            return feature;
          }
          const cancerRateAverage =
            cancerRate.reduce((a, b) => a + b, 0) / cancerRate.length;
          feature.properties.cancerRate = cancerRateAverage;
          return feature;
        });
        Object.assign(features, clonedFeatures);
        const linearRegressionResults = this.calculateLinearRegression(
          cancerRatesAggregatedToNitrateHexbins
        );
        // linearRegressionLine returns a function which can be used to predict values
        // for the independent variable y (cancer rates)
        // based on the slope and intercept from the linear regression results
        // https://simplestatistics.org/docs/#linear-regression-line
        const line = linearRegressionLine(linearRegressionResults);

        // reclone features
        const reclonedFeatures = cloneDeep(clonedFeatures);
        reclonedFeatures.forEach(feature => {
          const {
            properties: { nitr_ran, cancerRate },
          } = feature;
          const predictedCancerRate = line(nitr_ran);
          const residual = predictedCancerRate - cancerRate;
          feature.properties.predictedCancerRate = predictedCancerRate;
          feature.properties.residual = residual;
        });
        Object.assign(features, reclonedFeatures);

        // calculate rSquared and save to component state
        this.rSquaredResults = this.calculateRSquared(
          line,
          cancerRatesAggregatedToNitrateHexbins
        );
        this.setWellsIDW(cancerRatesAggregatedToNitrateHexbins);
        // set this same feature collection as the tracts IDW, which will be styled differently in the UI
        this.setTractsIDW(cancerRatesAggregatedToNitrateHexbins);
        this.setResiduals(cancerRatesAggregatedToNitrateHexbins);
        this.displayTracts(false);
        this.displayResiduals(true);
        this.setResidualsLoading(false);
      });
    },
    calculateLinearRegression(featureCollection) {
      const { features } = featureCollection;
      const interpolatedVals = features.map(feature => {
        const { properties } = feature;
        // nitrate level = x (independent variable), cancer rate = y (dependent variable)
        return [properties.nitr_ran, properties.cancerRate];
      });
      // the regression equation is the slope and y-intercept of a regression line
      // so, for any value of x (nitrate level as slope), we can predict y (cancer rate as intercept)
      const slopeAndIntercept = linearRegression(interpolatedVals);
      return slopeAndIntercept;
    },
    calculateRSquared(regressionLine, featureCollection) {
      const { features } = featureCollection;
      const samples = features.map(feature => {
        const { properties } = feature;
        // nitrate level = x (independent variable), cancer rate = y (dependent variable)
        return [properties.nitr_ran, properties.cancerRate];
      });
      return rSquared(samples, regressionLine);
    },
    ...mapMutations({
      displayResiduals: "residuals/setDisplayStatus",
      displayTracts: "tracts/setDisplayStatus",
      displayWells: "wells/setDisplayStatus",
      displayWellsIDW: "wells/setDisplayStatusIDW",
      displayTractsIDW: "tracts/setDisplayStatusIDW",
      setResidualsLoading: "residuals/setLoadingStatus",
      setResiduals: "residuals/setHexbins",
      setWellsIDW: "wells/setIDW",
      setTractsIDW: "tracts/setIDW",
    }),
  },
};
</script>
<style>
</style>
