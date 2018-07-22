import { Component, ViewChild } from '@angular/core';

import { AlertController, App, FabContainer, List, ModalController, NavController, ToastController, LoadingController, Refresher } from 'ionic-angular';

import { MeetingProvider  } from '../../providers/meeting-provider';
import { UserData } from '../../providers/user-data';
import { DummyLoginProvider } from '../../providers/dummy-login-provider';

import { MeetingDetailPage } from '../meeting-detail/meeting-detail';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';

@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html'
})
export class SchedulePage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('scheduleList', { read: List }) scheduleList: List;

  private dayIndex: number = 0;
  private queryText: string = '';
  private segment: string = 'upcoming';
  private excludeCategories: any = [];
  private shownMeetingsCount: number;
  private groups: any = [];
  private loading: any;

  constructor(
    public alertCtrl: AlertController,
    public app: App,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public meetingProvider: MeetingProvider,
    public user: UserData,
    private loginProvider: DummyLoginProvider
  ) {}

  ionViewDidLoad() {
    this.app.setTitle('Schedule');
    this.updateSchedule();
  }

  updateSchedule() {
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();

    let userId = this.loginProvider.UserId;
    console.log('userId : ' + userId);
    
    this.loading = this.loadingCtrl.create({
      content: 'Fetching Meetings...'
    });

    this.loading.present().then(()=>{
      this.meetingProvider.getMeetingListForUser(userId).then(result => {
        let allMeetings: any = result;
        let meetingGroupsData: any = this.meetingProvider.getMeetingGroupsDataFromAllMeetings(allMeetings, this.queryText, this.excludeCategories, this.segment);
        let meetingGroups: any = meetingGroupsData.groups;
        let shownMeetings: number = meetingGroupsData.shownMeetings;

        this.shownMeetingsCount = shownMeetings;
        this.groups = meetingGroups;

        this.loading.dismiss();
      });
    });

  }

  presentFilter() {
    let modal = this.modalCtrl.create(ScheduleFilterPage, this.excludeCategories);
    modal.present();

    modal.onWillDismiss((data: any[]) => {
      if (data) {
        this.excludeCategories = data;
        this.updateSchedule();
      }
    });
  }

  goToMeetingDetail(meeting: any) {
    
    console.log('tjv...meetingData.id : ' + meeting.id);
    console.log('tjv...meetingData.title : ' + meeting.title);
    console.log('tjv...meetingData.startTime : ' + meeting.startTime);
    console.log('tjv...meetingData.endTime : ' + meeting.endTime);

    //this.navCtrl.push(MeetingDetailPage, { sessionId: meetingData.meeting_id, name: meetingData.title });
    this.navCtrl.push(MeetingDetailPage, meeting);
  }

  openSocial(network: string, fab: FabContainer) {
    console.log('tjv...Inside openSocial()');
    let loading = this.loadingCtrl.create({
      content: `Posting to ${network}`,
      duration: (Math.random() * 1000) + 500
    });
    loading.onWillDismiss(() => {
      fab.close();
    });
    loading.present();
  }

  doRefresh(refresher: Refresher) {
    console.log('tjv...Inside doRefresh()...refresher._didStart : ' + refresher._didStart);
    this.meetingProvider.getTimeline(this.dayIndex, this.queryText, this.excludeCategories, this.segment).subscribe((data: any) => {
      this.shownMeetingsCount = data.shownSessions;
      this.groups = data.groups;

      console.log('tjv...this.dayIndex :  ' + this.dayIndex);
      console.log('tjv...this.queryText :  ' + this.queryText);
      console.log('tjv...this.excludeCategories.length :  ' + this.excludeCategories.length);

      console.log('tjv...data.shownSessions :  ' + data.shownSessions);
      console.log('tjv...this.groups.length :  ' + this.groups.length);
      console.log('tjv...this.groups[0] :  ' + JSON.stringify(this.groups[0]))

      // simulate a network request that would take longer
      // than just pulling from out local json file
      setTimeout(() => {
        //refresher.complete(); tjv blocked for testing

        const toast = this.toastCtrl.create({
          message: 'Meetings have been updated.',
          duration: 3000
        });
        toast.present();
      }, 1000);
    });
  }

  //tjv : dummy() is to simulate doRefresh()
   dummy() {
    
    let userId = this.loginProvider.UserId;
    console.log('userId : ' + userId);
    console.log("tjv...Inside dummy()...");

    this.loading = this.loadingCtrl.create({
      content: 'Fetching Meetings...'
    });

    this.loading.present().then(()=>{
      console.log('tjv...Calling getMeetingListForUser()...');

      this.meetingProvider.getMeetingListForUser(userId).then(result => {
        let allMeetings: any = result;
        console.log('meetings.length : ' + allMeetings.length);
     
        let meetingGroupsData: any = this.meetingProvider.getMeetingGroupsDataFromAllMeetings(allMeetings, this.queryText, this.excludeCategories, this.segment);
        let meetingGroups: any = meetingGroupsData.groups;
        let shownMeetingsCount: number = meetingGroupsData.shownMeetings;
        
        console.log('meetingGroups.length : ' + meetingGroups.length);

        console.log('tjv...Initial');
        console.log(this.groups[0]);

        this.shownMeetingsCount = shownMeetingsCount;
        this.groups = meetingGroups;

        console.log('tjv...Final');
        console.log(this.groups[0]);

        this.loading.dismiss();
      });
      
    });
  }
}
