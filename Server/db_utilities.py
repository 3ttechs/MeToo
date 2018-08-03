import sqlite3, os, requests
from datetime import datetime
from flask import Flask, request,json,send_from_directory,Response,render_template,send_file, url_for, redirect
from flask_mail import Mail, Message
from werkzeug.contrib.fixers import ProxyFix
from flask_dance.contrib.twitter import make_twitter_blueprint, twitter
from flask_dance.contrib.google import make_google_blueprint, google




dbfile ='MeToo.db'



def run_select_query(query):
    #print ("Select Query : "+query)
    con = sqlite3.connect(dbfile)
    cur = con.cursor()
    cur.execute(query)
    rows = cur.fetchall()
    cur.connection.close()
    return rows

def run_insert_query(query):
    #print ("Insert Query : "+query)
    con = sqlite3.connect(dbfile)
    cur = con.cursor()
    cur.execute(query)
    con.commit()
    cur.connection.close()
    return 0


def run_query(query, args=(), one=False):
    con = sqlite3.connect(dbfile)
    cur = con.cursor()
    cur.execute(query)
    r = [dict((cur.description[i][0], value) \
               for i, value in enumerate(row)) for row in cur.fetchall()]
    cur.connection.close()
    return (r[0] if r else None) if one else r

#my_query = query_db("select * from majorroadstiger limit %s", (3,))
#json_output = json.dumps(my_query)


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



def get_user_name(user_id):
    query = 'select distinct user_name from user where user_id  ='+ str(user_id)
    data = run_query(query)
    return data[0]['user_name']

def add_notification(user_id_list, meeting_id, note, notification_date, notification_time):
    print('* '+meeting_id)
    print('* '+note)
    print('* '+notification_date)
    print('* '+notification_time)


    for user_id in user_id_list:
        print('* '+user_id)

        query = "INSERT INTO notification (user_id, meeting_id, note, notification_date, notification_time) VALUES (%d,%d, '%s','%s','%s')"% (user_id, meeting_id, note,notification_date, notification_time)    
        run_insert_query(query)
    # add meeting, organiser & participants
    # delete meeting, organiser & participants
    # accept and Decline, organiser & one participant
    # feedback given, organiser & one participant
    # asking for feedback, organiser & participants, mail is required   
    return "Success", 200

now = datetime.now()

app = Flask(__name__,static_url_path = "", static_folder = "static")
app.wsgi_app = ProxyFix(app.wsgi_app)
app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = '3ttechs@gmail.com'
app.config['MAIL_PASSWORD'] = 'udqufbctqmjlwtkh'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True


mail = Mail(app)



# Social Networking integrations

app.config['SECRET_KEY'] = 'thisismysecret'
twitter_blueprint = make_twitter_blueprint(api_key='', api_secret='')
# twitter password : metooapp

app.register_blueprint(twitter_blueprint, url_prefix='/twitter_login')
'''
@app.route("/twitter_login")
def twitter_login():
    if not twitter.authorized:
        return redirect(url_for('twitter.login'))
    account_info = twitter.get('account/settings.json')
    if account_info.ok:
        return '<h1>Your Twitter name is @{}</h1>'.format(account_info_json['screen_name'])

    return '<h1>Request failed!'
'''
app.secret_key = 'thisismysecret'

google_blueprint = make_google_blueprint( 
    client_id="897538310482-8j8c29ttpb99pqn84kp8set2ca9ee6o9.apps.googleusercontent.com", 
    client_secret="f62HUAJy7nNEmNCIMhMegWsP", 
    #offline=True,
    #reprompt_consent=True,
    #redirect_url="/callback/google"
    scope=["profile", "email"])
app.register_blueprint(google_blueprint, url_prefix="/google_login")

