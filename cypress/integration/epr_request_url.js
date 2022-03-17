describe("Checking epr longest requests", () => {
    /*|------------------------------------<|       Paths       |>------------------------------------------------|*/
    var links_path = "cypress/fixtures/epr_links.json";
    var base       = "https://icms.cern.ch/epr/";
    var out_path   = "cypress/fixtures/epr_requests.json";
    /*|-----------------------------------------------------------------------------------------------------------|*/
    var start = 0;
    var n = 1;
    /*|-----------------------------------------------------------------------------------------------------------|*/
    var env      = Cypress.env()["flags"]
    var isadmin  = env["isAdmin"];
    var login    = env["login"];
    var password = env["password"];
    /*|-----------------------------------------------------------------------------------------------------------|*/

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
            link: "",
            dur: ""
        });
    }

    Cypress.Cookies.defaults({
	preserve: ['session', '_saml_idp', 'AUTH_SESSION_ID_LEGACY', 'KC_RESTART', 'AUTH_SESSION_ID', 'KEYCLOAK_IDENTITY', 'KEYCLOAK_IDENTITY_LEGACY', 'KEYCLOAK_SESSION_LEGACY', 'KEYCLOAK_SESSION', '_ga']
    })

    before(() => {
	cy.visit(base);
	cy.login(login, password);
    })

    for (let k = 0; k < n; k++) {
        let durations = [];
        let duration = -100;
        it("Logs in selects the longest request url.", () => {
            cy.server();
            site_state[0].date = Cypress.moment().format("MM-DD-YYYY, h:mm");
            // cy.listen_fails(site_state, k, base, links_path, out_path);
            // ############################################### Requests #####################################################
            // cy.intercept({url: "https://auth.cern.ch/auth/**"}).as("auth");
            cy.route({
                method: 'POST',
                url: 'https://icms.cern.ch/**',
                onResponse: (xhr) => {
		    if (xhr.duration > duration){
			duration = xhr.duration;
			console.log(xhr.duration);
			console.log(xhr.url)
			if (xhr.url.split("?").length > 1){
			    site_state[0].results[k].link = xhr.url.split("?")[0] + "**";
			} else {
			    site_state[0].results[k].link = xhr.url;
			}
			site_state[0].results[k].dur  = xhr.duration;
		    }
                }
            }).as("posts");
	    // ##############################################################################################################
            cy.readFile(links_path).then(($link_obj) => {
                let links = $link_obj[0]["links"];
                let link = links[k + start];
                site_state[0].results[k].url = link;
                cy.visit(link);
                site_state[0].username = login;
                cy.wait_for_requests("@posts", {timeout: 60000});
		cy.wait(4000);
            });
            cy.writeFile(out_path, site_state);
            console.log(site_state);
        })
    }
});
