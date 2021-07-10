describe("Checking tools", () => {
    /*var site_state = [{
        date: "",
        username: "",
        results: [],
        cons_failed_pages: 0,
        app_status: ""
    }];*/

    var links_path = "cypress/fixtures/tools_links.json";
    var base = "https://icms.cern.ch/tools/";
    var profile = "https://icms.cern.ch/tools/user/profile";
    var user_path = "cypress/fixtures/users.json";
    var out_path = "data/tools_out.json";
    var out_path_light = "data/tools_out_surf.json";

    var name_surname = "Aram Hayrapetyan";
    var institute = "Yerevan Physics Institute";
    var unit_name = "MUON Subdetector";
    var date = "2012-12-10";
<<<<<<< HEAD
    var rooms_data = {
	custom_name:"Test name",
	indico_id:None,
	building:"Building name",
	floor:None,
	room_rm:None,
	at_cern:true
    };
    var weeks_data = {
	title:"Test title",
	start_date:"2022-11-10",
	end_date:"2022-11-17",
	is_out_cern:false
    };
=======
    var flag_name = "Aarnio Pertti A.";
>>>>>>> d7ea09be519581d90802012a904b4d78a677cba2

    var user_index = 0;
    var page_fail_limit = 5;
    var page_fails = 0;
    var n = 31;
    var start = 4;

    var env = Cypress.env()["flags"]
    var login    = env["login"];
    var password = env["password"];
    var mode     = env["mode"];
    var isadmin  = env["isAdmin"] == "true";

    if (mode == "light") {
        var site_state = [{
            date: "",
            username: "",
<<<<<<< HEAD
            isAdmin: isadmin,
=======
>>>>>>> d7ea09be519581d90802012a904b4d78a677cba2
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
        var site_state = [{
            date: "",
            username: "",
<<<<<<< HEAD
            isAdmin: isadmin,
=======
>>>>>>> d7ea09be519581d90802012a904b4d78a677cba2
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
        it("Logs in and tests the pages in '" + mode + "' mode.", () => {
            cy.server();
            site_state[0].date = Cypress.moment().format("MM-DD-YYYY, h:mm");
            //cy.listen_fails(site_state, k, base, links_path, out_path);
            cy.intercept({
		url: "https://auth.cern.ch/auth/**",
                onResponse: (xhr) => {if (xhr.status <= 600 && xhr.status >= 400) {site_state[0].results[k].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);}}
            }).as("auth");
	    cy.route({
		url: "https://icms.cern.ch/tools-api/**",
                onResponse: (xhr) => {if (xhr.status <= 600 && xhr.status >= 400) {site_state[0].results[k].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);}}
            }).as("gets");
            cy.route({
		method: "POST",
		url: "https://icms.cern.ch/tools-api/**",
                onResponse: (xhr) => {if (xhr.status <= 600 && xhr.status >= 400) {site_state[0].results[k].errors.push("POST request error : " + xhr.status + "  " + xhr.statusMessage);}}
            }).as("posts");
            cy.route({
		method: "POST",
		url: "**/restplus/relay/piggyback/people/statuses/requests/",
                onResponse: (xhr) => {if (xhr.status <= 600 && xhr.status >= 400) {site_state[0].results[k].errors.push("Em-nominations, POST request error : " + xhr.status + "  " + xhr.statusMessage);}}
            }).as("em_nom");
	    cy.route({
		method: "PUT",
		url: "https://icms.cern.ch/tools-api/**",
                onResponse: (xhr) => {if (xhr.status <= 600 && xhr.status >= 400) {site_state[0].results[k].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);}}
            }).as("puts");
            cy.route({
		method: "DELETE",
		url: "https://icms.cern.ch/tools-api/**",
                onResponse: (xhr) => {if (xhr.status <= 600 && xhr.status >= 400) {site_state[0].results[k].errors.push("GET request error : " + xhr.status + "  " + xhr.statusMessage);}}
            }).as("deletes");

            cy.readFile(links_path).then(($link_obj) => {
                let links = $link_obj[0]["links"];
                let link = links[k + start];
                site_state[0].results[k].url = link;
                if (mode == "light") {
                    console.log("light")
                    cy.visit(link);
                    site_state[0].username = login;
                    cy.login(login, password);
		    cy.wait_for_requests("@auth");
		    cy.wait_for_requests("@gets");
                    cy.wait(2000);
                    if (link == profile) {
                        cy.check_profile_dashboard(site_state[0], k, base);
                        cy.check_logo_reference(site_state[0], base);
                    } else if (link == base) {
                        cy.check_dashboard(site_state[0], k, base, name_surname, institute);
                    } else if (link == base + "collaboration/units") {
                        cy.check_units(site_state[0], k, unit_name, date);
                    } else if (link == base + "collaboration/institutes") {
                        cy.check_tables(site_state[0].results[k]);
			cy.check_institutes(site_state[0], k);
                    } else if (link == base + "collaboration/people") {
                        cy.check_tables(site_state[0].results[k]);
                        cy.check_people(site_state[0], k);
                    } else if (link == base + "collaboration/mo-list") {
                        cy.check_tables(site_state[0].results[k]);
                        cy.check_mo_list(site_state[0], k);
                    } else if (link == base + "/collaboration/emeritus-nominations") {
                        cy.check_tables(site_state[0].results[k]);
                        cy.check_em_nominations(site_state[0], k);
                    } else if (link == base + "/collaboration/statistics") {
                        cy.check_tables(site_state[0].results[k]);
                        cy.check_statistics(site_state[0], k);
                    } else if (link == base + "/collaboration/flags") {
                        cy.check_tables(site_state[0].results[k]);
<<<<<<< HEAD
                        cy.check_flags(site_state[0], k);
                    } else if (link == base + "/collaboration/cms-week/rooms") {
                        cy.check_rooms(site_state[0], k, rooms_data);
                        cy.check_tables(site_state[0].results[k]);
                    } else if (link == base + "/collaboration/cms-week/weeks") {
                        cy.check_weeks(site_state[0], k, weeks_data);
                        cy.check_tables(site_state[0].results[k]);
=======
                        cy.check_flags(site_state[0], k, flag_name);
>>>>>>> d7ea09be519581d90802012a904b4d78a677cba2
                    }
		    /* else if (link == base + "/institute/overdue-graduations") {
                        cy.check_ov_graduations(site_state[0], k);
                        cy.check_tables(site_state[0].results[k]);
                    } else if (link == base + "/collaboration/tenures") {
                        cy.check_tenures(site_state[0], k);
                        cy.check_tables(site_state[0].results[k]);
                    } */
		    else{
                        cy.check_tables(site_state[0].results[k]);
		    }
                    //cy.check_tables(site_state[0].results[k]);
                } else if (mode == "entire") {
                    cy.get_stat_dur(link, site_state, k, page_fail_limit);
                    site_state[0].results[k].load_time = performance.now();
                    cy.visit(link);
                    site_state[0].username = login;
                    cy.login(login, password);
		    cy.wait_for_requests("@auth");
                    cy.wait_for_requests("@gets");
                    cy.wait(2000);
                    cy.get_load_time(site_state[0].results[k]);
                    if (link == profile) {
                        cy.check_profile_dashboard(site_state[0], k, base);
                        cy.check_logo_reference(site_state[0], base);
                    } else if (link == base) {
                        cy.check_dashboard(site_state[0], k, base, name_surname, institute);
                    } else if (link == base + "collaboration/units") {
                        cy.check_units(site_state[0], k, unit_name, date);
                    } else if (link == base + "collaboration/institutes") {
                        cy.check_tables(site_state[0].results[k]);
			cy.check_institutes(site_state[0], k);
                    } else if (link == base + "collaboration/people") {
                        cy.check_tables(site_state[0].results[k]);
			cy.check_people(site_state[0], k);
                    } else if (link == base + "collaboration/mo-list") {
                        cy.check_tables(site_state[0].results[k]);
			cy.check_mo_list(site_state[0], k);
                    } else if (link == base + "/collaboration/emeritus-nominations") {
                        cy.check_em_nominations(site_state[0], k);
                        cy.check_tables(site_state[0].results[k]);
                    } else if (link == base + "/collaboration/statistics") {
                        cy.check_tables(site_state[0].results[k]);
			cy.check_statistics(site_state[0], k);
                    } else if (link == base + "/collaboration/flags") {
                        cy.check_tables(site_state[0].results[k]);
<<<<<<< HEAD
			cy.check_flags(site_state[0], k);
                    } else if (link == base + "/collaboration/cms-week/rooms") {
                        cy.check_rooms(site_state[0], k, rooms_data);
                        cy.check_tables(site_state[0].results[k]);
                    } else if (link == base + "/collaboration/cms-week/weeks") {
                        cy.check_weeks(site_state[0], k, weeks_data);
                        cy.check_tables(site_state[0].results[k]);
=======
			cy.check_flags(site_state[0], k, flag_name);
>>>>>>> d7ea09be519581d90802012a904b4d78a677cba2
                    }
		    /*
		    else if (link == base + "/institute/overdue-graduations") {
                        cy.check_ov_graduations(site_state[0], k);
                        cy.check_tables(site_state[0].results[k]);
                    } else if (link == base + "/collaboration/tenures") {
                        cy.check_tenures(site_state[0], k);
                        cy.check_tables(site_state[0].results[k]);
                    }
		    */
		    else{
                        cy.check_tables(site_state[0].results[k]);
		    }
                }
            });
            if (mode == "light") {
                cy.writeFile(out_path_light, site_state);
                cy.save_data(site_state[0].results[k], base, mode = mode);
            } else {
                cy.writeFile(out_path, site_state);
                cy.save_data(site_state[0].results[k], base);
            }
            console.log(site_state);
        })
    }
});