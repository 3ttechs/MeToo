import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavController } from 'ionic-angular';

import { ContactProvider } from '../../providers/contact-provider';

import { Contact } from '../../interfaces/contact';
import { TabsPage } from '../tabs-page/tabs-page';

@Component({
  selector: 'page-contacts',
  templateUrl: 'contacts.html'
})
export class ContactsPage {

  contact: Contact = { Name: '', Mobile: 0, Email: '' };
  
  submitted = false;
  constructor(public navCtrl: NavController, public contactProvider: ContactProvider) {
    console.log('tjv..ContactsPage constructor');
  }

  ionViewDidLoad() {

      console.log('tjv...ionViewDidLoad');
  }

  onAddContact(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      console.log('tjv...form is valid....Will call the service');
      this.contactProvider.dummy('dummy');

      

      this.navCtrl.push(TabsPage);
    }
  }
}
