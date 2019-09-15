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

export default {
  name: "MapComponent",
  components: {
    MapControls,
  },
  computed: {
    wellsData() {
      return this.$store.state.wells.data;
    },
    wellsDataLoading() {
      return this.$store.state.wells.loading;
    },
    ...mapState({
      displayWells: state => state.wells.displayStatus,
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







