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
    return('MeToo Application API')

#http://localhost:5000/add_meeting - Done
#http://localhost:5000/get_meeting_list -Done
#http://localhost:5000/get_meeting_details - Done
#http://localhost:5000/get_meeting_attendees
#http://localhost:5000/get_meeting_attendees_feedback
#http://localhost:5000/update_meeting_response

#http://localhost:5000/add_feedback

#http://localhost:5000/login - Done
#http://localhost:5000/get_contacts_list
#http://localhost:5000/get_notifications_list
#http://localhost:5000/add_general_comments
#http://localhost:5000/add_new_user
#http://localhost:5000/add_contact
#http://localhost:5000/upade_user_profile

#http://localhost:5000/login
# body : {"login_id": "a","passwd":"a"}
@app.route('/login', methods=['GET'])
def login():
    d = json.loads(request.data)
    login_id = d['login_id']
    passwd = d['passwd']

    query = 'select user_id from user where login_id = "'+ login_id +'" and passwd = "' +passwd +'"'
    print(query)
    result = run_query(query)
    user_id = result[0]['user_id']
    print(user_id)
    return str(user_id), 200

#http://localhost:5000/get_meeting_list/user_id=1
@app.route('/get_meeting_list/user_id=<user_id>', methods=['GET'])
def get_meeting_list(user_id):
    query = 'select distinct meeting_id from attendee where attendee_id = "'+ user_id +'"'
    result_list = run_query(query)
    meeting_ids=[]
    for result in result_list:
        meeting_ids.append(result['meeting_id'])
    
    meeting_ids_str = ','.join(str(e) for e in meeting_ids)    
    query = 'select * from meeting where organiser_id = "'+ user_id +'" or meeting_id in ('+meeting_ids_str+')'
    result = run_query(query)

    return json.dumps(result), 200

#http://localhost:5000/get_meeting_details/meeting_id=1
@app.route('/get_meeting_details/meeting_id=<meeting_id>', methods=['GET'])
def get_meeting_details(user_id):
    query = 'select * from meeting where meeting_id ='+ meeting_id
    result = run_query(query)
    return "", 200


''' ------------------------------------BODY JSON-------------------------------------------------------------
{
  "organiser_id": 1,
  "title": "Sample meeting",
  "category": "Business",
  "venue": "Office",
  "notes": "Sample notes",
  "all_day": 1,
  "start_date": "08-07-2018",
  "end_date": "08-07-2018",
  "start_time": "10:00",
  "end_time": "11-00",
  "attendee_ids": [ 2,3]
}
'''
#http://localhost:5000/add_meeting
@app.route('/add_meeting', methods=['GET'])
def add_meeting():
    d = json.loads(request.data)

    organiser_id = d['organiser_id']
    title = d['title']
    category=data = d['category']
    venue = d['venue']
    notes = d['notes']
    all_day = d['all_day']
    start_date = d['start_date']
    end_date = d['end_date']
    start_time = d['start_time']
    end_time = d['end_time']
    attendee_count = len(d['attendee_ids'])
    attendee_ids = d['attendee_ids']
    response ='ACTIVE'

    query = "INSERT INTO meeting \
    (organiser_id, title,  category,venue,notes,start_date,end_date,start_time,end_time,response) \
    VALUES (%d,'%s','%s','%s','%s','%s','%s','%s','%s','%s' )"% \
    (organiser_id, title,  category,venue,notes,start_date,end_date,start_time,end_time,response)
    run_insert_query(query)
    meeting_id = run_select_query('SELECT MAX(meeting_id) FROM meeting')[0][0]

    for attendee_id in attendee_ids:
        print('attendee_id: ',attendee_id)
        query = "INSERT INTO feedback (meeting_id,attendee_id) VALUES (%d,%d)"% (meeting_id,attendee_id)
        run_insert_query(query)
        feedback_id = run_select_query('SELECT MAX(feedback_id) FROM feedback')[0][0]

        query = "INSERT INTO attendee \
        (meeting_id, attendee_id,  feedback_id) \
        VALUES (%d,%d,%d)"% \
        (meeting_id, attendee_id,  feedback_id)
        run_insert_query(query)

    return "1", 200


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin','*')
    response.headers.add('Access-Control-Allow-Headers','Origin,Accept,X-Requested-With,Content-Type')
    response.headers.add('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,OPTIONS')
    return response

"""
Read the file passed as parameter as a properties file.
"""

def load_properties(filepath, sep=':', comment_char='#'):
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
