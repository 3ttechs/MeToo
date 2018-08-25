import { Component } from '@angular/core';
import { NavParams, LoadingController, FabContainer, Platform } from 'ionic-angular';

import { FeedbackProvider } from '../../providers/feedback-provider';
import { MeetingProvider } from '../../providers/meeting-provider';
import { DummyLoginProvider } from '../../providers/dummy-login-provider';
import { SocialSharing } from '@ionic-native/social-sharing';

@Component({
  selector: 'page-meeting-detail',
  templateUrl: 'meeting-detail.html'
})
export class MeetingDetailPage {
  [x: string]: any;
  // shareurl(arg0: any, arg1: any, arg2: any): any {
  //   throw new Error("Method not implemented.");
  // }
  // presentToast(arg0: any, arg1: any, arg2: any): any {
  //   throw new Error("Method not implemented.");
  // }
  // compilemsg(_arg0: any): any {
  //   throw new Error("Method not implemented.");
  // }

  private meeting: any;
  private attendees: any;
  public msgSentToMedia: String = '';

  public  msgTitle: String = '';
  public msgStartTime: String = '';
  public msgEndTime: String = '';
  public msgVenue: String = '';
  public msgOrg: String = '';
  public msgFooter: String = '';

  private loading: any;

  constructor(
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private feedbackProvider: FeedbackProvider,
    private loginProvider: DummyLoginProvider,
    private meetingProvider: MeetingProvider,
    private socialSharing: SocialSharing,
    public platform: Platform
  ) { }

  ionViewWillEnter() {
    let userId = this.loginProvider.UserId;
    this.meeting = this.navParams.data;

    console.log('Inside ionViewWillEnter()...meeting.isPast : ' + this.meeting.isPast)

    if (this.meeting.isPast === 'Yes') {
      this.showAttendeesAndFeedback(userId, this.meeting.id);
    }
    else {
      this.showAttendeesAndResponse(userId, this.meeting.id);
    }
  }

  SocialSharingData(MessageSentMediaType,  img, link) {
    try {

      this.msgTitle = "Title : "+ this.meeting.title.toString();
      this.msgStartTime="Start Date/Time : "+ this.meeting.startDate.toString();
      this.msgEndTime=this.meeting.startTime.toString();  // this is start time 
      this.msgVenue="Venue : "+ this.meeting.venue.toString();
      this.msgOrg="Organiser : "+ this.meeting.organiserName.toString();
      this.msgFooter="Link : http://metoo.com"

      this.msgSentToMedia = this.msgTitle.toString() + ', ' +this.msgStartTime.toString()+
       ' - '+ this.msgEndTime.toString()+', '+this.msgVenue.toString() +','+this.msgOrg.toString() +','+this.msgFooter+'.';
      
      if (MessageSentMediaType == 'w'){ 
        window['plugins'].socialsharing
          .shareViaWhatsApp(this.msgSentToMedia.toString(), null, null);
        }
      else if (MessageSentMediaType == 'f'){
        window['plugins'].socialsharing
          .shareViaFacebook(this.msgSentToMedia.toString(), img, link);
        }
      else if (MessageSentMediaType == 't'){
        window['plugins'].socialsharing
          .shareViaTwitter(this.msgSentToMedia.toString(), img, link);
        }
      else if (MessageSentMediaType == 't'){
        window['plugins'].socialsharing
          .shareViaTwitter(this.msgSentToMedia.toString(), img, link);
        }
      else if (MessageSentMediaType == 'sms'){
        window['plugins'].socialsharing
          .shareViaSMS(this.msgSentToMedia.toString() + ' ' + img + ' ' + link);
        }
      else {
        var sub = 'MeeToo Meeting Request';
        window['plugins'].socialsharing
          .shareViaEmail(this.msgSentToMedia.toString(), sub, '');
      }
    } catch (error) {
      alert(error);
    }
  }

  fnSMSmsg(){
    try {
      this.SocialSharingData('sms', null, null);
    } catch (error) {
      this.feedbackProvider.showAlert(error, "Error");
    } 
  }

  fnWhatsapp() {
    try {
      this.SocialSharingData('w',  null, null);
    } catch (error) {
      this.feedbackProvider.showAlert(error, "Error");
    }

    //this.WhatsAppShare();
  }

