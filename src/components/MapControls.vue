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
        <v-container v-if="!mini" class="grey lighten-5 mt-5">
          <v-row>
            <v-col cols="12" class="mt-5">
              <v-slider
                color="secondary"
                v-model="hexSize"
                :max="maxHex"
                :min="minHex"
                thumb-label="always"
                label="Hexbin size in km: "
              ></v-slider>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="idwWeightCancer"
                label="Power (k) for cancer rate interpolation"
                width="60"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="idwWeightNitrate"
                label="Power (k) for nitrate level interpolation"
                width="60"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-flex>
                R Squared Value:
                <span>{{rSquaredResults.toFixed(4)}}</span>
              </v-flex>
            </v-col>
            <v-col cols="12">
              <v-btn @click="interpolate" color="secondary">Submit</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
// TODO: Constrain inputs to positive number greater than or equal to 1
// TODO: Make note of why aggregating to the census tract layer might be better (build alternative?)
// TODO: Make help text for each input
// TODO: Add classifications and color ramps
// TODO: Create legends
// TODO: Handle case where inputs result in NaN
// TODO: Improve styling for power inputs
// TODO: Why does a power level over 145 for cancer interpolation break the calculations?
// TODO: Constrain max range on power sliders
// TODO: Add text to About page
// TODO: Add map layer to display standard deviation of residuals
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
      tractCentroids: state => state.tracts.centroids,
      tractsData: state => state.tracts.data,
      wellsData: state => state.wells.data,
    }),
  },
  data() {
    return {
      drawer: true,
      hexSize: 15,
      idwWeightCancer: 2,
      idwWeightNitrate: 2,
      maxHex: 50,
      minHex: 5,
      mini: false,
      minWeight: 1.1,
      rSquaredResults: 0,
    };
  },
  methods: {
    interpolate() {
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
        const residual = cancerRate - predictedCancerRate;
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
      this.displayResiduals(true);
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
      setResiduals: "residuals/setHexbins",
      setWellsIDW: "wells/setIDW",
      setTractsIDW: "tracts/setIDW",
    }),
  },
};
</script>


