Cypress.Commands.add("check_tables", (site_state, toggled = false) => {
    let white_list = false;
    cy.get("main").then(($body) => {
        cy.readFile("cypress/fixtures/white_list.json").then(($obj) => {
            let white_list = $obj[0]["links"].includes(site_state["url"]);
        });
        if ($body.find("table").length) {
            if ($body.find(".v-slide-group__wrapper").length) {
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
    cy.get("div.row div.v-card div.v-card__text").eq(1).find("div.v-list-item__subtitle")
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
    cy.get("div.v-card .container").find(".row div.col-9").eq(0).then(($elem) => {
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
        cy.get("@outline").eq(index).click();
        let option = elem.get(0).innerText;
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
    var key = [6, 8, 5];
    var menu_item = "";
    var n_thead;
    var option;
    var stop = false;
    cy.get(".v-data-footer__select div[role='button'] .v-select__slot").click();
    cy.get("div.menuable__content__active div[role='option']").eq(2).click();
    cy.get(".v-card__title .row .v-input").as("menu_items").each((item0, index0, items0) => {
        if (index0 == 0 || index0 == 1 || index0 == 2) {
            cy.get("@menu_items").eq(index0).click().wait(1000);
            cy.get("body").then((body) => {
                if (body.find("div:visible.v-menu__content div[aria-selected='true']").length != 0) {
                    cy.get("div:visible.v-menu__content div[aria-selected='true']").click({
                        multiple: true
                    });
                }
                cy.get(".v-card__title .row .v-input").eq(index0).then((i) => {
                    menu_item = i.get(0).innerText;
                });
                cy.get("div:visible.v-menu__content div[role='listbox'] div[aria-selected='false']").as("outline").each((item1, index1, items1) => {
                    console.log(item1);
                    cy.get("@outline").eq(index1).click({force: true});
                    option = item1.get(0).innerText;
                    console.log(item1.get(0).innerText, item1.get(0), option);
                    cy.wait(2000);
                    if (cy.get("body").find("tbody tr[class='']").length != 0) {
                        cy.get("tbody tr[class='']").each((tr, index, trs) => {
                            if (tr.get(0).children[key[index0]].innerText != option) {
                                if (!stop) {
                                    site_state.results[k].warnings.push("There is someting wrong in menu`s '" + menu_item + "' '" + option + "' table.");
                                    stop = true;
                                    return false;
                                } else {
                                    return false;
                                }
                            }
                        });
                        cy.wait(2000);
                        cy.get("@outline").eq(index1).click({force: true});
                    } else {
                        site_state.results[k].warnings.push("The menu`s '" + menu_item + "', '" + option + "' table is empty.");
                        return false;
                    }
                });
            });
        } else if (index0 == 4) {
            cy.get(".v-data-table__wrapper thead tr").children().then((elems) => {
                n_thead = elems.length;
            });
            cy.get("@menu_items").eq(index0).click().wait(2000);
            cy.get(".v-data-table__wrapper thead tr").children().then((elems) => {
                n_thead -= elems.length;
                if (Math.abs(n_thead) != 3) {
                    site_state.results[k].additional = "There are " + n_thead + " extended colmuns instead of 3.";
                }
            });
        }
    });
})

Cypress.Commands.add("check_mo_list", (site_state, k) => {
    var initial = []
    var stop0 = false;
    var mode = "";
    var i;
    var year;
    cy.get(".row .v-data-table__wrapper tbody tr").each((tr0, index0, trs0) => {
        let initial = tr0.get(0).children[4].innerText;
    });
    cy.wait(2000);
    cy.get(".v-card__title .col-2").children().eq(0).as("mode").click();
    cy.get("div[role='listbox']").children().eq(0).as("lb").children().then((children) => {
        var i = Math.floor(Math.random() * children.length);
        cy.get("@lb").children().eq(i).click({
            force: true
        });
        mode = children[i].innerText;
    });
    cy.wait(2000);
    cy.get(".row .v-data-table__wrapper tbody tr").each((tr1, index1, trs1) => {
        if (tr1.get(0).children[4].innerText != initial[index1] && !stop0) {
            stop0 = true;
        }
    }).then(() => {
        if (!stop0) {
            site_state.results[k].warnings.push("The '" + mode + "' option of 'mode' changed nothing.");
        } else {
            stop0 = false;
        }
    });
    cy.wait(2000);
    cy.get(".v-card__title .col-2").children().eq(1).as("year").click();
    cy.get("div[role='listbox']").children().eq(1).as("lb").children().then((children) => {
        i = Math.floor(Math.random() * children.length);
        cy.get("@lb").children().eq(i).click({
            force: true
        });
        year = children[i].innerText;
    });
    cy.wait(2000);
    cy.get(".row .v-data-table__wrapper tbody tr").each((tr1, index1, trs1) => {
        console.log(tr1.get(0).children[4].innerText == initial[index1])
        if (tr1.get(0).children[4].innerText != initial[index1] && !stop0) {
            stop0 = true;
        }
    }).then(() => {
        if (!stop0) {
            site_state.results[k].warnings.push("The '" + year + "' option of 'year' changed nothing.");
        } else {
            stop0 = false;
        }
    });
})

Cypress.Commands.add("check_em_nominations", (site_state, k, data = false) => {
    cy.get("table tbody tr").then((tr) => {
        var length = tr.length;
    });
    cy.get("table tbody tr").as("rows").then((tr) => {
        var index = Math.floor(Math.random() * length);
        var f_name = tr.get(0).children[1].innerText;
        var l_name = tr.get(0).children[2].innerText;
        var institute = tr.get(0).children[3].innerText;
	var t_date = new Date().getFullYear();
        //checking names
        cy.get("table tbody tr td a", {
            timeout: 60000
        }).eq(0).click();
        cy.get(".v-card__text .v-list .v-list-item .v-list-item__title").contains(/\w+/, {
            timeout: 60000
        });
        cy.get(".v-card__text .v-list .v-list-item").then((item) => {
            if (item.get(2).innerText == f_name && item.get(3).innerText == l_name) {
                site_state.results[k].warnings.push("Reference to a wrong personal profile.");
            }
        });
        cy.wait(1000);
        cy.go("back");
        //checking institute
        cy.get("table tbody tr td a", {
            timeout: 60000
        }).eq(1).click({
            waitForAnimations: true
        });
        cy.get(".v-card .v-toolbar__title").then((title) => {
            var t_date = title.get(0).innerText.split(" CMS Emeritus Nominations")[0];
            if (title.get(0).innerText.split("Institute Profile of ")[1] != institute) {
                site_state.results[k].warnings.push("Reference to a wrong institute profile.");
            }
        });
        cy.wait(1000);
        cy.go("back");
        //switches
        if (site_state.isAdmin) {
            console.log("Is admin!");
            cy.get(".v-card .v-toolbar__content .v-btn__content .v-icon").eq(1).click();
            cy.get(".v-card .v-toolbar__title").then((title) => {
                if (title.get(0).innerText.split(" CMS Emeritus Nominations")[0] != (t_date-1)) {
                    site_state.results[k].warnings.push("Reference to a page with a wrong date.");
                }
            });
            cy.get(".v-card .v-toolbar__content .v-btn__content .v-icon").eq(2).click().click();
            cy.get(".v-card .v-toolbar__title").then((title) => {
                if (title.get(0).innerText.split(" CMS Emeritus Nominations")[0] != (t_date+1)) {
                    site_state.results[k].warnings.push("Reference to a page with a wrong date.");
                }
            });
            // Additional actions
            cy.get(".v-card .v-toolbar__content .v-btn__content .v-icon").eq(3).click();
            cy.get("body").then((body) => {
                if (body.find(".v-card .v-card__actions button").length != 1) {
		    cy.wait(2000);
                    site_state.results[k].warnings.push("Info modal was not, or was wrongly opened.");
                }
            });
            cy.get(".v-card .v-toolbar__content .v-btn__content .v-icon").eq(0).click();
            cy.get(".v-card .v-card__text input").eq(0).type(data.criterion);
            cy.get(".v-card .v-card__text input").eq(1).type(data.year);
            cy.get(".v-card .v-card__actions button").eq(2).click();
            cy.wait_for_requests("@em_nom");
        } else {
	    console.log("Is not an admin.");
            cy.get(".v-card .v-toolbar__content .v-btn__content .v-icon").eq(0).click();
            cy.get(".v-card .v-toolbar__title").then((title) => {
		console.log(title.get(0).innerText.split(" CMS Emeritus Nominations")[0]);
                if (title.get(0).innerText.split(" CMS Emeritus Nominations")[0] != (t_date-1)) {
                    site_state.results[k].warnings.push("Reference to a page with a wrong date.");
                }
            });
            cy.get(".v-card .v-toolbar__content .v-btn__content .v-icon").eq(1).click().click();
            cy.get(".v-card .v-toolbar__title").then((title) => {
                if (title.get(0).innerText.split(" CMS Emeritus Nominations")[0] != (t_date+1)) {
                    site_state.results[k].warnings.push("Reference to a page with a wrong date.");
                }
            });
	}
        cy.get(".v-card .v-toolbar__content .v-btn__content .v-icon").eq(0).click();
        cy.get(".v-card__title .v-input__slot").click({
            waitForAnimations: false
        });
        cy.wait(500);
        cy.check_tables(site_state.results[k], true);
        cy.wait(500);
    });
})

Cypress.Commands.add("check_over_graduation", (site_state, k) => {
    cy.Open_All();
    cy.get("table tbody tr").then((table_rows) => {
        cy.get(".v-card__title .col .v-input__slot label").each((label, index0, labels) => {
            var label_name = label.get(0).innerText;
            console.log(label_name)
            if (label_name == "Institute") {
                cy.get(".v-data-footer__pagination").then((rows_pagination) => {
                    var rows = Number(rows_pagination.get(0).innerText.split("of ")[1]);
                    var index_institute = Math.floor(Math.random() * rows);
                    var institute = table_rows.get(index_institute).children[0].innerText;
                    cy.get(".v-card__title .col .v-input__slot input").eq(index0).type(institute + " {enter}");
                    cy.get("table tbody tr").each((tr, index1, trs) => {
                        if (tr.get(0).innerText != institute) {
                            site_state.results[k].warnings.push("Table returned wrong institute name.");
                            return false;
                        }
                    });
                });
            } else if (label_name == "Years") {
                cy.get(".v-card__title .col .v-input__slot").then((inputs) => {
                    inputs.get(index0).click();
                    var years = Number(inputs.get(index0).children[0].children[1]._value);
                    cy.get("table tbody tr").each((tr, index1, trs) => {
                        console.log(tr.get(0).children[7].innerText, inputs.get(index0).children[0].children[1]._value)
                        if (Number(tr.get(0).children[7].innerText) < years) {
                            site_state.results[k].warnings.push("Table returned wrong year.");
                            return false;
                        }
                    });
                });
            }
        });
    });
})

Cypress.Commands.add("check_statistics", (site_state, k) => {
    var table_rows = NaN;
    var n_initial = NaN;
    var n_final = NaN;
    var th, op, title;
    cy.get(".v-card__title .col-4 .v-input__slot").as("title").each((d, index0, ds) => {
        cy.get("@title").eq(index0).click();
        cy.get(".v-card__title .col-4 label").eq(index0).then((label) => {
            title = label.get(0).innerText;
        });
        if (index0 == 0 || index0 == 1) {
            cy.get("div.v-menu__content div[aria-selected='false']").should('be.visible').as("options").each((option, index1, options) => {
                op = option.get(0).innerText;
                cy.get(".v-data-footer__pagination").then((table_rows) => {
                    n_initial = Number(table_rows.get(0).innerText.split("of ")[1]);
                });
                cy.wait(2000);
                cy.get("@options").eq(index1).click();
                cy.wait(1000);
                cy.get(".v-data-footer__pagination").then((table_rows) => {
                    n_final = Number(table_rows.get(0).innerText.split("of ")[1]);
                    if (n_initial >= n_final) {
                        site_state.results[k].warnings.push("The '" + op + "' option of '" + title + "' dropdown changed nothing.");
                    }
                });
            });
        } else if (index0 == 2) {
            cy.get("div.v-menu__content div[aria-selected='false']").should('be.visible').as("options").each((option, index1, options) => {
                cy.get(".v-data-footer__pagination").then((table_rows) => {
                    n_initial = Number(table_rows.get(0).innerText.split("of ")[1]);
                });
                cy.get("@options").eq(index1).click();
                cy.wait(1000);
                cy.get("table thead tr th").as("ths").eq(index1 + 1).then((table_header) => {
                    th = table_header.get(0).innerText;
                    op = options.get(index1).innerText;
                    cy.get(".v-data-footer__pagination").then((table_rows) => {
                        n_final = Number(table_rows.get(0).innerText.split("of ")[1]);
                        if (op != th) {
                            site_state.results[k].warnings.push("The '" + op + "' option of '" + title + "' did'nt create a column.");
                        } else if (n_initial >= n_final) {
                            site_state.results[k].warnings.push("The '" + op + "' option of '" + title + "' did'nt create rows.");
                        } else if (n_initial >= n_final && op != th) {
                            site_state.results[k].warnings.push("The '" + op + "' option of '" + title + "' did'nt create a column.");
                            site_state.results[k].warnings.push("The '" + op + "' option of '" + title + "' did'nt create rows.");
                        }
                    });
                });
            });
        }
    });
})
Cypress.Commands.add("check_flags", (site_state, k, flags_name) => {
    cy.Open_All();
    cy.get(".v-card__title .col-2").as("elems").each((elem, index0, elems) => {
        var stop = false;
        var title, n_options = NaN,
            selected;
        cy.get(".v-card__title .col-2:visible").eq(index0).click();
        cy.get(".v-card__title .col-2 label").eq(index0).then((label) => {
            title = label.get(0).innerText;
            cy.get("div.menuable__content__active div.v-list-item__content").then((options) => {
                n_options = options.length;
                cy.get("div.menuable__content__active div.v-list-item__content").eq(Math.floor(Math.random() * n_options)).click().then((option) => {
                    selected = option.get(0).innerText;
                    if (index0 == 0) {
                        cy.get(".v-card__title .col-2 input:visible").eq(index0).type(selected);
                        cy.wait(1000);
                        cy.get("table tbody tr").as("rows").each((tr, index1, trs) => {
                            if (trs.children()[1].innerText + " " + trs.children()[2].innerText != selected) {
                                if (!stop) {
                                    stop = true;
                                    site_state.results[k].warnings.push("Wrong first and last name were delivered in: '" + selected + "' option of '" + title + "'.");
                                } else {
                                    return false;
                                }
                            }
                        });
                    } else if (index0 == 1) {
                        cy.get(".v-card__title .col-2").eq(index0).type(selected);
                        cy.wait(1000);
                        cy.get("table tbody tr").as("rows").each((tr, index1, trs) => {
                            if (trs.children()[4].innerText.split("_")[0] != selected.split(" ")[0]) {
                                if (!stop) {
                                    stop = true;
                                    site_state.results[k].warnings.push("Wrong Flag name was delivered in: '" + selected + "' option of '" + title + "'.");
                                } else {
                                    return false;
                                }
                            }
                        });
                    }
                    cy.get("button[aria-label='clear icon']").eq(0).click({
                        force: true
                    });
                });
            });
        });
    });
})

Cypress.Commands.add("check_weeks", (site_state, k, data) => {
        /*create a new CMSWeek*/
        cy.get(".v-card__title button").click();
        cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.title);
        cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.start_date, {force: true});
        cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.end_date, {force: true});
        if (data.is_out_cern) {
            cy.get(".v-card .v-card__text input").eq(3).click({force:true});
        }
        cy.get(".v-card .v-card__actions button").eq(1).click({force:true});
	cy.get(".v-dialog--active").click().type("{esc}");
        /*change the CMSWeek*/
	if (site_state.isAdmin) {
    	    cy.get("table tbody tr button").eq(Math.floor(Math.random() * 25)).click();
    	    cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.title);
    	    cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.start_date, {force: true});
    	    cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.end_date, {force: true});
    	    if (data.is_out_cern) {
        	cy.get(".v-card .v-card__text input").eq(3).click({force: true});
    	    }
    	    cy.get(".v-card .v-card__actions button").eq(1).click({force: true});
    	    cy.wait_for_requests("@puts");
	}
})

