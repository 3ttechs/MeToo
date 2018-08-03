import sqlite3, os, requests
from datetime import datetime
from flask import Flask, request,json,send_from_directory,Response,render_template,send_file, url_for, redirect
from flask_mail import Mail, Message
from  global_params import *
#from  global_params import get_user_name, add_notification, mail


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
def add_meeting():
    print(request.data)
    d = json.loads(request.data)


    organiser_id = d['organiser_id']
    title = d['title']
    category=data = d['category']
    venue = d['venue']
    notes = d['notes']
    all_day = 0
    start_date = d['start_date']
    end_date = d['end_date']
    start_time = d['start_time']
    end_time = d['end_time']
    #attendee_count = len(d['attendee_ids'])
    attendee_ids = d['attendee_ids']
    response ='ACTIVE'
    organiser_name = get_user_name(organiser_id)

    # processing input list to get integer array 
    attendee_ids_str = attendee_ids[0]
    attendee_ids = attendee_ids_str.split(',')
    attendee_ids = [int(numeric_string) for numeric_string in attendee_ids]

    if(all_day==1):
        start_time="00:00"
        end_time="00:00"

    # check for end_time >= start_time
    start = datetime.strptime(start_date +" "+ start_time, '%Y-%m-%d %H:%M')
    end = datetime.strptime(end_date +" "+ end_time, '%Y-%m-%d %H:%M')

    if(end<=start):
        data = {
            'value'  : -1,
            'status' : 'ERROR',
            'message': 'Start datetime is before or equal to End datetime'
        }
        print('Start datetime is before or equal to End datetime')
        return (Response(json.dumps(data), status=200, mimetype='application/json'))
    # check for past time
    current = datetime.now()
    if(end<current): 
        data = {
            'value'  : -2,
            'status' : 'ERROR',
            'message': 'End datetime is before Current datetime'
        }
        print('End datetime is before Current datetime')
        return (Response(json.dumps(data), status=200, mimetype='application/json'))
 
    # check for overlap with other meetings
    query = "select meeting_id from meeting where  ( \
            datetime('"+start_date+"', '"+start_time+"') < datetime(end_date, end_time) and \
            datetime('"+end_date+"', '"+end_time+"') > datetime(start_date, start_time)) and \
            organiser_id = "+str(organiser_id)+" and response = 'ACTIVE' "
    result_list = run_query(query)
    if(len(result_list)>0):
        data = {
            'value'  : -3,
            'status' : 'ERROR',
            'message': 'Overlapping Meeting found'
        }
        print('Overlapping Meeting found')        
        return (Response(json.dumps(data), status=200, mimetype='application/json'))
 
    # Now create meeting 
    query = "INSERT INTO meeting \
    (organiser_id, title,  category,venue,notes,start_date,end_date,start_time,end_time,response) \
    VALUES (%d,'%s','%s','%s','%s','%s','%s','%s','%s','%s' )"% \
    (organiser_id, title,  category,venue,notes,start_date,end_date,start_time,end_time,response)
    run_insert_query(query)
    meeting_id = run_select_query('SELECT MAX(meeting_id) FROM meeting')[0][0]
    attendee_ids.append(organiser_id)

    #add_notification(attendee_ids, meeting_id, "Meeting "+title+" created", now.strftime("%Y-%m-%d"), now.strftime("%H:%M"))

    attendee_id_str=''
    for attendee_id in attendee_ids:
        attendee_id_str+=str(attendee_id)+','

        response = 'NOT_GIVEN'
        query = "INSERT INTO feedback (meeting_id,attendee_id,response) VALUES (%d,%d,'%s')"% (meeting_id,attendee_id,response)
        run_insert_query(query)
        feedback_id = run_select_query('SELECT MAX(feedback_id) FROM feedback')[0][0]

        response = 'ACCEPT'
        query = "INSERT INTO attendee \
        (meeting_id, attendee_id,  feedback_id, response) \
        VALUES (%d,%d,%d,'%s')"% \
        (meeting_id, attendee_id,  feedback_id,response)
        run_insert_query(query)

    data = {
        'value'  : meeting_id,
        'status' : 'SUCCESS',
        'message': ' '
    }
    print('SUCCESS ',meeting_id)
    # send mail to all
    attendee_id_str = attendee_id_str[:-1]
    query = 'select distinct email from user where user_id in ('+ attendee_id_str +')'
    result_list = run_query(query)
    email_ids=[]
    email_id_str=''

    for result in result_list:
        email_ids.append(result['email'])
        email_id_str+=str(result['email'])+','
    email_id_str = email_id_str[:-1]

    query = "UPDATE meeting SET email_list='%s' WHERE meeting_id=%d" % (email_id_str,meeting_id)
    run_insert_query(query)

    to = email_id_str.split(',')
    subject = "New meeting from MeToo"
    body = "Welcome to MeToo\n\nNew Meeting created\n"
    body+= "Title: "+title+"\n"
    body+= "Organiser: "+ organiser_name +"\n"
    body+= "Category: "+category+"\n"
    body+= "Venue: "+venue+"\n"
    body+= "Notes: "+notes+"\n"
    body+= "All_day: "+str(all_day)+"\n"
    body+= "Start: "+start_date+" " +start_time+"\n"
    body+= "End: "+end_date+" " +end_time+"\n"
    body+= "Attendees: "+",".join(to)+"\n"
    msg = Message(subject, sender = '3ttechs@gmail.com', recipients = to)
    msg.body = body
    mail.send(msg)    

    return (Response(json.dumps(data), status=500, mimetype='application/json'))


