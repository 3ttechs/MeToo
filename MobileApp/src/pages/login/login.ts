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
//import  {AngularFireAuth} from 'angularfire2/auth'
import {GooglePlus} from '@ionic-native/google-plus';
//import {AngularFireModule} from 'angularfire2';
import firebase from 'firebase';

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
  constructor( public navCtrl: NavController, public googleplus:GooglePlus, public userData: UserData,
    private feedbackProvider: FeedbackProvider,
    private loginProvider: DummyLoginProvider) { }
  
  onLogin(form: NgForm) {
    // Added by ChandraRao
    this.submitted = true;

    if (form.valid) {
      let LoginData = JSON.stringify({
        login_id: this.login.username,passwd: this.login.password
      });
  
        this.feedbackProvider.PostData(LoginData,"/login").then((result) => {
        this.data = result;
        this.login_method();
      }).catch(function (error) {
        this.feedbackProvider.showAlert(JSON.stringify(error),"Error");
      });
    }

  }

  private login_method() {
    if (this.data === 0) {
      this.feedbackProvider.showAlert('Invalid user', "Login");
    }
    else {
      this.inputdataVal = this.data;
      //alert(JSON.stringify(this.inputdataVal['login_id']));
      this.loginProvider.UserId = this.inputdataVal['user_id'];
      this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }
  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }
  onForgotPassword()
  {
    this.navCtrl.push(ForgotPasswordPage);
  }

  onGLogin() {
    //https://www.youtube.com/watch?v=g_UGNO3IfN8
    this.googleplus.login({
      'webClientId':'743549657335-s7t4n5egprp1u08ehoa4mhbb9b173h9r.apps.googleusercontent.com',
      'offline':true
    }).then(res =>{
      firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken))
      .then(suc=>{
        alert('LOGIN Succesful, User ID = '+suc.email)

        let LoginData = JSON.stringify({
          login_id: suc.email, user_name: suc.displayName
        });
    
          this.feedbackProvider.PostData(LoginData,"/google_login").then((result) => {
          this.data = result;
          this.login_method();
        }).catch(function (error) {
          this.feedbackProvider.showAlert(JSON.stringify(error),"Error");
        });

      }).catch(ns=>{
        alert('NOT SUC'+ns.toJSON)
      })
    })

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
