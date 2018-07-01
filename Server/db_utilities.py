import sqlite3

dbfile ='MeditationCure.db'

def run_select_query(query):
    #print ("Select Query : "+query)
    con = sqlite3.connect(dbfile)
    cur = con.cursor()
    cur.execute(query)
    rows = cur.fetchall()
    return rows

def run_insert_query(query):
    #print ("Insert Query : "+query)
    con = sqlite3.connect(dbfile)
    cur = con.cursor()
    cur.execute(query)
    con.commit()
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
