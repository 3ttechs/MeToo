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
    this.showPendingFeedback();
  }

  showPendingFeedback() {
    

    let userId = this.loginProvider.UserId;
    

    this.loading = this.loadingCtrl.create({
      //content: 'Fetching Pending Feedback...'
    });

    this.loading.present().then(()=>{
      this.feedbackProvider.getPendingFeedbackListForUser(userId).then(result => {
        
        this.pendingFeedbackArray = [];
        
        let feedBackArray: any = result;
        for(let i=0; i<feedBackArray.length; i++)
        {
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
        this.loading.dismiss();
      });
    });
  }

  submitFeedback(feedback: any, response: string) {
    
    feedback.response = response;
    this.showLoader();
      this.feedbackProvider.addFeedback(feedback).then((result) => {
        
        this.loading.dismiss();
        console.log(result);
        
        if(result === 1){
                    
          this.showAlert('Feedback Added');

          if(this.pendingFeedbackArray.length <= 1)
          {
            this.navCtrl.push(TabsPage);
          }
          else
          {
            this.navCtrl.push(FeedbackPage);
          }
        }
        else{
          this.showAlert('Feedback NOT Added');
          this.navCtrl.push(FeedbackPage);
        }
        
      }, (err) => {
        this.loading.dismiss();
        this.presentToast(err);
      });
  }

  showLoader(){
    this.loading = this.loadingCtrl.create({
        //content: 'Adding feedback...'
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
