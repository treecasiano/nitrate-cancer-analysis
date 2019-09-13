describe("Well Point Locations", () => {
  const markersArray = ".leaflet-marker-pane img";

  beforeEach(() => {
    cy.visit("/");
  });

  it.skip("Displays markers with popups on a map", () => {
    cy.get(markersArray)
      .first()
      .click();
    cy.contains("Nitrate Rates").should("be.visible");
  });
});
