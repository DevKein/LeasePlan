import { LightningElement, api, track, wire  } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, updateRecord, getFieldValue } from 'lightning/uiRecordApi';

import CASE_ID_FIELD from '@salesforce/schema/Case.Id';
import ACCOUNT_ID_FIELD from '@salesforce/schema/Account.Id';

const CASEFIELDS = ['Case.Rate__c'];
const ACCOUNTFIELDS = ['Account.Average_Rate__c'];

const ICON_COLOR_MAPPING = new Map([
    ["grey", "default"],
    ["green", "success"],
    ["orange", "warning"],
    ["red", "error"],
    ["white", "inverse"],
]);

export default class StarRating extends LightningElement {
    // LWC Properties
    @api isStatic;
    @api cardTitle;
    @api ratingFieldName;

    // Context awereness
    @api recordId;
    @api objectApiName;
    @track wiredFields;
    record;
    
    // Default configuration
    @api defaultRating = 0;
    @api totalStars = 5;
    @api size = "medium";
    @api filledColor = "orange";
    @api unfilledColor = "grey";
    @api customFilledUrl;
    @api customUnfilledUrl;
    @track selectedRating;
    @track stars = new Array();
    isLoaded;

    @wire(getRecord, { recordId: '$recordId', fields: '$fields' })
    wiredRecord({ error, data }) {
        console.log('in the wire',error,data,this.fields);
        if (error) {
            let message = 'Unknown error';
            if (Array.isArray(error.body)) {
                message = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                message = error.body.message;
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading record',
                    message,
                    variant: 'error',
                }),
            );
        } else if (data) {
            this.record = data;
            if(this.objectApiName === "Case") {
                this.selectedRating = this.record.fields.Rate__c.value;
            } else if(this.objectApiName === "Account") {
                this.selectedRating = this.record.fields.Average_Rate__c.value;
            }
            // if selected rating is null then draw empty star rating
            this.selectedRating = this.selectedRating || this.defaultRating;
            if(this.selectedRating !== this.defaultRating) {
                 this.isStatic = true;
            }
            this.reRenderStars(this.selectedRating);
        }
    }

    get fields() {
        if (this.objectApiName === "Account") {
            return ACCOUNTFIELDS;
        } else if(this.objectApiName === "Case") {
            return CASEFIELDS;
        }
    }

    connectedCallback() {
        //create empty rating element if selected rating is empty otherwise show rating
        this.selectedRating = this.defaultRating;
            for (let i = 0; i < this.totalStars; ++i) {
                if (i < this.selectedRating) {
                    this.stars.push(
                        {
                            Index: i,
                            State: ICON_COLOR_MAPPING.get(this.filledColor),
                            CustomUrl: this.customFilledUrl
                        }
                    );
                } else {
                    this.stars.push(
                        {
                            Index: i,
                            State: ICON_COLOR_MAPPING.get(this.unfilledColor),
                            CustomUrl: this.customUnfilledUrl
                        }
                    );
                }
            }
    }

    handleRatingHover(event) {
        this.reRenderStars(1 + +event.target.getAttribute('data-id'));
    }

    handleRatingHoverOut() {
        this.reRenderStars(this.selectedRating);
    }

    handleRatingClick(event) {
        console.log('handle click',this.objectApiName);
        this.selectedRating = 1 + +event.target.getAttribute('data-id');
        this.updateRating();
    }

    updateRating() {
        const fields = {};
        if(this.objectApiName === 'Account') {
            fields[ACCOUNT_ID_FIELD.fieldApiName] = this.recordId;
            fields['Average_Rate__c'] = this.selectedRating;
        } else if(this.objectApiName === 'Case') {
            fields[CASE_ID_FIELD.fieldApiName] = this.recordId;
            fields['Rate__c'] = this.selectedRating;

        } else {
            // This component only Supports Account and Case objects 'else' should never be reached
            // throw exception unexpected object
        }
        
        
        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `${this.objectApiName} updated`,
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }


    reRenderStars = (numberOfFilledStars) => {
        for (let i = 0; i < this.totalStars; ++i) {
            if (i < numberOfFilledStars) {
                this.stars[i].State = ICON_COLOR_MAPPING.get(this.filledColor);
                this.stars[i].CustomUrl = this.customFilledUrl;
            }
            else {
                this.stars[i].State = ICON_COLOR_MAPPING.get(this.unfilledColor);
                this.stars[i].CustomUrl = this.customUnfilledUrl;
            }
        }
    }
}