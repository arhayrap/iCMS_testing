Cypress.Commands.add("check_tables", (site_state, k, toggled = false) => {
    let white_list = false;
    site_state = site_state.results[k];
    cy.get("main").then(($body) => {
        cy.readFile("cypress/fixtures/white_list.json").then(($obj) => {
            let white_list = $obj[0]["links"].includes(site_state["url"]);
        });
        if ($body.find("table").length) {
	    if ($body.find(".v-slide-group__wrapper").length) {
		cy.get(".v-slide-group__wrapper .v-tab").as("tab_buttons").click({
		    multiple: true
		});
	    }
	    if ($body.find(".v-data-footer__pagination").length){
		cy.get(".v-data-footer__pagination").each((pagination, index0, paginations) => {
		    console.log( pagination.get(0).innerText,  "–", "    ", Number(pagination.get(0).innerText.split(" of ")[1]) );
                    if (pagination.get(0).innerText == "–" || Number(pagination.get(0).innerText.split(" of ")[1]) == 0) {
                        if (!toggled) {
                            site_state.warnings.push("Table warning: There is an empty table.");
                        } else {
                            site_state.warnings.push("Table warning: There is an empty table after toggling.");
                        }
                    }
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
	    }
	    if ($body.find(".v-data-footer__pagination").length){
		cy.get(".v-data-footer__pagination").each((pagination, index0, paginations) => {
                    if (pagination.get(0).innerText == "–" || Number(pagination.get(0).innerText.split(" of ")[1]) == 0) {
                        if (!toggled) {
                            site_state.warnings.push("Table warning: There is an empty table.");
                        } else {
                            site_state.warnings.push("Table warning: There is an empty table after toggling.");
                        }
                    }
                });
	    }
        }
    });
})

Cypress.Commands.add("check_units", (site_state, k, data) => {
    // Checking end date
    cy.get("table thead th").eq(8).click(); // sort by increasement
    cy.Open_All();
    cy.get("table tbody tr").each((tr, index0, trs) => {
	if (tr.get(0).children[8] != "") {
	    var time = new Date(tr.get(0).children[8].innerText.split("-")[0], tr.get(0).children[8].innerText.split("-")[1], tr.get(0).children[8].innerText.split("-")[2]).getTime();
	    var now  = new Date().getTime();
	    if (time > now) {
		site_state.warnings.push("Data with wrong date were returned.");
	    }
	    return false;
	}
    });
    // Checking end date after toggle
    cy.get("div.v-input--selection-controls__ripple").eq(1).as("checkbox").click();
    cy.get("table thead th").eq(8).click(); // sort by decreasement
    cy.get("table tbody tr").each((tr, index0, trs) => {
	if (tr.get(0).children[8] != "") {
	    var time = new Date(tr.get(0).children[8].innerText.split("-")[0], tr.get(0).children[8].innerText.split("-")[1], tr.get(0).children[8].innerText.split("-")[2]).getTime();
	    var now  = new Date().getTime();
	    console.log(time, now);
	    if (time < now) {
		site_state.results[k].warnings.push("Data with wrong date were returned (after the toggle).");
	    }
	    return false;
	}
    });
    cy.get("@checkbox").click();
    // Checking end date of new date
    cy.get("input[type='date']").type(data["date"]);
    cy.get("table thead th").eq(8).click(); // sort by increasement
    cy.Open_All();
    cy.get("table tbody tr").each((tr, index0, trs) => {
	if (tr.get(0).children[8] != "") {
	    var time = new Date(tr.get(0).children[8].innerText.split("-")[0], tr.get(0).children[8].innerText.split("-")[1], tr.get(0).children[8].innerText.split("-")[2]).getTime();
	    var now  = new Date().getTime();
	    if (time > now) {
		site_state.results[k].warnings.push("Data with wrong date were returned (new date without toggling).");
	    }
	    return false;
	}
    });
    // Checking units
    cy.get("main header button.v-btn").eq(0).click();
    cy.get("button.v-icon").click({
        multiple: true,
        force: true
    });
    cy.get("div.v-menu__content input").type(data["unit_name"]);
    cy.get("div.v-treeview-node__children div.v-treeview-node__content span").click();
    cy.get("main header div.v-toolbar__title").then(($elem) => {
        if ($elem.get(0).innerText.split(": ")[1] != data["unit_name"]) {
            site_state.results[k].warnings.push("Unit selection was not done correctly.");
        }
    });
    cy.get("main div.v-toolbar__content button.v-btn").eq(1).click().then(() => {
	cy.url().then((url) => {
	    console.log(url, site_state.results[k].url);
	    if (url != site_state.results[k].url) {
		site_state.results[k].warnings.push("Reference back to executive boards was not done correctly (wrong url in the result).");
	    }
	});
    }).wait(1000);
    // ------------------------------------------------------- Administrator -------------------------------------------------------------
    if (site_state.results[k].isAdmin){
	/* EDIT */
	cy.get("main header button.v-btn").eq(1).click();
	cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.edit.unit_domain, {force: true});
	cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.edit.unit_type,   {force: true});
	cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.edit.superior,    {force: true});
	cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.edit.enclosing,   {force: true});
	cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.edit.outermost,   {force: true});
	cy.get(".v-card .v-card__text input").eq(5).then((input) => {
	    if (data.edit.active && !input.get(0).checked) {
		cy.get(".v-card .v-card__text input").eq(5).click({force: true});
	    }
	});
	cy.get(".v-card button").eq(2).click({force: true});
	cy.get(".v-dialog--active").click().type("{esc}");
	cy.wait(1000);
	/* CREATE A NEW TENURE */
	cy.get("main header button.v-btn").eq(2).click();
	cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.add_tenure.unit_domain, {force: true});
	cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.add_tenure.unit_type,   {force: true});
	cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.add_tenure.superior,    {force: true});
	cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.add_tenure.enclosing,   {force: true});
	cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.add_tenure.outermost,   {force: true});
	cy.get(".v-card button").eq(2).click({force: true});
	cy.get(".v-dialog--active").click().type("{esc}");
	cy.wait(1000);
	/* CREATE A NEW UNIT */
	cy.get("main header button.v-btn").eq(3).click();
	cy.get(".v-card .v-card__text input").eq(0).click({force: true}).type(data.add_unit.unit_domain, {force: true});
	cy.get(".v-card .v-card__text input").eq(1).click({force: true}).type(data.add_unit.unit_type,   {force: true});
	cy.get(".v-card .v-card__text input").eq(2).click({force: true}).type(data.add_unit.superior,    {force: true});
	cy.get(".v-card .v-card__text input").eq(3).click({force: true}).type(data.add_unit.enclosing,   {force: true});
	cy.get(".v-card .v-card__text input").eq(4).click({force: true}).type(data.add_unit.outermost,   {force: true});
	cy.get(".v-card .v-card__text input").eq(5).then((input) => {
	    if (data.add_unit.active && !input.get(0).checked) {
		cy.get(".v-card .v-card__text input").eq(5).click({force: true});
	    }
	});
	cy.get(".v-card button").eq(2).click({force: true});
	cy.get(".v-dialog--active").click().type("{esc}");
	cy.wait(1000);
	/* ROW ACTIONS */
	cy.OpenAll();
	cy.get(".v-data-footer__pagination").then((rows_pagination) => {
	    var rows = Number(rows_pagination.get(0).innerText.split("of ")[1]);
	    var index = Math.round(Math.random() * (rows-1));
	    cy.get("table tbody tr").eq(index).then((tr) => {
		tr.find("button")[0].click();
		cy.get(".v-dialog .v-card__title").then((title) => {
		    if (title.get(0).innerText != "Edit unit: Executive Board") {
			site_state.results[k].warnings.push("The reference to the profile was not done correctly.");
		    }
		});
		cy.get(".v-dialog--active").click().type("{esc}");
	    });
	    cy.get("table tbody tr").eq(index).then((tr) => {
		tr.find("button")[1].click();
		cy.get(".v-dialog .v-card__title").then((title) => {
		    if (title.get(0).innerText != "Remove unit: Executive Board") {
			site_state.results[k].warnings.push("The reference to the profile was not done correctly.");
		    }
		});
		cy.get(".v-dialog--active").click().type("{esc}");
	    });
	    cy.get("table tbody tr").eq(index).then((tr) => {
		tr.find("button")[2].click();
		cy.get(".v-dialog .v-card__title").then((title) => {
		    if (title.get(0).innerText != "Create a new unit") {
			site_state.results[k].warnings.push("The reference to the profile was not done correctly.");
		    }
		});
		cy.get(".v-dialog--active").click().type("{esc}");
	    });
	});
    }

})

