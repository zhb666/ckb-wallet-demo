describe("transfer", () => {
  it("transfer ckb", () => {
    // page url
    cy.visit("http://localhost:3000/transfer-demo2");

    window.localStorage.setItem(
      "privKey",
      "0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40"
    );

    const key =
      "0x913a1d234419e401db40a8821ac4ba9f4d54f99e977f7857e8768887e4eccd40";
    // get element click
    cy.get("#private-key").type(key);
  });
});
