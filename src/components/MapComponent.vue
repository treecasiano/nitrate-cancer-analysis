<template>
  <div>
    <v-layout>
      <l-map
        ref="map"
        :zoom="zoom"
        :center="center"
        :maxZoom="maxZoom"
        @update:zoom="zoomUpdated"
        @update:center="centerUpdated"
        @update:bounds="boundsUpdated"
        :options="{zoomControl: false}"
        v-bind:style="`height: calc(${height}vh - ${offsetHeight}px); width: ${width}%;`"
      >
        <l-control position="topright">
          <MapLayers />
        </l-control>
        <l-control-scale position="bottomleft"></l-control-scale>
        <l-control position="topleft">
          <v-btn dark color="primary" @click="resetMapView">
            <v-icon>home</v-icon>
          </v-btn>
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
        <div v-if="displayTractsIDW && idwTracts.features">
          <l-geo-json :geojson="idwTracts" :options="optionsIDW" :options-style="stylesIDW"></l-geo-json>
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
        <l-control-zoom position="bottomright"></l-control-zoom>
      </l-map>
    </v-layout>
  </div>
</template>

<script>
import MapLayers from "@/components/MapLayers.vue";
import MapControls from "@/components/MapControls.vue";
import { mapState } from "vuex";

const defaultCenter = [44.6656476, -90.2436474];
const defaultZoom = 7;

const defaultStyle = {
  weight: 0.75,
  color: "#A9A9A9",
  opacity: 1,
  fillColor: "#B1B6B6",
  fillOpacity: 0.25,
};

const defaultStyleIDW = {
  weight: 0.75,
  color: "#A9A9A9",
  opacity: 1,
  fillColor: "#B1B6B6",
  fillOpacity: 0.2,
};

const highlightStyle = {
  weight: 1.5,
  color: "rgb(124, 179, 66)",
  opacity: 0.8,
  fillColor: "#B1B6B6",
  fillOpacity: 0.1,
};

const highlightStyleIDW = {
  weight: 1.5,
  color: "rgb(124, 179, 66)",
  opacity: 0.8,
  fillColor: "#B1B6B6",
  fillOpacity: 0.1,
};

export default {
  name: "MapComponent",
  components: {
    MapControls,
    MapLayers,
  },
  computed: {
    optionsCensusTracts() {
      return {
        onEachFeature: this.onEachCensusTractFeature,
      };
    },
    optionsIDW() {
      return {
        onEachFeature: this.onEachIDWFeature,
      };
    },
    optionsResiduals() {
      return {
        onEachFeature: this.onEachResidualFeature,
      };
    },
    stylesCensusTracts() {
      return () => {
        return defaultStyle;
      };
    },
    stylesIDW() {
      return () => {
        return defaultStyleIDW;
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
        this.setDefaultStyles(layer, feature);
        layer.bindPopup(popupContent, {
          permanent: false,
          sticky: true,
          className: "popup--all",
        });
      };
    },
    onEachIDWFeature() {
      return (feature, layer) => {
        const popupContent = this.createIDWContent(feature.properties);
        this.setIDWStyles(layer, feature);
        layer.bindPopup(popupContent, {
          permanent: false,
          sticky: true,
          className: "popup--all",
        });
      };
    },
    onEachResidualFeature() {
      return (feature, layer) => {
        const popupContent = this.createIDWContent(feature.properties);
        this.setResidualsStyles(layer, feature);
        layer.bindPopup(popupContent, {
          permanent: false,
          sticky: true,
          className: "popup--all",
        });
      };
    },
    ...mapState({
      displayResiduals: state => state.residuals.displayStatus,
      displayTracts: state => state.tracts.displayStatus,
      displayTractsIDW: state => state.tracts.displayStatusIDW,
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
      url:
        "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      zoom: defaultZoom,
      center: defaultCenter,
      bounds: null,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      loading: false,
      maxZoom: 18,
      markersArray: [],
      wellDataColor: "#C0C0C0",
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
      let propertyString = `<strong>Cancer Rate:</strong> ${props.canrate}`;
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
    getResidualsFillColor(feature) {
      const colorRamp = ["blue", "lightblue", "white", "pink", "red"];
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
      return "black";
    },
    resetMapView() {
      this.$refs.map.setCenter(defaultCenter);
      this.$refs.map.setZoom(defaultZoom);
    },
    setDefaultStyles(layer, feature) {
      layer.setStyle(defaultStyle);
      layer.on("mouseover", () => {
        layer.setStyle(highlightStyle);
      });
      layer.on("mouseout", () => {
        layer.setStyle(defaultStyle);
      });
    },
    setIDWStyles(layer, feature) {
      layer.setStyle(defaultStyleIDW);
      layer.on("mouseover", () => {
        layer.setStyle(highlightStyleIDW);
      });
      layer.on("mouseout", () => {
        layer.setStyle(defaultStyleIDW);
      });
    },
    setResidualsStyles(layer, feature) {
      const defaultStyleResiduals = {
        weight: 0.75,
        color: "#A9A9A9",
        opacity: 1,
        fillColor: this.getResidualsFillColor(feature),
        fillOpacity: 0.2,
      };
      const highlightStyleResiduals = {
        weight: 1.5,
        color: "rgb(124, 179, 66)",
        opacity: 0.8,
        fillColor: this.getResidualsFillColor(feature),
        fillOpacity: 0.1,
      };
      layer.setStyle(defaultStyleResiduals);
      layer.on("mouseover", () => {
        layer.setStyle(highlightStyleResiduals);
      });
      layer.on("mouseout", () => {
        layer.setStyle(defaultStyleResiduals);
      });
    },
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
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
</style>




