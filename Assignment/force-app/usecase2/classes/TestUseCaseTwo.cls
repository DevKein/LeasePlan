/**
 * This class contains unit tests for validating the behavior of Apex classes
 * and triggers.
 *
 * Unit tests are class methods that verify whether a particular piece
 * of code is working properly. Unit test methods take no arguments,
 * commit no data to the database, and are flagged with the testMethod
 * keyword in the method definition.
 *
 * All test methods in an org are executed whenever Apex code is deployed
 * to a production org to confirm correctness, ensure code
 * coverage, and prevent regressions. All Apex classes are
 * required to have at least 75% code coverage in order to be deployed
 * to a production org. In addition, all triggers must have some code coverage.
 * 
 * The @isTest class annotation indicates this class only contains test
 * methods. Classes defined with the @isTest annotation do not count against
 * the org size limit for all Apex scripts.
 *
 * See the Apex Language Reference for more information about Testing and Code Coverage.
 */
@isTest
private class TestUseCaseTwo {

    @TestSetup
    private static void setup() {

        Profile standardUserProfile = [SELECT Id FROM Profile WHERE Name='Standard User']; 
        User testUser = new User(Alias = 'standt', Email='standarduser@test.com', 
            EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US', 
            LocaleSidKey='en_US', ProfileId = standardUserProfile.Id, 
            TimeZoneSidKey='America/Los_Angeles', UserName='standarduser251322@test.com');
        insert testUser;

        TestDataFactory.createAccounts(50);
        TestDataFactory.createSuppliers(200);

        
    }


    @isTest
    static void singleRateTest() {
        User runningUser = getRunAsUser();
        PermissionSet supplierPermission = [SELECT Id, Name
                    FROM PermissionSet
                    WHERE Name = 'Supplier_Permission'];

        insert new PermissionSetAssignment(AssigneeId = runningUser.id, PermissionSetId = supplierPermission.Id);
        System.runAs(runningUser) {
            Account acc = getAccounts()[4];
            Supplier__c supp = getSuppliers()[7];

            Case testCase = TestDataFactory.createSupplierCase(1, supp.Id, acc.Id)[0];
            testCase.Rate__c = 2;
            update testCase;

            Supplier__c testSupplier = SupplierSelector.getSupplier(supp.Id);
            System.assert(testSupplier.Country__c != null);

            System.AssertEquals(2, testCase.Rate__c);
            System.AssertEquals(2, AccountSelector.getAccount(acc.Id).Average_Rate__c);
        }
    }

    @isTest
    static void averageRateTest() {
        System.runAs(getRunAsUser()) {
            Account acc = getAccounts()[9];
            Supplier__c supp = getSuppliers()[11];

            TestDataFactory.createRatedSupplierCase(10, supp.Id, acc.Id);
            
            List<AggregateResult> agg = [SELECT AVG(Rate__c) ave FROM Case WHERE Rate__c != null AND AccountId = :acc.Id];
            Decimal avgRate = (Decimal)agg[0].get('ave');
            // Average calculated
            System.assert(avgRate > 0);
            Integer averageRate = (Integer)avgRate.round(System.RoundingMode.HALF_EVEN);

            // check account average
            System.AssertEquals(averageRate, AccountSelector.getAccount(acc.Id).Average_Rate__c);
        }
    }

    private static User getRunAsUser() {
        return [SELECT Id FROM User WHERE Profile.Name = 'Standard User' ORDER BY CreatedDate DESC LIMIT 1];
    }

    private static List<Account> getAccounts() {
        return [SELECT Id FROM Account];
    }

    private static List<Supplier__c> getSuppliers() {
        return [SELECT Id FROM Supplier__c];
    }

}