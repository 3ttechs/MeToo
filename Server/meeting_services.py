import sqlite3, os, requests
from datetime import datetime
from flask import Flask, request,json,send_from_directory,Response,render_template,send_file, url_for, redirect
from flask_mail import Mail, Message
from  global_params import *
import time, calendar


# organiser_response : ACTIVE / CANCEL
# attendee_response : NOT_GIVEN / ACCEPT / DECLINE
# feedback_response : NOT_GIVEN / GIVEN / DECLINE



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
    organiser_response ='ACTIVE'
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
            organiser_id = "+str(organiser_id)+" and organiser_response = 'ACTIVE' "
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
    (organiser_id, title,  category,venue,notes,start_date,end_date,start_time,end_time,organiser_response) \
    VALUES (%d,'%s','%s','%s','%s','%s','%s','%s','%s','%s' )"% \
    (organiser_id, title,  category,venue,notes,start_date,end_date,start_time,end_time,organiser_response)
    run_insert_query(query)
    meeting_id = run_select_query('SELECT MAX(meeting_id) FROM meeting')[0][0]
    attendee_ids.append(organiser_id)

    #add_notification(attendee_ids, meeting_id, "Meeting "+title+" created", now.strftime("%Y-%m-%d"), now.strftime("%H:%M"))

    attendee_id_str=''
    for attendee_id in attendee_ids:
        attendee_id_str+=str(attendee_id)+','

        feedback_response = 'NOT_GIVEN'
        query = "INSERT INTO feedback (meeting_id,attendee_id,feedback_response) VALUES (%d,%d,'%s')"% (meeting_id,attendee_id,feedback_response)
        run_insert_query(query)
        feedback_id = run_select_query('SELECT MAX(feedback_id) FROM feedback')[0][0]

        attendee_response = 'NOT_GIVEN'
        query = "INSERT INTO attendee \
        (meeting_id, attendee_id,  feedback_id, attendee_response) \
        VALUES (%d,%d,%d,'%s')"% \
        (meeting_id, attendee_id,  feedback_id,attendee_response)
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
    #body+= "All_day: "+str(all_day)+"\n"
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
            organiser_id = "+str(organiser_id)+" and organiser_response = 'ACTIVE' "
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
    query = 'select * from meeting where meeting_id in ('+meeting_ids_str+' ) and organiser_response = "ACTIVE" order by start_date, start_time '
    result = run_query(query)
    for i in range(len(result)):
        result[i]['organiser_name'] = get_user_name(result[i]['organiser_id'])
        
        if(str(result[i]['organiser_id'])==user_id):
            result[i]['Is_Organiser'] ='Yes'
            result[i]['attendee_response'] = 'ACCEPT'

        else:
            result[i]['Is_Organiser'] ='No' 
            result[i]['attendee_response'] = get_attendee_response(user_id,result[i]['meeting_id'])
                        
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


def get_meeting_list_for_a_day(user_id, start_date):
    total_result=[]
    query = 'select distinct meeting_id from attendee where attendee_id = "'+ user_id +'"'
    result_list = run_query(query)
    meeting_ids=[]
    for result in result_list:
        meeting_ids.append(result['meeting_id'])
    
    meeting_ids_str = ','.join(str(e) for e in meeting_ids)    
    query = "select start_date, start_time,end_date,end_time,title  from meeting where meeting_id in ("+meeting_ids_str+" ) and organiser_response = 'ACTIVE' and start_date = '" + start_date +"' order by start_time"
    result = run_query(query)

    '''
    for i in range(len(result)):
        result[i]['organiser_name'] = get_user_name(result[i]['organiser_id'])
        
        if(str(result[i]['organiser_id'])==user_id):
            result[i]['Is_Organiser'] ='Yes'
            result[i]['attendee_response'] = 'ACCEPT'

        else:
            result[i]['Is_Organiser'] ='No' 
            result[i]['attendee_response'] = get_attendee_response(user_id,result[i]['meeting_id'])
    '''                 
    eight_am = datetime.strptime(start_date +" 08:00", '%Y-%m-%d %H:%M')
    eight_am = time.mktime(eight_am.timetuple())
    eight_pm = datetime.strptime(start_date +" 20:00", '%Y-%m-%d %H:%M')
    eight_pm = time.mktime(eight_pm.timetuple())
    t_line=[]
    t_line.append(eight_am)
    for i in range(len(result)):
        start_date = result[i]['start_date']
        start_time = result[i]['start_time']
        start = datetime.strptime(start_date +" "+ start_time, '%Y-%m-%d %H:%M')  
        start = time.mktime(start.timetuple())


        end_date = result[i]['end_date']
        end_time = result[i]['end_time']
        end = datetime.strptime(end_date +" "+ end_time, '%Y-%m-%d %H:%M')
        end = time.mktime(end.timetuple())
        if(end<=eight_pm):
            t_line.append(start)
            t_line.append(end)
    t_line.append(eight_pm)

    if (len(result)<=0):
        return 0    
    init_point = t_line[0] 
    for i in range(len(t_line)):
        t_line[i] = t_line[i]-init_point
    last_point = t_line[len(t_line)-1] 
    for i in range(len(t_line)):
        t_line[i] = int(t_line[i]*100.0/last_point)
        
    total_result.append({"meetings":result})
    total_result.append({"timeline":t_line})
    if (len(result)<=0):
        return '0', 200    
    return json.dumps(total_result), 200 



