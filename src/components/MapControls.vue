<template>
  <v-card>
    <v-navigation-drawer v-model="drawer" :mini-variant.sync="mini" permanent>
      <template v-slot:prepend>
        <v-list-item v-if="mini">
          <v-btn icon @click.stop="mini = !mini">
            <v-icon>mdi-layers</v-icon>
          </v-btn>
        </v-list-item>
        <v-list-item v-if="!mini">
          <v-btn small icon @click.stop="mini = !mini">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item>
        <v-container v-if="!mini">
          <v-layout>
            <v-flex>
              <v-divider class="mb-3"></v-divider>
              <v-checkbox
                v-model="wellsDisplayStatus"
                :label="`Well Locations`"
                data-cy="checkbox--wells"
                color="primary"
              ></v-checkbox>
              <v-checkbox
                v-model="tractsDisplayStatus"
                :label="`Census Tracts`"
                data-cy="checkbox--tracts"
                color="primary"
              ></v-checkbox>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
import { mapMutations } from "vuex";

export default {
  computed: {
    tractsDisplayStatus: {
      get() {
        return this.$store.state.tracts.displayStatus;
      },
      set(value) {
        this.displayTracts(value);
      },
    },
    wellsDisplayStatus: {
      get() {
        return this.$store.state.wells.displayStatus;
      },
      set(value) {
        this.displayWells(value);
      },
    },
  },
  data() {
    return {
      drawer: true,
      mini: true,
    };
  },
  methods: {
    ...mapMutations({
      displayTracts: "tracts/setDisplayStatus",
      displayWells: "wells/setDisplayStatus",
    }),
  },
};
</script>

<style>
/* vuetify style overrides */

.v-input--checkbox {
  margin: 0 !important;
  padding: 0 !important;
}

.v-input--slot {
  margin: 0 !important;
  padding: 0 !important;
}
</style>

