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
        <l-control-scale position="bottomleft"></l-control-scale>
        <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

        <div>
          <l-marker
            v-for="(item, index) in markersArray"
            v-bind:item="item"
            v-bind:index="index"
            v-bind:key="index"
            :lat-lng="item"
          >
            <l-popup>
              <div>
                <strong>Nitrate Rate</strong>
                : {{item.props.nitr_ran}}
              </div>
            </l-popup>
          </l-marker>
        </div>
        <l-control-zoom position="topright"></l-control-zoom>
        <l-control position="topleft">
          <v-btn dark color="primary" @click="resetMapView">
            <v-icon>home</v-icon>
          </v-btn>
        </l-control>
      </l-map>
    </v-layout>
  </div>
</template>

<script>
const defaultCenter = [44.6656476, -90.2436474];
const defaultZoom = 6;

export default {
  name: "MapComponent",
  computed: {
    // exampleGeoJSON() {
    //   return this.$store.state.example.exampleGeoJSON;
    // },
    wellsData() {
      return this.$store.state.wells.data;
    },
  },
  async created() {
    this.loading = true;
    // await this.$store.dispatch("example/getExampleGeoJSON");
    await this.$store.dispatch("wells/getData");
    this.loading = false;
    this.createMarkers(this.wellsData);
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
    };
  },
  methods: {
    zoomUpdated(zoom) {
      this.zoom = zoom;
    },
    centerUpdated(center) {
      this.center = center;
    },
    createMarkers() {
      const markersArray = this.wellsData["features"].map(feature => {
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
};
</script>







