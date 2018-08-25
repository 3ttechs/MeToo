import { Component, ViewChild } from '@angular/core';

import { AlertController, App, List, ModalController, NavController, ToastController, LoadingController, Refresher } from 'ionic-angular';

import { MeetingProvider  } from '../../providers/meeting-provider';
import { UserData } from '../../providers/user-data';
import { DummyLoginProvider } from '../../providers/dummy-login-provider';
import { UtilityProvider } from '../../providers/utility-provider';

import { MeetingDetailPage } from '../meeting-detail/meeting-detail';
import { MeetingEditPage } from '../meeting-edit/meeting-edit';
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

  private queryText: string = '';
  private segment: string = 'upcoming';
  private excludeCategories: any = [];
  private allMeetings: any = [];
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
    private loginProvider: DummyLoginProvider,
    private utility: UtilityProvider
  ) {}

  ionViewDidLoad() {
    this.app.setTitle('Schedule');
    this.updateScheduleOnDidLoad();
  }

  updateScheduleOnDidLoad() {
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();

    let userId = this.loginProvider.UserId;
            
    this.loading = this.loadingCtrl.create({
      content: 'Fetching Meetings...'
    });

    this.loading.present().then(()=>{
      this.meetingProvider.getMeetingListForUser(userId).then(result => {
        
        this.allMeetings = result;
       
        let meetingGroupsData: any = this.meetingProvider.getMeetingGroupsDataFromAllMeetings(this.allMeetings, this.queryText, this.excludeCategories, this.segment);
        let meetingGroups: any = meetingGroupsData.groups;
        
        this.shownMeetingsCount = meetingGroupsData.shownMeetingsCount;
        this.groups = meetingGroups;
        
        this.loading.dismiss();
      });
    });

  }

  updateSchedule() {
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();
  
    let meetingGroupsData: any = this.meetingProvider.getMeetingGroupsDataFromAllMeetings(this.allMeetings, this.queryText, this.excludeCategories, this.segment);
    let meetingGroups: any = meetingGroupsData.groups;
    
    this.shownMeetingsCount = meetingGroupsData.shownMeetingsCount;
    this.groups = meetingGroups;
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

  doRefresh(refresher: Refresher, flag: number) {
    let userId = this.loginProvider.UserId;
    
    this.meetingProvider.callGetMeetingListService(userId).subscribe((data: any) => {

      this.allMeetings = data.json();
            
      let meetingGroupsData: any = this.meetingProvider.getMeetingGroupsDataFromAllMeetings(this.allMeetings, this.queryText, this.excludeCategories, this.segment);
      let meetingGroups: any = meetingGroupsData.groups;
      let shownMeetingsCount: number = meetingGroupsData.shownMeetingsCount;
            
      this.shownMeetingsCount = shownMeetingsCount;
      this.groups = meetingGroups;
    
      setTimeout(() => {

        if(flag === 0) refresher.complete();
        
        const toast = this.toastCtrl.create({
          message: 'Meetings have been updated.',
          duration: 3000
        });
        toast.present();

      }, 1000);
    });
  }

  doRefreshExplicitly(refresher: Refresher, flag: number) {
    this.doRefresh(refresher, flag);
  }

  respondToMeetingInvitation(meetingId: number, attendeeResponse: string){
    let userId = this.loginProvider.UserId;
    let attendeeId = userId;

    //this.utility.showLoader('Adding response...');
    this.meetingProvider.updateAttendeeMeetingResponse(meetingId, attendeeId, attendeeResponse).then((result) => {
      
      //this.utility.dismissLoader();
      if(result === 'Success'){
        this.utility.showAlert(attendeeResponse, 'Meeting');
        this.doRefreshExplicitly(null, 1);
      }
      else{
        this.utility.showAlert('Response not added', 'Meeting');
      }
    }, (err) => {
      this.utility.presentToast(err);
    });

  }

  deleteMeeting(meetingId: number){

    this.meetingProvider.deleteMeeting(meetingId).then((result) => {
      
      if(result === 'Success'){
        this.utility.showAlert('Meeting deleted', 'Meeting');
        this.doRefreshExplicitly(null, 1);
      }
      else{
        
        this.utility.showAlert('Meeting not deleted', 'Meeting');
      }
      
    }, (err) => {
      this.utility.presentToast(err);
    });

  }

  editMeeting(meeting: any) {
    this.navCtrl.push(MeetingEditPage, meeting);
  }
}
