import configData from "../fixtures/tools_page_data.json";

describe("Checking tools", () => {
    /*|------------------------------------<|       Paths       |>------------------------------------------------|*/
    var links_path      = "cypress/fixtures/tools_links.json";
    var base            = "https://icms.cern.ch/tools/";
    var profile         = "https://icms.cern.ch/tools/user/profile";
    var out_path_lite   = "data/tools_out_surf.json";
    var out_path        = "data/tools_out.json";
    var INPUT_DATA = configData;
    /*|-----------------------------------------------------------------------------------------------------------|*/
    var page_fail_limit = 5;
    var page_fails = 0;
    var start = 0;
    var n = 35;
    /*|-----------------------------------------------------------------------------------------------------------|*/
    var env = Cypress.env()["flags"]
    var login = env["login"];
    var password = env["password"];
    var mode = env["mode"];
    var isadmin = env["isAdmin"] == "true";
    /*|-----------------------------------------------------------------------------------------------------------|*/

    if (mode == "lite") {
        var site_state = [{
            date: "",
            username: "",
            isAdmin: isadmin,
            results: [],
            cons_failed_pages: 0,
            app_status: "",
        }];
        for (var j = 0; j < n; j++) {
            site_state[0].results.push({
                url: "",
                warnings: [],
                errors: [],
                state: "OK",
            });
        }
    } else {
        var site_state = [{
            date: "",
            username: "",
            isAdmin: isadmin,
            results: [],
            cons_failed_pages: 0,
            app_status: "",
        }];
        for (var j = 0; j < n; j++) {
            site_state[0].results.push({
                url: "",
                status: 0,
                duration: 0,
                load_time: 0,
                warnings: [],
                errors: [],
                state: "OK",
            });
        }
    }

    Cypress.Cookies.defaults({
	preserve: ['session', '_saml_idp', 'AUTH_SESSION_ID_LEGACY', 'KC_RESTART', 'AUTH_SESSION_ID', 'KEYCLOAK_IDENTITY', 'KEYCLOAK_IDENTITY_LEGACY', 'KEYCLOAK_SESSION_LEGACY', 'KEYCLOAK_SESSION', '_ga']
    })

    before(() => {
	cy.visit(base);
	cy.login(login, password);
    })
/*
    beforeEach(() => {
	cy.getCookies();
    })
*/
    for (let k = 0; k < n; k++) {
        it("Logs in and tests the pages in '" + mode + "' mode.", () => {
            cy.server();
            site_state[0].date = Cypress.moment().format("MM-DD-YYYY, h:mm");
            // cy.listen_fails(site_state, k, base, links_path, out_path);
            // ############################################### Requests #####################################################
            cy.intercept({
                url: "https://auth.cern.ch/auth/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[k].errors.push("GET request error (authentification) : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("auth");
            cy.route({
                url: "**/tools-api/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[k].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("gets");
            cy.route({
                method: "POST",
                url: "**/tools-api/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[k].errors.push("POST request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("posts");
            cy.route({
                method: "POST",
                url: "**/restplus/relay/piggyback/people/statuses/requests/",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[k].errors.push("POST request error (Em-nominations) : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("em_nom");
            cy.route({
                method: "PUT",
                url: "**/tools-api/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[k].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("puts");
            cy.route({
                method: "DELETE",
                url: "**/tools-api/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[k].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("deletes");

	    // ##############################################################################################################

            cy.readFile(links_path).then(($link_obj) => {
                let links = $link_obj[0]["links"];
                let link = links[k + start];
                site_state[0].results[k].url = link;
                if (mode == "lite") {
                    cy.visit(link);
                    site_state[0].username = login;
                    //cy.login(login, password);
                    //cy.wait_for_requests("@auth");
                    cy.wait_for_requests("@gets");
                    cy.wait(3000);
                    cy.check_tables(site_state[0], k);
                    if (link == profile) {
                        cy.check_profile_dashboard(site_state[0], k, base);
                        cy.check_logo_reference(site_state[0], base);
                    } else if (link == base) {
                        cy.check_dashboard(site_state[0], k, INPUT_DATA["dashboard_data"]);
                    } else if (link == base + "collaboration/units") {
                        cy.check_units(site_state[0], k, INPUT_DATA["units_data"]);
                    } else if (link == base + "collaboration/institutes") {
                        cy.check_institutes(site_state[0], k);
                    } else if (link == base + "collaboration/people") {
                        cy.check_people(site_state[0], k);
                    } else if (link == base + "collaboration/mo-list") {
                        cy.check_mo_list(site_state[0], k);
                    } else if (link == base + "collaboration/emeritus-nominations") {
                        cy.check_em_nominations(site_state[0], k);
                    } else if (link == base + "collaboration/statistics") {
                        cy.check_statistics(site_state[0], k);
                    } else if (link == base + "collaboration/flags") {
                        cy.check_flags(site_state[0], k, INPUT_DATA["flags_data"]);
                    } else if (link == base + "collaboration/cms-weeks/rooms") {
                        cy.check_rooms(site_state[0], k, INPUT_DATA["rooms_data"]);
                    } else if (link == base + "collaboration/cms-weeks/weeks") {
                        cy.check_weeks(site_state[0], k, INPUT_DATA["weeks_data"]);
                    } else if (link == base + "institute/overdue-graduations") {
                        cy.check_over_graduation(site_state[0], k);
                    } else if (link == base + "collaboration/tenures") {
                        cy.check_tenures(site_state[0], k, INPUT_DATA["tenures_data"]);
                    } /*else if (link == base + "publications/cadi/lines") {
                        cy.check_CADI_lines(site_state[0], k, INPUT_DATA["CADI_lines"]);
                    }*/
                } else if (mode == "entire") {
                    cy.get_stat_dur(link, site_state, k, page_fail_limit);
                    site_state[0].results[k].load_time = performance.now();
                    cy.visit(link);
                    site_state[0].username = login;
                    //cy.login(login, password);
                    //cy.wait_for_requests("@auth");
                    cy.wait_for_requests("@gets");
                    cy.wait(3000);
                    cy.get_load_time(site_state[0].results[k]);
                    cy.check_tables(site_state[0], k);
                    if (link == profile) {
                        cy.check_profile_dashboard(site_state[0], k, base);
                        cy.check_logo_reference(site_state[0], base);
                    } else if (link == base) {
                        cy.check_dashboard(site_state[0], k, INPUT_DATA["dashboard_data"]);
                    } else if (link == base + "collaboration/units") {
                        cy.check_units(site_state[0], k, INPUT_DATA["units_data"]);
                    } else if (link == base + "collaboration/institutes") {
                        cy.check_institutes(site_state[0], k);
                    } else if (link == base + "collaboration/people") {
                        cy.check_people(site_state[0], k);
                    } else if (link == base + "collaboration/mo-list") {
                        cy.check_mo_list(site_state[0], k);
                    } else if (link == base + "collaboration/emeritus-nominations") {
                        cy.check_em_nominations(site_state[0], k);
                    } else if (link == base + "collaboration/statistics") {
                        cy.check_statistics(site_state[0], k);
                    } else if (link == base + "collaboration/flags") {
                        cy.check_flags(site_state[0], k, INPUT_DATA["flags_data"]);
                    } else if (link == base + "collaboration/cms-weeks/rooms") {
                        cy.check_rooms(site_state[0], k, INPUT_DATA["rooms_data"]);
                    } else if (link == base + "collaboration/cms-weeks/weeks") {
                        cy.check_weeks(site_state[0], k, INPUT_DATA["weeks_data"]);
                    } else if (link == base + "institute/overdue-graduations") {
                        cy.check_over_graduation(site_state[0], k);
                    } else if (link == base + "collaboration/tenures") {
                        cy.check_tenures(site_state[0], k, INPUT_DATA["tenures_data"]);
                    } /*else if (link == base + "publications/cadi/lines") {
                        cy.check_CADI_lines(site_state[0], k, INPUT_DATA["CADI_lines"]);
                    }*/
                }
            });
            if (mode == "lite") {
                // cy.writeFile(out_path_lite, site_state);
                cy.task("writeFile", {path: out_path_lite, data: site_state});
                cy.save_data(site_state[0].results[k], base, mode = mode);
            } else {
                // cy.writeFile(out_path, site_state);
                cy.task("writeFile", {path: out_path, data: site_state});
                cy.save_data(site_state[0].results[k], base);
            }
            console.log(site_state);
        })
    }
});
