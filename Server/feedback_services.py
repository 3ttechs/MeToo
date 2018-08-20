import sqlite3, os, requests
from datetime import datetime
from flask import Flask, request,json,send_from_directory,Response,render_template,send_file, url_for, redirect
from flask_mail import Mail, Message
from  global_params import *

# organiser_response : ACTIVE / CANCEL
# attendee_response : NOT_GIVEN / ACCEPT / DECLINE
# feedback_response : NOT_GIVEN / GIVEN / DECLINE (used for Not Attended..)


def get_meeting_attendees_feedback(user_id,meeting_id):
    query = 'select  user.user_id as attendee_id, user.user_name as attendee_name, user.phone_no, user.email, feedback.feedback_id, feedback.star_rating, feedback.feedback_response, feedback.note '
    query += 'from (select attendee_id, feedback_id from attendee where attendee_response in("NOT_GIVEN","ACCEPT","DECLINE") and meeting_id = '+ meeting_id+' order by attendee_id) a, feedback, user '
    query += 'where feedback.feedback_id=a.feedback_id and user.user_id = a.attendee_id '
    result = run_query(query)
    for i in range(len(result)):
        if(str(result[i]['attendee_id'])==user_id):
            result[i]['Is_Organiser'] ='Yes'
        else:
            result[i]['Is_Organiser'] ='No'     
    return json.dumps(run_query(query)), 200

''' 
{
  "user_id": 1,  
  "comment": "My Comments"
}
'''
def add_general_comments():
    d = json.loads(request.data)
    user_id = d['user_id']
    comment = d['comment']

    query = "INSERT INTO comment (user_id, comment) VALUES (%d, '%s')"% (user_id,comment)
    run_insert_query(query)
    return "Success", 200   

def get_feedback_count(user_id):
    # get the list of meetings end_time before current time, where feedback not given
    query = 'select distinct meeting_id from attendee where attendee_id = "'+ user_id +'"'
    result_list = run_query(query)
    meeting_ids=[]
    for result in result_list:
        meeting_ids.append(result['meeting_id'])
    
    meeting_ids_str = ','.join(str(e) for e in meeting_ids)

    
    query = 'select feedback.feedback_id from feedback, meeting, user, attendee '
    query += 'where meeting.meeting_id in ('+meeting_ids_str+') '
    query += "and meeting.meeting_id = feedback.meeting_id and user.user_id = '"+user_id +"' and user.user_id = feedback.attendee_id and attendee.feedback_id=feedback.feedback_id and feedback.feedback_response='NOT_GIVEN' and organiser_response='ACTIVE' and attendee_response='ACCEPT' and (date(start_date, start_time) < date('now'))  "
    #print(query)
    
    '''
    query = 'select meeting.meeting_id,meeting.category,meeting.title,meeting.venue,meeting.start_date,meeting.start_time,meeting.end_date,meeting.end_time,meeting.notes as meeting_notes,meeting.organiser_response, '
    query += 'feedback.attendee_id, user.user_name as attendee_name,user.phone_no, user.email,attendee.attendee_response, '
    query += 'feedback.feedback_id,feedback.star_rating,feedback.note,feedback.feedback_response '
    query += 'from feedback, meeting, user, attendee '
    query += 'where meeting.meeting_id in ('+meeting_ids_str+') '
    query += "and meeting.meeting_id = feedback.meeting_id and user.user_id = '"+user_id +"' and user.user_id = feedback.attendee_id and attendee.feedback_id=feedback.feedback_id and feedback.feedback_response='NOT_GIVEN' and organiser_response='ACTIVE' and attendee_response='ACCEPT' and (date(start_date, start_time) < date('now')) order by start_date, start_time "
    '''

    result = run_query(query)
    return json.dumps(len(result)), 200

def ask_for_feedback(user_id):
    # get the list of meetings end_time before current time, where feedback not given
    query = 'select distinct meeting_id from attendee where attendee_id = "'+ user_id +'"'
    result_list = run_query(query)
    meeting_ids=[]
    for result in result_list:
        meeting_ids.append(result['meeting_id'])
    
    meeting_ids_str = ','.join(str(e) for e in meeting_ids)

    query = 'select meeting.meeting_id,meeting.category,meeting.title,meeting.venue,meeting.start_date,meeting.start_time,meeting.end_date,meeting.end_time,meeting.notes as meeting_notes,meeting.organiser_response, '
    query += 'feedback.attendee_id, user.user_name as attendee_name,user.phone_no, user.email,attendee.attendee_response, '
    query += 'feedback.feedback_id,feedback.star_rating,feedback.note,feedback.feedback_response '
    query += 'from feedback, meeting, user, attendee '
    query += 'where meeting.meeting_id in ('+meeting_ids_str+') '
    query += "and meeting.meeting_id = feedback.meeting_id and user.user_id = '"+user_id +"'  and user.user_id = feedback.attendee_id and attendee.feedback_id=feedback.feedback_id and feedback.feedback_response='NOT_GIVEN' and organiser_response='ACTIVE' and attendee_response='ACCEPT' and (date(start_date, start_time) < date('now')) order by start_date, start_time "

    result = run_query(query)
    if (len(result)<=0):
        return '0', 200

    for i in range(len(result)):
        if(str(result[i]['attendee_id'])==user_id):
            result[i]['Is_Organiser'] ='Yes'
        else:
            result[i]['Is_Organiser'] ='No'

    return json.dumps(result), 200

''' 
{
  "feedback_id": 1,
  "star_rating": 5,
  "feedback_response": "GIVEN",  # options are GIVEN or DECLINE
  "note": "Response note"
}

'''
def add_feedback():
    d = json.loads(request.data)
    feedback_id = d['feedback_id']
    star_rating = d['star_rating']
    feedback_response = d['feedback_response'] 
    note  = d['note']

    query = "UPDATE feedback SET star_rating=%d,feedback_response='%s',note='%s' WHERE feedback_id=%s" % (star_rating,feedback_response,note,feedback_id)
    run_insert_query(query)
    return "1", 200   
