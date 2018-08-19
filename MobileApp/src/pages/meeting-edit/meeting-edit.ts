import { Component } from '@angular/core';
import { NavParams, LoadingController } from 'ionic-angular';
import { NgForm } from '@angular/forms';


import { DummyLoginProvider } from '../../providers/dummy-login-provider';
import { MeetingProvider } from '../../providers/meeting-provider';
import { UtilityProvider } from '../../providers/utility-provider';

import { Meeting } from '../../interfaces/meeting';
//import { TabsPage } from '../tabs-page/tabs-page';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-meeting-edit',
  templateUrl: 'meeting-edit.html'
})
export class MeetingEditPage {
  [x: string]: any;

  private meeting: any;
  private attendees: any;
  private attendeesCount: number;

  private loading: any;

  private meetingEdit: Meeting = {Title: "", Venue: "", Notes:"", StartTimeStr: "", EndTimeStr: "", Category: "" };
  private submitted = false;

  constructor(
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private loginProvider: DummyLoginProvider,
    private utility: UtilityProvider,
    private meetingProvider: MeetingProvider,
    public navCtrl: NavController, 
  ) {}

  ionViewWillEnter() {
    this.meeting = this.navParams.data;
    let userId = this.loginProvider.UserId;

    this.meetingEdit.Title = this.meeting.title;
    this.meetingEdit.Venue = this.meeting.venue;
    this.meetingEdit.Notes = this.meeting.notes;

    this.meetingEdit.StartTimeStr = this.meeting.startTimeStr;
    this.meetingEdit.EndTimeStr = this.meeting.endTimeStr;
    this.meetingEdit.Category = this.meeting.category;

    console.log('meeting.title : ' + this.meeting.title);
    this.showAttendees(userId, this.meeting.id);
  }

  //Copy paste from another module
  showAttendees(userId: number, meetingId: number) {
  
    this.loading = this.loadingCtrl.create({
      content: 'Fetching Attendees...'
    });

    this.loading.present().then(()=>{
      this.meetingProvider.getAttendeesOfMeeting(userId, meetingId).then(result => {
        
        let attendeesData: any = result;
        
        this.attendees = [];
        
        let i: number = 0;
        attendeesData.forEach(attendeeData => {
                            
          let attendee: any = {
            name : attendeeData.attendee_name,
            email : attendeeData['user.email'],
            phoneNo : attendeeData['user.phone_no'],
          };
          
          this.attendees[i] = attendee;
          i = i+1;
        });

        this.attendeesCount = this.attendees.length;
        console.log('this.attendeesCount : ' + this.attendeesCount);
        
        this.loading.dismiss();
      });

    });

  }

  onModifyMeeting(form: NgForm) {
    
    this.submitted = true;

      if (form.valid) {
        
      let meetingId = this.meeting.id;
      console.log(JSON.stringify(this.meeting));
      console.log('meetingId : ' + meetingId);
      this.meetingProvider.modifyMeeting(this.meetingEdit, meetingId).then((result) => {

        console.log('result : ' + result)
        
        if(result === 'Success'){
          this.utility.showAlert('Meeting modified', 'Meeting');
          this.navCtrl.pop();


        }
        else{
          this.utility.showAlert('Meeting not modified', 'Meeting');
        }
      }, (err) => {
        this.utility.presentToast(err);
      });
    }

  }

}
