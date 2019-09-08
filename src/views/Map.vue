<template>
  <div>
    <v-card class="info" dark>
      <v-card-text>
        <div>Center: {{ center }}</div>
        <div>Zoom: {{ zoom }}</div>
        <div>Bounds: {{ bounds }}</div>
      </v-card-text>
    </v-card>
    <v-layout>
      <v-flex>
        <l-map
          ref="map"
          style="height: calc(50vh - 25px); width: 100%"
          :zoom="zoom"
          :center="center"
          @update:zoom="zoomUpdated"
          @update:center="centerUpdated"
          @update:bounds="boundsUpdated"
        >
          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
          <l-marker
            v-for="(item, index) in markersArray"
            v-bind:item="item"
            v-bind:index="index"
            v-bind:key="index"
            :lat-lng="item"
          >
            <l-popup>
              <div>
                <strong>name</strong>
                : {{item.props.first_name}} {{item.props.last_name}}
              </div>
              <div>
                <strong>favorite color:</strong>
                {{item.props.favorite_color}}
              </div>
            </l-popup>
          </l-marker>
        </l-map>
      </v-flex>
    </v-layout>

    <v-card>
      <v-list one-line>
        <template v-for="(item, index) in exampleList">
          <v-subheader v-if="item.user_name" :key="item.user_name">{{ item.username }}</v-subheader>
          <v-list-item :key="item.user_name">
            <v-list-item-content>
              <v-list-item-title>
                {{ index + 1 }}.
                <span v-html="item.last_name"></span>,&nbsp;
                <span v-html="item.first_name"></span>
              </v-list-item-title>
              <v-list-item-title>Favorite color: {{ item.favorite_color}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </div>
</template>

<script>
const defaultCenter = [45.5155, -122.6793];
const defaultZoom = 3;

export default {
  computed: {
    exampleList() {
      return this.$store.state.example.exampleList;
    },
    exampleGeoJSON() {
      return this.$store.state.example.exampleGeoJSON;
    },
  },
  async created() {
    await this.$store.dispatch("example/getExampleList");
    await this.$store.dispatch("example/getExampleGeoJSON");
    this.createMarkers(this.exampleGeoJSON);
  },
  data() {
    return {
      url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: defaultZoom,
      center: defaultCenter,
      bounds: null,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
    boundsUpdated(bounds) {
      this.bounds = bounds;
    },
    createMarkers() {
      const markersArray = this.exampleGeoJSON["features"].map(feature => {
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
  },
};
</script>
