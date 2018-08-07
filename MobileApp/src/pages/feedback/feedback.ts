import { Component } from '@angular/core';

import {NavController, LoadingController, AlertController, ToastController} from 'ionic-angular';

import { DummyLoginProvider } from '../../providers/dummy-login-provider';
import { FeedbackProvider } from '../../providers/feedback-provider';
import { TabsPage } from '../tabs-page/tabs-page';

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html'
})
export class FeedbackPage {
  
  private loading: any;
  private pendingFeedbackArray: any = [];
  
  constructor(
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, 
    private toastCtrl: ToastController,
    private loginProvider: DummyLoginProvider,
    private feedbackProvider: FeedbackProvider
  ) {}

  ionViewDidLoad() {
    console.log('tjv...Inside ionViewDidLoad()');
    this.showPendingFeedback();
  }

  showPendingFeedback() {
    console.log('tjv...showPendingFeedback()');

    let userId = this.loginProvider.UserId;
    console.log('userId : ' + userId);

    this.loading = this.loadingCtrl.create({
      content: 'Fetching Pending Feedback...'
    });

    this.loading.present().then(()=>{
      console.log('tjv...Calling getPendingFeedbackListForUser()...userId : ' + userId);
      this.feedbackProvider.getPendingFeedbackListForUser(userId).then(result => {
        
        this.pendingFeedbackArray = [];
        
        let feedBackArray: any = result;
        for(let i=0; i<feedBackArray.length; i++)
        {
          console.log('meeting_id : ' + feedBackArray[i].meeting_id + '...' + feedBackArray[i].feedback_id + '...' + feedBackArray[i].title);

          let feedBack = {meetingId: feedBackArray[i].meeting_id,
                          meetingTitle: feedBackArray[i].title,
                          meetingVenue: feedBackArray[i].venue,
                          meetingStartDate: feedBackArray[i].start_date,
                          isOrganiser : feedBackArray[i].Is_Organiser,
                          feedbackId: feedBackArray[i].feedback_id,
                          note: feedBackArray[i].note,
                          starRating : 1};

          this.pendingFeedbackArray[i] = feedBack;
        }
        //console.log('tjv...this.pendingFeedbackArray : ' + JSON.stringify(result));
        console.log('tjv...this.pendingFeedbackArray.length ' + this.pendingFeedbackArray.length);
        this.loading.dismiss();
      });
    });
  }

  submitFeedback(feedback: any) {
    console.log('tjv...Submit clicked ...meetingId : ' + feedback.meetingId);

    console.log('tjv...this.pendingFeedbackArray : ' + JSON.stringify(this.pendingFeedbackArray));

    feedback.response = 'GIVEN';
    this.showLoader();
      this.feedbackProvider.addFeedback(feedback).then((result) => {
        console.log('tjv...Calling loading.dismiss()');
        this.loading.dismiss();
        console.log(result);
        
        if(result === 1){
          console.log('result === Success');
          
          this.showAlert('Feedback Added');
          this.navCtrl.push(TabsPage);
        }
        else{
          console.log('result != 0');
          this.showAlert('Feedback NOT Added');
          this.navCtrl.push(TabsPage);
        }
        
      }, (err) => {
        this.loading.dismiss();
        this.presentToast(err);
      });
  }

  showLoader(){
    this.loading = this.loadingCtrl.create({
        content: 'Adding feedback...'
    });
    this.loading.present();
  }

  showAlert(msg) {
    let alert = this.alertCtrl.create({
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      dismissOnPageChange: true
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

}
