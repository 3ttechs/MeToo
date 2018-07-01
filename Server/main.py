'''
Compilation Steps: 
pyinstaller main.py
'''

import sqlite3
from flask import Flask, request,json,send_from_directory,Response,render_template,send_file, url_for
from  db_utilities import *
import requests

app = Flask(__name__,static_url_path = "", static_folder = "static")


@app.route('/')
def home():
    return('Meditation Cure Application')


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin','*')
    response.headers.add('Access-Control-Allow-Headers','Origin,Accept,X-Requested-With,Content-Type')
    response.headers.add('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,OPTIONS')
    return response

def load_properties(filepath, sep=':', comment_char='#'):
    """
    Read the file passed as parameter as a properties file.
    """
    props = {}
    with open(filepath, "rt") as f:
        for line in f:
            l = line.strip()
            if l and not l.startswith(comment_char):
                key_value = l.split(sep)
                key = key_value[0].strip()
                value = sep.join(key_value[1:]).strip().strip('"')
                props[key] = value
    return props

if __name__ == '__main__':
    props = load_properties('config_file.txt')
    for prop in props:
        if(prop=='main_server_host'): main_server_host =props[prop]
        if(prop=='main_server_port'): main_server_port =props[prop]

    app.run(host=main_server_host, port=main_server_port)
