import { Injectable } from '@angular/core';
import { Headers,Http, RequestOptions } from '@angular/http';
import { AlertController } from 'ionic-angular';

let apiUrl = 'http://localhost:5000';

@Injectable()
export class FeedbackProvider {
  
  constructor(public http: Http,public alertCtrl: AlertController) { }

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
// ChandraRao Implimented
  HeaderOptionsValues() {
    let myHeader: Headers = new Headers;
    myHeader.set('Accept', 'application/json');
    myHeader.set('Content-type', 'application/json');
    return new RequestOptions({
      headers: myHeader
    });
  }
   // this method is used for save data
   PostData(InsertData: string, CallingMethodName: string) {
    //alert(apiUrl+CallingMethodName+InsertData);
    let loginBody = InsertData;
    return new Promise(resolve => {
      this.http.post(apiUrl+CallingMethodName, loginBody, this.HeaderOptionsValues())
        .subscribe(res => resolve(res.json()))
    });
  }

  // Generic method to GET data
  GetData(InputData: string,CallingMethodName: string ) {
    //alert(apiUrl+CallingMethodName+InputData);
    return new Promise(resolve => {
      this.http.get(apiUrl+CallingMethodName+InputData)
      .subscribe(res => resolve(res.json()))
    })
  }

      // this is for ionic alert box
      showAlert(Message:string,Title:string) {
        const alert = this.alertCtrl.create({
          title: Title,
          subTitle: Message,
          buttons: ['OK']
        });
        alert.present();
      }
      // ChandraRao Implimented
}
