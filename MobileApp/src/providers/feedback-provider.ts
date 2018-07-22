import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

let apiUrl = 'http://localhost:5000';

@Injectable()
export class FeedbackProvider {
  
  constructor(public http: Http) { }

  public getAttendeesFeedbackForMeeting(meetingId: number){
    return new Promise((resolve,reject) =>{
      this.http.get(apiUrl + '/get_meeting_attendees_feedback/user_id=1,meeting_id=' + meetingId)
        .subscribe(res=>{
          resolve(res.json());
        },(err) => {
          console.log(err);
          reject(err);
        });
    })
  }
}
