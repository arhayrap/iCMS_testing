# iCMS_testing

```terminal
cd iCMS_testing

npm install

npm run cy:run -- --env flags='{"login":"login","password":"password","mode":""}'
```

For specific scripts and "light mode:
```terminal
npm run cy:run -- --env flags='{"login":"login","password":"password","mode":"light"}' --spec ["cypress/integration/tools_test_spec.js","cypress/integration/epr_test_spec.js"]
```

```terminal
python ./data/visualization.py ./data/tools_out.json

python ./data/visualization.py ./data/epr_out.json

python ./data/visualization.py ./data/tools_out_surf.json

python ./data/visualization.py ./data/epr_out_surf.json
```
