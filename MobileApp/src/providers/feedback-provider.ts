import { Injectable } from '@angular/core';
import { Headers,Http, RequestOptions } from '@angular/http';
import { AlertController } from 'ionic-angular';
import { UtilityProvider } from '../providers/utility-provider';


@Injectable()
export class FeedbackProvider {
  apiUrl: string;
  
  constructor(public http: Http,public alertCtrl: AlertController, private utility: UtilityProvider) { 
    this.apiUrl =this.utility.apiUrl; 
  }

  public getAttendeesFeedbackForMeeting(userId: number, meetingId: number){
    console.log('Calling get_meeting_attendees_feedback with 2 arguments...user_id : ' + userId + ' meetingId : ' + meetingId);
    return new Promise((resolve,reject) =>{
      this.http.get(this.apiUrl + '/get_meeting_attendees_feedback/user_id='+userId+ ',meeting_id=' + meetingId)
        .subscribe(res=>{
          resolve(res.json());
        },(err) => {
          console.log(err);
          reject(err);
        });
    })
  }

  public getPendingFeedbackListForUser(userId: number){
    return new Promise((resolve,reject) =>{
      this.http.get(this.apiUrl + '/ask_for_feedback/user_id=' + userId)
        .subscribe(res=>{
          resolve(res.json());
        },(err) => {
          console.log(err);
          reject(err);
        });
    }) 
  }

  addFeedback(feedback: any){
    return new Promise((resolve,reject) => {
      let headers = new Headers();
      
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');

      let postParams = {feedback_id: feedback.feedbackId, star_rating: feedback.starRating,
                        feedback_response: feedback.response, note: feedback.note};

      console.log(postParams);
      
      this.http.post(this.apiUrl+'/add_feedback', postParams, {headers: headers})
        .subscribe(res => {
          resolve(res.json());
          //resolve(res.text());
        }, (err) => {
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
      this.http.post(this.apiUrl+CallingMethodName, loginBody, this.HeaderOptionsValues())
        .subscribe(res => resolve(res.json()))
    });
  }

  // Generic method to GET data
  GetData(InputData: string,CallingMethodName: string ) {
    //alert(apiUrl+CallingMethodName+InputData);
    return new Promise(resolve => {
      this.http.get(this.apiUrl+CallingMethodName+InputData)
      .subscribe(res => resolve(res.json()))
    })
  }

    // this method is used for save data and return Success Text 
    PostDataT(InsertData: string, CallingMethodName: string) {
      //alert(apiUrl+CallingMethodName+InsertData);
      let loginBody = InsertData;
      return new Promise(resolve => {
        this.http.post(this.apiUrl+CallingMethodName, loginBody, this.HeaderOptionsValues())
          .subscribe(res => resolve(res.text()))
      });
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
