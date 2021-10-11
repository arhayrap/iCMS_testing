describe("Checking epr", () => {
    var y = 6;
    var years = [2015, 2016, 2017, 2018, 2019, 2020, 2021];
    var n = 334;
    var start = 0;
    var links_path = "cypress/fixtures/epr_links.json";
    var base = "https://icms.cern.ch/epr/";
    var out_path = "data/epr_out";
    var out_path_lite = "data/epr_out_surf";
    var page_fail_limit = 10;
    var env = Cypress.env()["flags"];
    var login    = env["login"];
    var password = env["password"];
    var mode     = env["mode"];
    var isadmin  = env["isAdmin"] == "true";
    if (mode == "lite") {
        var check_string = "Logs in and visits the page in 'lite' mode";
        var site_state = [{
            date: "",
            username: "",
	    isAdmin: isadmin,
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
        var check_string = "Logs in and visits the page in 'entire' mode";
        var site_state = [{
            date: "",
            username: "",
	    isAdmin: isadmin,
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
        it(check_string, () => {
            cy.server();
            site_state[0].date = Cypress.moment().format("MM-DD-YYYY, h:mm");
            cy.listen_fails(site_state, k, base, links_path, out_path);
            cy.route({
                method: 'POST',
                url: 'https://icms.cern.ch/**',
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[k].errors.push("POST request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as('posts');
            cy.route({
                method: 'GET',
                url: 'https://icms.cern.ch/epr/**',
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[k].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as('gets');
	    /*cursor: default'*/
            cy.find_popup_alerts(site_state[0].results[k]);
            cy.readFile(links_path).then(($link_obj) => {
                let links = $link_obj[0]["links"];
                let link = links[k + start];
                site_state[0].results[k].url = link;
                cy.visit(link);
                site_state[0].username = login;
                cy.login(login, password);
                cy.wait_for_requests("@posts");
                if (mode == "lite") {
                    cy.select_year("@posts", site_state[0].results[k], y);
                    cy.get('body', { 
                        timeout: 60000
                    }).should('have.css', 'cursor').and('match', /default/);
                    cy.get_stat_dur_lite(link, site_state, k, page_fail_limit);
                } else {
                    site_state[0].results[k].load_time = performance.now();
                    cy.select_year("@posts", site_state[0].results[k], y);
		    cy.get('body', { 
                        timeout: 60000
                    }).should('have.css', 'cursor').and('match', /default/);
                    cy.get_load_time(site_state[0].results[k]);
                    cy.get_stat_dur(link, site_state, k, page_fail_limit);
                }
                cy.check_tables_epr(site_state[0].results[k]);
            });
            if (mode == "lite") {
                cy.writeFile(out_path_lite+"_"+String(years[y])+"_.json", site_state);
                cy.save_data(site_state[0].results[k], base, mode, years[y]);
            } else {
                cy.writeFile(out_path+"_"+String(years[y])+"_.json", site_state);
                cy.save_data(site_state[0].results[k], base, "", years[y]);
            }
            console.log(site_state);
        });
    }
});
