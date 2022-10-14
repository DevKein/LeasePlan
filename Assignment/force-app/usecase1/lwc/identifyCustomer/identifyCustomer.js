import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
// Messaging services
import { publish, MessageContext } from 'lightning/messageService';
import CUSTOMER_INFO_CHANNEL from '@salesforce/messageChannel/customerInfoChannel__c';
// Apex handler
import getCustomerData from '@salesforce/apex/AccountSelector.getAccountData';

export default class IdentifyCustomer extends NavigationMixin(LightningElement) {
    searchKey;
    customerId;
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
                this.customerId = this.accounts[0].Id;
                // Publish an LMS messaage for other components in the page 
                // subscribing to the channel can get notified about selected customer
                this.publishCustomerInfo(this.customerId);
            }                
        })
        .catch( error=>{
            this.accounts = null;
            console.error('error:: ', error);
        });

    }

    callRowAction( event ) {  
        this.customerId =  event.detail.row.Id;
        const actionName = event.detail.action.name;  
        if ( actionName === 'SelectAccount' ) {  
            this.customerFound = true;
            this.foundMultipleMatches = false;
            this.accounts = [];
            this.accounts.push(event.detail.row);
            // Publish an LMS messaage for other components in the page 
            // subscribing to the channel can get notified about selected customer
            this.publishCustomerInfo(this.customerId);  
        } else {
            // Do nothing
        }          
  
    }

    handleView(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.customerId,
                actionName: 'view'
            }
        });
    }

    handleReset(event) {
        // Reset customer search variables to enable new search
        this.customerFound = false;
        this.foundMultipleMatches = false;
        this.searchKey = '';
        this.accounts = new Array();
    }
    
    publishCustomerInfo(customerId) {
        // LMS publish
        const payload = { recordId: customerId, messageType: 'customer' };
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