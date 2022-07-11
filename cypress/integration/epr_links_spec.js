describe('Getting the epr links', () => {
    let links = [];
    let user_path = "cypress/fixtures/users.json";
    let base = "https://icms.cern.ch/epr/"
    it("Getting the links", () => {
        cy.visit(base);
	let env = Cypress.env()["flags"]
        let login = env["login"];
        let password = env["password"];
	cy.login(login, password);
        cy.wait(1000);
        cy.get("div.navbar-collapse").first().get("ul.navbar-nav").first().as("header_menu");
        cy.get("@header_menu").children().each(($j, index0, $jdiv) => {
            cy.log("index is -> ", index0);
            cy.get("@header_menu").children().eq(index0).as("curr_opt").click();
            cy.wait(1000);
            if (index0 == 3 || index0 == 1 || index0 == 2 || index0 == 4) {
                cy.get("@curr_opt").children().last().then(() => {
                    cy.get("@curr_opt").children().last().children("li").not(".required").children("a").each(($a, index1, $ah) => {
                        if ($a[0].href != "") {
                            links.push($a[0].href);
                        }
                    });
                });
            }
            cy.wait(1000);
            if (index0 == 3) {
                cy.get("@curr_opt").get(".dropdown-menu").as("drop");
                cy.get("@drop").get(".dropdown-submenu").as("add_drop").each(($d, index2, $divs) => {
                    cy.get("@add_drop").eq(index2).click().trigger("mouseon");
                    cy.get("@add_drop").eq(index2).children().last().children("li").not(".required").children("a").each(($i, index3, $adiv) => {
                        if ($i[0].href != "") {
                            links.push($i[0].href);
                        }
                    });
                });
            }
        });
        cy.writeFile("cypress/fixtures/epr_links.json", [{
            "links": links
        }]);
        console.log(links);
    });
})
