DROP TABLE IF EXISTS attendee;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS user;


CREATE TABLE user (
    user_id   INTEGER PRIMARY KEY AUTOINCREMENT  NOT NULL,
    login     TEXT    NOT NULL ,
    password  TEXT    NOT NULL,
    user_type TEXT    NOT NULL,
    name      TEXT    NOT NULL,
    phone_no  INT,
    photo     BLOB
);
CREATE TABLE session (
    session_id   INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id      INTEGER REFERENCES user (user_id) NOT NULL,
    session_date DATE    NOT NULL,
    from_time    TIME,
    to_time      TIME,
    venue        TEXT,
    attachment   TEXT
);
CREATE TABLE attendee (
	attendee_id INTEGER PRIMARY KEY AUTOINCREMENT  NOT NULL,
    session_id INTEGER REFERENCES session (session_id) NOT NULL,
    user_id    INTEGER REFERENCES user (user_id) NOT NULL,
    response   TEXT
);


-###################################################################################################################
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

