import { Component } from '@angular/core';
import { NavParams, LoadingController } from 'ionic-angular';

import { FeedbackProvider } from '../../providers/feedback-provider';

@Component({
  selector: 'page-meeting-detail',
  templateUrl: 'meeting-detail.html'
})
export class MeetingDetailPage {

  private attendees: any;
  private meeting: any;

  private loading: any;

  constructor(
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private feedbackProvider: FeedbackProvider
  ) {}

  ionViewWillEnter() {
    
    console.log('tjv...ionViewWillEnter()....>>>this.navParams.data : ' + JSON.stringify(this.navParams.data));
    this.meeting = this.navParams.data;

    console.log('tjv...Calling showAttendees()...this.meeting.id : ' + this.meeting.id);
    this.showAttendees(this.meeting.id);
  }

  showAttendees(meetingId: number) {
  
    this.loading = this.loadingCtrl.create({
      content: 'Fetching Attendees...'
    });

    this.loading.present().then(()=>{
      console.log('tjv...Calling getAttendeesFeedbackForMeeting()...meetingId : ' + meetingId);
      this.feedbackProvider.getAttendeesFeedbackForMeeting(meetingId).then(result => {
        
        this.attendees = result;
        console.log('tjv...this.attendees : ' + JSON.stringify(this.attendees));
        this.loading.dismiss();
      });
    });

  }

}
