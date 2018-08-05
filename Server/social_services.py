import sqlite3
import requests
from datetime import datetime
from flask import Flask, request,json,send_from_directory,Response,render_template,send_file, url_for, redirect
from flask_mail import Mail, Message
from flask_dance.contrib.twitter import make_twitter_blueprint, twitter
from flask_dance.contrib.google import make_google_blueprint, google
from  global_params import *

def google_login():
    print('Entered google_login service')
    d = json.loads(request.data)
    login_id = d['login_id']
    user_name = d['user_name']
    login_by  = 'GOOGLE'
    email = d['login_id']
    passwd = '0'
    phone_no  = '0' 

    # first check whether this user is in user table
    # if yes, allow him access
    # if no, add him to user table and allow him access

    # Check for duplicate user
    data = run_select_query("select distinct user_id from user where email='" + email+"'")
    duplicate_found = 0
    if (len(data)>0):
        user_id = data[0][0]
        duplicate_found =1

    if(duplicate_found==0):
        query = "INSERT INTO user (login_id,passwd,user_name,phone_no,email,login_by) VALUES ('%s','%s','%s','%s','%s','%s')"% (login_id, passwd, user_name, phone_no, email, login_by)
        run_insert_query(query)
        user_id = run_select_query('SELECT MAX(user_id) FROM user')[0][0]

    query = 'select user_id,login_id,user_name,phone_no,email,login_by from user where user_id = '+ str(user_id)

    result = run_query(query)
    if (len(result)<=0):
        return '0', 200
    return json.dumps(result[0]), 200

''' 
{
  "to": ["lakshmynarayanan.al@gmail.com","lakshmynarayanan.al@gmail.com"],  
  "subject": "This is the email subject",
  "body": "This is the email body"
}
'''
def send_metoo_mail():
    d = json.loads(request.data)
    to = d['to']
    subject = d['subject']
    body = d['body']

    msg = Message(subject, sender = '3ttechs@gmail.com', recipients = to)
    msg.body = body
    mail.send(msg)
    return "SUCCESS"

def get_notifications_list(user_id):
    query = 'select * from notification where user_id ='+ user_id
    return json.dumps(run_query(query)), 200

