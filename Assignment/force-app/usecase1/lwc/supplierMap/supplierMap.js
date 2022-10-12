import { LightningElement, wire, track } from 'lwc';

// Import message service features required for subscribing and the customer info message channel
import { subscribe, MessageContext } from 'lightning/messageService';
import CUSTOMER_INFO_CHANNEL from '@salesforce/messageChannel/CustomerInfoChannel__c';

import getCustomer from '@salesforce/apex/AccountSelector.getAccount';

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
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }
}