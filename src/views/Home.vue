<template>
  <div>
    <HelloWorld />
    <h2 class="my-3">Example Map Component</h2>
    <MapComponent height="50" loading="loading" offsetHeight="100" width="100" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import MapComponent from "@/components/MapComponent.vue";

export default {
  name: "home",
  components: {
    HelloWorld,
    MapComponent,
  },
};
</script>
