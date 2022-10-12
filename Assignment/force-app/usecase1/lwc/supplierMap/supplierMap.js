import { LightningElement, wire, track } from 'lwc';

// Import message service features required for subscribing and the customer info message channel
import { subscribe, MessageContext } from 'lightning/messageService';
import CUSTOMER_INFO_CHANNEL from '@salesforce/messageChannel/CustomerInfoChannel__c';

import getCustomer from '@salesforce/apex/AccountSelector.getAccount';
import getSupplier from '@salesforce/apex/SupplierSelector.getSupplier';

export default class SupplierMap extends LightningElement {

    @wire(MessageContext)
    messageContext;

    customerId;

    // DEFAULT MAP PROPERTIES

    zoomLevel = 12;
    listView = 'visible';
    @track supplierMarkers;

    mapOptions = {
        draggable: true,
        disableDefaultUI: false,
        zoomControl: true
    };

    center = {
        location: { Street: '5 Market Street', PostalCode: '94103' },
    };

    // HANDLERS
    handleMarkerSelect(event) {
        this.selectedMarkerValue = event.target.selectedMarkerValue;
    }

    // Encapsulate logic for LMS subscribe.
    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            CUSTOMER_INFO_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    // Handler for message received by component
    handleMessage(message) {
        if(message.messageType == 'customer') {
            this.customerId = message.recordId;
            //apex call
            getCustomer({accountId: this.customerId})
            .then(result => {
                this.account = result;
                console.log(this.account.BillingAddress.street);
                let marker = [{
                    location: {
                    Street:result.BillingAddress.street,
                    City: result.BillingAddress.city,
                    PostalCode: result.BillingAddress.postalCode,
                    State: result.BillingAddress.state,
                    Country: result.BillingAddress.country,
                    },
                    mapIcon : {
                        path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
                        fillColor: '#CF3476',
                        fillOpacity: .5,
                        strokeWeight: 1,
                        scale: .10,
                    },
                    title: this.account.Name,
                    description: '<b>Account Name: </b>' + this.account.Name
                }];
                console.log('marker :',marker);
                this.supplierMarkers = [...marker];
                this.center = marker;
                this.zoomLevel = 12;
                console.log('this.supplierMarkers ::',this.supplierMarkers);        
            })
            .catch( error=>{
                this.accounts = null;
                console.error('error:: ', error);
            });
        } else if (message.messageType == 'supplier') {

            this.supplierId = message.recordId;
            //apex call
            getSupplier({supplierId: this.supplierId})
            .then(result => {
                let tempMarkers = new Array();
                tempMarkers.push(...this.supplierMarkers);
                this.supplierMarkers = undefined;
                this.supplier = result;
                console.log(this.account.BillingAddress.street);
                let marker = [{
                    location: {
                        Street:this.supplier.Street__c,
                        City: this.supplier.City__c,
                        PostalCode: this.supplier.Postal_Code__c,
                        State: this.supplier.State__c,
                        Country: this.supplier.Country__c,
                      },
                      title: this.supplier.Name,
                      description: '<b>Supplier Name: </b>' + this.supplier.Name
                }];
                console.log('marker :',marker);
                tempMarkers.push(...marker);
                this.supplierMarkers = tempMarkers;
                console.log('this.supplierMarkers ::',JSON.parse(JSON.stringify(this.supplierMarkers)));        
            })
            .catch( error=>{
                this.accounts = null;
                console.error('error:: ', error);
            });
        }
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }
}