def add_meeting_validation(organiser_id,start_date,start_time,end_date,end_time):

    # check for end_time >= start_time
    start = datetime.strptime(start_date +" "+ start_time, '%Y-%m-%d %H:%M')
    end = datetime.strptime(end_date +" "+ end_time, '%Y-%m-%d %H:%M')

    if(end<=start):
        print('Start datetime is before or equal to End datetime')
        return(json.dumps('Error: Start datetime is before or equal to End datetime')), 200

    # check for past time
    current = datetime.now()
    if(end<current):
        print('End datetime is before Current datetime')
        return(json.dumps('Error: End datetime is before Current datetime')), 200
 
    # check for overlap with other meetings
    query = "select meeting_id from meeting where  ( \
            datetime('"+start_date+"', '"+start_time+"') < datetime(end_date, end_time) and \
            datetime('"+end_date+"', '"+end_time+"') > datetime(start_date, start_time)) and \
            organiser_id = "+str(organiser_id)+" and response = 'ACTIVE' "
    result_list = run_query(query)
    if(len(result_list)>0):
        print('Overlapping Meeting found')
        return(json.dumps('Error: Overlapping Meeting found')), 200
    
    return(json.dumps('Meeting added Successfully')), 200


def get_meeting_list(user_id):
    query = 'select distinct meeting_id from attendee where attendee_id = "'+ user_id +'"'
    result_list = run_query(query)
    meeting_ids=[]
    for result in result_list:
        meeting_ids.append(result['meeting_id'])
    
    meeting_ids_str = ','.join(str(e) for e in meeting_ids)    
    query = 'select * from meeting where meeting_id in ('+meeting_ids_str+' ) order by start_date, start_time'
    result = run_query(query)
    for i in range(len(result)):
        result[i]['organiser_name'] = get_user_name(result[i]['organiser_id'])
        if(str(result[i]['organiser_id'])==user_id):
            result[i]['Is_Organiser'] ='Yes'
        else:
            result[i]['Is_Organiser'] ='No' 
                        
        start_date = result[i]['start_date']
        start_time = result[i]['start_time']
        start = datetime.strptime(start_date +" "+ start_time, '%Y-%m-%d %H:%M')
        current = datetime.now()
        if(start>current):
            result[i]['Is_Past'] ='No'
        else:
            result[i]['Is_Past'] ='Yes'

    if (len(result)<=0):
        return '0', 200    
    return json.dumps(result), 200

