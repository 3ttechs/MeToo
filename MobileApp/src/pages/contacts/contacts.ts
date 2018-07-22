import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { LoadingController, AlertController, ToastController } from 'ionic-angular';

import { ContactProvider } from '../../providers/contact-provider';
import { DummyLoginProvider } from '../../providers/dummy-login-provider';

import { Contact } from '../../interfaces/contact';
import { TabsPage } from '../tabs-page/tabs-page';

@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html'
})
export class ContactsPage {
  
  private loading: any;
  private contact: Contact = {UserId: 0, ContactName: "", ContactMobile:0, ContactEmail:"" };
  private submitted = false;

  constructor(private navCtrl: NavController, 
    private contactProvider: ContactProvider, private loginProvider: DummyLoginProvider,
    private loadingCtrl: LoadingController, private alertCtrl: AlertController, private toastCtrl: ToastController) {
    console.log('tjv..ContactsPage constructor');
  }

  ionViewDidLoad() {

      console.log('tjv...ionViewDidLoad+++');
  }

  onAddContact(form: NgForm) {

    this.submitted = true;

    console.log('tjv...form.valid : ' + form.valid);

    if (form.valid) {
      console.log('tjv...Inside onAddContact()...');

      this.contact.UserId = this.loginProvider.UserId;
      console.log('UserId : ' + this.contact.UserId);

      console.log('ContactName : ' + this.contact.ContactName);
      console.log('ContactMobile : ' + this.contact.ContactMobile);
      console.log('ContactEmail : ' + this.contact.ContactEmail);
      
      this.showLoader();
      this.contactProvider.addContact(this.contact).then((result) => {
        console.log('tjv...Calling loading.dismiss()');
        this.loading.dismiss();
        console.log(result);
        
        if(result === 0){
          console.log('result === 0');
          console.log('Contact exists!!!');
          this.showAlert('Contact exists!!!');
          //this.navCtrl.setRoot(ContactsPage);
          this.navCtrl.push(TabsPage);
        }
        else{
          console.log('result != 0');
          this.showAlert('Contact Added');
          //this.navCtrl.setRoot(ContactsPage);
          this.navCtrl.push(TabsPage);
        }
      }, (err) => {
        this.loading.dismiss();
        this.presentToast(err);
      });
    }
  }

  showLoader(){
    this.loading = this.loadingCtrl.create({
        content: 'Adding contact...'
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
