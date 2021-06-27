Cypress.Commands.add("check_tables_epr", (site_state) => {
    let white_list = false;
    cy.readFile("cypress/fixtures/white_list.json").then(($obj) => {
        let white_list = $obj[0]["links"].includes(site_state["url"]);
    });
    cy.get("body").then(($body, $site_state) => {
        var t = [];
        var site = site_state;
        if ($body.find("table:visible").length) {
            cy.get("div.container table > tbody").as("table_body");
            if ($body.find("td.dataTables_empty").length) {
                let td = cy.get("@table_body").find("td.dataTables_empty").then(($td) => {
                    if ($td.length != 0 && !white_list) {
                        for (let j = 0; j < $td.length; j++) {
                            site.warnings.push("Table warning: There is an empty table");
                        }
                    }
                });
            }
        } else {
            site_state.warnings = [];
        }
    })
})

Cypress.Commands.add("select_year", (alias = "GET", site_state, year_index) => {
    cy.get("body").then((main) => {
        if (main.find("div.navbar-collapse").length) {
            cy.get("div.navbar-collapse").first().get("ul.navbar-nav").first().as("header_menu");
            cy.get("@header_menu").children().eq(0).as("curr_opt").click();
            cy.get("@curr_opt").children().last().then(() => {
                cy.get("@curr_opt").children().last().children("li").not(".required").eq(year_index).click();
            });
        }
    });
})
