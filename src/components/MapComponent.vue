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
        <l-control position="topleft">
          <MapControls />
        </l-control>
        <l-control-scale position="bottomleft"></l-control-scale>
        <l-control position="topright">
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
            :radius="5"
            :color="wellDataColor"
            :fillColor="wellDataFillColor"
            :weight="1"
            :opacity="1"
            :fillOpacity="1"
          >
            <l-popup>
              <div>
                <strong>Nitrate Rate</strong>
                : {{item.props.nitr_ran}}
              </div>
            </l-popup>
          </l-circle-marker>
        </div>
        <div v-if="displayTracts">
          <l-geo-json :geojson="tractsData" :options="options" :options-style="styleFunction"></l-geo-json>
        </div>
        <l-control-zoom position="bottomright"></l-control-zoom>
      </l-map>
    </v-layout>
  </div>
</template>

<script>
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

export default {
  name: "MapComponent",
  components: {
    MapControls,
  },
  computed: {
    options() {
      return {
        onEachFeature: this.onEachFeatureFunction,
      };
    },
    styleFunction() {
      return () => {
        return defaultStyle;
      };
    },
    onEachFeatureFunction() {
      return (feature, layer) => {
        const popupContent = this.createCensusTractContent(feature.properties);
        this.setDefaultStyles(layer, feature);
        layer.bindPopup(popupContent, {
          permanent: false,
          sticky: true,
          className: "popup--census",
        });
      };
    },
    ...mapState({
      displayTracts: state => state.tracts.displayStatus,
      displayWells: state => state.wells.displayStatus,
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
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
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
      wellDataFillColor: "#FF5733",
    };
  },
  methods: {
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    centerUpdated(center) {
      this.center = center;
    },
    createCensusTractContent(props) {
      console.log(props);
      let propertyString = `Cancer Rate: ${props.canrate}`;
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
    boundsUpdated(bounds) {
      this.bounds = bounds;
    },
    resetMapView() {
      this.$refs.map.setCenter(defaultCenter);
      this.$refs.map.setZoom(defaultZoom);
    },
    setDefaultStyles(layer, feature) {
      layer.setStyle(defaultStyle);
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
.popup--census {
  border-radius: 0 !important;
  text-align: left;
  color: var(--v-primary-darken3) !important;
}
</style>




