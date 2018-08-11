import { Component } from '@angular/core';
import { NavParams, LoadingController,FabContainer } from 'ionic-angular';

import { FeedbackProvider } from '../../providers/feedback-provider';
import { DummyLoginProvider } from '../../providers/dummy-login-provider';


@Component({
  selector: 'page-meeting-detail',
  templateUrl: 'meeting-detail.html'
})
export class MeetingDetailPage {

  private meeting: any;
  private attendees: any;

  private loading: any;

  constructor(
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private feedbackProvider: FeedbackProvider,
    private loginProvider: DummyLoginProvider
  ) {}

  ionViewWillEnter() {
    let userId = this.loginProvider.UserId;
    this.meeting = this.navParams.data;
    this.showAttendees(userId, this.meeting.id);
  }

  showAttendees(userId: number, meetingId: number) {
  
    this.loading = this.loadingCtrl.create({
     // content: 'Fetching Attendees...'
    });

    this.loading.present().then(()=>{
      this.feedbackProvider.getAttendeesFeedbackForMeeting(userId, meetingId).then(result => {
        
        let attendeesData: any = result;
        
        this.attendees = [];
        let i: number = 0;
        attendeesData.forEach(attendeeData => {
          console.log('starRating : ' + attendeeData['feedback.star_rating']);
          // need to stringify
          let attendee: any = {
            name : attendeeData.attendee_name,
            //email : attendeeData['user.email'],
            //phoneNo : attendeeData['user.phone_no'],
            //feedback : attendeeData['feedback.note'],
            //starRating : attendeeData['feedback.star_rating']
            email : attendeeData.email,
            phoneNo : attendeeData.phone_no,
            feedback : attendeeData.note,
            starRating : attendeeData.star_rating           
          };
          
          this.attendees[i] = attendee;
          i = i+1;
        });
        
        this.loading.dismiss();
      });

    });

  }

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
