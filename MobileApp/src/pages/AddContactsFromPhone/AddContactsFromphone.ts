import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Contacts } from '@ionic-native/contacts'; // ChandraRao
import { ContactsPage } from '../contacts/contacts';
import { contactsFromMobile } from '../../interfaces/user-options';
import { FeedbackProvider } from '../../providers/feedback-provider';
import { DummyLoginProvider } from '../../providers/dummy-login-provider';

@Component({
    selector: 'page-AddContactsFromphone',
    templateUrl: 'AddContactsFromphone.html'
})
export class AddContactsFromphonePage {
    i: number = 0;
    allContacts: any;

    contFromPhone: contactsFromMobile = { name: '', phone: '', email: '' ,UserId:0};
    data: any;
    Mydata: any;
    constructor(private navCtrl: NavController, private contacts: Contacts,
        private feedbackProvider: FeedbackProvider,
        private loginProvider: DummyLoginProvider)
     {
        this.getContacts();
    }

    async getContacts() {

        try {
            const pickSelectedContact = await this.contacts.pickContact();
            if (pickSelectedContact.phoneNumbers === null) {
                this.contFromPhone.phone="1234567890";
            } else {
                this.contFromPhone.phone=JSON.stringify(pickSelectedContact.phoneNumbers[this.i].value).replace('"',"");
            }
            if (pickSelectedContact.name === null) {
                this.contFromPhone.name="No Name";
        } else {
            this.contFromPhone.name=pickSelectedContact.displayName;
        }
            if (pickSelectedContact.emails === null) {
                this.contFromPhone.email='noreplay@gmail.com';
            } else {
                this.contFromPhone.email= JSON.stringify(pickSelectedContact.emails[this.i].value);
            }

        } catch (error) {
            alert(error);
        }
    }


    DisplayPhoneContacts() {
        this.getContacts();
    }
    onAddPhoneContacts() {
        if (this.contFromPhone.name === "") {
            this.feedbackProvider.showAlert("User Name Should not left blank", "Error");
            
        } else if (this.contFromPhone.phone === "") {
            this.feedbackProvider.showAlert("User Phone No Should not left blank", "Error");
            
        } else if (this.contFromPhone.email === "") {
            this.feedbackProvider.showAlert("User Email ID Should not left blank", "Error");
        } else {

             let AddContactsFromMobile  = JSON.stringify({
                user_id: this.loginProvider.UserId,
                contact_name: this.contFromPhone.name,
                phone_no: this.contFromPhone.phone,
                email: this.contFromPhone.email
              });;              
            this.feedbackProvider.PostData(AddContactsFromMobile, "/add_contact").then((result) => {
                this.Mydata = result;
                if (this.Mydata === 0) {
                  this.feedbackProvider.showAlert('error', "Add Contact Details");
                } else {
                    this.feedbackProvider.showAlert('Added sucessfully', "Contact From phone");
                    this.navCtrl.setRoot(ContactsPage);
                }
              }).catch(function (error) {
                console.log('function' + error);
              });

            
        }
    }
}