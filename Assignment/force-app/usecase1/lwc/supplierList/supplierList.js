import { LightningElement,wire } from 'lwc';

import { publish, subscribe, MessageContext } from 'lightning/messageService';
import CUSTOMER_INFO_CHANNEL from '@salesforce/messageChannel/CustomerInfoChannel__c';

import getSuppliers from '@salesforce/apex/SupplierSelector.getList';

export default class SupplierList extends LightningElement {
    suppliers;
    cols = [
        { type: "button", 
          initialWidth: 90, 
          typeAttributes: {  
            label: 'Add',  
            name: 'addToMap',  
            title: 'Add',  
            disabled: false,  
            value: 'Add',  
            iconPosition: 'left'  
        } },
        {label:'Supplier Name', fieldName:'Name' , type:'text'} ,
        {label:'Street', fieldName:'Street__c' , type:'text'} ,
        {label:'City', fieldName:'City__c' , type:'text'}
    ]

    @wire(MessageContext)
    messageContext;

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
            getSuppliers({accountId: this.customerId})
            .then(result => {
                this.suppliers = result;       
            })
            .catch( error=>{
                this.suppliers = null;
                console.error('error:: ', error);
            });
        }
    }

    callRowAction( event ) {
        const actionName = event.detail.action.name;  
        if ( actionName === 'addToMap' ) {  
            console.log('call to action');
            const payload = { recordId: event.detail.row.Id, messageType: 'supplier'};
            publish(this.messageContext, CUSTOMER_INFO_CHANNEL, payload);
        } else {
            // Do nothing
        }
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }
}