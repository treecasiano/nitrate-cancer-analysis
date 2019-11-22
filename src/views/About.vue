<template>
  <v-container class="about">
    <h1>Nitrate Levels and Cancer Rates</h1>
    <h2>Background</h2>
    <p>Nitrates are found naturally in the soil and water. Increased concentrations of nitrate levels are found in areas where nitrogren fertilizers are used. The highest nitrogen levels are found in shallow wells where runoff from industrial farming accumulates. Excess nitrate intake from food and water with high nitrate levels is known to cause cancer in animals and may also cause certain types of cancer in humans, particularly colorectal cancer.</p>
    <h2>About this Application</h2>
    <p>
      This application is one of the Capstone projects for the MS in Cartography and GIS Development program of the University of Wisconsin-Madison. A variety of JavaScript libraries have been implemented for geoprocessing, mapping, and statistical analysis tasks. (View the source code here:
      <a
        href="https://github.com/treecasiano/nitrate-cancer-analysis"
      >https://github.com/treecasiano/nitrate-cancer-analysis</a>.) Users are able to adjust the power of the interpolation (k values) and create a raster surface of the nitrate levels based on samples taken from well locations. The relationship between the independent and dependent variables (nitrate levels and cancer rates, respectively) is explored using a simple linear regression.
    </p>
    <p>The results of the linear regression are displayed in a map of the standard deviation of residuals and in two scatterplots that show the variance in the predicted values.</p>
    <h2>About the Data</h2>
    <p>Please note that the data used in this application is not real and was provided by the school. It should not be used to draw definitive conclusions about the relationship between nitrates and cancer. Also, because the cancer rates were interpolated so they could be collected into the same spatial units as the nitrates, there would be some loss of data accuracy even if the data were real. The purpose of the application is to demonstrate skill in web development and spatial analysis</p>
    <h2>About the Developer</h2>
    <p>
      <a href="http://www.treecasiano.com">Tree Casiano</a> is a software developer working for a healthcare IT company in Portland, OR.
    </p>
    <h2>Resources</h2>
    <p>
      <a
        href="https://progressreport.cancer.gov/prevention/nitrate"
      >Nitrate | Cancer Trends Progress Report</a>
    </p>
    <p>
      <a
        href="https://www.webmd.com/cancer/news/20190612/report_cancer-causing_nitrates_in_water_supply#1"
      >Report: Cancer-Causing Nitrates in Water Supply</a>
    </p>
    <p>
      <a
        href="https://www.sciencedaily.com/releases/2018/02/180220095019.htm"
      >Nitrate in drinking water increases the risk of colorectal cancer, study finds</a>
    </p>
  </v-container>
</template>

<script>
export default {
  name: "about",
};
</script>
<style>
.about {
  text-align: left;
}
.about a {
  font-weight: bold;
  color: var(--v-primary-base) !important;
}
</style>

