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
        //console.log(elem)
        cy.get("@outline").eq(index).click();
        let option = elem.get(0).innerText;
        //console.log(elem.get(0).innerText, elem.get(0), option);
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
                    cy.get("@outline").eq(index1).click();
                    option = item1.get(0).innerText;
                    console.log(item1.get(0).innerText, item1.get(0), option);
                    cy.wait(2000);
                    if (cy.get("body").find("tbody tr[class='']").length != 0) {
                        cy.get("tbody tr[class='']").each((tr, index, trs) => {
                            if (tr.get(0).children[key[index0]].innerText != option) {
                        	if (!stop){
                            	    site_state.results[k].warnings.push("There is someting wrong in menu`s '" + menu_item + "' '" + option + "' table.");
                            	    stop = true;
                            	    return false;
                            	}else{
                            	    return false;
                            	}
                            }
                        });
                        cy.wait(2000);
                        cy.get("@outline").eq(index1).click();
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
	    //console.log(tr1.get(0).children[4].innerText == initial[index1])
            stop0 = true;
        }
    }).then(() => {
        if (!stop0) {
            site_state.results[k].warnings.push("The '" + mode + "' option of 'mode' changed nothing.");
        } else {
            stop0 = false;
        }
    });
    //cy.get("div.v-skeleton-loader__table-tbody", {timeout:10000});
    cy.wait(2000);
    cy.get(".v-card__title .col-2").children().eq(1).as("year").click();
    cy.get("div[role='listbox']").children().eq(1).as("lb").children().then((children) => {
        i = Math.floor(Math.random() * children.length);
        cy.get("@lb").children().eq(i).click({
            force: true
        });
        year = children[i].innerText;
    });
    //cy.get("div.v-skeleton-loader__table-tbody", {timeout:10000});
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

Cypress.Commands.add("check_em_nominations", (site_state, k) => {
    //.each
    cy.get("table tbody tr").then((tr) => {
	var length = tr.length;
    });
    cy.get("table tbody tr").as("rows").eq(Math.floor(Math.random() * length)).then((tr) => {
	var f_name    = tr.get(0).children().eq(1).innerText();
	var l_name    = tr.get(0).children().eq(2).innerText();
	var institute = tr.get(0).children().eq(3).innerText();
	//checking names
	cy.get("table tbody tr td a").eq(0).click();
	cy.get(".v-card__text .v-list .v-list-item").then((item) => {
	    if (item.get(2).innerText == f_name && item.get(3).innerText == l_name){
		site_state.results[k].warnings.push("Reference to a wrong personal profile.");
	    }
	});
	cy.wait(1000);
	cy.go("back");
	//checking institute
	cy.get("table tbody tr td a").eq(1).click();
	cy.get(".v-card .v-toolbar__title").then((title) => {
	    var t_date = title.get(0).innerText.split(" CMS Emeritus Nominations")[0];
	    if (title.get(0).innerText.split("Institute Profile of ")[0] != institute){
		site_state.results[k].warnings.push("Reference to a wrong institute profile.");
	    }
	});
	cy.wait(1000);
	cy.go("back");
	//switches
	cy.get(".v-card .v-toolbar__content .v-btn__content .v-icon").eq(0).click();
	cy.get(".v-card .v-toolbar__title").then((title) => {
	    if (title.get(0).innerText.split("Institute Profile of ")[0] != t_date){
		site_state.results[k].warnings.push("Reference to a page with a wrong date.");
	    }
	});
	cy.check_tables(site_state.results[k]);
	cy.go("back");
	
	cy.get(".v-card .v-toolbar__content .v-btn__content .v-icon").eq(1).click();
	cy.get(".v-card .v-toolbar__title").then((title) => {
	    if (title.get(0).innerText.split("Institute Profile of ")[0] != t_date){
		site_state.results[k].warnings.push("Reference to a page with a wrong date.");
	    }
	});
	cy.check_tables(site_state.results[k]);
	cy.go("back");
	cy.get("input[role='switch']").click();
	cy.wait(500);
	cy.check_tables(site_state.results[k], true);
	cy.wait(500);
	if (site_state.isAdmin){
	    // Additional actions
	    console.log("Admin's additional testing.")
	}
    });
})

