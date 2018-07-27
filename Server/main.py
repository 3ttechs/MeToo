'''
Compilation Steps: 
pyinstaller main.py
'''

import sqlite3
import requests
from datetime import datetime
from flask import Flask, request,json,send_from_directory,Response,render_template,send_file, url_for
from flask_mail import Mail, Message
from  db_utilities import *
#from  login_with_social import *



app = Flask(__name__,static_url_path = "", static_folder = "static")

app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = '3ttechs@gmail.com'
app.config['MAIL_PASSWORD'] = 'udqufbctqmjlwtkh'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)



@app.route('/')
def home():
    return('MeToo Application API')

#http://localhost:5000/add_meeting 
#http://localhost:5000/get_meeting_list  
#http://localhost:5000/get_meeting_details 
#http://localhost:5000/get_meeting_attendees organiser/attendee
#http://localhost:5000/get_meeting_attendees_feedback 
#http://localhost:5000/update_meeting_response 
#http://localhost:5000/delete_meeting 

#http://localhost:5000/ask_for_feedback
#http://localhost:5000/add_feedback , Time stamp checking, collapsable form


#http://localhost:5000/login 
#http://localhost:5000/get_user_details
#http://localhost:5000/get_contacts_list  
#http://localhost:5000/get_notifications_list 
#http://localhost:5000/add_contact
#http://localhost:5000/add_new_user 
#http://localhost:5000/add_contact 
#http://localhost:5000/update_user_profile 



''' 
{
  "to": ["lakshmynarayanan.al@gmail.com","lakshmynarayanan.al@gmail.com"],  
  "subject": "This is the email subject",
  "body": "This is the email body"
}
'''
#http://localhost:5000/send_metoo_mail
@app.route("/send_metoo_mail", methods=['POST'])
def send_metoo_mail():
    d = json.loads(request.data)
    to = d['to']
    subject = d['subject']
    body = d['body']

    msg = Message(subject, sender = '3ttechs@gmail.com', recipients = to)
    msg.body = body
    mail.send(msg)
    return "SUCCESS"

#http://localhost:5000/get_contacts_list/user_id=1
@app.route('/get_contacts_list/user_id=<user_id>', methods=['GET'])
def get_contacts_list(user_id):
    query = 'select * from user where user_id in (select contact_id from contact where user_id ='+ user_id+' )'
    return json.dumps(run_query(query)), 200

#http://localhost:5000/get_notifications_list/user_id=1
@app.route('/get_notifications_list/user_id=<user_id>', methods=['GET'])
def get_notifications_list(user_id):
    query = 'select * from notification where user_id ='+ user_id
    return json.dumps(run_query(query)), 200

#http://localhost:5000/get_user_details/login_id='b'
@app.route('/get_user_details/login_id=<login_id>', methods=['GET'])
def get_user_details(login_id):
    query = 'select user_id,login_id,user_name,phone_no,email from user where login_id  ='+ login_id
    data = run_query(query)
    if (len(data)<=0):
        return '0', 200
    return json.dumps(data[0]), 200

#http://localhost:5000/forgot_password/login_id='b'
@app.route('/forgot_password/login_id=<login_id>', methods=['GET'])
def forgot_password_by_login_id(login_id):
    query = 'select * from user where login_id  ='+ login_id
    print(query)
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

