import { LightningElement, track, wire } from 'lwc';
// Messaging services
import { publish, MessageContext } from 'lightning/messageService';
import CUSTOMER_INFO_CHANNEL from '@salesforce/messageChannel/CustomerInfoChannel__c';
// Apex handler
import getCustomerData from '@salesforce/apex/AccountSelector.getAccountData';

export default class IdentifyCustomer extends LightningElement {
    searchKey;
    customerFound = false;
    customerNotFound = false;
    foundMultipleMatches = false;
    
    @track accounts = [];
    /* @wire(MessageContext) to create a MessageContext object, which provides information about the 
    Lightning web component that is using the Lightning message service
    */
    @wire(MessageContext)
    messageContext;

    // The function to get search key value from the text input
    handelSearchKey(event){
        this.searchKey = event.target.value;
        console.log('searchKey:: ',this.searchKey);
    }

    // The function to fetch accounts matching the search key using account name field
    SearchAccountHandler(){
        //apex call
        getCustomerData({searchkey: this.searchKey})
        .then(result => {
            this.accounts = result;
            // Multiple matches identified
            if(this.accounts.length > 1) {
                this.foundMultipleMatches = true;
                this.customerFound = false;
            } else {
                this.customerFound = true;
                this.foundMultipleMatches = false;
                this.publishCustomerInfo(this.accounts[0].Id);
            }                
        })
        .catch( error=>{
            this.accounts = null;
            console.error('error:: ', error);
        });

    }

    callRowAction( event ) {  
        console.log('event.detail.row',event.detail.row)
        const customerId =  event.detail.row.Id;
        const actionName = event.detail.action.name;  
        if ( actionName === 'SelectAccount' ) {  
            this.customerFound = true;
            this.foundMultipleMatches = false;
            this.publishCustomerInfo(customerId);
  
        } else {
            // Do nothing
        }          
  
    }
    
    publishCustomerInfo(customerId) {
        const payload = { recordId: customerId };
        publish(this.messageContext, CUSTOMER_INFO_CHANNEL, payload);
    }

    // Columns: can be retrieved from fieldsets
    cols = [
        { type: "button", 
          initialWidth: 100, 
          typeAttributes: {  
            label: 'Select',  
            name: 'SelectAccount',  
            title: 'Select',  
            disabled: false,  
            value: 'Select',  
            iconPosition: 'left'  
        } },
        {label:'Account Name', fieldName:'Name' , type:'text'} ,
        {label:'Billing Address', fieldName:'BillingAddress' , type:'Address'} ,
        {label:'Phone', fieldName:'Phone' , type:'Phone'}
              
    ]

    customer_cols = [
        {label:'Account Name', fieldName:'Name' , type:'text'} ,
        {label:'Phone', fieldName:'Phone' , type:'Phone'}
              
    ]
}