def get_meeting_details(meeting_id):
    query = 'select * from meeting where meeting_id ='+ meeting_id
    result = run_query(query)
    return json.dumps(result[0]), 200


def delete_meeting(meeting_id):
    response = "DELETE"
    query = "UPDATE meeting SET response='%s'  WHERE meeting_id=%s" % (response, meeting_id)
    run_insert_query(query)

    query = "select * from meeting  WHERE meeting_id=%s" % (meeting_id)
    result = run_query(query)[0]
    print(result['email_list'].split(','))
    organiser_id = result['organiser_id']
    to = result['email_list'].split(',')
    subject = "MeToo Update : Meeting "+result['title']+ " deleted"
    body = "Welcome to MeToo\n\nThe following meeting is deleted\n"
    body+= "Title: "+ result['title'] +"\n"
    body+= "Organiser: "+ get_user_name(result['organiser_id'])  +"\n" 
    body+= "Category: "+ result['category']+"\n"
    body+= "Venue: "+ result['venue']+"\n"
    body+= "Notes: "+ result['notes']+"\n"
    body+= "Start: "+ result['start_date']+" " + result['start_time']+"\n"
    body+= "End: "+ result['end_date']+" " + result['end_time']+"\n"
    body+= "Attendees: "+result['email_list']+"\n"

    query = "select attendee_id from attendee WHERE meeting_id=%s" % (meeting_id)
    result_list = run_query(query)
    attendee_id_str=str(organiser_id)+','
    for result1 in result_list:
        attendee_id_str+=str(result1['attendee_id'])+','
    
    msg = Message(subject, sender = '3ttechs@gmail.com', recipients = to)
    msg.body = body
    mail.send(msg)    

    #add_notification(attendee_id_str, meeting_id, "Meeting "+result['title']+" deleted", now.strftime("%Y-%m-%d"), now.strftime("%H:%M"))

    return " Success", 200   

def update_meeting_response(meeting_id, attendee_id,response):
    query = "UPDATE attendee SET response='%s'  WHERE meeting_id=%s and attendee_id=%s" % (response, meeting_id, attendee_id)
    run_insert_query(query)

    query = "select * from meeting  WHERE meeting_id=%s" % (meeting_id)
    result = run_query(query)[0]
    organiser_id = result['organiser_id']

    subject = "MeToo Update : Meeting "+result['title']+ " deleted"
    body = "Welcome to MeToo\n\nThe following meeting is deleted\n"
    body+= "Title: "+ result['title'] +"\n"
    body+= "Organiser: "+ get_user_name(result['organiser_id'])  +"\n" 
    body+= "Category: "+ result['category']+"\n"
    body+= "Venue: "+ result['venue']+"\n"
    body+= "Notes: "+ result['notes']+"\n"
    body+= "Start: "+ result['start_date']+" " + result['start_time']+"\n"
    body+= "End: "+ result['end_date']+" " + result['end_time']+"\n"

    query = "select distinct email from user WHERE user_id in(%s,%s)" % (organiser_id,attendee_id)
    result_list = run_query(query)
    email_id_str=''
    for result in result_list:
        email_id_str+=str(result['email'])+','
    email_id_str = email_id_str[:-1]

    to = email_id_str.split(',')
    msg = Message(subject, sender = '3ttechs@gmail.com', recipients = to)
    msg.body = body
    mail.send(msg)    
    
    return "Success", 200    

def get_meeting_attendees(user_id,meeting_id):
    query = 'select  user.user_id as attendee_id, user.user_name as attendee_name, user.phone_no, user.email '
    query += 'from (select attendee_id, feedback_id from attendee where meeting_id = '+ meeting_id+' order by attendee_id) a, user '
    query += 'where user.user_id = a.attendee_id '
    result = run_query(query)
    for i in range(len(result)):
        if(str(result[i]['attendee_id'])==user_id):
            result[i]['Is_Organiser'] ='Yes'
        else:
            result[i]['Is_Organiser'] ='No'            
    return json.dumps(result), 200

