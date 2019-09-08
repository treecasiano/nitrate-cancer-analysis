<template>
  <div>
    <MainHeading />
    <MapComponent height="90" loading="loading" offsetHeight="100" width="100" />
  </div>
</template>

<script>
// @ is an alias to /src
import MainHeading from "@/components/MainHeading.vue";
import MapComponent from "@/components/MapComponent.vue";

export default {
  name: "home",
  components: {
    MainHeading,
    MapComponent,
  },
};
</script>
