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