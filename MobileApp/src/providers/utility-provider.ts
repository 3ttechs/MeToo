import { Injectable } from '@angular/core';

import { Events, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

//import { Http, Headers } from "@angular/http";
import { Http, Headers, RequestOptions } from "@angular/http";


@Injectable()
export class UtilityProvider {
  
  private loading: any;
  public apiUrl: string = 'http://ec2-18-191-60-101.us-east-2.compute.amazonaws.com:5000';
  //public apiUrl: string = 'http://localhost:5000';
 
  constructor(
    private http: Http,
    public events: Events,
    public storage: Storage,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  public getData(inputData: string, callingMethodName: string) {
    return new Promise((resolve,reject) => {
      this.callService(inputData, callingMethodName)
      .subscribe(res=>{
        resolve(res.json());
      },(err) => {
        console.log(err);
        reject(err);
      });
    })
  }
  
  public callService(inputData: string, callingMethodName: string): any{
    return this.http.get(this.apiUrl + callingMethodName + inputData);
  }

  public showAlert(message:string, title:string) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  public presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      dismissOnPageChange: true
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  public showLoader(message: string){
    this.loading = this.loadingCtrl.create({
      content: message
    });
    this.loading.present();
  }

  public dismissLoader(){
    if(this.loading != null) 
      this.loading.dismiss();
  }

  public getHeaderOptions() {
    let myHeader: Headers = new Headers;
    myHeader.set('Accept', 'application/json');
    myHeader.set('Content-type', 'application/json');

    return new RequestOptions({
      headers: myHeader
    });
  }



}
