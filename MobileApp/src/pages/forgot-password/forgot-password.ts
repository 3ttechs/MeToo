import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import {  ForgotPwd } from '../../interfaces/user-options';
import { FeedbackProvider } from '../../providers/feedback-provider';  // where feeback provider will use for login screen  -- ChandraRao

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordPage {

    forgotPwd: ForgotPwd = { LoginId: '' };
    submitted = false;
    data: any;
    constructor(public navCtrl: NavController, public navParams: NavParams,
      private feedbackProvider: FeedbackProvider) {
    }
  
    ionViewDidLoad() {
      console.log('ionViewDidLoad ForgotPasswordPage');
    }
    //http://localhost:5000/forgot_password/login_id='b'
    //{"email": "c@d.com", "login_id": "b", "passwd": "b", "phone_no": 2, "user_id": 2, "user_name": "b"}
    onSendEmail() {
      if (this.forgotPwd.LoginId === "") {
        this.feedbackProvider.showAlert("User Id Should not left blank", "Error");
      } else {
          this.submitted = true;
          //let forgotPwdData = JSON.stringify({
          //  login_id: this.forgotPwd.LoginId
         // });
            this.feedbackProvider.GetData("email='"+this.forgotPwd.LoginId+"'","/forgot_password/").then((result) => {
              this.data = result;
            if (this.data === 0) {
              this.feedbackProvider.showAlert('Invalid user',"Error");
            } else {
              this.feedbackProvider.showAlert("Password sucessfully sent to registered email", "Forgot Password");
            }
          }).catch(function (error) {
            this.feedbackProvider.showAlert(JSON.stringify(error),"Error");
          });
      }
    }
  }