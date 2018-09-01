
from meeting_services import *
from user_services import *
from feedback_services import *
from social_services import *
from global_params import *

import sqlite3
import requests
from datetime import datetime
import time


def get_meeting_list_for_a_day1(user_id, start_date):
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
        #print(eight_am - eight_pm) # 43200
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
    return total_result

print(get_meeting_list_for_a_day1('1','2018-8-29'))




    