Cypress.Commands.add("check_dashboard", (site_state, k, data) => {
    cy.get(".v-main__wrap .v-card__actions button").eq(0).click();
    cy.go('back');
    cy.get("div.v-select__slot input:visible").eq(0).type(data["name_surname"]).wait(1000).type("{enter}").wait(2000);
    cy.check_profile_dashboard(site_state, k, data["name_surname"]);
    cy.go('back');
    cy.get("div.v-select__slot input:visible").eq(1).type(data["institute"]).wait(1000).type("{enter}").wait(2000);
    cy.check_institute_dashboard(site_state, k, data["institute"]);
    cy.go('back');
    cy.get("header .d-flex .v-toolbar__title").click();
})

Cypress.Commands.add("check_profile_dashboard", (site_state, k, data) => {
    cy.get("div.row div.v-card div.v-card__text").eq(1).find("div.v-list-item__subtitle")
        .should(($title) => {
            expect($title).to.contain("Full Name");
        })
        .siblings("div.v-list-item__title").eq(0).then(($elem) => {
            if (!name) {
                if ($elem.get(0).innerText != data) {
		    site_state.results[k].warnings.push("The reference to the profile was not done correctly.");
                }
            } else {
                if ($elem.get(0).innerText != data) {
                    site_state.results[k].warnings.push("The reference to the profile was not done correctly.");
                }
            }
        });
})

