'''
Compilation Steps: 
pyinstaller main.py
'''

import sqlite3
import requests
from datetime import datetime
from flask import Flask, request,json,send_from_directory,Response,render_template,send_file, url_for, redirect
from flask_mail import Mail, Message
from flask_dance.contrib.twitter import make_twitter_blueprint, twitter
from flask_dance.contrib.google import make_google_blueprint, google
from meeting_services import *
from user_services import *
from feedback_services import *
from social_services import *
from global_params import *
from pyfcm import FCMNotification


#from  login_with_social import *

import os

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

@app.route('/')
def home():    return('MeToo Application API')

'''
-------------------------------------------------------------------------------
                             USER SERVICES
-------------------------------------------------------------------------------
'''

''' 
{
  "login_id": "Lakshmy",
  "passwd": "LaKsHmY",
  "user_name": "Lakshmy", 
  "phone_no": "9988776655",
  "email": "g@h.com"
}
'''
# If new user already exist, return 0
#http://localhost:5000/add_new_user
@app.route('/add_new_user', methods=['POST'])
def add_new_user_method():    return(add_new_user())

#http://localhost:5000/login
# body : {"login_id": "b","passwd":"b"}
@app.route('/login', methods=['POST'])
def login_method():    return(login())


''' 
{
  "user_id": 1,  
  "contact_name": "Lakshmy", 
  "phone_no": "9988776655",
  "email": "g@h.com"
}
'''
# If User already exist, use the contact_id
#http://localhost:5000/add_contact
@app.route('/add_contact', methods=['POST'])
def add_contact_method(): return(add_contact())

''' 
{
  "user_id": 1,
  "login_id": "Lakshmy",
  "passwd": "LaKsHmY",
  "user_name": "Lakshmy", 
  "phone_no": "9988776655",
  "email": "g@h.com"
}
'''
#http://localhost:5000/update_user_profile
@app.route('/update_user_profile', methods=['POST'])
def update_user_profile_method():    return(update_user_profile())

''' 
{
  "user_id": 1,
  "email_notify": 1,
  "app_notify": 1,
  "business_category_color": "#ff0000", 
  "personal_category_color": "#00ff00",
}
'''
#http://localhost:5000/add_update_settings
@app.route('/add_update_settings', methods=['POST'])
def add_update_settings_method(): return(add_update_settings())

#http://localhost:5000/get_user_details/user_id=1
@app.route('/get_user_details/user_id=<user_id>', methods=['GET'])
def get_user_details_method(user_id): return(get_user_details(user_id))

#http://localhost:5000/forgot_password/login_id='Lakshmy'
@app.route('/forgot_password/login_id=<login_id>', methods=['GET'])
def forgot_password_by_login_id_method(login_id): return(forgot_password_by_login_id(login_id))

#http://localhost:5000/forgot_password/email='lakshmynarayanan.al@gmail.com'
@app.route('/forgot_password/email=<email>', methods=['GET'])
def forgot_password_by_email_method(email): return(forgot_password_by_email(email))

#http://localhost:5000/get_contacts_list/user_id=1
@app.route('/get_contacts_list/user_id=<user_id>', methods=['GET'])
def get_contacts_list_method(user_id): return(get_contacts_list(user_id))

#http://localhost:5000/delete_contact/user_id=6,contact_id=6 
@app.route('/delete_contact/user_id=<user_id>,contact_id=<contact_id>', methods=['GET'])
def delete_contact_method(user_id,contact_id): return(delete_contact(user_id,contact_id))

'''
-------------------------------------------------------------------------------
                             MEETING SERVICES
-------------------------------------------------------------------------------
'''
''' 
{
  "organiser_id":1,
  "title":"a",
  "category":"Personal",
  "venue":"a",
  "notes":"a",
  "start_date":"2018-8-3",
  "end_date":"2018-8-3",
  "start_time":"16:47",
  "end_time":"17:47",
  "attendee_ids":["6,5,3"]
  }


'''
#http://localhost:5000/add_meeting
@app.route('/add_meeting', methods=['POST'])
def add_meeting_method(): return(add_meeting())

#http://localhost:5000/get_meeting_list/user_id=1
@app.route('/get_meeting_list/user_id=<user_id>', methods=['GET'])
def get_meeting_list_method(user_id):    return(get_meeting_list(user_id))

#http://localhost:5000/get_meeting_list_for_a_day/user_id=1,start_date=2018-8-29
@app.route('/get_meeting_list_for_a_day/user_id=<user_id>,start_date=<start_date>', methods=['GET'])
def get_meeting_list_for_a_day_method(user_id, start_date): return(get_meeting_list_for_a_day(user_id,start_date))

#http://localhost:5000/get_meeting_details/meeting_id=1
@app.route('/get_meeting_details/meeting_id=<meeting_id>', methods=['GET'])
def get_meeting_details_method(meeting_id):    return(get_meeting_details(meeting_id))
 
#http://localhost:5000/get_meeting_attendees/user_id=1,meeting_id=1
@app.route('/get_meeting_attendees/user_id=<user_id>,meeting_id=<meeting_id>', methods=['GET'])
def get_meeting_attendees_method(user_id,meeting_id): return(get_meeting_attendees(user_id,meeting_id))

#http://localhost:5000/get_meeting_attendees_feedback/user_id=1,meeting_id=1
@app.route('/get_meeting_attendees_feedback/user_id=<user_id>,meeting_id=<meeting_id>', methods=['GET'])
def get_meeting_attendees_feedback_method(user_id,meeting_id):    return(get_meeting_attendees_feedback(user_id,meeting_id))

