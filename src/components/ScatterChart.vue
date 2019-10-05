<script>
import { Scatter, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;
export default {
  extends: Scatter,
  mixins: [reactiveProp],
  props: ["chartdata", "options", "legendId"],
  mounted() {
    // http://www.chartjs.org/docs/latest/#creating-a-chart
    // this.chartData is created in the mixin
    // to pass in options, create a local options object
    this.renderChart(this.chartData, this.options);
  },
  watch: {
    chartData() {},
  },
};
</script>
