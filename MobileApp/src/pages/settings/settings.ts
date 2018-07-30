import { Component } from '@angular/core';
//import { NgForm } from '@angular/forms';

import { AlertController, NavController, ToastController } from 'ionic-angular';
//import { Http, Headers } from "@angular/http";
import { DummyLoginProvider } from '../../providers/dummy-login-provider';
import { FeedbackProvider } from '../../providers/feedback-provider';
//import { SignupPage } from '../signup/signup';
import { UserData } from '../../providers/user-data';
import { UserOptions } from '../../interfaces/user-options';
//import { LoginPage } from '../login/login';

//let apiUrl = 'http://localhost:5000';
//let apiUrl ='http://ec2-18-191-60-101.us-east-2.compute.amazonaws.com:5000';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  submitted: boolean = false;
  newPasswd: string;
  userDetails : any;
  inputdataVal: any[0];
  login_id : string;
  user_name : string;

  constructor(
    //private http: Http,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private feedbackProvider: FeedbackProvider,
    private loginProvider: DummyLoginProvider,
    //private userOptions : UserOptions,
    public userdata: UserData
  ) {

  }

  ionViewDidLoad() {
 
  }
  ionViewDidEnter() {
    this.onGetUserDetails();
    //toast.present();
  }
onGetUserDetails(){
  let inputdata = "user_id="+this.loginProvider.UserId;
  
  this.feedbackProvider.GetData(inputdata, "/get_user_details/").then(data => {
    this.inputdataVal = data;
  }).catch(function (error) {
    alert(JSON.stringify(error));
  });
  //console.log(this.userOptions.Name);
  //console.log(this.userOptions.username);
}

/*
onChangeParameters(form: NgForm){

    this.submitted = true;

    if (form.valid) {
    return new Promise((resolve,reject) => {
      let headers = new Headers();
      
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');
      let user_id = this.loginProvider.UserId;
      let newPasswd = "test@123" ;
    
      let login_id = this.userDetails.login_id;
      let passwd = newPasswd;
      let user_name  = this.userDetails.user_name;
      let phone_no  = this.userDetails.phone_no;
      let email  = this.userDetails.email;

      //let postParams = JSON.stringify({user_id:user_id, comment:this.supportMessage})
      let postParams = {user_id: user_id, login_id: login_id, passwd: passwd, user_name: user_name, phone_no:phone_no,email:email }
      
      console.log(postParams);
      
      this.http.post(apiUrl+'/update_user_profile', postParams, {headers: headers})
        .subscribe(res => {
          resolve(res.text());
          
          console.log('Balaji..Getting into Success loop after posting password');
        }, (err) => {
          //console.log(err);
          //console.log('Balaji..Getting into error loop after posting');
          reject(err);
        });
    })
  }
}
*/
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
    /*
    if (!this.supportMessage || this.supportMessage.trim().length === 0) {
      return true;
    }
    */

    return new Promise((resolve: any, reject: any) => {
      let alert = this.alertCtrl.create({
        title: 'Leave this page?',
        message: 'Are you sure you want to leave this page?'
      });
      alert.addButton({ text: 'Stay', handler: reject });
      alert.addButton({ text: 'Leave', role: 'cancel', handler: resolve });

      alert.present();
    });
  }
}