Cypress.Commands.add("check_rooms", (site_state, k, data) => {
        /*create a new room*/
        cy.get(".v-card__title button").click();
        cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.custom_name, {force: true});
        cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.indico_id, {force: true});
        cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.building, {force: true});
        cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.floor, {force: true});
        cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.room_nr, {force: true});
	cy.get(".v-card .v-card__text input").eq(5).then((input) => {
	    if (data.at_cern && !input.get(0).checked) {
        	cy.get(".v-card .v-card__text input").eq(5).click({force: true});
	    }
	});
        cy.get(".v-card .v-card__actions button").eq(1).click({force: true});
	cy.get(".v-dialog--active").click().type("{esc}");
        /*change the room*/
     if (site_state.isAdmin) {
        cy.get("table tbody tr button").eq(Math.floor(Math.random() * 25)).click({force: true});
        cy.get(".v-card__title button").click({force: true});
        cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.custom_name, {force: true});
        cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.indico_id, {force: true});
        cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.building, {force: true});
        cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.floor, {force: true});
        cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.room_nr, {force: true});
        if (data.at_cern) {
            cy.get(".v-card .v-card__text input").eq(5).click({force: true});
        }
        cy.get(".v-card .v-card__actions button").eq(1).click({force: true});
        cy.wait_for_requests("@puts");
	cy.get(".v-dialog--active").click().type("{esc}");
    }
})