def get_meeting_details(meeting_id):
    query = 'select * from meeting where meeting_id ='+ meeting_id
    result = run_query(query)
    return json.dumps(result[0]), 200


def delete_meeting(meeting_id):
    organiser_response = "CANCEL"
    query = "UPDATE meeting SET organiser_response='%s'  WHERE meeting_id=%s" % (organiser_response, meeting_id)
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

    return "Success", 200   
'''
{
  "meeting_id":1,
  "attendee_id":1,
  "attendee_response":"ACCEPT" # ACCEPT / DECLINE
}
'''

def update_meeting_response():

    d = json.loads(request.data)
    meeting_id = d['meeting_id']
    attendee_id = d['attendee_id']
    attendee_response = d['attendee_response']

    query = "UPDATE attendee SET attendee_response='%s' WHERE meeting_id=%s and attendee_id=%s" % (attendee_response, meeting_id, attendee_id)
    run_insert_query(query)

    # Send mail to attendees
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
    query = 'select  user.user_id as attendee_id, user.user_name as attendee_name, user.phone_no, user.email, a.attendee_response as attendee_response '
    query += 'from (select attendee_id, feedback_id, attendee_response from attendee where meeting_id = '+ meeting_id+' order by attendee_id) a, user '
    query += 'where user.user_id = a.attendee_id '
    result = run_query(query)
    for i in range(len(result)):
        if(str(result[i]['attendee_id'])==user_id):
            result[i]['Is_Organiser'] ='Yes'
        else:
            result[i]['Is_Organiser'] ='No'            
    return json.dumps(result), 200



'''
{
  "meeting_id": 1,
  "title": "My Title",
  "venue": "My Venue",
  "notes": "My Notes" 
}
'''

def update_meeting():
    d = json.loads(request.data)
    meeting_id = d['meeting_id']
    title = d['title']
    venue = d['venue']
    notes = d['notes']

    query = "UPDATE meeting SET title='%s', venue='%s', notes='%s' WHERE meeting_id=%s" % (title, venue, notes, meeting_id)
    run_insert_query(query)

    # Send mail to attendees
    query = "select * from meeting  WHERE meeting_id=%s" % (meeting_id)
    result = run_query(query)[0]
    #organiser_id = result['organiser_id']

    subject = "MeToo Update : Meeting "+result['title']+ " updated"
    body = "Welcome to MeToo\n\nThe following meeting is deleted\n"
    body+= "Title: "+ result['title'] +"\n"
    body+= "Organiser: "+ get_user_name(result['organiser_id'])  +"\n" 
    body+= "Category: "+ result['category']+"\n"
    body+= "Venue: "+ result['venue']+"\n"
    body+= "Notes: "+ result['notes']+"\n"
    body+= "Start: "+ result['start_date']+" " + result['start_time']+"\n"
    body+= "End: "+ result['end_date']+" " + result['end_time']+"\n"

    to = result['email_list'].split(',')
    msg = Message(subject, sender = '3ttechs@gmail.com', recipients = to)
    msg.body = body
    mail.send(msg)    
    
    return "Success", 200    

def calendar_data():
  calendar.setfirstweekday(calendar.SUNDAY)
  result=[]
  for year in range (2018,2020):
      week_count = 0
      for month in range(1, 13):
          cal = calendar.monthcalendar(year,month)
          num_weeks = len(cal)
          for week in range(num_weeks):
              week_count = week_count+ 1
              result.append({"year":year, "month":month, "month_name":calendar.month_name[month], "week":week_count, "dates":cal[week]})
              if(week == num_weeks-1 and cal[week][6]==0):
                  week_count = week_count-1

  return json.dumps(result), 200
