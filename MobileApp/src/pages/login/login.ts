import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController, LoadingController } from 'ionic-angular';
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
//import { Device } from '@ionic-native/device';
import { Storage } from '@ionic/storage';
import { FeedbackPage } from '../feedback/feedback';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { Facebook } from '@ionic-native/facebook';
//import { TwitterConnect } from '@ionic-native/twitter-connect';
import { LinkedIn, LinkedInLoginScopes } from '@ionic-native/linkedin';



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
  private loading: any;
  private feedBackCountStr: any;
  private my_uuid: any;
//  constructor(  private uniqueDeviceID: UniqueDeviceID, public navCtrl: NavController, public googleplus:GooglePlus, public userData: UserData, public facebook:Facebook, private twitter: TwitterConnect,
  constructor(  private uniqueDeviceID: UniqueDeviceID, public navCtrl: NavController, public googleplus:GooglePlus, public userData: UserData, public facebook:Facebook, private linkedin: LinkedIn,
    private feedbackProvider: FeedbackProvider,
    private loginProvider: DummyLoginProvider,
    private storage: Storage,
    private loadingCtrl: LoadingController) {

    this.uniqueDeviceID.get()
    .then((uuid: any) => {
      this.my_uuid = uuid;
    })
    .catch((error: any) => console.log(error));

      console.log('constructor ');
      this.storage.length().then((result) => {
        console.log("My Length : " + result);
  
        if (result > 3) {
          this.storage.get('login_id1').then((StorageUserName) => {
            this.login.username = StorageUserName
  
            this.storage.get('passwd1').then((StoragePassword) => {
              this.login.password = StoragePassword
  
              let LoginData = JSON.stringify({
                login_id: this.login.username, passwd: this.login.password
              });
              this.feedbackProvider.PostData(LoginData, "/login").then((result) => {
                this.data = result;
                this.login_method();
              }).catch(function (error) {
                this.feedbackProvider.showAlert(JSON.stringify(error), "Error");
              });
            });
          });
  
        } else {
  
        }
      });






     }
  
  onLogin(form: NgForm) {
    // Added by ChandraRao
    this.submitted = true;
    if (form.valid) {
      let LoginData = JSON.stringify({
        login_id: this.login.username, passwd: this.login.password, uuid: this.my_uuid
      });
  
        this.feedbackProvider.PostData(LoginData,"/login").then((result) => {
        this.data = result;
        this.login_method();
      }).catch(function (error) {
        this.feedbackProvider.showAlert(JSON.stringify(error),"Error");
      });


      if (LoginData.length > 0) {
        this.storage.set('login_id1', this.login.username);
        this.storage.set('passwd1', this.login.password);

      }      
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
      // TODO: Feedback status by Lakshmy
      this.loginProvider.FeedbackStatus = 0;
      this.userData.login(this.login.username);

      console.log('userid : ' + this.inputdataVal['user_id']);

      this.getPendingFeedbackCountForUser(this.inputdataVal['user_id']);

      /*
      let pendingFeedbackCount = this.getPendingFeedbackCountForUser(this.inputdataVal['user_id']);
      console.log('pendingFeedbackCount : ' + pendingFeedbackCount);

      if(this.loginProvider.FeedbackStatus==0)
      {
        this.navCtrl.push(TabsPage);
      }
        else
      {
        this.navCtrl.push(FeedbackPage);
      }
      */

    }
  }

  getPendingFeedbackCountForUser(userId: number) {
    
    this.loading = this.loadingCtrl.create({
      content: 'Fetching Pending Feedback count...'
    });

    this.loading.present().then(()=>{
      this.feedbackProvider.getPendingFeedbackCountForUser(userId).then(result => {

        this.feedBackCountStr = result;
        console.log('this.feedBackCountStr : ' + this.feedBackCountStr);
        
        this.loading.dismiss();

        if(this.feedBackCountStr == 0)
        {
          console.log('TabsPage will be loaded');
          this.navCtrl.push(TabsPage);
        }
        else
        {
          console.log('FeedbackPage will be loaded');
          this.navCtrl.push(FeedbackPage);
        }

      });
    });
    
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
        //alert('LOGIN Succesful, User ID = '+suc.email)

        let LoginData = JSON.stringify({
          login_id: suc.email, user_name: suc.displayName
        });
    
          this.feedbackProvider.PostData(LoginData,"/google_login").then((result) => {
          this.data = result;
          this.login_method();
        }).catch(function (error) {
          this.feedbackProvider.showAlert(JSON.stringify(error),"Error");
        });



        if (LoginData.length > 0) {
          this.storage.clear();
          this.storage.set('login_id1', suc.email);
          this.storage.set('passwd1', '0');
  
        }          


      }).catch(ns=>{
        alert('NOT SUC'+ns.toJSON)
      })
    }
  
  )

  }
