import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http, Headers } from "@angular/http";

import { Contact } from '../interfaces/contact';

//let apiUrl = 'http://localhost:5000';
let apiUrl ='http://ec2-18-191-60-101.us-east-2.compute.amazonaws.com:5000';

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
        phone_no: contact.ContactMobile, email: contact.ContactEmail};

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

  public getContactsDataForUser(userId){
    return new Promise((resolve,reject) =>{
      this.http.get(apiUrl + '/get_contacts_list/user_id=' + userId)
        .subscribe(res=>{
          resolve(res.json());
        },(err) => {
          console.log(err);
          reject(err);
        });
    })
  }

  public getAllContactsForUser(allContactsResult: any){

    let contacts: any = [];

    for(let i=0; i<allContactsResult.length; i++)
    {
      let contact = {userName :  allContactsResult[i].user_name, 
                     email :  allContactsResult[i].email,
                     phoneNo :  allContactsResult[i].phone_no
                    };
      contacts[i] = contact;
    }

    return contacts;
  }

  public getRequiredContactsFromAllContacts(allContacts: any, queryText = '')
  {
    let contactsData = {contacts: [], shownContactsCount: 0};

    queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    let queryWords = queryText.split(' ').filter(w => !!w.trim().length);

    allContacts.forEach((contact: any) => {
       this.filterContact(contact, queryWords); //add hide property
       if (!contact.hide) {
        contactsData.shownContactsCount++;
      }
    });

    contactsData.contacts = allContacts;

    return contactsData;
  }

  filterContact(contact: any, queryWords: string[]) {
    
    let matchesQueryText = false;
    if (queryWords.length) {
      
      queryWords.forEach((queryWord: string) => {
        if (contact.userName.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }
      });
    } else {
      // if there are no query words then this contact passes the query test
      matchesQueryText = true;
    }
    
    if(matchesQueryText)
    {
      contact.hide  = false; //show contact
    }
    else
    {
      contact.hide  = true;
    }
  }



}
