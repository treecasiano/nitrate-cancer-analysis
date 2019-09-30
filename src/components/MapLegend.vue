<template>
  <v-container>
    <div class="legendTitle">LEGEND</div>
    <v-container class="legendPoint__container">
      <v-row justify="end">
        <v-col cols="1" align-self="center">
          <div class="legendPoint"></div>
        </v-col>
        <v-col cols="10">Nitrate Sample Locations</v-col>
      </v-row>
    </v-container>
    <v-container v-if="tracts || tractsIDW || wellsIDW">
      <v-row no-gutters justify="center">
        <v-col cols="2">
          <div class="legendClass idwLegendClass-1"></div>
        </v-col>
        <v-col cols="2">
          <div class="legendClass idwLegendClass-2"></div>
        </v-col>
        <v-col cols="2">
          <div class="legendClass idwLegendClass-3"></div>
        </v-col>
        <v-col cols="2">
          <div class="legendClass idwLegendClass-4"></div>
        </v-col>
        <v-col cols="2">
          <div class="legendClass idwLegendClass-5"></div>
        </v-col>
        <v-col cols="12">
          <div>Low ------- High</div>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-if="residuals">
      <v-row no-gutters justify="center">
        <v-col cols="2">
          <div class="legendClass residualsLegendClass-1"></div>
          <div>-2.5</div>
        </v-col>
        <v-col cols="2">
          <div class="legendClass residualsLegendClass-2"></div>
          <div>-1.5</div>
        </v-col>
        <v-col cols="2">
          <div class="legendClass residualsLegendClass-3"></div>
          <div>-0.5</div>
        </v-col>
        <v-col cols="2">
          <div class="legendClass residualsLegendClass-3"></div>
          <div>0.5</div>
        </v-col>
        <v-col cols="2">
          <div class="legendClass residualsLegendClass-4"></div>
          <div>1.5</div>
        </v-col>
        <v-col cols="2">
          <div class="legendClass residualsLegendClass-5"></div>
          <div>2.5</div>
        </v-col>
        <v-col cols="12">Standard Deviation Breakpoints</v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  computed: {
    ...mapState({
      residuals: state => state.residuals.displayStatus,
      tracts: state => state.tracts.displayStatus,
      tractsIDW: state => state.tracts.displayStatusIDW,
      wells: state => state.wells.displayStatus,
      wellsIDW: state => state.wells.displayStatusIDW,
    }),
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style>
.legendPoint {
  border-radius: 50%;
  background: rgb(0, 131, 143);
  height: 10px;
  width: 10px;
}

.legendPoint__container {
  margin-bottom: -20px;
}

.legendClass {
  height: 30px;
  margin: 0;
  padding: 0;
}

.legendTitle {
  margin-bottom: -20px;
}

.idwLegendClass-1 {
  background: #ffffcc;
}
.idwLegendClass-2 {
  background: #a1dab4;
}
.idwLegendClass-3 {
  background: #41b6c4;
}
.idwLegendClass-4 {
  background: #2c7fb8;
}
.idwLegendClass-5 {
  background: #253494;
}

.residualsLegendClass-1 {
  background: #a6611a;
}
.residualsLegendClass-2 {
  background: #dfc27d;
}
.residualsLegendClass-3 {
  background: #f5f5f5;
}
.residualsLegendClass-4 {
  background: #80cdc1;
}
.residualsLegendClass-5 {
  background: #018571;
}
</style>
