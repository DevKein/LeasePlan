@isTest
public with sharing class TestDataFactory {
    public static List<Account> createAccounts(Integer numAccts) {
        List<Account> accts = new List<Account>();
        for(Integer i=0;i<numAccts;i++) {
            Account a = new Account(
                Name='TestAccount' + i,
                BillingStreet = i+' Geneva Street',
                BillingCity = 'New York',
                BillingPostalCode = '10003',
                BillingState = 'NY',
                BillingCountry = 'USA'
            );
            accts.add(a);
        }
        //NOPMD
        insert accts;
        return accts;
    }

    public static List<Supplier__c> createSuppliers(Integer numSuppliers) {
        List<Supplier__c> suppliers = new List<Supplier__c>();
        for(Integer i=0;i<numSuppliers;i++) {
            Supplier__c s = new Supplier__c(
                Name='TestAccount' + i,
                Street__c  = i+' Geneva Street',
                City__c  = 'New York',
                Postal_Code__c = '10003',
                State__c  = 'NY',
                Country__c  = 'USA'
            );
            suppliers.add(s);
        }
        //NOPMD
        insert suppliers;
        return suppliers;
    }

    public static List<Case> createRatedSupplierCase(Integer numCases, Id supplierId, Id accountId) {
        Integer [] rates = new Integer[]{1,2,3,4,5};
        List<Case> cases = new List<Case>();
        for(Integer i=0;i<numCases;i++) {
            Case c = new Case(
                Supplier__c = supplierId,
                AccountId = accountId,
                Status = 'Working',
                Origin = 'Phone',
                Rate__c = rates[Math.mod(i,5)]
            );
            cases.add(c);
        }
        //NOPMD
        insert cases;
        return cases;
    }

    public static List<Case> createSupplierCase(Integer numCases, Id supplierId, Id accountId) {
        List<Case> cases = new List<Case>();
        for(Integer i=0;i<numCases;i++) {
            Case c = new Case(
                Supplier__c = supplierId,
                AccountId = accountId,
                Status = 'Working',
                Origin = 'Phone',
                Rate__c = null
            );
            cases.add(c);
        }
        //NOPMD
        insert cases;
        return cases;
    }
}
