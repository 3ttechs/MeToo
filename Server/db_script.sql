--###################################################################################################################
--# DB Schema
--###################################################################################################################


DROP TABLE IF EXISTS attendee;
DROP TABLE IF EXISTS meeting;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS notification;


CREATE TABLE user (
    user_id  INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    login_id    TEXT    NOT NULL,
    passwd TEXT    NOT NULL,
    user_name     TEXT    NOT NULL,
    phone_no INTEGER,
    email    TEXT
);

CREATE TABLE meeting (
    meeting_id   INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    organiser_id INTEGER REFERENCES user (user_id) NOT NULL,
    start_date   DATE,
    end_date     DATE,
    start_time   TIME,
    end_time     TIME,
    title        TEXT,
    venue        TEXT,
    notes        TEXT,
    category     TEXT,
    response       TEXT
);

CREATE TABLE feedback (
    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    star_rating INTEGER,
    response      TEXT,
    note        TEXT
);

CREATE TABLE attendee (
    attendee_id INTEGER REFERENCES user (user_id) NOT NULL,
    meeting_id  INTEGER REFERENCES meeting (meeting_id) NOT NULL,
    feedback_id INTEGER REFERENCES feedback (feedback_id) NOT NULL,
    response      TEXT
);

CREATE TABLE contact (
    user_id    INTEGER REFERENCES user (user_id) NOT NULL,
    contact_id INTEGER REFERENCES user (user_id) NOT NULL
);


CREATE TABLE notification (
    user_id       INTEGER REFERENCES user (user_id) NOT NULL,
    meeting_id  INTEGER REFERENCES meeting (meeting_id) NOT NULL,
    note          TEXT,
    notification_date DATE,
    notification_time TIME
);


--###################################################################################################################
--# Initial Data
--###################################################################################################################

INSERT INTO admin_lookup ( login, password) VALUES ( 'Admin', 'admin');
INSERT INTO admin_lookup ( login, password) VALUES ( 'Owner', 'owner');


INSERT INTO sales_person_master (name,code,contact_number,login,password ) VALUES ( 'Abdul A','Abdul11',11111111,'Abdul', 'abdul');
INSERT INTO sales_person_master (name,code,contact_number,login,password ) VALUES ( 'Yasin Y','Yasin22',22222222,'Yasin', 'yasin');
INSERT INTO sales_person_master (name,code,contact_number,login,password ) VALUES ( 'Hamsa H','Hamsa33',33333333,'Hamsa', 'hamsa');
INSERT INTO sales_person_master (name,code,contact_number,login,password ) VALUES ( 'Omar O','Omar44',44444444,'Omar', 'omar');
INSERT INTO sales_person_master (name,code,contact_number,login,password ) VALUES ( 'Ahmed A','Ahmed55',55555555,'Ahmed', 'ahmed');
INSERT INTO sales_person_master (name,code,contact_number,login,password ) VALUES ( 'Ali A','Ali66',6666666,'Ali', 'ali');