/*

  twLogin(form: NgForm) 
  {
    this.twitter.login().then( response => {
      alert(JSON.stringify(response));
    }, error => {
      console.log("Error connecting to twitter: ", error);
    });

    this.submitted = true;
    if (form.valid) {
      this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }

  }

  */




  onTLogin(form: NgForm) {
    // App_ID:  C48ECbLFZqTdQ8YeA7oKFOLbe
    // App_Secret: E1jQQxhS1n0bv9AlC1nGFczKgYwy6SJ1KW3AuEoWfh7ibjpl3V

    alert('Inside onTLogin');
    firebase.auth().signInWithPopup(new firebase.auth.TwitterAuthProvider())
    .then(res => {
      //alert('LOGIN Succesful, User ID = '+res.user.email)
      //alert(JSON.stringify(res));
      let LoginData = JSON.stringify({
        login_id: res.user.email, user_name: res.user.displayName
      });
      this.feedbackProvider.PostData(LoginData,"/facebook_login").then((result) => {
        this.data = result;
        this.login_method();
      }).catch(function (error) {
        this.feedbackProvider.showAlert(JSON.stringify(error),"Error");
      });

      if (LoginData.length > 0) {
        this.storage.clear();
        this.storage.set('login_id1', res.user.email);
        this.storage.set('passwd1', '0');

      } 
    }).catch(ferr=>{
      alert("firebase errc")
      alert(JSON.stringify(ferr))
    })


    this.submitted = true;
    if (form.valid) {
      this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }
  }


  onTwitterLogin(form: NgForm) {
    // App_ID: 1042366875925525
    // App_Secret: b7f65dbb1f82ba2c14e15b2fef99d479
    // https://www.youtube.com/watch?v=_PGob2ypXJc

    this.facebook.login(['email']).then(res=>{
      const fc=firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken)
      firebase.auth().signInWithCredential(fc).then(fs=>{
        //alert('LOGIN Succesful, User ID = '+fs.email)
        //alert(JSON.stringify(fs));
        let LoginData = JSON.stringify({
          login_id: fs.email, user_name: fs.displayName
        });
        this.feedbackProvider.PostData(LoginData,"/facebook_login").then((result) => {
          this.data = result;
          this.login_method();
        }).catch(function (error) {
          this.feedbackProvider.showAlert(JSON.stringify(error),"Error");
        });

        if (LoginData.length > 0) {
          this.storage.clear();
          this.storage.set('login_id1', fs.email);
          this.storage.set('passwd1', '0');
  
        } 


      }).catch(ferr=>{
        alert("firebase errc")
        alert(JSON.stringify(ferr))
      })
    }).catch(err=>{
      alert(JSON.stringify(err))
    })

    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }
  }

  onFBLogin(form: NgForm) {
    // App_ID: 1042366875925525
    // App_Secret: b7f65dbb1f82ba2c14e15b2fef99d479
    // https://www.youtube.com/watch?v=_PGob2ypXJc

    this.facebook.login(['email']).then(res=>{
      const fc=firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken)
      firebase.auth().signInWithCredential(fc).then(fs=>{
        //alert('LOGIN Succesful, User ID = '+fs.email)
        //alert(JSON.stringify(fs));
        let LoginData = JSON.stringify({
          login_id: fs.email, user_name: fs.displayName
        });
        this.feedbackProvider.PostData(LoginData,"/facebook_login").then((result) => {
          this.data = result;
          this.login_method();
        }).catch(function (error) {
          this.feedbackProvider.showAlert(JSON.stringify(error),"Error");
        });

        if (LoginData.length > 0) {
          this.storage.clear();
          this.storage.set('login_id1', fs.email);
          this.storage.set('passwd1', '0');
  
        } 


      }).catch(ferr=>{
        alert("firebase errc")
        alert(JSON.stringify(ferr))
      })
    }).catch(err=>{
      alert(JSON.stringify(err))
    })





    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login.username);
      this.navCtrl.push(TabsPage);
    }
  }

  onLLogin()  {
    // Client ID:	811sy5gatij4cj
    //Client Secret:	l2vNdmfXtaRasnsP

    // check if there is an active session
    this.linkedin.hasActiveSession().then((active) => console.log('has active session?', active));

    // login
    //const scopes:String[] = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', 'w_share'];
    const scopes: LinkedInLoginScopes[] = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', 'w_share'];
    this.linkedin.login(scopes, true)
      .then((result) => {
        console.log('Logged in!')
        alert('Logged in!');
        alert(JSON.stringify(result));

    })
      .catch(e => {
        console.log('Error logging in', e);
        alert(JSON.stringify(e));
    });
  }
}

