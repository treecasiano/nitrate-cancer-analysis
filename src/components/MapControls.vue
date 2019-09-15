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
          <v-list-item-title>Map Controls</v-list-item-title>

          <v-btn icon @click.stop="mini = !mini">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-list-item>
        <v-container v-if="!mini">
          <v-layout>
            <v-flex>
              <v-divider></v-divider>
              <v-checkbox
                v-model="wellsDisplayStatus"
                :label="`Well Locations`"
                data-cy="checkbox--wells"
              ></v-checkbox>
            </v-flex>
          </v-layout>
        </v-container>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  computed: {
    wellsDisplayStatus: {
      get() {
        const displayStatus = this.$store.state.wells.displayStatus;
        console.log("displayStatus", displayStatus);
        return this.$store.state.wells.displayStatus;
      },
      set(value) {
        console.log("value", value);
        this.displayWells(value);
      },
    },
  },
  data() {
    return {
      drawer: true,
      mini: false,
    };
  },
  methods: {
    ...mapMutations({
      displayWells: "wells/setDisplayStatus",
    }),
  },
};
</script>

