import { LightningElement,wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

import { publish, subscribe, MessageContext } from 'lightning/messageService';
import CUSTOMER_INFO_CHANNEL from '@salesforce/messageChannel/customerInfoChannel__c';

import getSuppliers from '@salesforce/apex/SupplierSelector.getList';

export default class SupplierList extends NavigationMixin(LightningElement) {
    @api recordId;
    suppliers = [];
    data = [];
    showTable = false;

    // infinite loading configuration
    recordCount = 5; // increment
    loadMoreStatus;
    totalRecountCount = 0;
    targetDatatable;

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
        {label:'City', fieldName:'City__c' , type:'text'},
        {type: 'action',
        fixedWidth: 30,
        hideDefaultActions: true,
        typeAttributes: {
            rowActions: [{ id: 'item-1', label: 'Create Case', name: 'CreateCase' }],
            id: { fieldName: 'id' }
        }}
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
            this.fetchSupplier();
        }
    }

    fetchSupplier() {
        this.showTable = false;
        //apex call
        getSuppliers({accountId: this.customerId})
        .then(result => {
            this.totalRecountCount = result.length;
            this.suppliers = [...this.suppliers, ...result];
            this.data = this.suppliers.slice(0, this.recordCount); 
            this.showTable = true;   
        })
        .catch( error=>{
            this.suppliers = [];
            this.showTable = false;
            console.error('error:: ', error);
        });
    }

    callRowAction( event ) {
        const actionName = event.detail.action.name;
        
        if ( actionName === 'addToMap' ) {  
            console.log('call to action');
            const payload = { recordId: event.detail.row.Id, messageType: 'supplier'};
            publish(this.messageContext, CUSTOMER_INFO_CHANNEL, payload);
        } else if(actionName === 'CreateCase') {
            const defaultValues = encodeDefaultFieldValues({
                AccountId: this.customerId,
                Supplier__c:  event.detail.row.Id
            });
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Case',
                    actionName: 'new'
                },
                state: {
                    defaultFieldValues: defaultValues
                }
            });
        }
    }

    handleLoadMore(event) {
        console.log('loading more')
        event.preventDefault();
        this.recordCount += 5;
        //Display spinner and "Loading" when more data is being loaded
        event.target.isLoading = true;
        this.loadMoreStatus = 'Loading';
        this.targetDatatable = event.target;
        
        // Get new set of records and append to this.data
        this.getRecordIncrement();
    }

    getRecordIncrement() {
        this.recordCount = (this.recordCount > this.totalRecountCount) ? this.totalRecountCount : this.recordCount; 
        this.data = this.suppliers.slice(0, this.recordCount);
        // Remove loading and spinner
        this.loadMoreStatus = '';
        if (this.targetDatatable){
            this.targetDatatable.isLoading = false;
        }
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
        if(!!this.recordId) {
            this.customerId = this.recordId;
            this.fetchSupplier();
        }
    }
}