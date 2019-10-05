<template>
  <div>
    <v-layout>
      <l-map
        ref="map"
        :zoom="zoom"
        :center="center"
        :maxBounds="maxBounds"
        :maxZoom="maxZoom"
        :minZoom="minZoom"
        @update:zoom="zoomUpdated"
        @update:center="centerUpdated"
        @update:bounds="boundsUpdated"
        :options="{zoomControl: false}"
        v-bind:style="`height: calc(${height}vh - ${offsetHeight}px); width: ${width}%;`"
      >
        <l-control position="topright">
          <v-btn dark color="primary" @click="resetMapView" style="width: 80px;">
            <v-icon>home</v-icon>
          </v-btn>
        </l-control>
        <l-control position="topright">
          <MapLayers />
        </l-control>
        <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
        <div v-if="displayWells">
          <l-circle-marker
            v-for="(item, index) in markersArray"
            v-bind:item="item"
            v-bind:index="index"
            v-bind:key="index"
            :lat-lng="item"
            :radius="3"
            :color="wellDataColor"
            :fillColor="wellDataFillColor"
            :weight="1"
            :opacity="1"
            :fillOpacity="1"
          >
            <l-popup>
              <div>
                <strong>Nitrate Level (ppm)</strong>
                : {{item.props.nitr_ran.toFixed(2)}}
              </div>
            </l-popup>
          </l-circle-marker>
        </div>
        <div v-if="displayTracts">
          <l-geo-json
            :geojson="tractsData"
            :options="optionsCensusTracts"
            :options-style="stylesCensusTracts"
          ></l-geo-json>
        </div>
        <div v-if="displayWellsIDW && idwWells.features">
          <l-geo-json :geojson="idwWells" :options="optionsIDW" :options-style="stylesIDW"></l-geo-json>
        </div>
        <div v-if="displayCancerRatesIDW && idwTracts.features">
          <l-geo-json
            :geojson="idwTracts"
            :options="optionsCancerRatesIDW"
            :options-style="stylesCancerRatesIDW"
          ></l-geo-json>
        </div>
        <div v-if="displayResiduals && idwWells.features">
          <l-geo-json
            :geojson="residuals"
            :options="optionsResiduals"
            :options-style="stylesResiduals"
          ></l-geo-json>
        </div>
        <l-control position="topleft">
          <MapControls />
        </l-control>
        <l-control v-if="displayChart" class="chart" style="position: fixed; top: 7%; left: 30%;">
          <div>
            <v-radio-group v-model="radios" row class="mt-0">
              <v-radio label="Observed & Predicted Rates" value="radio1" color="primary"></v-radio>
              <v-radio label="Residuals vs. Predicted Plot" value="radio2" color="primary"></v-radio>
            </v-radio-group>
          </div>
          <v-card v-if="radios === 'radio1'">
            <v-card-title dense>
              <div class="overline">Observed & Predicted Cancer Rates</div>
              <v-spacer></v-spacer>
              <v-btn small icon @click="setDisplayStatusChart(false)">
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card color="white" style="height: 500px; width: 500px;">
              <ScatterChart :chart-data="chartData" :options="chartOptions" legendId="legend"></ScatterChart>
            </v-card>
          </v-card>
          <v-card v-if="radios === 'radio2'">
            <v-card-title dense>
              <div class="overline">Residuals vs. Predicted Plot</div>
              <v-spacer></v-spacer>
              <v-btn small icon @click="setDisplayStatusChart(false)">
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card color="white" style="height: 500px; width: 500px;">
              <ScatterChart
                :chart-data="chartDataResiduals"
                :options="chartOptionsResiduals"
                legendId="legend"
              ></ScatterChart>
            </v-card>If the model is specified correctly, this plot should appear random with little structure.
          </v-card>
        </l-control>
        <l-control
          v-show="displayResiduals || displayTracts || displayWellsIDW || displayCancerRatesIDW"
          class="legend"
          position="bottomleft"
        >
          <v-card style="width: 360px; height: 120px">
            <MapLegend />
          </v-card>
        </l-control>
        <l-control-zoom position="bottomright"></l-control-zoom>
      </l-map>
    </v-layout>
  </div>
</template>

