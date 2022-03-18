# iCMS_testing

```terminal
cd iCMS_testing

npm install
```

The suit contains "epr_links_spec.js", "tools_links_spec.js" scripts which are used ot get the links of the webpages of each website. Also the "tools" website requires to have the longest request urls for each website, so the get them "tools_request_url.js" scripts is used.
To update the urls and to get the longest request urls:
```terminal
python run_request_url.py
Type login: 
Type password: 
Are you an admin? (y or n): 
```

The website that should be tested can be mentioned inside the "run_parallel.py" script.
To run the pages testing in parallel:
```terminal
python run_parallel.py <number_of_jobs>
Type login: 
Type password: 
Are you an admin? (y or n): 
```

For visualiazation of the results the 'visualization.py' script is used. 
```terminal
python ./data/visualization.py ./data/tools_out/tools_out_*.json

python ./data/visualization.py ./data/epr_out/epr_out_*.json
```