#http://localhost:5000/forgot_password/email='c@d.com'
@app.route('/forgot_password/email=<email>', methods=['GET'])
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
  "user_id": 1,  
  "comment": "My Comments"
}
'''

#http://localhost:5000/add_general_comments
@app.route('/add_general_comments', methods=['POST'])
def add_general_comments():
    d = json.loads(request.data)
    user_id = d['user_id']
    comment = d['comment']

    query = "INSERT INTO comment (user_id, comment) VALUES (%d, '%s')"% (user_id,comment)
    run_insert_query(query)
    return "Success", 200   


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
def add_new_user():
    d = json.loads(request.data)
    login_id = d['login_id']
    passwd = d['passwd']
    user_name = d['user_name']
    phone_no  = d['phone_no']
    email  = d['email']

    # Check for duplicate user
    data = run_select_query("select user_id from user where email='" + email+"'")
    if (len(data)>0):
        return '0', 200
    data = run_select_query("select user_id from user where login_id='" + login_id+"'")
    if (len(data)>0):
        return '0', 200
    data = run_select_query("select user_id from user where phone_no='" + phone_no+"'")
    if (len(data)>0):
        return '0', 200

    query = "INSERT INTO user (login_id,passwd,user_name,phone_no,email) VALUES ('%s','%s','%s','%s','%s')"% (login_id,passwd,user_name,phone_no,email)
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
  "contact_name": "Lakshmy", 
  "phone_no": "9988776655",
  "email": "g@h.com"
}
'''
# If User already exist, use the contact_id
#http://localhost:5000/add_contact
@app.route('/add_contact', methods=['POST'])
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
        # Create user
        query = "INSERT INTO user (login_id,passwd,user_name,phone_no,email) VALUES ('%s','%s','%s','%s','%s')"% (login_id,passwd,user_name,phone_no,email)
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


#http://localhost:5000/ask_for_feedback/user_id=1
@app.route('/ask_for_feedback/user_id=<user_id>', methods=['GET'])
def ask_for_feedback(user_id):
    # get the list of meetings end_time before current time, where feedback not given
    query = 'select distinct meeting_id from attendee where attendee_id = "'+ user_id +'"'
    result_list = run_query(query)
    meeting_ids=[]
    for result in result_list:
        meeting_ids.append(result['meeting_id'])
    
    meeting_ids_str = ','.join(str(e) for e in meeting_ids)

    query = 'select meeting.meeting_id,meeting.category,meeting.title,meeting.venue,meeting.start_date,meeting.start_time,meeting.end_date,meeting.end_time,meeting.notes as meeting_notes,meeting.response as meeting_response, '
    query += 'feedback.attendee_id, user.user_name as attendee_name,user.phone_no, user.email,attendee.response as attendee_response, '
    query += 'feedback.feedback_id,feedback.star_rating,feedback.note,feedback.response as feedback_response '
    query += 'from feedback,meeting, user, attendee '
    query += 'where meeting.meeting_id in ('+meeting_ids_str+') '
    query += "and meeting.meeting_id = feedback.meeting_id and user.user_id = feedback.attendee_id and attendee.feedback_id=feedback.feedback_id and feedback.response='NOT_GIVEN' and meeting_response='ACTIVE' and attendee_response='ACCEPT' and (date(start_date, start_time) < date('now')) order by start_date, start_time "

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
  "response": "ACCEPT",  # options are ACCEPT or DECLINE
  "note": "Response note"
}

