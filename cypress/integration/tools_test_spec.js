describe("Checking tools", () => {
    var site_state = [{
        date: "",
        username: "",
        results: [],
        cons_failed_pages: 0,
        app_status: ""
    }];
    var links_path = "cypress/fixtures/tools_links.json";
    var base = "https://icms.cern.ch/tools/";
    var user_path = "cypress/fixtures/users.json";
    var out_path = "data/tools_out.json";
    var out_path_light = "data/tools_out_surf.json";
    var user_index = 0;
    var page_fail_limit = 5;
    var page_fails = 0;
    var n = 34;
    var start = 0;
    var env = Cypress.env()["flags"]
    var login = env["login"];
    var password = env["password"];
    var mode = env["mode"];
    if (mode == "light") {
        var site_state = [{
            date: "",
            username: "",
            results: [],
            cons_failed_pages: 0,
            app_status: ""
        }];
        for (var j = 0; j < n; j++) {
            site_state[0].results.push({
                url: "",
                warnings: [],
                errors: [],
                state: "OK"
            });
        }
    } else {
        var site_state = [{
            date: "",
            username: "",
            results: [],
            cons_failed_pages: 0,
            app_status: ""
        }];
        for (var j = 0; j < n; j++) {
            site_state[0].results.push({
                url: "",
                status: 0,
                duration: 0,
                load_time: 0,
                warnings: [],
                errors: [],
                state: "OK"
            });
        }
    }
    for (let k = 0; k < n; k++) {
        it("Logs in and tests the pages", () => {
            cy.server();
            site_state[0].date = Cypress.moment().format("MM-DD-YYYY, h:mm");
            //cy.listen_fails(site_state, k, base, links_path, out_path);
            cy.route({
        	url:"https://icms.cern.ch/tools-api/**", //url: "**/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[k].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("gets");

            cy.readFile(links_path).then(($link_obj) => {
                let links = $link_obj[0]["links"];
                let link = links[k + start];
                site_state[0].results[k].url = link;
                if (mode == "light") {
                    cy.visit(link);
                    site_state[0].username = login;
                    cy.login(login, password);
		    cy.wait_for_requests("@gets");
		    cy.wait(6000);
                } else if(mode == "entire") {
                    cy.get_stat_dur(link, site_state, k, page_fail_limit);
                    site_state[0].results[k].load_time = performance.now();
                    cy.visit(link);
                    site_state[0].username = login;
                    cy.login(login, password);
                    cy.wait_for_requests("@gets");
                    cy.wait(4000);
                    cy.get_load_time(site_state[0].results[k])
                }
                cy.check_tables(site_state[0].results[k]);
            });
            if (mode == "light") {
                cy.writeFile(out_path_light, site_state);
                cy.save_data(site_state[0].results[k], base, mode = mode);
            } else {
                cy.writeFile(out_path, site_state);
                cy.save_data(site_state[0].results[k], base);
            }
            console.log(site_state);
        })
    }
});