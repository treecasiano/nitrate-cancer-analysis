describe("Example", () => {
  const markersArray = ".leaflet-marker-pane img";

  beforeEach(() => {
    cy.visit("/");
  });

  it("Displays 7 markers with popups on a map", () => {
    cy.get(markersArray).should("have.length", 7);
    cy.get(markersArray)
      .first()
      .click();
    cy.contains("Tereza Averescu").should("be.visible");
    cy.get(markersArray)
      .eq(1)
      .click();
    cy.contains("Roberto Serra").should("be.visible");
    cy.contains("Tereza Averescu").should("not.be.visible");
  });
});