Cypress.Commands.add("check_tenures", (site_state, k, data) => {
    cy.Open_All();
    if (site_state.isAdmin) {
	/*make a new tenure*/
	cy.get("main .v-toolbar__content button").click();
	cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.member, {force: true});
	cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.unit, {force: true});
	cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.position, {force: true});
	cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.start_date, {force: true});
	cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.end_date, {force: true});
	cy.get(".v-card .v-card__actions button").eq(1).click({force: true});
	cy.get(".v-dialog--active").click().type("{esc}");
	/*change the tenure*/
	cy.get(".v-data-footer__pagination").then((table_rows) => {
	    cy.get("table tbody tr button").then((buttons) => {
		var tr_index = Math.floor(Math.random() * buttons.length/2);
		if(tr_index % 2 == 0){
		    /*change tenure*/
		    buttons.get(0).children[tr_index].click();
		    cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.member, {force: true});
		    cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.unit, {force: true});
		    cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.position, {force: true});
		    cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.start_date, {force: true});
		    cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.end_date, {force: true});
		    cy.get(".v-card .v-card__actions button").eq(1).click({force: true});
		    cy.get(".v-dialog--active").click().type("{esc}");
		    /*delete tenure*/
		    buttons.get(0).children[tr_index+1].click();
		    cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.member, {force: true});
		    cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.unit, {force: true});
		    cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.position, {force: true});
		    cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.start_date, {force: true});
		    cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.end_date, {force: true});
		    cy.get(".v-card .v-card__actions button").eq(1).click({force: true});
		    cy.get(".v-dialog--active").click().type("{esc}");
		    cy.wait_for_requests("@deletes");
		} else {
		    /*change tenure*/
		    buttons.get(0).children[tr_index-1].click();
		    cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.member, {force: true});
		    cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.unit, {force: true});
		    cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.position, {force: true});
		    cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.start_date, {force: true});
		    cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.end_date, {force: true});
		    cy.get(".v-card .v-card__actions button").eq(1).click({force: true});
		    cy.get(".v-dialog--active").click().type("{esc}");
		    /*delete tenure*/
		    buttons.get(0).children[tr_index].click();
		    cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.member, {force: true});
		    cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.unit, {force: true});
		    cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.position, {force: true});
		    cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.start_date, {force: true});
		    cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.end_date, {force: true});
		    cy.get(".v-card .v-card__actions button").eq(1).click({force: true});
		    cy.get(".v-dialog--active").click().type("{esc}");
		    cy.wait_for_requests("@deletes");
		}
	    });
	});
    }
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
    cy.wait(1000);
})

Cypress.Commands.add("check_dashboard", (site_state, k, base, name_surname, institute) => {
    cy.get(".v-main__wrap .v-card__actions button").eq(0).click();
    cy.go('back');
    cy.get("div.v-select__slot input:visible").eq(0).type(name_surname).wait(1000).type("{enter}").wait(2000);
//    cy.get("div.v-select__slot input:visible").eq(0).type("{enter}");
    cy.check_profile_dashboard(site_state, k, name_surname);
    cy.go('back');
    cy.get("div.v-select__slot input:visible").eq(1).type(institute).wait(1000).type("{enter}").wait(2000);
//    cy.get("div.v-select__slot input:visible").eq(1).type("{enter}");
    cy.check_institute_dashboard(site_state, k, institute);
    cy.go('back');
    cy.get("header .d-flex .v-toolbar__title").click();
})

Cypress.Commands.add("Open_All", () => {
    cy.get(".v-data-footer .v-input__control").click();
    cy.get("div.menuable__content__active div[role='option']").eq(3).click();
})
