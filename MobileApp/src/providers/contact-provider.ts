import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http, Headers } from "@angular/http";

import { Contact } from '../interfaces/contact';

let apiUrl = 'http://localhost:5000';

@Injectable()
export class ContactProvider {
  _favorites: string[] = [];
  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';

  constructor(
    private http: Http,
    public events: Events,
    public storage: Storage
  ) {}

  addContact(contact: Contact){
    return new Promise((resolve,reject) => {
      let headers = new Headers();
      
      headers.append('Accept', 'application/json');
      headers.append('Content-Type', 'application/json');

      //let postParams = JSON.stringify(contact)

      let postParams = {user_id: contact.UserId, contact_name: contact.ContactName,
        phone_no: contact.ContactMobile, email: contact.ContactEmail}

      console.log(postParams);
      
      this.http.post(apiUrl+'/add_contact', postParams, {headers: headers})
        .subscribe(res => {
          resolve(res.json());
        }, (err) => {
          console.log(err);
          reject(err);
        });
    })
  }


}
