import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { UserData } from '../../providers/user-data';
import { UserOptions } from '../../interfaces/user-options';
//import { TabsPage } from '../tabs-page/tabs-page';
import { FeedbackProvider } from '../../providers/feedback-provider';  // where feeback provider will use for login screen  -- ChandraRao
import { LoginPage } from '../login/login';


@Component({
  selector: 'page-user',
  templateUrl: 'signup.html'
})
export class SignupPage {
  signup: UserOptions = { username: '', password: '', Confirmpassword: '', Email: '', PhoneNumber: '',Name:'' };
  submitted = false;
  data: any;
  constructor(public navCtrl: NavController, public userData: UserData,
    private feedbackProvider: FeedbackProvider) {}

  onSignup(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      if (this.signup.Confirmpassword === this.signup.password) {
        let AddNewUserBody = JSON.stringify({
          login_id: this.signup.username, passwd: this.signup.password, user_name: this.signup.Name, phone_no: this.signup.PhoneNumber, email: this.signup.Email
        });
        this.feedbackProvider.PostData(
          AddNewUserBody, "/add_new_user"
        ).then((addNewUsrResult) => {
          this.data = addNewUsrResult;
          if (this.data===0) {
            this.feedbackProvider.showAlert("Alerady User Exits", "New User"); 
        } else {
          this.feedbackProvider.showAlert("New User Added", "New User");
          this.ClearFormFields();
          this.navCtrl.push(LoginPage);
          
          }
        })
          .catch(function (error) {
            this.restService.showAlert((JSON.stringify(error)));
          });
      } else {
        this.feedbackProvider.showAlert("Password and Confirm Password not matches", "New User")
      }
      
      
    }
  }

  ClearFormFields() {
    this.signup.username = '',
      this.signup.password = '',
      this.signup.Email = '',
      this.signup.Name = '',
      this.signup.PhoneNumber = '',
      this.signup.Confirmpassword = ''
  }

}
