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
const { collect, interpolate } = require("@turf/turf");
const { linearRegression, linearRegressionLine } = require("simple-statistics");

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
      minHex: 10,
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
      const tractGridOptions = {
        gridType: "point",
        property: "canrate",
        units: "kilometers",
        weight: parseFloat(this.idwWeight),
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

      /* Note that while the code within map() below does not change 
      the original features array, it does, however, change the objects 
      referenced by the features array, 
      because of this cancerRatesAggregatedToNitrateHexbins will end up
      with the correct averaged values. */

      const { features } = cancerRatesAggregatedToNitrateHexbins;
      features.forEach(feature => {
        const {
          properties: { cancerRate },
        } = feature;
        const cancerRateAverage =
          cancerRate.reduce((a, b) => a + b, 0) / cancerRate.length;
        feature.properties.cancerRate = cancerRateAverage;
        return feature;
      });

      const linearRegressionResults = this.calculateLinearRegression(
        cancerRatesAggregatedToNitrateHexbins
      );
      // linearRegressionLine returns a function which can be used to predict values
      // for the independent variable y (cancer rates)
      // based on the slope and intercept from the linear regression results
      // https://simplestatistics.org/docs/#linear-regression-line
      const line = linearRegressionLine(linearRegressionResults);
      features.forEach(feature => {
        const {
          properties: { nitr_ran, cancerRate },
        } = feature;
        const predictedCancerRate = line(nitr_ran);
        const residual = cancerRate - predictedCancerRate;
        feature.properties.predictedCancerRate = predictedCancerRate;
        feature.properties.residual = residual;
      });
      this.setWellsIDW(cancerRatesAggregatedToNitrateHexbins);
      // set this same feature collection as the tracts IDW, which will be styled differently in the UI
      this.setTractsIDW(cancerRatesAggregatedToNitrateHexbins);
      this.displayWellsIDW(true);
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


