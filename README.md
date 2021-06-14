# iCMS_testing

```terminal
cd iCMS_testing

npm install
```

For specific scripts and "light" mode:
```terminal
python run.py light --spec ["cypress/integration/tools_test_spec.js","cypress/integration/epr_test_spec.js"]
Type login: 
Type password: 
```

Mode: light, entire, both.

```terminal
python ./data/visualization.py ./data/tools_out.json

python ./data/visualization.py ./data/epr_out.json

python ./data/visualization.py ./data/tools_out_surf.json

python ./data/visualization.py ./data/epr_out_surf.json
```
