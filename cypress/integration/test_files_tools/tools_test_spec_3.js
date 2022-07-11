import configData from "../../fixtures/tools_page_data.json";
import requestData from "../../fixtures/tools_requests.json";
import linksTools from "../../fixtures/tools_links.json";
describe("Checking tools", () => {
    let links_path = "cypress/fixtures/tools_links.json";
    let base       = "https://icms.cern.ch/tools/";
    let profile    = "https://icms.cern.ch/tools/user/profile";
    let INPUT_DATA = configData;
    let page_fail_limit = 5;
    let page_fails = 0;
    let env = Cypress.env()["flags"]
    let login = env["login"];
    let password = env["password"];
    let isadmin = env["isAdmin"] == "true";
    let n = 43;
    let job = 2;
    it('Wait for its turn.', () => {
        cy.wait(10000 * 3)
    });
    let start = 3;
    let end = n;
    let total = n;
    let step = 3;
    let out_path = 'data/tools_output/tools_out_' + 3 + '.json';
    let site_state = [{
        date: "",
        username: "",
        isAdmin: isadmin,
        results: [],
        cons_failed_pages: 0,
        app_status: "",
    }];
    for (let k = job, j = 0; k < n; k+=step, j++) {
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
    Cypress.Cookies.defaults({
        preserve: ['session', '_saml_idp', 'AUTH_SESSION_ID_LEGACY', 'KC_RESTART', 'AUTH_SESSION_ID', 'KEYCLOAK_IDENTITY', 'KEYCLOAK_IDENTITY_LEGACY', 'KEYCLOAK_SESSION_LEGACY', 'KEYCLOAK_SESSION', '_ga']
    })
    before(() => {
        cy.visit(base);
        cy.login(login, password);
    })
    for (let k = job, j = 0; k < n; k+=step, j++) {
        it("Logs in and tests the 'tools' pages.", () => {
            cy.server();
            site_state[0].date = Cypress.moment().format("MM-DD-YYYY, h:mm");
            cy.listen_fails(site_state, j, base, links_path, out_path);
            cy.intercept({
                url: "https://auth.cern.ch/auth/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[j].errors.push("GET request error (authentification) : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("auth");
            cy.route({
                url: "**/tools-api/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[j].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("gets");
            cy.route({
                url: requestData[0].results[k].link,
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[j].errors.push("GET request error (main) : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("main");
            cy.route({
                method: "POST",
                url: "**/tools-api/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[j].errors.push("POST request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("posts");
            cy.route({
                method: "POST",
                url: "**/restplus/relay/piggyback/people/statuses/requests/",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[j].errors.push("POST request error (Em-nominations) : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("em_nom");
            cy.route({
                method: "PUT",
                url: "**/tools-api/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[j].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("puts");
            cy.route({
                method: "DELETE",
                url: "**/tools-api/**",
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[j].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as("deletes");
            cy.readFile(links_path).then(($link_obj) => {
                let links = $link_obj[0]["links"];
                let link = links[k];
                site_state[0].results[j].url = link;
                cy.get_stat_dur(link, site_state, j, page_fail_limit);
                site_state[0].results[j].load_time = performance.now();
                cy.visit(link);
                site_state[0].username = login;
                cy.wait_for_requests("@main", {timeout: 60000});
                cy.wait_for_requests("@gets", {timeout: 60000});
                cy.wait(1000);
                cy.get_load_time(site_state[0].results[j]);
                cy.check_tables(site_state[0], j);
                if (link == profile) {
                    cy.check_profile_dashboard(site_state[0], j, INPUT_DATA["dashboard_data"]["name_surname"]);
                    cy.check_logo_reference(site_state[0], j, INPUT_DATA["dashboard_data"]["base"]);
                } else if (link == base) {
                    cy.check_dashboard(site_state[0], j, INPUT_DATA["dashboard_data"]);
                } else if (link == base + "collaboration/units") {
                    cy.check_units(site_state[0], j, INPUT_DATA["units_data"]);
                } else if (link == base + "collaboration/institutes") {
                    cy.check_institutes(site_state[0], j);
                } else if (link == base + "collaboration/people") {
                    cy.check_people(site_state[0], j);
                } else if (link == base + "collaboration/mo-list") {
                    cy.check_mo_list(site_state[0], j);
                } else if (link == base + "collaboration/emeritus-nominations") {
                    cy.check_em_nominations(site_state[0], j);
                } else if (link == base + "collaboration/statistics") {
                    cy.check_statistics(site_state[0], j);
                } else if (link == base + "collaboration/flags") {
                    cy.check_flags(site_state[0], j, INPUT_DATA["flags_data"]);
                } else if (link == base + "collaboration/cms-weeks/rooms") {
                    cy.check_rooms(site_state[0], j, INPUT_DATA["rooms_data"]);
                } else if (link == base + "collaboration/cms-weeks/weeks") {
                    cy.check_weeks(site_state[0], j, INPUT_DATA["weeks_data"]);
                } else if (link == base + "institute/overdue-graduations") {
                    cy.check_over_graduation(site_state[0], j);
                } else if (link == base + "collaboration/tenures") {
                    cy.check_tenures(site_state[0], j, INPUT_DATA["tenures_data"]);
                } else if (link == base + "publications/cadi/lines") {
                    cy.check_CADI_lines(site_state[0], j, INPUT_DATA["CADI_lines"]);
                }
                cy.task("writeFile", {path: out_path, data: site_state, index: j});
                cy.save_data(site_state[0].results[j], base);
            });
            if (k == (n - 1)) {
               cy.clearCookies();
            }
        })
    }
});
