import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AlertController, NavController, ToastController } from 'ionic-angular';
import { Http, Headers } from "@angular/http";
import { UtilityProvider } from '../../providers/utility-provider';


@Component({
  selector: 'page-vision',
  templateUrl: 'vision.html'
})
export class VisionPage {

  submitted: boolean = false;
  supportMessage: string;
  apiUrl: string;

  constructor(
    private http: Http,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private utility: UtilityProvider
  ) {
    this.apiUrl = this.utility.apiUrl; 
  }
/*
  ionViewDidEnter() {
    let toast = this.toastCtrl.create({
      message: 'This does not actually send a support request.',
      duration: 3000
    });
    toast.present();
  }*/

  submit(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      //this.supportMessage = '';
      //this.submitted = false;
      //this.showLoader();
      this.addGeneralComment(this.supportMessage).then((result) => {
        console.log('Balaji...Completed posting');
        //this.loading.dismiss();
        //console.log(result);
        //console.log('Balaji...Posting Completed');
        if(result == "Success"){
          //console.log('result === 0');
          console.log('Comment Posting Completed!');
          //this.showAlert('Contact exists!!!');
          //this.navCtrl.setRoot(ContactsPage);
          this.supportMessage = "";
          this.navCtrl.push(VisionPage);
        }
        else{
          //console.log('result != 0');
          //this.showAlert('Contact Added');
          //this.navCtrl.setRoot(ContactsPage);
          this.navCtrl.push(VisionPage);
        }
        //console.log(result);
      }, (err) => {
        //console.log('Balaji...Posting Not Completed');
        console.log(err);
        //this.loading.dismiss();
        //this.presentToast(err);
      });
      //oast.present();
    }
  }


  addGeneralComment(supportMessage){
    return new Promise((resolve,reject) => {
      let headers = new Headers();
      
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      let user_id = 2 // harcoded need to change to global variable USER_ID or global method
      //let postParams = JSON.stringify({user_id:user_id, comment:this.supportMessage})
     
      let postParams = {user_id: user_id, comment: this.supportMessage}
      console.log(supportMessage);
      console.log(postParams);
      
      this.http.post(this.apiUrl+'/add_general_comments', postParams, {headers: headers})
        .subscribe(res => {
          resolve(res.text());
          console.log('Balaji..Getting into Success loop after posting');
        }, (err) => {
          //console.log(err);
          //console.log('Balaji..Getting into error loop after posting');
          reject(err);
        });
    })
  }
  /*
  showLoader(){
    this.loading = this.loadingCtrl.create({
        content: 'Adding your comments...'
    });
    this.loading.present();
  }
  */
  // If the user enters text in the support question and then navigates
  // without submitting first, ask if they meant to leave the page
  ionViewCanLeave(): boolean | Promise<boolean> {
    // If the support message is empty we should just navigate
    if (!this.supportMessage || this.supportMessage.trim().length === 0) {
      return true;
    }

    return new Promise((resolve: any, reject: any) => {
      let alert = this.alertCtrl.create({
        title: 'Leave this page?',
        message: 'Are you sure you want to leave this page? Your support message will not be submitted.'
      });
      alert.addButton({ text: 'Stay', handler: reject });
      alert.addButton({ text: 'Leave', role: 'cancel', handler: resolve });

      alert.present();
    });
  }
}