<script>
import { easyPrint, latLngBounds } from "leaflet";
import MapControls from "@/components/MapControls.vue";
import MapLayers from "@/components/MapLayers.vue";
import MapLegend from "@/components/MapLegend.vue";
import { mapGetters, mapMutations, mapState } from "vuex";
import ScatterChart from "@/components/ScatterChart.vue";

// TODO: Try to clip the hexbins to shape of Wisconsin   https://www.npmjs.com/package/turf-clip

const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
const url =
  "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
const defaultCenter = [44.6656476, -90.2436474];
const defaultZoom = 7;
const popupOptions = {
  permanent: false,
  sticky: true,
  className: "popup--all",
};

export default {
  name: "MapComponent",
  components: {
    MapControls,
    MapLayers,
    MapLegend,
    ScatterChart,
  },
  computed: {
    chartData() {
      const interpolatedValues = this.$store.state.chart.interpolatedValues;
      const predictedValues = this.$store.state.chart.predictedValues;
      const interpolatedData = interpolatedValues.map(dataPoint => {
        return {
          x: dataPoint[0].toFixed(4),
          y: dataPoint[1].toFixed(4),
        };
      });
      const predictedData = predictedValues.map(dataPoint => {
        return {
          x: dataPoint[0].toFixed(4),
          y: dataPoint[1].toFixed(4),
        };
      });
      const data = { interpolatedData, predictedData };
      return this.fillChart(data);
    },
    chartDataResiduals() {
      const { features } = this.$store.state.residuals.hexbins;
      const residualsData = features.map(feature => {
        const {
          properties: { residual, predictedCancerRate },
        } = feature;
        const standardDevOfResidual = residual / this.standardDeviation;
        return {
          x: predictedCancerRate.toFixed(4),
          y: standardDevOfResidual.toFixed(4),
        };
      });
      return this.fillChartResiduals(residualsData);
    },
    chartOptions() {
      const options = {
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Nitrate Levels (ppm)",
              },
              ticks: {
                beginAtZero: true,
                max: 18,
                stepSize: 1,
              },
              type: "linear",
              position: "bottom",
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Cancer Rates",
              },
              ticks: {
                beginAtZero: true,
                max: 0.6,
                stepSize: 0.05,
                callback: value => {
                  return value + "%";
                },
              },
              type: "linear",
              position: "bottom",
            },
          ],
        },
      };
      return options;
    },
    chartOptionsResiduals() {
      const options = {
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "PredictedValues",
              },
              ticks: {
                beginAtZero: true,
                max: 0.3,
                stepSize: 0.05,
                callback: value => {
                  return value + "%";
                },
              },
              type: "linear",
              position: "bottom",
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Standard Deviation of Predicted Values",
              },
              ticks: {
                beginAtZero: true,
                max: 8,
                stepSize: 1,
                callback: value => {
                  return value;
                },
              },
              type: "linear",
              position: "bottom",
            },
          ],
        },
      };
      return options;
    },
    optionsCensusTracts() {
      return {
        onEachFeature: this.onEachCensusTractFeature,
      };
    },
    optionsIDW() {
      return {
        onEachFeature: this.onEachNitrateLevelIDWFeature,
      };
    },
    optionsCancerRatesIDW() {
      return {
        onEachFeature: this.onEachCancerRatesIDWFeature,
      };
    },
    optionsResiduals() {
      return {
        onEachFeature: this.onEachResidualFeature,
      };
    },
    stylesCensusTracts() {
      return () => {
        return {};
      };
    },
    stylesIDW() {
      return () => {
        return {};
      };
    },
    stylesCancerRatesIDW() {
      return () => {
        return {};
      };
    },
    stylesResiduals() {
      return () => {
        return {};
      };
    },
    onEachCensusTractFeature() {
      return (feature, layer) => {
        const popupContent = this.createCensusTractContent(feature.properties);
        this.setCensusTractStyles(layer, feature);
        layer.bindPopup(popupContent, popupOptions);
      };
    },
    onEachNitrateLevelIDWFeature() {
      return (feature, layer) => {
        const popupContent = this.createIDWContent(feature.properties);
        this.setNitrateLevelsIDWStyles(layer, feature);
        layer.bindPopup(popupContent, popupOptions);
      };
    },
    onEachCancerRatesIDWFeature() {
      return (feature, layer) => {
        const popupContent = this.createIDWContent(feature.properties);
        this.setCancerRatesIDWStyles(layer, feature);
        layer.bindPopup(popupContent, popupOptions);
      };
    },
    onEachResidualFeature() {
      return (feature, layer) => {
        const popupContent = this.createIDWContent(feature.properties);
        this.setResidualsStyles(layer, feature);
        layer.bindPopup(popupContent, popupOptions);
      };
    },
    ...mapGetters({
      classesCancerRatesIDW: "tracts/getClassesIDW",
      classesCancerRatesTracts: "tracts/getClassesTracts",
      classesNitrates: "wells/getClassesIDW",
    }),
    ...mapState({
      displayResiduals: state => state.residuals.displayStatus,
      displayTracts: state => state.tracts.displayStatus,
      displayCancerRatesIDW: state => state.tracts.displayStatusIDW,
      displayChart: state => state.chart.displayStatus,
      displayWells: state => state.wells.displayStatus,
      displayWellsIDW: state => state.wells.displayStatusIDW,
      idwWells: state => state.wells.idw,
      idwTracts: state => state.tracts.idw,
      residuals: state => state.residuals.hexbins,
      standardDeviation: state => state.residuals.standardDeviation,
      tractsData: state => state.tracts.data,
      tractsDataLoading: state => state.tracts.loading,
      wellsData: state => state.wells.data,
      wellsDataLoading: state => state.wells.loading,
    }),
  },
  created() {
    if (this.wellsData.features) {
      this.createMarkers(this.wellsData);
    }
  },
  data() {
    return {
      url,
      zoom: defaultZoom,
      center: defaultCenter,
      bounds: null,
      attribution,
      subdomains: "abcd",
      loading: false,
      maxBounds: latLngBounds([
        [48.95136647094772, -80.20019531250001],
        [40.027614437486655, -100.30517578125001],
      ]),
      maxZoom: 18,
      markersArray: [],
      minZoom: 6,
      colorRamp: ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"],
      radios: "radio1",
      wellDataColor: "#ffffff",
      wellDataFillColor: "rgb(0, 131, 143)",
    };
  },
  methods: {
    boundsUpdated(bounds) {
      this.bounds = bounds;
    },
    centerUpdated(center) {
      this.center = center;
    },
    createCensusTractContent(props) {
      let propertyString = `<strong>Cancer Rate:</strong> ${props.canrate.toFixed(
        2
      )}%`;
      return propertyString;
    },
    createIDWContent(props) {
      let propertyString = "";
      if (props.nitr_ran) {
        propertyString += `
        <div> <strong>Interpolated Nitrate Levels:</strong> ${props.nitr_ran.toFixed(
          4
        )}</div>
       `;
      }
      if (props.cancerRate) {
        propertyString += `<div><strong>Interpolated Cancer Rates:</strong> ${props.cancerRate.toFixed(
          4
        )}
        </div>
       `;
      }
      if (props.predictedCancerRate) {
        propertyString += `<div><strong>Predicted Cancer Rates:</strong> ${props.predictedCancerRate.toFixed(
          4
        )}
        </div>
       `;
      }
      if (props.residual) {
        propertyString += `<div><strong>Residual:</strong> ${props.residual.toFixed(
          4
        )}
        </div>
       `;
      }
      if (props.stdDev) {
        propertyString += `<div><strong>Standard Deviation of Residual:</strong> ${props.stdDev.toFixed(
          4
        )}
        </div>
       `;
      }
      return propertyString;
    },
    createMarkers(geojson) {
      const markersArray = geojson["features"].map(feature => {
        // eslint-disable-next-line
        let markerObject = L.latLng(
          feature["geometry"]["coordinates"][1],
          feature["geometry"]["coordinates"][0]
        );
        let props = feature["properties"];

        Object.assign(markerObject, { props });
        return markerObject;
      });
      this.markersArray = markersArray;
    },
    fillChart(chartData) {
      let chartConfig = {};
      let labels = [];
      let interpolatedData = [];
      let predictedData = [];
      if (chartData) {
        labels = Object.keys(chartData.interpolatedData);
        interpolatedData = Object.values(chartData.interpolatedData);
        predictedData = Object.values(chartData.predictedData);
      }
      chartConfig = {
        labels,
        datasets: [
          {
            label: "Interpolated Values",
            backgroundColor: "rgba(124, 179, 66, .5)",
            data: interpolatedData,
          },
          {
            label: "Predicted Values",
            backgroundColor: "rgb(0, 131, 143)",
            data: predictedData,
          },
        ],
        borderWidth: 3,
      };
      return chartConfig;
    },
    fillChartResiduals(chartData) {
      let chartConfig = {};
      let labels = [];
      let residualsData = [];
      if (chartData) {
        labels = Object.keys(chartData);
        residualsData = Object.values(chartData);
      }
      chartConfig = {
        labels,
        datasets: [
          {
            label: "Standard Deviation of Predicted Values",
            backgroundColor: "rgb(0, 131, 143)",
            data: residualsData,
          },
        ],
        borderWidth: 3,
      };
      return chartConfig;
    },
    getNitrateLevelsIDWFillColor(feature) {
      const {
        properties: { nitr_ran },
      } = feature;
      const { classBreakPoints } = this.classesNitrates;
      if (nitr_ran < classBreakPoints[0]) {
        return this.colorRamp[0];
      }
      if (nitr_ran < classBreakPoints[1]) {
        return this.colorRamp[1];
      }
      if (nitr_ran < classBreakPoints[2]) {
        return this.colorRamp[2];
      }
      if (nitr_ran < classBreakPoints[3]) {
        return this.colorRamp[3];
      }
      if (nitr_ran >= classBreakPoints[3]) {
        return this.colorRamp[4];
      }
      return "#B1B6B6";
    },
    getCancerRatesIDWFillColor(feature) {
      const {
        properties: { cancerRate },
      } = feature;
      const { classBreakPoints } = this.classesCancerRatesIDW;
      if (cancerRate < classBreakPoints[0]) {
        return this.colorRamp[0];
      }
      if (cancerRate < classBreakPoints[1]) {
        return this.colorRamp[1];
      }
      if (cancerRate < classBreakPoints[2]) {
        return this.colorRamp[2];
      }
      if (cancerRate < classBreakPoints[3]) {
        return this.colorRamp[3];
      }
      if (cancerRate >= classBreakPoints[3]) {
        return this.colorRamp[4];
      }
      return "#B1B6B6";
    },
    getCensusTractsFillColor(feature) {
      const {
        properties: { canrate },
      } = feature;
      const { classBreakPoints } = this.classesCancerRatesTracts;
      if (canrate < classBreakPoints[0]) {
        return this.colorRamp[0];
      }
      if (canrate < classBreakPoints[1]) {
        return this.colorRamp[1];
      }
      if (canrate < classBreakPoints[2]) {
        return this.colorRamp[2];
      }
      if (canrate < classBreakPoints[3]) {
        return this.colorRamp[3];
      }
      if (canrate >= classBreakPoints[3]) {
        return this.colorRamp[4];
      }
      return "#B1B6B6";
    },
    getResidualsFillColor(feature) {
      const colorRamp = ["#a6611a", "#dfc27d", "#ffffcc", "#80cdc1", "#018571"];
      const standardDev = this.standardDeviation;
      const classBreaks = [
        -2 * standardDev,
        -1 * standardDev,
        standardDev,
        2 * standardDev,
      ];
      const {
        properties: { residual },
      } = feature;

      // less than -2 standard deviations
      if (residual < classBreaks[0]) {
        return colorRamp[0];
      }
      // between -2 and -1 standard deviations
      if (residual < classBreaks[1]) {
        return colorRamp[1];
      }
      // between -1 and 1 standard deviations
      if (residual < classBreaks[2]) {
        return colorRamp[2];
      }
      // between 1 and 2 standard deviations
      if (residual < classBreaks[3]) {
        return colorRamp[3];
      }
      // greater than 2 standard deviations
      if (residual >= classBreaks[3]) {
        return colorRamp[4];
      }
      return "#B1B6B6";
    },
    resetMapView() {
      this.$refs.map.setCenter(defaultCenter);
      this.$refs.map.setZoom(defaultZoom);
    },
    setStyles(layer, defaultStyles, hightlightStyles) {
      layer.setStyle(defaultStyles);
      layer.on("mouseover", () => {
        layer.setStyle(hightlightStyles);
      });
      layer.on("mouseout", () => {
        layer.setStyle(defaultStyles);
      });
    },
    setCensusTractStyles(layer, feature) {
      const defaultStyle = {
        weight: 0.75,
        color: "#A9A9A9",
        opacity: 1,
        fillColor: this.getCensusTractsFillColor(feature),
        fillOpacity: 0.5,
      };
      const highlightStyle = {
        weight: 1.5,
        color: "rgb(124, 179, 66)",
        opacity: 0.8,
        fillColor: this.getCensusTractsFillColor(feature),
        fillOpacity: 0.25,
      };
      this.setStyles(layer, defaultStyle, highlightStyle);
    },
    setNitrateLevelsIDWStyles(layer, feature) {
      const defaultStyle = {
        weight: 0.75,
        color: "#A9A9A9",
        opacity: 1,
        fillColor: this.getNitrateLevelsIDWFillColor(feature),
        fillOpacity: 0.5,
      };
      const highlightStyle = {
        weight: 1.5,
        color: "rgb(124, 179, 66)",
        opacity: 0.8,
        fillOpacity: 0.25,
      };
      this.setStyles(layer, defaultStyle, highlightStyle);
    },
    setCancerRatesIDWStyles(layer, feature) {
      const defaultStyle = {
        weight: 0.75,
        color: "#A9A9A9",
        opacity: 1,
        fillColor: this.getCancerRatesIDWFillColor(feature),
        fillOpacity: 0.5,
      };
      const highlightStyle = {
        weight: 1.5,
        color: "rgb(124, 179, 66)",
        opacity: 0.8,
        fillOpacity: 0.25,
      };
      this.setStyles(layer, defaultStyle, highlightStyle);
    },
    setResidualsStyles(layer, feature) {
      const defaultStyle = {
        weight: 0.75,
        color: "#A9A9A9",
        opacity: 1,
        fillColor: this.getResidualsFillColor(feature),
        fillOpacity: 0.5,
      };
      const highlightStyle = {
        weight: 1.5,
        color: "rgb(124, 179, 66)",
        opacity: 0.8,
        fillOpacity: 0.25,
      };
      this.setStyles(layer, defaultStyle, highlightStyle);
    },
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    ...mapMutations({
      setDisplayStatusChart: "chart/setDisplayStatus",
    }),
  },
  mounted() {
    this.$nextTick(() => {
      easyPrint({
        title: "Print map",
        position: "topleft",
        hideControlContainer: false,
        hideClasses: ["leaflet-control-easyPrint"],
        sizeModes: ["Current", "A4Landscape"],
      }).addTo(this.$refs.map.mapObject);
    });
  },
  props: {
    height: String,
    offsetHeight: String,
    width: String,
  },
  watch: {
    wellsData() {
      this.createMarkers(this.wellsData);
    },
  },
};
</script>

<style>
/* leaflet style overrides */

.leaflet-control {
  font-family: "Muli" !important;
}

input {
  font-family: "Muli" !important;
}

.leaflet-popup-content-wrapper {
  border-radius: 0 !important;
  font-family: "Muli" !important;
  opacity: 0.95 !important;
  color: var(--v-primary-base-darken3);
}

.popup--all {
  border-radius: 10% !important;
  text-align: left;
}

/* vuetify style overrides */
.v-input--checkbox {
  margin: 0 !important;
  padding: 0 !important;
}

.v-input .v-label {
  line-height: 0.9rem !important;
  font-size: 0.9rem !important;
}

.v-input--slot {
  margin: 0 !important;
  padding: 0 !important;
}

.v-input--selection-controls__input {
  height: 0 !important;
}

/* MEDIA QUERIES */

@media only screen and (max-width: 500px) {
  .chart {
    display: none;
  }
  .leaflet-control-easyPrint {
    display: none;
  }
}

@media only screen and (max-height: 400px) {
  .legend {
    display: none;
  }
  .chart {
    display: none;
  }
}
</style>
