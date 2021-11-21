# iCMS_testing

```terminal
cd iCMS_testing

npm install
```

Mode: "lite", "entire", "both".

The path to the scripts and the mode are written in 'input.json'.
To run pages testing:
```terminal
python run.py input.json
Type login: 
Type password: 
Are you an admin? (y or n): 
```

For visualiazation of the results the 'visualization.py' script is used. 
```terminal
python ./data/visualization.py ./data/tools_out.json

python ./data/visualization.py ./data/epr_out.json

python ./data/visualization.py ./data/tools_out_surf.json

python ./data/visualization.py ./data/epr_out_surf.json
```