  fntwitterapp() {
    try {
      this.SocialSharingData('t',  null, null);
    } catch (error) {
      this.feedbackProvider.showAlert(error, "Error");
    }

  }
  fnFBapp() {
    try {
      this.SocialSharingData('f',  null, null);
    } catch (error) {
      this.feedbackProvider.showAlert(error, "Error");
    }

  }
  fnGoogle() {
    try {
      this.SocialSharingData('',  null, null);
    } catch (error) {
      this.feedbackProvider.showAlert(error, "Error");
    }
  }
  WhatsAppShare() {
    try {
      this.msgSentToMedia = 'Whats app Message ';
      //this.socialSharing.shareViaWhatsApp('test',null,'http://localhost:8100/#/tabs-page/conference-schedule/meetingDetail/:meetingId')
      this.socialSharing.shareViaWhatsApp(this.msgSentToMedia.toString(), null, null)
        .then(() => {
          //alert(JSON.stringify(WhatsdataMag));
        }).catch((error) => {
          alert(error);
        });
    } catch (error) {
      alert(error);
    }
  }
 
  WhatsAppShareReceiver() {
    try {
      this.msgSentToMedia = 'shareViaWhatsAppToReceiver ';
      //this.socialSharing.shareViaWhatsApp('test',null,'http://localhost:8100/#/tabs-page/conference-schedule/meetingDetail/:meetingId')
      this.socialSharing.shareViaWhatsAppToReceiver(this.msgSentToMedia.toString(),"MyMessage", null, null)
        .then(() => {
         // alert(JSON.stringify(WhatsdataMag));
        }).catch((error) => {
          alert(error);
        });
    } catch (error) {
      alert(error);
    }
  }

  populateViewWithAttendeesData(result: any) {
    console.log(JSON.stringify(result));
    let attendeesData: any = result;

    this.attendees = [];
    let i: number = 0;
    attendeesData.forEach(attendeeData => {

      let attendee: any;

      if (this.meeting.isPast === 'Yes') {
        let feedbackResponse = attendeeData.feedback_response; //['feedback.feedback_response']
        if (attendeeData.feedback_response === 'NOT_GIVEN')
          feedbackResponse = 'Not Given';
        else if (attendeeData.feedback_response === 'GIVEN')
          feedbackResponse = 'Given';
        else if (attendeeData.feedback_response === 'DECLINE')
          feedbackResponse = 'Did not attend meeting';
        else { }

        attendee = {
          name: attendeeData.attendee_name,
          email: attendeeData['user.email'],
          phoneNo: attendeeData['user.phone_no'],
          feedbackNote: attendeeData['feedback.note'],
          starRating: attendeeData['feedback.star_rating'],
          feedbackResponse: attendeeData['feedback.star_rating'],
          isOrganiser : attendeeData.Is_Organiser
        };
      }
      else {
        let attendeeResponse = attendeeData.attendee_response;
        if (attendeeData.attendee_response === 'NOT_GIVEN')
          attendeeResponse = 'Yet to respond';
        else if (attendeeData.attendee_response === 'DECLINE')
          attendeeResponse = 'Declined';
        else if (attendeeData.attendee_response === 'ACCEPT')
          attendeeResponse = 'Accepted';
        else { }

        attendee = {
          name: attendeeData.attendee_name,
          email: attendeeData['user.email'],
          phoneNo: attendeeData['user.phone_no'],
          attendeeResponse: attendeeResponse,
          isOrganiser : attendeeData.Is_Organiser
        };
        console.log('attendeeData.attendee_response : ' + attendeeData.attendee_response);
      }

      this.attendees[i] = attendee;
      i = i + 1;
    });

    this.loading.dismiss();
  }

  showAttendeesAndResponse(userId: number, meetingId: number) {

    console.log('meetingId : ' + meetingId);

    this.loading = this.loadingCtrl.create({
      content: 'Fetching Attendees Response data...'
    });

    this.loading.present().then(() => {
      this.meetingProvider.getAttendeesOfMeeting(userId, meetingId).then(result => {

        this.populateViewWithAttendeesData(result);
      });

    });

  }

  showAttendeesAndFeedback(userId: number, meetingId: number) {

    this.loading = this.loadingCtrl.create({
      content: 'Fetching Attendees Feedback data...'
    });

    this.loading.present().then(() => {
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
