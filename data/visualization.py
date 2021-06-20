import plotly.graph_objects as go
from plotly.colors import n_colors

import dash_html_components as html
import dash_core_components as dcc
import dash_table_experiments as dt

import dash
import dash_table
import numpy as np
import pandas as pd
import sys

data = pd.read_json(sys.argv[1])
dataf = pd.DataFrame(data.iloc[0]["results"])
dataf["warnings"] = dataf["warnings"].apply(lambda a: "\n".join(a) if a != [] else "")
dataf["errors"] = dataf["errors"].apply(lambda a: "\n".join(a) if a != [] else "")

style_def = [{
    'if': {
        'column_id': 'errors',
    },
    'backgroundColor': '#dc3545',
    'font-weight': 'bold',
    'color': 'white',
}, {
    'if': {
        'column_id': 'warnings',
    },
    'backgroundColor': '#ff6700',
    'font-weight': 'bold',
    'color': 'white',
}, ]

style_err = [{
        'if': {
            'filter_query': '{errors} = ""',
            'column_id': 'errors'
        },
        'backgroundColor': 'lightgreen',
        'color': 'black',
    }
    for i in range(len(dataf["errors"]))
]

style_warn = [{
        'if': {
            'filter_query': '{warnings} = ""',
            'column_id': 'warnings'
        },
        'backgroundColor': "white",
        'color': 'black',
    }
    for i in range(len(dataf["errors"]))
]

style = style_def + style_err + style_warn
columns = dataf.columns

app = dash.Dash(__name__)
app.layout = dash_table.DataTable(
    style_cell = {
        'height': 'auto',
        'padding': '0.5%',
        'background-color': 'white',
        'text-align': 'center'
    },
    style_header = {
        'backgroundColor': 'white',
        'fontWeight': 'bold',
        'fontSize': 'larger',
        'border': '1px solid black'
    },
    page_size = 100,
    columns = [{
            'id': c,
            'name': c
        }
        for c in dataf.columns
    ],
    data = dataf.to_dict('records'),
    style_data = {
        'whiteSpace': 'pre-line',
        'border-left': '1px solid black',
        'border-right': '1px solid black',
        'border-top': '0px solid lightgreen',
        'border-bottom': '0px solid lightgreen',
        'height': 'auto'
    },
    style_data_conditional = style,
)

if __name__ == "__main__":
    app.run_server(debug = True)
