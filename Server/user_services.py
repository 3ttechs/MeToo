import sqlite3, os, requests
from datetime import datetime
from flask import Flask, request,json,send_from_directory,Response,render_template,send_file, url_for, redirect
from flask_mail import Mail, Message
from  global_params import *

def get_user_details(user_id):
    query = 'select user_id,login_id,user_name,phone_no,email from user where user_id  ='+ user_id
    data = run_query(query)
    if (len(data)<=0):
        return '0', 200
    return json.dumps(data[0]), 200

def forgot_password_by_login_id(login_id):
    query = 'select * from user where login_id  ='+ login_id
    data = run_query(query)
    if (len(data)<=0):
        return '0', 200

    # Need to send email    
    to = data[0]['email']
    login = data[0]['login_id']    
    passwd = data[0]['passwd']
    subject = "MeToo Update"
    body = 'Please find your Password\n'
    body+= 'login: '+login+'\n'
    body+= 'passwd: '+passwd+'\n'

    msg = Message(subject, sender = '3ttechs@gmail.com', recipients = [to])
    msg.body = body
    mail.send(msg)

    return json.dumps(data[0]), 200

def forgot_password_by_email(email):
    query = 'select * from user where email  ='+ email
    data = run_query(query)
    if (len(data)<=0):
        return '0', 200
    
    # Need to send email
    to = data[0]['email']
    login = data[0]['login_id']    
    passwd = data[0]['passwd']
    subject = "MeToo Update"
    body = 'Please find your Password\n'
    body+= 'login: '+login+'\n'
    body+= 'passwd: '+passwd+'\n'

    msg = Message(subject, sender = '3ttechs@gmail.com', recipients = [to])
    msg.body = body
    mail.send(msg)

    return json.dumps(data[0]), 200


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
def add_new_user():
    d = json.loads(request.data)
    login_id = d['login_id']
    passwd = d['passwd']
    user_name = d['user_name']
    phone_no  = d['phone_no']
    email  = d['email']
    login_by  = 'CUSTOM'

    # Check for duplicate user
    # TODO: Send the email to user in case of duplicate
    data = run_select_query("select user_id from user where email='" + email+"'")
    if (len(data)>0):
        return '0', 200
    data = run_select_query("select user_id from user where login_id='" + login_id+"'")
    if (len(data)>0):
        return '0', 200
    data = run_select_query("select user_id from user where phone_no='" + phone_no+"'")
    if (len(data)>0):
        return '0', 200


    query = "INSERT INTO user (login_id,passwd,user_name,phone_no,email,login_by) VALUES ('%s','%s','%s','%s','%s','%s')"% (login_id,passwd,user_name,phone_no,email,login_by)
    run_insert_query(query)
    user_id = run_select_query('SELECT MAX(user_id) FROM user')[0][0]
    
    # send mail to user
    to = email
    subject = "Welcome to MeToo"
    body = "Welcome to MeToo\n\nNew user created\n"
    body+= "login_id = "+login_id+"\n"
    body+= "passwd = "+passwd+"\n"

    msg = Message(subject, sender = '3ttechs@gmail.com', recipients = to)
    msg.body = body
    mail.send(msg)

    return str(user_id), 200   

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
def update_user_profile():
    d = json.loads(request.data)
    user_id = d['user_id']
    login_id = d['login_id']
    passwd = d['passwd']
    user_name  = d['user_name']
    phone_no  = d['phone_no']
    email  = d['email']        

    query = "UPDATE user SET login_id='%s',passwd='%s',user_name='%s',phone_no='%s',email='%s' WHERE user_id=%d" % (login_id,passwd,user_name,phone_no,email,user_id)
    run_insert_query(query)
    return "Success", 200  

# body : {"login_id": "b","passwd":"b"}
def login():
    #print(request.data)
    d = json.loads(request.data)
    login_id = d['login_id']
    passwd = d['passwd']

    query = 'select user_id,login_id,user_name,phone_no,email from user where login_id = "'+ login_id +'" and passwd = "' +passwd +'"'

    result = run_query(query)
    if (len(result)<=0):
        return '0', 200
    return json.dumps(result[0]), 200


''' 
{
  "user_id": 1,  
  "contact_name": "Lakshmy", 
  "phone_no": "9988776655",
  "email": "g@h.com"
}
'''
# If User already exist, use the contact_id
def add_contact():
    d = json.loads(request.data)
    user_id = d['user_id']
    login_id = d['email']
    passwd = 'password'
    user_name = d['contact_name']
    phone_no  = d['phone_no']
    email  = d['email']

    duplicate_found =0

    # Check for duplicate user
    data = run_select_query("select distinct user_id from user where email='" + email+"'")
    if (len(data)>0):
        contact_id = data[0][0]
        duplicate_found =1
    else:
        data = run_select_query("select distinct user_id from user where phone_no='" + phone_no+"'")
        if (len(data)>0):
            contact_id = data[0][0]
            duplicate_found =1


    if(duplicate_found==0):
        login_by = 'CONTACTS'
        # Create user
        query = "INSERT INTO user (login_id,passwd,user_name,phone_no,email,login_by) VALUES ('%s','%s','%s','%s','%s','%s')"% (login_id,passwd,user_name,phone_no,email,login_by)
        run_insert_query(query)
        contact_id = run_select_query('SELECT MAX(user_id) FROM user')[0][0]

    # check for duplicate contact
    duplicate_found =0    
    data = run_select_query("select distinct user_id from contact where user_id=" + str(user_id)+" and contact_id= "+str(contact_id))
    if (len(data)>0):
        contact_id = data[0][0]
        duplicate_found =1  

    if(duplicate_found==0):
        query = "INSERT INTO contact (user_id,contact_id) VALUES (%d,%d)"% (user_id,contact_id)
        run_insert_query(query)
        return str(contact_id), 200   
    else:
        return "0", 200

def delete_contact(user_id,contact_id):
    
    query = "DELETE FROM contact WHERE user_id = %s and contact_id=%s" % (user_id, contact_id)
    run_insert_query(query)

    return "Success", 200

def get_contacts_list(user_id):
    query = 'select * from user where user_id in (select contact_id from contact where user_id ='+ user_id+' )'
    return json.dumps(run_query(query)), 200

