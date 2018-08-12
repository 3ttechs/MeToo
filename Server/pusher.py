import pyrebase
from pusher_push_notifications import PushNotifications
import com.pusher.pushnotifications.PushNotifications

# https://www.youtube.com/watch?v=18xTC4W1lRc
# https://www.hackanons.com/2018/04/iot-with-firebase-sensor-alert.html
config = {
  'apiKey': "AIzaSyCGrUjJflFZ1ZatMgnegq4kzrLPMYvRI00",
  'authDomain': "rising-timing-211502.firebaseapp.com",
  'databaseURL': "https://rising-timing-211502.firebaseio.com",
  'projectId': "rising-timing-211502",
  'storageBucket': "rising-timing-211502.appspot.com",
  'messagingSenderId': "743549657335"
}

firebase = pyrebase.initialize_app(config)
db=firebase.database()
'''
pn_client = PushNotifications(
    instance_id ='',
    secret_key='',
)

import pusher

pusher_client = pusher.Pusher(
  app_id='576330',
  key='0af9e559675049c8e3f0',
  secret='3d88b04514368ce72f98',
  cluster='ap2',
  ssl=True
)

pusher_client.trigger('my-channel', 'my-event', {'message': 'hello world'})
'''
PushNotifications.start(getApplicationContext(), "51a66adb-87e0-43cb-bd28-a6471faae053")
PushNotifications.subscribe("hello")

pn_client = PushNotifications(
instance_id='51a66adb-87e0-43cb-bd28-a6471faae053',
secret_key='C6DDB23DCA4B81BBBC7D5C9E973D94C',
)
def stream_handler(message):
    print(message)
    if(message['data'] is 1):
        response = pn_client.publish(
            interests=['hello'],
            publish_body={
                'apns': {'aps': {'alert': 'Hello!',},},
                'fcm': {'notification': {'title': 'Hello','body': 'Hello, world!',},
                },
            },
        )
    print(response['publishId'])
    # variable name "fire_sensor_status"
    my_stream = db.child("fire_sensor_status").stream(stream_handler,None)

