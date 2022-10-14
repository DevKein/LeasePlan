import { LightningElement, wire, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Import message service features required for subscribing and the customer info message channel
import { subscribe, MessageContext } from 'lightning/messageService';
import CUSTOMER_INFO_CHANNEL from '@salesforce/messageChannel/customerInfoChannel__c';

import getCustomer from '@salesforce/apex/AccountSelector.getAccount';
import getSupplier from '@salesforce/apex/SupplierSelector.getSupplier';

export default class SupplierMap extends LightningElement {

    @wire(MessageContext)
    messageContext;
    showMap = false;

    customerId;
    @api recordId;

    selectedSuppliers = []

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
        this.showMap = false;
        if(message.messageType == 'customer') {
            this.customerId = message.recordId;
            this.fetchCustomerAndMarker();            
        } else if (message.messageType == 'supplier') {
            this.supplierId = message.recordId;
            this.fetchSupplierAndMarker(); 
        }
    }

    fetchSupplierAndMarker() {
        if(this.selectedSuppliers.indexOf(this.supplierId) < 0) {
            getSupplier({supplierId: this.supplierId})
                .then(result => {
                    let tempMarkers = new Array();
                    tempMarkers.push(...this.supplierMarkers);
                    this.supplierMarkers = undefined;
                    this.supplier = result;
                    let marker = [{
                        location: {
                            Street:this.supplier.Street__c,
                            City: this.supplier.City__c,
                            PostalCode: this.supplier.Postal_Code__c,
                            State: this.supplier.State__c,
                            Country: this.supplier.Country__c,
                        },
                        title: this.supplier.Name
                    }];
                    tempMarkers.push(...marker);
                    this.supplierMarkers = tempMarkers;
                    this.selectedSuppliers.push(this.supplierId);
                    this.showMap = true;
                })
                .catch( error=>{
                    this.accounts = null;
                    console.error('error:: ', error);
                });
        }
    }

    fetchCustomerAndMarker() {
        //apex call
        getCustomer({accountId: this.customerId})
        .then(result => {
            this.account = result;
            if(result.BillingAddress) {
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
                    title: this.account.Name
                }];
                this.supplierMarkers = [...marker];
                this.showMap = true;
                this.center = marker;
                this.zoomLevel = 12; 
            } else {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Map warning',
                        message: 'Selected customer has no address information',
                        variant: 'warning',
                    }),
                );
            }   
        })
        .catch( error=>{
            this.accounts = null;
            console.error('error:: ', error);
        });
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
        if(!!this.recordId) {
            this.customerId = this.recordId;
            this.fetchCustomerAndMarker();
        }
    }
}