{
  "meeting_id":1,
  "attendee_id":1,
  "response":"GIVEN" # or "DECLINE"
}

#http://localhost:5000/update_meeting_response
@app.route('/update_meeting_response', methods=['POST'])
def update_meeting_response_method ():    return(update_meeting_response())

#http://localhost:5000/delete_meeting/meeting_id=2
@app.route('/delete_meeting/meeting_id=<meeting_id>', methods=['GET'])
def delete_meeting_method(meeting_id):    return(delete_meeting(meeting_id))

'''
{
  "meeting_id": 1,
  "title": "My Title",
  "venue": "My Venue",
  "notes": "My Notes" 
}
'''

#http://localhost:5000/update_meeting
@app.route('/update_meeting', methods=['POST'])
def update_meeting_method():    return(update_meeting())


#http://localhost:5000/add_meeting_validation/organiser_id=1,start_date=2018-8-3,start_time=16:47,end_date=2018-8-3,end_time=17:47
@app.route('/add_meeting_validation/organiser_id=<organiser_id>,start_date=<start_date>,start_time=<start_time>,end_date=<end_date>,end_time=<end_time>', methods=['GET'])
def add_meeting_validation_method(organiser_id,start_date,start_time,end_date,end_time):    return(add_meeting_validation(organiser_id,start_date,start_time,end_date,end_time))
    

'''
-------------------------------------------------------------------------------
                             FEEDBACK SERVICES
-------------------------------------------------------------------------------
'''

''' 
{
  "feedback_id": 1,
  "star_rating": 5,
  "response": "ACCEPT",  # options are ACCEPT or DECLINE
  "note": "Response note"
}

'''
#http://localhost:5000/add_feedback
@app.route('/add_feedback', methods=['POST'])
def add_feedback_method(): return(add_feedback())

''' 
{
  "to": ["lakshmynarayanan.al@gmail.com","lakshmynarayanan.al@gmail.com"],  
  "subject": "This is the email subject",
  "body": "This is the email body"
}
'''
#http://localhost:5000/send_metoo_mail
@app.route("/send_metoo_mail", methods=['POST'])
def send_metoo_mail_method(): return(send_metoo_mail())

''' 
{
  "user_id": 1,  
  "comment": "My Comments"
}
'''
#http://localhost:5000/add_general_comments
@app.route('/add_general_comments', methods=['POST'])
def add_general_comments_method(): return(add_general_comments())

#http://localhost:5000/get_feedback_count/user_id=1
@app.route('/get_feedback_count/user_id=<user_id>', methods=['GET'])
def get_feedback_count_method(user_id): return(get_feedback_count(user_id))


#http://localhost:5000/ask_for_feedback/user_id=1
@app.route('/ask_for_feedback/user_id=<user_id>', methods=['GET'])
def ask_for_feedback_method(user_id): return(ask_for_feedback(user_id))

#http://localhost:5000/get_notifications_list/user_id=1
@app.route('/get_notifications_list/user_id=<user_id>', methods=['GET'])
def get_notifications_list_method(user_id): return(get_notifications_list(user_id))
    


'''
-------------------------------------------------------------------------------
                             SOCIAL SERVICES
-------------------------------------------------------------------------------
'''
# http://localhost:5000/google_login/google/authorized
# http://localhost:8100/tabs-page/conference-schedule/schedule/google/authorized
#http://localhost:5000/google_login/email=3ttechs@gmail.com
# body : {"login_id": "b","user_name":"b"}
@app.route('/google_login', methods=['POST'])
def google_login_method():  return(google_login())

@app.route('/facebook_login', methods=['POST'])
def facebook_login_method():  return(facebook_login())


#http://localhost:5000/send_notification
@app.route('/send_notification', methods=['GET'])
def send_notification_method():  
    # https://console.firebase.google.com/u/0/project/rising-timing-211502/settings/cloudmessaging/android:io.ionic.conferenceapp
    push_service = FCMNotification(api_key="AAAArR8DYPc:APA91bGSo4F9nDSCLv3iECImRj0pRK-zWfIsl_WlOJxy8rUqFWrSwRzWAvpLUrQ2QF1bLKNWZLnE898s7Jz-_nY5prq2nWTLmNhQkBLgWPB1te1G02xmrmmjTG2WV6j1LhMGr3r7JS7qRDNHnLgScTbRFYx-tET4LA")
    # Your api-key can be gotten from:  https://console.firebase.google.com/project/<project-name>/settings/cloudmessaging
    #registration_id = "DgJjbmgqXYaUYCszPdt5DzJAf0i2"
    #registration_id ="rising-timing-211502"
    #registration_id ="AIzaSyCGrUjJflFZ1ZatMgnegq4kzrLPMYvRI00"
    #registration_id = "863448035765798"    
    #registration_id = "863448035765806"    
    #registration_id = "33356b0b062301e3"
    registration_id = "7d51d344-295b-43bb-8662-480359093488"

    message_title = "Uber update"
    message_body = "Hi john, your customized news for today is ready"
    result = push_service.notify_single_device(registration_id=registration_id, message_title=message_title, message_body=message_body)
    print (result)

#http://localhost:5000/calendar_data
@app.route('/calendar_data', methods=['GET'])
def calendar_data_method(): return(calendar_data())


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin','*')
    response.headers.add('Access-Control-Allow-Headers','Origin,Accept,X-Requested-With,Content-Type')
    response.headers.add('Access-Control-Allow-Methods','GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    props = load_properties('config_file_LOCAL.txt')
    for prop in props:
        if(prop=='main_server_host'): main_server_host =props[prop]
        if(prop=='main_server_port'): main_server_port =props[prop]

    app.run(host=main_server_host, port=main_server_port)

