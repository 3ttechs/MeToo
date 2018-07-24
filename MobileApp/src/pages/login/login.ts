import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { UserData } from '../../providers/user-data';
import { UserOptions } from '../../interfaces/user-options';
import { TabsPage } from '../tabs-page/tabs-page';
import { SignupPage } from '../signup/signup';
import { FeedbackProvider } from '../../providers/feedback-provider';  // where feeback provider will use for login screen  -- ChandraRao
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { DummyLoginProvider } from '../../providers/dummy-login-provider';

@Component({
  selector: 'page-user',
  templateUrl: 'login.html'
})
export class LoginPage {
  public UserId: string =""; // ChandraRao
  inputdataVal: any[0]; // ChandraRao  
  login: UserOptions = { username: '', password: '', Confirmpassword: '', Email: '',PhoneNumber: '',Name: '' };
  submitted = false;
  data: any;
  constructor(public navCtrl: NavController, public userData: UserData,
    private feedbackProvider: FeedbackProvider,
    private loginProvider: DummyLoginProvider) { }

  onLogin(form: NgForm) {
    // Added by ChandraRao
    //this.submitted = true;

    if (form.valid) {
      let LoginData = JSON.stringify({
        login_id: this.login.username,passwd: this.login.password
      });
  
        this.feedbackProvider.PostData(LoginData,"/login").then((result) => {
        this.data = result;
        if (this.data === 0) {
          this.feedbackProvider.showAlert('Invalid user',"Login");
        } else {
          this.inputdataVal =this.data;
          //alert(JSON.stringify(this.inputdataVal['login_id']));
          this.loginProvider.UserId=this.inputdataVal['user_id'];
          this.navCtrl.push(TabsPage);
        }
      }).catch(function (error) {
        this.feedbackProvider.showAlert(JSON.stringify(error),"Error");
      });
    }

  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }
  onForgotPassword()
  {
    this.navCtrl.push(ForgotPasswordPage);
  }

  onGLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }
  }

  onTLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }
  }

  onFBLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }
  }
}