Cypress.Commands.add("check_institute_dashboard", (site_state, k, data) => {
    cy.get("div.v-card .container").find(".row div.col-9").eq(0).then(($elem) => {
        console.log($elem.get(0).innerText == data);
        if ($elem.get(0).innerText != data) {
            site_state.results[k].warnings.push("The reference to the institute was not done correctly.");
        }
    });
})

Cypress.Commands.add("check_logo_reference", (site_state, k, base) => {
    site_state = site_state.results[k];
    cy.get("header .d-flex .v-toolbar__title").click();
    if (cy.url() != base) {
        site_state.results[k].warnings.push("The logo reference was not done correctly.");
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
    let key = [6, 8, 5];
    let menu_item = "";
    let n_thead;
    let stop = false;
    cy.get(".v-data-footer__select div[role='button'] .v-select__slot").click();
    cy.get("div.menuable__content__active div[role='option']").eq(2).click();
    cy.get(".v-card__title .row .v-input").as("menu_items").each((item0, index0, items0) => {
        if (index0 == 0 || index0 == 1 || index0 == 2) {
            cy.get("@menu_items").eq(index0).click().wait(1000);
            cy.get("body").then((body) => {
        	if (index0 == 0){
                cy.get("div:visible.v-menu__content div[aria-selected='true']").click({
                    multiple: true
                }).wait(9000);
                }
                cy.get(".v-card__title .row .v-input").eq(index0).then((i) => {
                    menu_item = i.get(0).innerText;
                });
                cy.get("div:visible.v-menu__content div[role='listbox'] div[aria-selected='false']").as("outline").then((items1) => {
		    let element = Math.round((items1.length - 1) * Math.random());
		    let item1 = items1.get(element);
        	    cy.get("@outline").eq(element).click({force: true}).wait(4000);
                    if (cy.get("body").find("tbody tr[class='']").length != 0) {
                        cy.get("tbody tr[class='']").each((tr, index, trs) => {
                            if (tr.get(0).children[key[index0]].innerText != item1.innerText) {
				// console.log(tr.get(0).children[key[index0]].innerText, " <====> ", item1.innerText);
                                if (!stop) {
                                    site_state.results[k].warnings.push("There is someting wrong in menu`s '" + menu_item + "' '" + item1.innerText + "' table.");
                                    stop = true;
                                    return false;
                                } else {
                                    return false;
                                }
                            }
                        });
                	cy.get("@outline").eq(element).click({force: true}).wait(4000);
                    } else {
                        site_state.results[k].warnings.push("The menu`s '" + menu_item + "', '" + item1.innerText + "' table is empty.");
                        return false;
                    }
                });
            });
        } else if (index0 == 4) {
            cy.get(".v-data-table__wrapper thead tr").children().then((elems) => {
                n_thead = elems.length;
            });
            cy.get("@menu_items").eq(index0).click().wait(5000);
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
        if (site_state.results[k].isAdmin) {
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
        cy.check_tables(site_state, k, true);
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
    let table_rows = NaN;
    let n_initial = NaN;
    let n_final = NaN;
    let th, op, title;
    cy.get(".v-card__title .col-4 .v-input__slot").as("title").each((d, index0, ds) => {
        cy.get("@title").eq(index0).click().wait(500);
        cy.get(".v-card__title .col-4 label").eq(index0).then((label) => {
            title = label.get(0).innerText;
        if (index0 == 0  || index0 == 1) {
	    cy.get("div.v-menu__content div[aria-selected='true']").click({multiple:true, force:true});
            cy.get("div.v-menu__content div:visible[aria-selected='false']").as("options1").each((option, index1, options) => {
                if (cy.get("body").find("tbody tr[class='']").length != 0) {
			//console.log(options);
        		op = options.get(index1).innerText;
        		cy.get(".v-data-footer__pagination").then((table_rows) => {
			    n_initial = Number(table_rows.get(0).innerText.split("of ")[1]);
			    cy.get("@options1").eq(index1).click({force: true}).wait(4000);
        		    cy.get(".v-data-footer__pagination").then((table_rows) => {
				n_final = Number(table_rows.get(0).innerText.split("of ")[1]);
                        	console.log(label.get(0).innerText, options.get(index1).innerText);
                	        console.log(n_initial, n_final);
        			if (n_initial == n_final && index1 != 0) {
        			    site_state.results[k].warnings.push("The '" + options.get(index1).innerText + "' option of '" + label.get(0).innerText + "' dropdown changed nothing.");
        			} else if (n_final == 0 && index1 == 0) {
				    site_state.results[k].warnings.push("The menu`s '" + options.get(index1).innerText + "', '" + label.get(0).innerText + "' table is empty.");
        			}
        		    });
                        });
        		cy.get("@options1").eq(index1).click({force: true}).wait(4000);
                } else {
                    site_state.results[k].warnings.push("The menu`s '" + options.get(index1).innerText + "', '" + label.get(0).innerText + "' table is empty.");
                    // return false;
                }
            });
        } else if (index0 == 2) {
            cy.get("div.v-menu__content div:visible[aria-selected='false']").as("options2").each((option, index1, options) => {
		//console.log(options);
                cy.get(".v-data-footer__pagination").then((table_rows) => {
                    n_initial = Number(table_rows.get(0).innerText.split("of ")[1]);
                });
                cy.get("@options2").eq(index1).click({force:true});
                cy.wait(2000);
                cy.get("table thead tr th").as("ths").eq(1).then((table_header) => {
                    th = table_header.get(0).innerText;
                    op = options.get(index1).innerText;
                    cy.get(".v-data-footer__pagination").then((table_rows) => {
                        n_final = Number(table_rows.get(0).innerText.split("of ")[1]);
			console.log(options.get(index1).innerText, label.get(0).innerText);
			console.log(n_initial, n_final);
                        if (op != th) {
                            site_state.results[k].warnings.push("The '" + options.get(index1).innerText + "' option of '" + label.get(0).innerText + "' did'nt create a column.");
                        } else if (n_initial == n_final) {
                            site_state.results[k].warnings.push("The '" + options.get(index1).innerText + "' option of '" + label.get(0).innerText + "' did'nt create rows.");
                        } else if (n_initial == n_final && op != th) {
                            site_state.results[k].warnings.push("The '" + options.get(index1).innerText + "' option of '" + label.get(0).innerText + "' did'nt create a column.");
                            site_state.results[k].warnings.push("The '" + options.get(index1).innerText + "' option of '" + label.get(0).innerText + "' did'nt create rows.");
                        }
                    });
                });
		cy.get("@options2").eq(index1).click({force:true});
            });
        }
        });

    });
})
Cypress.Commands.add("check_flags", (site_state, k, flags_name) => {
    cy.Open_All();
    cy.get(".v-card__title .col-2").as("elems").each((elem, index0, elems) => {
        var stop = false;
        var title, n_options = NaN, selected;
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
	if (site_state.results[k].isAdmin) {
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
     if (site_state.results[k].isAdmin) {
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
    if (site_state.results[k].isAdmin) {
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

Cypress.Commands.add("room_booking", (site_state, k, data) => {
    /*Create a booking*/
    cy.get("button.mr-2").click();
    cy.get(".v-dialog--active form input[type='text']").eq(0).click({force: true}).type(data.create.title,     {force: true});
    cy.get(".v-dialog--active form input[type='text']").eq(3).click({force: true}).type(data.create.starts_at, {force: true});
    cy.get(".v-dialog--active form input[type='text']").eq(4).click({force: true}).type(data.create.ends_at,   {force: true});
    cy.get(".v-dialog--active form input[type='text']").eq(7).click({force: true}).type(data.create.project,   {force: true});
    cy.get(".v-dialog--active button").eq(1).click({force: true});
    cy.get(".v-dialog--active").click().type("{esc}");
    cy.get(".v-select__selections input:visible").click({force:true}).type(data.cmsWeek).type("{enter}");
    if (site_state.results[k].isAdmin) {
	/*(+) button*/
	cy.get("button.mr-2").contains("+").click();
	cy.get(".v-dialog--active form input[type='text']").eq(0).click({force: true}).type(data.create.title,     {force: true});
	cy.get(".v-dialog--active form input[type='text']").eq(3).click({force: true}).type(data.create.starts_at, {force: true});
	cy.get(".v-dialog--active form input[type='text']").eq(4).click({force: true}).type(data.create.ends_at,   {force: true});
	cy.get(".v-dialog--active form input[type='text']").eq(7).click({force: true}).type(data.create.project,   {force: true});
	cy.get(".v-dialog--active button").eq(1).click({force: true});
	cy.get(".v-dialog--active").click().type("{esc}");
	/*Checking modals of approved and pendings*/
	// Approved
	cy.get(".booking").should("have.css", "background: rgb(85, 189, 213) none repeat scroll 0% 0%;").as("approved").then((divs) => {
	    cy.get(".booking .booking-title").should("have.css", "background: rgb(85, 189, 213) none repeat scroll 0% 0%;")
		.eq(Math.round(Math.random()*(divs.length-1)))
		.as("chosen_approved")
		.then((chosen_approved) => {
		    cy.get("body").then((body) => {
			if (!body.find(".v-dialog--active").length) {
			    site_state.results[k].append("The modal was not opened.");
			    return false;
			}
		    });
		    cy.get("@chosen_approved").click({force:true});
		    cy.get(".v-dialog--active").then((dialog) => {
			if (dialog.innerText.split(" (")[0] != chosen_approved.innerText) {
			    site_state.results[k].append("A wrong modal was opened.");
			    return false;
			}
		    });
		    cy.get(".v-dialog--active button").then((buttons) => {
			if (buttons.length != 1) {
			    site_state.results[k].append("An 'approved' modal was not opened.");
			    return false;
			}
		    });
		});
	    });
	// Pending
	cy.get(".booking").should("have.css", "background: rgb(241, 151, 51) none repeat scroll 0% 0%;").as("pending").then((divs) => {
	    cy.get(".booking .booking-title").should("have.css", "background: rgb(85, 189, 213) none repeat scroll 0% 0%;")
		.eq(Math.round(Math.random()*(divs.length-1)))
		.as("chosen_pending")
		.then((chosen_approved) => {
		    cy.get("body").then((body) => {
			if (!body.find(".v-dialog--active").length) {
			    site_state.results[k].append("The modal was not opened.");
			    return false;
			}
		    });
		    // Checking pending approval
		    cy.get("@chosen_pending").click({force:true});
		    cy.get(".v-dialog--active").then((dialog) => {
			if (dialog.innerText.split(" (")[0] != chosen_approved.innerText) {
			    site_state.results[k].append("A wrong modal was opened.");
			    return false;
			}
		    });
		    cy.get(".v-dialog--active button").then((buttons) => {
			if (buttons.length != 3) {
			    site_state.results[k].append("A 'pending' modal was not opened.");
			    return false;
			}
			cy.wait_for_requests("@puts");
			cy.get(".v-dialog--active button").eq(0).click().wait(1000);
			if (!body.find(".v-dialog--active").length) {
			    site_state.results[k].append("The confirmation modal was not opened.");
			    return false;
			}
			cy.get(".v-dialog--active button").eq(1).click().wait(1000);
		    // Checking pending removal
			cy.get("@chosen_pending").click({force:true});
			cy.get(".v-dialog--active button").then((buttons) => {
			    cy.wait_for_requests("@puts");
			    cy.get(".v-dialog--active button").eq(1).click().wait(1000);
			    if (!body.find(".v-dialog--active").length) {
				site_state.results[k].append("The removal modal was not opened.");
				return false;
			    }
			    cy.get(".v-dialog--active button").eq(1).click().wait(1000);
			});
		    });
		});
	});

	// Checking the arrows
	cy.get(".day-picker .day").then((date0) => {
	    cy.get(".day-picker button").eq(0).click().wait(500);
	    cy.get(".day-picker .day").then((date1) => {
		if ((Number(date0.get(0).innerText.split(" ")[1]) - Number(date1.get(0).innerText.split(" ")[1])) != 1) {
		    site_state.results[k].append("A passing to a wrong date (<-).");
		}
	    });
	    cy.get(".day-picker button").eq(1).click().click().wait(500);
	    cy.get(".day-picker .day").then((date2) => {
		if ((Number(date1.get(0).innerText.split(" ")[1]) - Number(date0.get(0).innerText.split(" ")[1])) != 1) {
		    site_state.results[k].append("A passing to a wrong date (->).");
		}
	    });
	});
    }
})

Cypress.Commands.add("Open_All", () => {
    cy.get(".v-data-footer .v-input__control").click();
    cy.get("div.menuable__content__active div[role='option']").eq(3).click();
})