'''

#http://localhost:5000/add_feedback
@app.route('/add_feedback', methods=['POST'])
def add_feedback():
    d = json.loads(request.data)
    feedback_id = d['feedback_id']
    star_rating = d['star_rating']
    response = d['response'] 
    note  = d['note']

    query = "UPDATE feedback SET star_rating=%d,response='%s',note='%s' WHERE feedback_id=%s" % (star_rating,response,note,feedback_id)
    run_insert_query(query)
    return "1", 200   

#http://localhost:5000/update_meeting_response/meeting_id=1,attendee_id=1,response=GIVEN or DECLINE
@app.route('/update_meeting_response/meeting_id=<meeting_id>,attendee_id=<attendee_id>,response=<response>', methods=['GET'])
def update_meeting_response(meeting_id, attendee_id,response):
    query = "UPDATE attendee SET response='%s'  WHERE meeting_id=%s and attendee_id=%s" % (response, meeting_id, attendee_id)
    run_insert_query(query)
    # TODO: send mail to all
    return "Success", 200    

#http://localhost:5000/delete_meeting/meeting_id=1
@app.route('/delete_meeting/meeting_id=<meeting_id>', methods=['GET'])
def delete_meeting(meeting_id):
    response = "DELETE"
    query = "UPDATE meeting SET response='%s'  WHERE meeting_id=%s" % (response, meeting_id)
    run_insert_query(query)
    #  TODO: send mail to all
    return "Success", 200   

#http://localhost:5000/login
# body : {"login_id": "b","passwd":"b"}
@app.route('/login', methods=['POST'])
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

def get_user_name(user_id):
    query = 'select distinct user_name from user where user_id  ='+ user_id
    data = run_query(query)
    return data[0]['user_name']

#http://localhost:5000/get_meeting_list/user_id=1
@app.route('/get_meeting_list/user_id=<user_id>', methods=['GET'])
def get_meeting_list(user_id):
    user_name = get_user_name(user_id)

    query = 'select distinct meeting_id from attendee where attendee_id = "'+ user_id +'"'
    result_list = run_query(query)
    meeting_ids=[]
    for result in result_list:
        meeting_ids.append(result['meeting_id'])
    
    meeting_ids_str = ','.join(str(e) for e in meeting_ids)    
    query = 'select * from meeting where meeting_id in ('+meeting_ids_str+' ) order by start_date, start_time'
    result = run_query(query)
    for i in range(len(result)):
        result[i]['organiser_name'] = user_name
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

#http://localhost:5000/get_meeting_details/meeting_id=1
@app.route('/get_meeting_details/meeting_id=<meeting_id>', methods=['GET'])
def get_meeting_details(meeting_id):
    query = 'select * from meeting where meeting_id ='+ meeting_id
    result = run_query(query)
    return json.dumps(result[0]), 200


#http://localhost:5000/get_meeting_attendees/user_id=1,meeting_id=1
@app.route('/get_meeting_attendees/user_id=<user_id>,meeting_id=<meeting_id>', methods=['GET'])
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

#http://localhost:5000/get_meeting_attendees_feedback/user_id=1,meeting_id=1
@app.route('/get_meeting_attendees_feedback/user_id=<user_id>,meeting_id=<meeting_id>', methods=['GET'])
def get_meeting_attendees_feedback(user_id,meeting_id):
    query = 'select  user.user_id as attendee_id, user.user_name as attendee_name, user.phone_no, user.email, feedback.feedback_id, feedback.star_rating, feedback.response, feedback.note '
    query += 'from (select attendee_id, feedback_id from attendee where meeting_id = '+ meeting_id+' order by attendee_id) a, feedback, user '
    query += 'where feedback.feedback_id=a.feedback_id and user.user_id = a.attendee_id '
    print(query)
    result = run_query(query)
    for i in range(len(result)):
        if(str(result[i]['attendee_id'])==user_id):
            result[i]['Is_Organiser'] ='Yes'
        else:
            result[i]['Is_Organiser'] ='No'     
    return json.dumps(run_query(query)), 200

''' 
{
  "organiser_id": 1,
  "title": "Sample meeting",
  "category": "Business",
  "venue": "Office",
  "notes": "Sample notes",
  "all_day": 0,
  "start_date": "2018-07-08",
  "end_date": "2018-07-08",
  "start_time": "10:00",
  "end_time": "11:00",
  "attendee_ids": [ 2,3]
}

{
    "organiser_id":2,
"title":"e",
"category":"Personal",
"venue":"a",
"notes":"a",
"start_date":"2018-6-25",
"end_date":"2018-6-25",
"start_time":"5:30 AM",
"end_time":"5:30 AM",
"attendee_ids":["2"]
}

'''
#http://localhost:5000/add_meeting
@app.route('/add_meeting', methods=['POST'])
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
    for result in result_list:
        email_ids.append(result['email'])

    to = email_ids
    subject = "New meeting from MeToo"
    body = "Welcome to MeToo\n\nNew Meeting created\n"
    body+= "Title: "+title+"\n"
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

    return (Response(json.dumps(data), status=200, mimetype='application/json'))


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
