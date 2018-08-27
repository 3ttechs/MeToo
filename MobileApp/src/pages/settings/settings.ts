import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AlertController, NavController, ToastController } from 'ionic-angular';
//import { Http, Headers } from "@angular/http";
import { DummyLoginProvider } from '../../providers/dummy-login-provider';
import { FeedbackProvider } from '../../providers/feedback-provider';
//import { SignupPage } from '../signup/signup';
import { UserData } from '../../providers/user-data';
//import { UserOptions } from '../../interfaces/user-options';
//import { LoginPage } from '../login/login';
import { UserProfile } from '../../interfaces/user-options';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  submitted: boolean = false;
  newPasswd: string;
  //userDetails : any;
  inputdataVal: any[0];
  login_id : string;
  user_name : string;
  changeSettings : boolean = false;
  changePwdFlag : boolean = false;
  emailNotification : boolean = false;
  isToggledEmail: boolean = false;
  devFlag : boolean = true;
  //Name:string, Password: string,   Confirmpassword: string,   NewPassword : string,   Email: string,  PhoneNumber: string,
  
  //private 
  userDetails: UserProfile = {UserID: "", LoginID: "", UserName: "", Password: "", Confirmpassword:"", NewPassword:"", Email:"", PhoneNumber:0 };
  //EmailNotification:"", ColorBusiness: "", ColorPersonal:""};
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

  onChangeParameters(){

    this.changeSettings = true;
  }

  ChangeParameters(form: NgForm){

      this.submitted = true;
      
      if (form.valid) {
      return new Promise((resolve, reject) => {
        let headers = new Headers();
        console.log(resolve);
        console.log(reject);
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        let user_id = this.loginProvider.UserId;
     
        this.userDetails.UserName = this.inputdataVal.user_name;
        this.userDetails.LoginID = this.inputdataVal.login_id;
        //this.userDetails.NewPassword = this.inputdataVal.Password;
       
        //let passwd = this.inputdataVal.Password;
        let passwd = "";
        
        
        let login_id = this.userDetails.LoginID;

        // Set new Passwd if changed
        if (this.changePwdFlag === true) {
          passwd = this.inputdataVal.Password;
          //console.log(passwd);
        }
        
        let user_name  = this.userDetails.UserName;
        let phone_no  = this.inputdataVal.phone_no;
        let email  = this.inputdataVal.email;

        /*{
          "user_id": 1,
          "login_id": "Lakshmy",
          "passwd": "LaKsHmY",
          "user_name": "Lakshmy", 
          "phone_no": "9988776655",
          "email": "g@h.com"
        }*/
      
        let postParams = JSON.stringify({user_id: user_id, login_id: login_id, passwd: passwd, user_name: user_name, phone_no:phone_no,email:email })
        
        console.log(postParams);
        this.feedbackProvider.PostDataT(postParams, '/update_user_profile').then((result) => {
      
          //this.inputdataVal = result;
          if(result === 0){
            this.showAlert('Not Updated  !');
            this.navCtrl.setRoot(SettingsPage);
          
          }
          else{
            this.showAlert('Updated');
            this.navCtrl.setRoot(SettingsPage);
            
          }
        },(err) =>{
          alert(JSON.stringify(err));
          });
          
      })
    }
  } 

  changePasswd($event) {
    console.log("Checkbox event below")
    console.log($event)
    this.changePwdFlag = $event;
  }
emailNotify(){
  this.emailNotification = this.isToggledEmail;
  console.log("Email Notification status")
  console.log(this.emailNotification)

}
 changeUserSettings(){

  //EmailNotification: Boolean,
  //ColorBusiness: string,
  //ColorPersonal: string
   let emailNotif = this.emailNotification;
   
    // Update the Settings table for Email Nofication
    let postParams = JSON.stringify({ EmailNotification:emailNotif, ColorBusiness:"", ColorPersonal:"" })
        
    console.log(postParams);
    this.feedbackProvider.PostDataT(postParams, '/update_user_settings').then((result) => {
      
      //this.inputdataVal = result;
      if(result === 0){
        this.showAlert('Not Updated  !');
        this.navCtrl.setRoot(SettingsPage);
      
      }
      else{
        this.showAlert('Updated');
        this.navCtrl.setRoot(SettingsPage);
        
      }
    },(err) =>{
      alert(JSON.stringify(err));
      });




  }

  showAlert(msg) {
    let alert = this.alertCtrl.create({
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
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
/*
  ionViewCanLeave(): boolean | Promise<boolean> {
    // If the support message is empty we should just navigate
    
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
  */
}