Cypress.Commands.add("check_statistics", (site_state, k) => {
    cy.get("div.menuable__content__active div[role='option']").eq(3).click();
    cy.get(".v-card__title .col-4").as("title").each((d, index0, ds) => {
	cy.get("@title").eq(index0).click();
	cy.get(".v-card__title .col-4 label").eq(index0).then((label) => {
	    var title = label.eq(0).innerText;
	});
	if(index0 == 0 || index0 == 1){
	    cy.get("table tbody tr").as("rows").then((table_rows) => {
		var n_initial = table_rows.length;
	    });
	    cy.get("div:visible.v-menu__content div[aria-selected='false']").as("options").each((option, index1, options) => {
		var op = option.innerText;
		cy.get("@options").eq(index1).click();
		cy.wait(1000);
		cy.get("table tbody tr").as("rows").then((table_rows) => {
		    var n_final = table_rows.length;
		});
		if(n_initial >= n_final){
		    site_state.results[k].warnigs.push("The '" + op + "' option of '" + title + "' dropdown changed nothing.");
	        }
	    });
	} else if (index0 == 2) {
	    cy.get("div:visible.v-menu__content div[aria-selected='false']").as("options").each((option, index1, options) => {
		var op = option.innerText;
		cy.get("@options").eq(index1).click();
		cy.wait(1000);
		cy.get("table thead tr td").as("tds").eq(1).then((table_data) => {
		    var td = table_data.innerText;
		});
		if(op != td){
		    site_state.results[k].warnigs.push("The '" + op + "' option of '" + title + "' dropdown changed nothing.");
	        }
	        cy.get("@options").eq(index1).click();
	    });
	}
    });
})

Cypress.Commands.add("check_flags", (site_state, k, flags_name) => {
    //div[role="listbox"] .v-list-item
    cy.get("div.menuable__content__active div[role='option']").eq(2).click();
    cy.get(".v-card__title .col-2").as("elems").each((elem, index0, elems) => {
	var stop = false;
	cy.get(".v-card__title .col-2 label").eq(index0).then((label) => {
	    var title = label.get(0).innerText;
	});
	cy.get("div.menuable__content__active div.v-list-item__content").then((options) => {
	    var n_options = options.length;
	});
	cy.get("div.menuable__content__active div.v-list-item__content").eq(Math.floor(Math.random() * n_options)).then((option) => {
	    var selected = option.get(0).innerText.split(" ")[0];
	}).click();
	if(index0 == 0){
	    cy.get(".v-card__title .col-2 input:visible").eq(index0).type(flags_name + "{enter}");
	    cy.wait(1000);
	    cy.get("table tbody tr").as("rows").each((tr, index1, trs) => {
		if (tr.get(0).children[1] + tr.get(0).children[2] != selected){
		    if(!stop){
			stop = true;
			site_state.results[k].warnigs.push("There is something wrong with '" + selected + "' option of '" + title + "'.");
		    } else {
			return false;
		    }
		}
	    });
	} else if (index0 == 1){
	    cy.get(".v-card__title .col-2 input:visible").eq(index0).click();
	    cy.wait(1000);
	    cy.get("table tbody tr").as("rows").each((tr, index1, trs) => {
		if (tr.get(0).children[4].split("_")[0] != selected){
		    if(!stop){
			stop = true;
			site_state.results[k].warnigs.push("There is something wrong with '" + selected + "' option of '" + title + "'.");
		    } else {
			return false;
		    }
		}
	    });
	}
	cy.get("button[aria-label='clear icon']").eq(index0).click();
    });
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
    cy.get("button.v-btn--contained").eq(0).click();
    cy.go('back');
    cy.get("div.v-select__slot input:visible").eq(0).type(name_surname).wait(1000);
    cy.get("div.v-select__slot input:visible").eq(0).type("{enter}");
    cy.wait(2000);
    cy.check_profile_dashboard(site_state, k, name_surname);
    cy.go('back');
    cy.get("div.v-select__slot input:visible").eq(1).type(institute).wait(1000);
    cy.get("div.v-select__slot input:visible").eq(1).type("{enter}");
    cy.wait(2000);
    cy.check_institute_dashboard(site_state, k, institute);
    cy.go('back');
    cy.get("header .d-flex .v-toolbar__title").click();
})
