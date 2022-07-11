describe("Checking epr", () => {
    let y = 2;
    let years = [2015, 2016, 2017, 2018, 2019, 2020, 2021];
    let links_path = "cypress/fixtures/epr_links.json";
    let base = "https://icms.cern.ch/epr/";
    let page_fail_limit = 10;
    let env = Cypress.env()["flags"];
    let login    = env["login"];
    let password = env["password"];
    let isadmin  = env["isAdmin"] == "true";
    /*|-----------------------------------------------------------------------------------------------------------|*/
    let n = 336;
    let job = 1;
    it('Wait for its turn.', () => {
        cy.wait(10000 * 2)
    });
    let start = 2;
    let end = n;
    let total = n;
    let step = 3;
    let out_path = 'data/epr_output/epr_out_' + 2 + '.json';
    // let out_path = "data/epr_out/epr_out_" + String(id) + ".json";
    let check_string = "Logs in and tests the 'epr' pages.";

    let site_state = [{
        date: "",
        username: "",
        isAdmin: isadmin,
        results: [],
        cons_failed_pages: 0,
        app_status: ""
    }];
    for (let j = job; j < n; j+=step) {
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

    Cypress.Cookies.defaults({
        preserve: ['session', '_saml_idp', 'AUTH_SESSION_ID_LEGACY', 'KC_RESTART', 'AUTH_SESSION_ID', 'KEYCLOAK_IDENTITY', 'KEYCLOAK_IDENTITY_LEGACY', 'KEYCLOAK_SESSION_LEGACY', 'KEYCLOAK_SESSION', '_ga']
    })

    before(() => {
        cy.visit(base);
        cy.login(login, password);
    })

    for (let k = job, j = 0; k < n; k+=step, j++) {
        it(check_string, () => {
            cy.server();
            site_state[0].date = Cypress.moment().format("MM-DD-YYYY, h:mm");
            cy.listen_fails(site_state, j, base, links_path, out_path);
            cy.route({
                method: 'POST',
                url: 'https://icms.cern.ch/**',
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[j].errors.push("POST request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as('posts');
            cy.route({
                method: 'GET',
                url: 'https://icms.cern.ch/epr/**',
                onResponse: (xhr) => {
                    if (xhr.status <= 600 && xhr.status >= 400) {
                        site_state[0].results[j].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);
                    }
                }
            }).as('gets');
            /*cursor: default'*/
            cy.find_popup_alerts(site_state[0].results[j]);
            cy.readFile(links_path).then(($link_obj) => {
                let links = $link_obj[0]["links"];
                let link = links[k];
                site_state[0].results[j].url = link;
                cy.visit(link);
                site_state[0].username = login;
                cy.wait_for_requests("@posts");
                site_state[0].results[j].load_time = performance.now();
                cy.select_year("@posts", site_state[0].results[j], y);
                cy.get('body', {
                    timeout: 60000
                }).should('have.css', 'cursor').and('match', /default/);
                cy.get_load_time(site_state[0].results[j]);
                cy.get_stat_dur(link, site_state, j, page_fail_limit);
                cy.check_tables_epr(site_state[0].results[j]);
            });
            cy.writeFile(out_path.split(".json")[0]+"_"+String(years[y])+".json", site_state);
            cy.save_data(site_state[0].results[j], base, "", years[y]);
            console.log(site_state);
            if (k == (n - 1)) {
               cy.clearCookies();
            }
        });
    }
});
