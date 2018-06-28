import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ViewController, ModalController, ActionSheetController} from 'ionic-angular';
import { Slides } from 'ionic-angular';

// Pages
import { StartUpPage } from '../start-up/start-up';
import { AuthenticationPage } from '../authentication/authentication';
import { IconPopupPage } from '../icon-popup/icon-popup';
import { AddPaymentPage } from '../add-payment/add-payment';
import { SelectPersonPage } from '../select-person/select-person';

// Providers
import { ToastProvider } from '../../providers/toast/toast';
import { AuthProvider } from '../../providers/auth/auth';
import { FirestoreProvider } from '../../providers/firestore/firestore';

@IonicPage()
@Component({
  selector: 'page-main',
  templateUrl: 'main.html',
})

export class MainPage {
  @ViewChild(Slides) verticalSlide: Slides;
  pages: any;
  displayName: string;
  userProfile: any;
  rootPage: AuthenticationPage;
  showSpinner: boolean = true;
  paymentData = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController, public modalCtrl: ModalController, public _authProvider: AuthProvider, private _toastCtrl: ToastProvider, public popoverCtrl: PopoverController, public _firestoreProvider: FirestoreProvider) {
    this.userProfile = _authProvider.getUserProfile();
    this.displayName = this.userProfile.displayName;   
    this.setListeners();
  }

  ionViewDidLoad() {
  }

  setListeners(){
    var uid = this.userProfile.uid;
    if(!uid) return;
    // Listener for updates to list of payments
    this._firestoreProvider.getDatabase().collection("users/" + uid + "/paymentRefs").onSnapshot((doc) => {
      this._firestoreProvider.getAllPayments().then((data) => {
        this.paymentData = data;
        this.showSpinner = false;
        this.verticalSlide.update();
      }).catch((error) => {
        console.log(error);
      })
    })
  }

  logout(){
    this._authProvider.signOut().then(() => {
      this._toastCtrl.toastMessage('Successfully logged out', 5000);
      this.navCtrl.setRoot(StartUpPage);
    }).catch((err) => {

    });
  }

  iconClick(myEvent) {
    let popover = this.popoverCtrl.create(IconPopupPage);
    popover.present({
      ev: myEvent
    });
  }

  presentAddPaymentSheet() {
    this.actionSheetCtrl.create({
      title: 'Select Payment Type',
      buttons: [
        // TODO: Create 'Add Receipt' functionality        
        // {
        //   text: 'Add Receipt',
        //   handler: () => {
        //   }
        // },

        // TODO: Create 'Add Direct Payment' functionality
        // {
        //   text: 'Add Direct Payment',
        //   handler: () => {
        //   }
        // },
        
        {
          text: 'Add Expenditure',
          handler: () => {
            let paymentModal = this.modalCtrl.create(AddPaymentPage, { 
              paymentType: "Expenditure",
              name: this.displayName,
              enablePaidOption: false,
              enableSendSMSReminder: false
            });
            paymentModal.onDidDismiss((data) => this.paymentFeedback(data));
            paymentModal.present();            
          }
        },
        {
          text: 'Cancel',
          role: 'Cancel'
        }
      ]
    }).present();
  }

  paymentFeedback(data) {
    if(data.success){
      this._toastCtrl.toastMessage("Payment successfully created", 3000);
    }
  }

  convertMillisToDateString(millisInput: string){
    var date = new Date(millisInput);
    if(!date) return "n/a";
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
  }
}
