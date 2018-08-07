import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController } from 'ionic-angular';
import { LoadingController, AlertController, List, ToastController, Refresher } from 'ionic-angular';

import { ContactProvider } from '../../providers/contact-provider';
import { DummyLoginProvider } from '../../providers/dummy-login-provider';

import { Contact } from '../../interfaces/contact';
//import { TabsPage } from '../tabs-page/tabs-page';

@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html'
})
export class ContactsPage {
  
  @ViewChild('contactList', { read: List }) contactList: List;

  private loading: any;
  private contact: Contact = {UserId: 0, ContactName: "", ContactMobile:0, ContactEmail:"" };
  private submitted = false;
  private addNewContact: Boolean = false;
  //private addNewContactFromPhone: Boolean = false;
  private contactSearch: Boolean = true;

  private queryText: string = '';
  private allContacts: any = [];
  private contacts: any = [];
  private shownContactsCount: number = 0;
  
  constructor(private navCtrl: NavController, 
    private contactProvider: ContactProvider, private loginProvider: DummyLoginProvider,
    private loadingCtrl: LoadingController, private alertCtrl: AlertController, 
    private toastCtrl: ToastController) {
    console.log('tjv..ContactsPage constructor');
  }

  ionViewDidLoad() {
    
    this.updateContactsOnDidLoad();
  }

  onAddContact(form: NgForm) {
    
    this.submitted = true;

    if (form.valid) {
  
      this.contact.UserId = this.loginProvider.UserId;
      
      this.showLoader();
      this.contactProvider.addContact(this.contact).then((result) => {
        
        this.loading.dismiss();
        
        if(result === 0){
          this.showAlert('Contact exists!!!');
          this.navCtrl.setRoot(ContactsPage);
          //this.navCtrl.push(TabsPage);
        }
        else{
          this.showAlert('Contact Added');
          this.navCtrl.setRoot(ContactsPage);
          //this.navCtrl.push(TabsPage);
        }
      }, (err) => {
        this.loading.dismiss();
        this.presentToast(err);
      });
    }
  }

  onAddNewContact(){
    
    this.addNewContact = true;
    this.contactSearch = false;
  }

  updateContactsOnDidLoad() {
    
    this.addNewContact = false;
    this.contactSearch = true;

    let userId = this.loginProvider.UserId;
    
    this.loading = this.loadingCtrl.create({
      content: 'Fetching Contacts...'
    });

    this.loading.present().then(()=>{
      
      this.contactProvider.getContactsDataForUser(userId).then(result => {

        this.allContacts = this.contactProvider.getAllContactsForUser(result);
               
        let requiredContactsData: any = this.contactProvider.getRequiredContactsFromAllContacts(this.allContacts, this.queryText);
        
        this.contacts = requiredContactsData.contacts;
        this.shownContactsCount = requiredContactsData.shownContactsCount;
                
        this.loading.dismiss();
      });
    });

  }

  doRefresh(refresher: Refresher) {
    let userId = this.loginProvider.UserId;
    
    this.contactProvider.callGetContactListService(userId).subscribe((data: any) => {
      
      this.allContacts = this.contactProvider.getAllContactsForUser(data.json());
                  
      let requiredContactsData: any = this.contactProvider.getRequiredContactsFromAllContacts(this.allContacts, this.queryText);
          
      this.contacts = requiredContactsData.contacts;
      this.shownContactsCount = requiredContactsData.shownContactsCount;
      
      setTimeout(() => {

        refresher.complete();

        const toast = this.toastCtrl.create({
          message: 'Contacts have been updated.',
          duration: 3000
        });
        toast.present();
        
      }, 1000);
    });
  }

  updateContacts() {
    // Close any open sliding items when the schedule updates
    this.contactList && this.contactList.closeSlidingItems();
    
    let requiredContactsData: any = this.contactProvider.getRequiredContactsFromAllContacts(this.allContacts, this.queryText);
        
    this.contacts = requiredContactsData.contacts;
    this.shownContactsCount = requiredContactsData.shownContactsCount;
  }

  /*
  private onAddNewContactFromPhone(){
    console.log('tjv...Inside onAddNewContactFromPhone()');
  }
  */
/*
  private deleteContact(contact: any) {
    console.log('tjv...Inside deleteContact()');

    this.showLoader();
    this.contactProvider.deleteContact(contact).then((result) => {
      console.log('tjv...Calling loading.dismiss()');
      this.loading.dismiss();
      console.log(result);
      
      if(result === 1){
        console.log('result === Success');
        
        this.showAlert('Feedback Added');
        //this.navCtrl.push(TabsPage);
      }
      else{
        console.log('result != 0');
        this.showAlert('Feedback NOT Added');
        //this.navCtrl.push(TabsPage);
      }
      
    }, (err) => {
      this.loading.dismiss();
      this.presentToast(err);
    });

  }
*/
  showLoader(){
    this.loading = this.loadingCtrl.create({
       // content: 'Adding contact...'
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
