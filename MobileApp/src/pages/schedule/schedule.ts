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
        
        this.shownMeetingsCount = meetingGroupsData.shownMeetingsCount;
        this.groups = meetingGroups;
        console.log('this.shownMeetingsCount : ' + this.shownMeetingsCount);
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
    
    this.meetingProvider.getTimeline(this.dayIndex, this.queryText, this.excludeCategories, this.segment).subscribe((data: any) => {
      this.shownMeetingsCount = data.shownSessions;
      this.groups = data.groups;

      // simulate a network request that would take longer
      // than just pulling from our local json file
      setTimeout(() => {
        refresher.complete(); //Note : This will give error if the function is called from a button click

        const toast = this.toastCtrl.create({
          message: 'Meetings have been updated.',
          duration: 3000
        });
        toast.present();
      }, 1000);
    });
  }

  //Note : This is very similar to updateSchedule(). Rename it to doRefresh() at a later stage
  dummyRefresh(refresher: Refresher, flag: number) {

    let userId = this.loginProvider.UserId;
    
    //Note : Earlier the below was a 'subscribe'. Now it is a 'then'. Refer getTimeline()
    this.meetingProvider.getMeetingListForUser(userId).then(result => {
    
      let allMeetings: any = result;
    
      let meetingGroupsData: any = this.meetingProvider.getMeetingGroupsDataFromAllMeetings(allMeetings, this.queryText, this.excludeCategories, this.segment);
      let meetingGroups: any = meetingGroupsData.groups;
      let shownMeetingsCount: number = meetingGroupsData.shownMeetingsCount;
      
      this.shownMeetingsCount = shownMeetingsCount;
      this.groups = meetingGroups;
    
      setTimeout(() => {

        if(flag === 1) refresher.complete();

        const toast = this.toastCtrl.create({
          message: 'Meetings have been updated.',
          duration: 3000
        });
        toast.present();
      }, 1000);
    });
  }

  dummyRefresh2(refresher: Refresher, flag: number) {
    let userId = this.loginProvider.UserId;
    
    this.meetingProvider.callGetMeetingListService(userId).subscribe((data: any) => {

      let allMeetings: any = data.json();
            
      let meetingGroupsData: any = this.meetingProvider.getMeetingGroupsDataFromAllMeetings(allMeetings, this.queryText, this.excludeCategories, this.segment);
      let meetingGroups: any = meetingGroupsData.groups;
      let shownMeetingsCount: number = meetingGroupsData.shownMeetingsCount;
            
      this.shownMeetingsCount = shownMeetingsCount;
      this.groups = meetingGroups;
    
      setTimeout(() => {

        if(flag === 1) refresher.complete();

        const toast = this.toastCtrl.create({
          message: 'Meetings have been updated.',
          duration: 3000
        });
        toast.present();
      }, 1000);
    });
  }
}
