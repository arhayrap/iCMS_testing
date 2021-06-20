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
        if (expect(resp).to.have.property("status")) {
            site_state[0].results[k].status = resp.status;
        }
        if (expect(resp).to.have.property("duration")) {
            site_state[0].results[k].duration = resp.duration;
        }
        if (resp.status != 200) {
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

Cypress.Commands.add("get_stat_dur_light", (link, site_state, k, limit) => {
    cy.request({
        url: link,
        failOnStatusCode: false
    }).then((resp) => {
        if (resp.status != 200) {
            site_state[0].results[k].errors.push("Responsed status : " + resp.status + " : " + resp.statusText);
            site_state[0].results[k].test = "Error page";
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

Cypress.Commands.add("check_tables", (site_state, toggled = false) => {
    let white_list = false;
    cy.get("main").then(($body) => {
        cy.readFile("cypress/fixtures/white_list.json").then(($obj) => {
            let white_list = $obj[0]["links"].includes(site_state["url"]);
        });
        if ($body.find("table").length) {
            console.log("found table");
            if ($body.find(".v-slide-group__wrapper").length) {
                console.log("v slide group wrapper!")
                cy.get(".v-slide-group__wrapper .v-tab").as("tab_buttons").click({
                    multiple: true
                });
                cy.get("main table > tbody").each(($tab, index0, $tables) => {
                    cy.get("main table > tbody").eq(index0).children().then((tr1) => {
                        if (tr1.length <= 2 && !white_list) {
                            if (!toggled) {
                                site_state.warnings.push("Table warning: There is an empty table");
                            } else {
                                site_state.warnings.push("Table warning: There is an empty table after toggling");
                            }
                        }
                    });
                });
            } else {
                cy.get("main table > tbody").each(($tab, index0, $tables) => {
                    cy.get("main table > tbody").eq(index0).children().then((tr1) => {
                        if (tr1.length <= 2 && !white_list) {
                            if (!toggled) {
                                site_state.warnings.push("Table warning: There is an empty table");
                            } else {
                                site_state.warnings.push("Table warning: There is an empty table after toggling");
                            }
                        }
                    });
                });
            }
        } else if ($body.find("div.v-skeleton-loader__table-tbody").length) {
            console.log("finding skeleton");
            cy.get("table", {
                timeout: 60000
            });
            if ($body.find(".v-slide-group__wrapper").length) {
                cy.get(".v-slide-group__wrapper .v-tab").as("tab_buttons").click({
                    multiple: true
                });
                cy.get("main table > tbody").each(($tab, index0, $tables) => {
                    cy.get("main table > tbody").children().then((tr1) => {
                        if (tr1.length <= 2 && !white_list) {
                            if (!toggled) {
                                site_state.warnings.push("Table warning: There is an empty table");
                            } else {
                                site_state.warnings.push("Table warning: There is an empty table after toggling");
                            }
                        }
                    });
                });
            } else {
                console.log("found only tables")
                cy.get("main table > tbody").each(($tab, index0, $tables) => {
                    cy.get("main table > tbody").children().then((tr1) => {
                        if (tr1.length <= 2 && !white_list) {
                            if (!toggled) {
                                site_state.warnings.push("Table warning: There is an empty table");
                            } else {
                                site_state.warnings.push("Table warning: There is an empty table after toggling");
                            }
                        }
                    });
                });
            }
        } else {
            site_state.warnings = [];
        }
    });
})

Cypress.Commands.add("check_profile_dashboard", (site_state, k, name = false) => {
    cy.get("div.row div.v-card div.v-card__title")
        .eq(2)
        .siblings(".v-card__text").as("vcard")
        .get("@vcard").find("div[role='list'] div.v-list-item__subtitle")
        .should(($title) => {
            expect($title).to.contain("Full Name");
        })
        .siblings("div.v-list-item__title").eq(0).then(($elem) => {
            if (!name) {
                console.log($elem.get(0).innerText == name);
                if ($elem.get(0).innerText == name) {
                    site_state.correct_profile = true;
                } else {
                    site_state.correct_profile = false;
                }
            } else {
                console.log($elem.get(0).innerText, name);
                if ($elem.get(0).innerText == name) {
                    site_state.correct_name_search = true;
                } else {
                    site_state.correct_name_search = false;
                }
            }
        });
})

Cypress.Commands.add("check_institute_dashboard", (site_state, k, name = false) => {
    cy.get("div.v-card div.v-card__title")
        .eq(1)
        .siblings(".container").as("cont")
        .get("@cont").find(".row div.col-9").eq(0).then(($elem) => {
            console.log($elem.get(0).innerText == name);
            if ($elem.get(0).innerText == name) {
                site_state.correct_institute_search = true;
            } else {
                site_state.correct_institute_search = false;
            }
        });
})

Cypress.Commands.add("check_logo_reference", (site_state, base) => {
    cy.get("header .d-flex .v-toolbar__title").click();
    if (cy.url().should('eq', base)) {
        site_state.correct_dashboard_url = true;
    } else {
        site_state.correct_dashboard_url = false;
    }
})

Cypress.Commands.add("check_institutes", (site_state, k) => {
    var key = {
        "Member": "Yes",
        "ForReference": "ForReference",
        "Associated": "Associated",
        "No": "No",
        "Cooperating": "Cooperating",
        "Leaving": "Leaving"
    };
    cy.get("i.mdi-menu-down").eq(1).click();
    cy.get("div.menuable__content__active div[role='option']").eq(3).click();
    cy.get("i.mdi-menu-down").eq(0).click();
    cy.get("i.mdi-checkbox-marked").click();
    cy.get(".menuable__content__active div[role='listbox'] div.v-list-item").as("outline").each((elem, index, arr) => {
        console.log(elem)
        cy.get("@outline").eq(index).click();
        let option = elem.get(0).innerText;
        console.log(elem.get(0).innerText, elem.get(0), option);
        cy.wait(1000);
        cy.get("tbody tr[class='']").each((tr, index, trs) => {
            if (tr.get(0).children[3].innerText != key[option]) {
                site_state.results[k].warnings.push("There is someting wrong in " + option + " table.");
                return false;
            }
        });
        cy.wait(1000);
        cy.get("@outline").eq(index).click();
    });
})

Cypress.Commands.add("check_people", (site_state, k) => {
    var key = [6,8,5];
    cy.get(".v-data-footer__select div[role='button'] .v-select__slot").click();
    cy.get("div.menuable__content__active div[role='option']").eq(2).click();
    cy.get(".v-card__title .row .v-input").as("menu_items").each((item0, index0, items0) => {
	if(index0 == 0 || index0 == 1 || index0 == 2){
	    cy.get("@menu_items").eq(index0).click();
	    cy.get("div[aria-selected='true']").click();
	    cy.get("div.menuable__content__active div[role='option'] label").eq(index0).then((i) => {
		let menu_item = i.innerText;
	    });
	    cy.get(".v-menu__content div[role='listbox']").as("outline").each((item1, index1, items1) => {
		console.log(item1);
		cy.get("@outline").eq(index1).click();
		let option = item1.get(0).innerText;
		console.log(item1.get(0).innerText, item1.get(0), option);
		cy.wait(1000);
		cy.get("tbody tr[class='']").each((tr, index, trs) => {
		    if(trs.length > 2){
			if (tr.get(0).children[key[index0]].innerText != option) {
			    site_state.results[k].warnings.push("There is someting wrong in menu`s '" + menu_item  + "' '" + option + "' table.");
			    return false;
			}
		    }else{
			site_state.results[k].warnings.push("The menu`s '" + menu_item  + "' '" + option + "' table is empty.");
			return false;
		    }
		});
		cy.wait(1000);
		cy.get("@outline").eq(index).click();
	    });
	}else if(index0 == 4){
	    cy.get(".v-data-table__wrapper thead").children().then((elems) => {
		let n_thead = elems.length;
	    });
	    cy.get("@menu_items").eq(index0).click();
	    cy.get(".v-data-table__wrapper thead").children().then((elems) => {
		let n_thead -= elems.length;
		if(n_thead != 3){
		    site_state.results[k].additional = "There are " + n_thead + " extended colmuns instead of 3";
		}
	    });
	}
    });
})

Cypress.Commands.add("check_mo_list", (site_state, k) => {
    //cy.get(".v-data-table__wrapper thead");
    let initial = []
    cy.get(".row .v-data-table__wrapper tbody tr").each((tr, index0, tbody) => {

	//to be continued...

    })
    cy.get(".v-card__title .col-2").eq(0).as("mode").click();
    cy.get("div[role='listbox']").eq(0).as("lb").children().then((children)=>{cy.get("@lb").eq(Math.floor(Math.random()*children.length)).click()});
    cy.get(".v-card__title .col-2").eq(1).as("year");
    

})

Cypress.Commands.add("check_units", (site_state, k, unit_name, date) => {
    cy.get("div.v-input--selection-controls__ripple").eq(1).as("checkbox").click();
    cy.check_tables(site_state.results[k], true);
    cy.get("@checkbox").click();
    cy.get("input[type='date']").type(date);
    cy.get("main header button.v-btn").click();
    cy.get("button.v-icon").click({
        multiple: true,
        force: true
    });
    cy.get("div.v-menu__content  div.v-card div.v-card__title div.v-input__control div.v-input__slot div.v-text-field__slot input").type(unit_name);
    cy.get("div.v-treeview-node__children div.v-treeview-node__content span").click();
    cy.get("main header div.v-toolbar__title").then(($elem) => {
        if ($elem.get(0).innerText.split(": ")[1] == unit_name) {
            site_state.results[k].correct_unit_search = true;
        } else {
            site_state.results[k].correct_unit_search = false;
        }
    });
    cy.get("main div.v-toolbar__content button.v-btn").eq(1).click().then(() => {
        site_state.results[k].correct_arrow = true;
    });
})

Cypress.Commands.add("check_dashboard", (site_state, k, base, name_surname, institute) => {
    cy.get("button.v-btn--contained").eq(0).click();
    cy.wait_for_requests("@gets");
    //cy.check_tables(site_state.results[k]);
    cy.go('back');
    cy.get("div.v-select__slot input:visible").eq(0).type(name_surname).wait(1000);
    cy.wait_for_requests("@gets");
    cy.get("div.v-select__slot input:visible").eq(0).type("{enter}");
    cy.wait(2000);
    cy.check_profile_dashboard(site_state, k, name_surname);
    cy.go('back');
    cy.get("div.v-select__slot input:visible").eq(1).type(institute).wait(1000);
    cy.wait_for_requests("@gets");
    cy.get("div.v-select__slot input:visible").eq(1).type("{enter}");
    cy.wait(2000);
    cy.check_institute_dashboard(site_state, k, institute);
    cy.go('back');
    cy.get("header .d-flex .v-toolbar__title").click();
})

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
        site_state[0].results[k].state = "Fail";
    }).then(() => {
        cy.readFile(link_path).then(($link_obj) => {
            let links = $link_obj[0]["links"];
            let link = links[k];
            site_state[0].results[k].url = link;
        });
    });
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
    cy.exec("mkdir -p " + path);
    cy.exec("mkdir -p " + path + "/" + suburl + "/");
    cy.exec("mkdir -p " + path + "/" + suburl + "/" + String(year) + "/");
    cy.writeFile(json_path, obj);
})
