<template>
  <div>
    <MapComponent height="100" loading="loading" offsetHeight="50" width="100" />
  </div>
</template>

<script>
// @ is an alias to /src
import MapComponent from "@/components/MapComponent.vue";

export default {
  name: "home",
  components: {
    MapComponent,
  },
};
</script>
