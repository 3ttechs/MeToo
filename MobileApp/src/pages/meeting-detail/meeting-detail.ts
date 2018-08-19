import { Component } from '@angular/core';
import { NavParams, LoadingController,FabContainer } from 'ionic-angular';

import { FeedbackProvider } from '../../providers/feedback-provider';
import { MeetingProvider } from '../../providers/meeting-provider';
import { DummyLoginProvider } from '../../providers/dummy-login-provider';
//import { SocialSharing } from '@ionic-native/social-sharing';

@Component({
  selector: 'page-meeting-detail',
  templateUrl: 'meeting-detail.html'
})

export class MeetingDetailPage {
  /*
  (arg0: any): any {
    throw new Error("Method not implemented.");
    //alert(arg0); 

  }
*/
  
  private meeting: any;
  private attendees: any;

  private loading: any;

  constructor(
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private feedbackProvider: FeedbackProvider,
    private loginProvider: DummyLoginProvider,
    private meetingProvider: MeetingProvider,
    //private socialSharing: SocialSharing
  ) {}

  ionViewWillEnter() {
    let userId = this.loginProvider.UserId;
    this.meeting = this.navParams.data;
    console.log('Inside ionViewWillEnter()...meeting.isPast : ' + this.meeting.isPast)

    if(this.meeting.isPast === 'Yes')
    {
      this.showAttendeesAndFeedback(userId, this.meeting.id);
    }
    else
    {
      this.showAttendeesAndResponse(userId, this.meeting.id);
    }
  }
  fnWhatsapp(){
    //this.shareViaWhatsApp("This is test",null,null);
  // this.whatsappShare1("Test");
  }
/*
 async whatsappShare() {
    try {
      
      this.socialSharing.shareViaWhatsApp
    this.socialSharing.shareViaWhatsApp("shareViaWhatsApp", null, null).then(() => {
      console.log("shareViaWhatsApp: Success");
    }).catch(() => {
      console.error("shareViaWhatsApp: failed");
    });
  } catch (error) {
     alert(error); 
  }
  }
  */
/*
  whatsappShare1(index){
    try {
      
   
    var msg  = this.compilemsg(index);
     this.socialSharing.shareViaWhatsApp(msg, null, null).then(()=>{
      alert('sucess');
     }).catch(()=>{
      alert('error');
     });
     

    } catch (error) {
      alert(error);
    }
   }
*/
  populateViewWithAttendeesData(result: any)
  {
    console.log(JSON.stringify(result));
    let attendeesData: any = result;
        
    this.attendees = [];
    let i: number = 0;
    attendeesData.forEach(attendeeData => {
      
      let attendee: any;

      if(this.meeting.isPast === 'Yes')
      {
        let feedbackResponse = attendeeData['feedback.feedback_response'];
        if(feedbackResponse === 'NOT_GIVEN')
          feedbackResponse = 'Not Given';
        else if(feedbackResponse === 'GIVEN')
          feedbackResponse = 'Given';
        else if(feedbackResponse === 'DECLINE')
          feedbackResponse = 'Did not attend meeting';
        else {}

        attendee = {
          name : attendeeData.attendee_name,
          email : attendeeData['user.email'],
          phoneNo : attendeeData['user.phone_no'],
          feedbackNote : attendeeData['feedback.note'],
          starRating : attendeeData['feedback.star_rating'],
          feedbackResponse : feedbackResponse
        };
      }
      else
      {
        let attendeeResponse = attendeeData.attendee_response;
        if(attendeeResponse === 'NOT_GIVEN')
          attendeeResponse = 'Yet to respond';
        else if(attendeeResponse === 'DECLINE')
          attendeeResponse = 'Declined';
        else if(attendeeResponse === 'ACCEPT')
          attendeeResponse = 'Accepted';
        else {}

        attendee = {
          name : attendeeData.attendee_name,
          email : attendeeData['user.email'],
          phoneNo : attendeeData['user.phone_no'],
          attendeeResponse : attendeeResponse
        };
        console.log('attendeeData.attendee_response : ' + attendeeData.attendee_response);
      }
      
      this.attendees[i] = attendee;
      i = i+1;
    });
    
    this.loading.dismiss();
  }

  showAttendeesAndResponse(userId: number, meetingId: number) {

    console.log('meetingId : ' + meetingId);
  
    this.loading = this.loadingCtrl.create({
      content: 'Fetching Attendees Response data...'
    });

    this.loading.present().then(()=>{
      this.meetingProvider.getAttendeesOfMeeting(userId, meetingId).then(result => {
        
        this.populateViewWithAttendeesData(result);
      });

    });

  }

  showAttendeesAndFeedback(userId: number, meetingId: number) {
  
    this.loading = this.loadingCtrl.create({
      content: 'Fetching Attendees Feedback data...'
    });

    this.loading.present().then(()=>{
      this.feedbackProvider.getAttendeesFeedbackForMeeting(userId, meetingId).then(result => {
        
        this.populateViewWithAttendeesData(result);
      });

    });

  }

  // <a href="whatsapp://send?text=The text to share!" data-action="share/whatsapp/share">Share via Whatsapp</a>

  openSocial(network: string, fab: FabContainer) {
    let loading = this.loadingCtrl.create({
      content: `Posting to ${network}`,
      
      duration: (Math.random() * 1000) + 500
    });
    loading.onWillDismiss(() => {
      fab.close();
    });
    loading.present();
  }


}
