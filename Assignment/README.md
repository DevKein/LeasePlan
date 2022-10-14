# LeasePlan

## Assignment Use Case #1

When the customer service agent receives a phone call to book a maintenance check for the
vehicle the agent should be able to list out all the suppliers who provide the maintenance in in the
city where the customer is located and check the location in a map to help the customer book an
appointment.

The Suppliers are stored in an independent custom object in Salesforce.

The Object definition of the custom object is as below:

| Field Label  | Field Name  | Description  |
|---|---|---|
| Name  | Name  | The name of the Supplier.  |
| City  | City__c  | The city in which the supplier is located.  |
| Latitude  | Latitude__c  | The latitude of the location of the Supplier.  |
| Longitude  | Longitude__c  | The Longitude of the location of the Supplier.  |

Note : You may also create the flat fields to log the address of the Supplier on the object if
needed instead of geo coordinates.

The customer service agent should be able to search the suppliers that are located on the Billing
city of the Account starting from the Account lightning page to see a list of suppliers and then be
able to drill down to each of the supplier to view the exact location on the Maps.

Take into account that the number of suppliers for a city can at least be more than 100.

## Assignment Use Case #1 Implementation

### Supplier Object

Created the supplier object with additional address fields

| Field Label  | Field Name  | Description  |
|---|---|---|
| Name  | Name  | The name of the Supplier.  |
| Street  | Street__c  | The street in which the supplier is located.  |
| City  | City__c  | The city in which the supplier is located.  |
| Postal Code  | Postal_Code__c  | The postal code for the address in which the supplier is located.  |
| State  | State__c  | The state in which the supplier is located.  |
| Country  | Country__c  | The country in which the supplier is located.  |
| Latitude  | Latitude__c  | The latitude of the location of the Supplier.  |
| Longitude  | Longitude__c  | The Longitude of the location of the Supplier.  |

### Supplier List Component - LWC

This a LWC using `lightning-datatable` to display list of suppliers. This component is a reusable component. Allowed places to use:

* Account Record Page
* Lightning App Pages

When placed on the Account Record page the component will use the record Id to fetch `billingAddress` and by using the City of the `billingAddress` this component will fetch and list all returned suppliers.

The datatable supports *infinite-loading* in case there are big amounth of suppliers.

Each row on this table contains 2 actions:

* Add Action: Add action on this component is a row column button action which publishes a message using LMS to let other components now that the use wants to Add the supplier row to the Supplier Map.
* Create Case: Create Case action is a dropdown button action. If the user (the agent) wants to create a case against a Supplier for the caller customer this action will trigger standard case creation dialog for easy access. The dialog will contains Account and Supplier lookups auto-populated.

### Supplier Map Component - LWC

