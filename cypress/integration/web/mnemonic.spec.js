describe("wallet", () => {
  it("Verify wallet creation", () => {
    // page url
    cy.visit("http://localhost:3000/");

    // get element click
    cy.get(".home > button").click();
  });
});
