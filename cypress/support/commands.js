// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
Cypress.Commands.add("login", (login, password) => {
    cy.get("#kc-form-login").within(() => {
        cy.get("input[tabindex=1]").type(login);
        cy.get("input[tabindex=2]").type(password);
        cy.get("input[tabindex=4]").click();
    })
})

Cypress.Commands.add("get_stat_dur", (link, site_state, k, limit) => {
    cy.request({
        url: link,
        failOnStatusCode: false
    }).then((resp) => {
	console.log(resp)
        if (expect(resp).to.have.property("status")) {
            site_state[0].results[k].status = resp.status;
        }
        if (expect(resp).to.have.property("duration")) {
            site_state[0].results[k].duration = resp.duration;
        }
        if (resp.status != 200 && site_state[0].app_status != "Test failed") {
            site_state[0].results[k].errors.push("Responsed status : " + resp.status + " : " + resp.statusText);
            site_state[0].cons_failed_pages += 1;
            if (site_state[0].cons_failed_pages >= limit) {
                site_state[0].app_status = "Test failed";
            }
            if (expect(resp).to.have.property("status")) {
                site_state[0].results[k].status = resp.status;
            }
            if (expect(resp).to.have.property("duration")) {
                site_state[0].results[k].duration = resp.duration;
            }
        } else {
            if (site_state[0].cons_failed_pages < limit) {
                site_state[0].cons_failed_pages = 0;
            }
        }
    });
})

Cypress.Commands.add("get_stat_dur_lite", (link, site_state, k, limit) => {
    cy.request({
        url: link,
        failOnStatusCode: false
    }).then((resp) => {
        if (resp.status != 200 && site_state[0].app_status != "Test failed") {
            site_state[0].results[k].errors.push("Responsed status : " + resp.status + " : " + resp.statusText);
            site_state[0].cons_failed_pages += 1;
            if (site_state[0].cons_failed_pages >= limit) {
                site_state[0].app_status = "Test failed";
            }
        } else {
            if (site_state[0].cons_failed_pages < limit) {
                site_state[0].cons_failed_pages = 0;
            }
        }
    });
})

Cypress.Commands.add("get_load_time", (site_state) => {
    cy.wrap(performance.now()).then((t1) => {
        site_state.load_time = t1 - site_state.load_time;
    });
})

Cypress.Commands.add("wait_for_requests", (alias) => {
    cy.wait(alias, {
        timeout: 40000
    });
})

Cypress.Commands.add("find_errors", (site_state) => {
    cy.window().then((win) => {
        cy.stub(win.console, 'error', ($obj) => {
            if ($obj.message != undefined) {
                site_state.errors.push($obj.name + " : " + $obj.message + " : " + $obj.request.responseText);
            }
        });
    });
})

Cypress.Commands.add("find_popup_alerts", (site_state) => {
    cy.on('window:alert', cy.spy(($obj) => {
        site_state.errors.push($obj);
    }));
})

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false;
})

Cypress.Commands.add("listen_fails", (site_state, k, base, link_path, out_path) => {
    cy.on("fail", (error) => {
        console.log(error);
        site_state[0].results[k].state = "Fail! -> " + String(error);
    }).then(() => {
        cy.readFile(link_path).then(($link_obj) => {
            let links = $link_obj[0]["links"];
            let link = links[k];
            site_state[0].results[k].url = link;
        });
    });
})

Cypress.Commands.add("click_navbar_elems", (alias = "GET", site_state) => {
    cy.get("div.navbar-collapse").first().get("ul.navbar-nav").first().as("header_menu");
    cy.get("@curr_opt").click();
    cy.wait(2000);
    cy.get("@header_menu").get("ul.nav > li.dropdown", {
        timeout: 40000
    }).children().each(($li, index_li, $ul) => {
        $li[0].click();
    });
})

Cypress.Commands.add("save_data", (obj, base, mode = "", year = 2021) => {
    var suburl = obj.url.replace(base, "");
    base = base.replace("//", "");
    base = base.replaceAll("/", "_") + "_" + mode;
    suburl = suburl.replaceAll("/", "_")
    var path = "data/" + base;
    var json_path = path + "/" + suburl + "/" + String(year) + "/" + suburl + "_" + Cypress.moment().format("MM_DD_YYYY_h:mm") + ".json";
    cy.exec("mkdir -p " + path, {timeout: 600000});
    cy.exec("mkdir -p " + path + "/" + suburl + "/", {timeout: 600000});
    cy.exec("mkdir -p " + path + "/" + suburl + "/" + String(year) + "/", {timeout: 600000});
    cy.writeFile(json_path, obj, {timeout: 600000});
    //, {timeout: 600000}
})
