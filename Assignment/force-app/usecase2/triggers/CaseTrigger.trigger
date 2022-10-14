Trigger CaseTrigger on Case (Before Insert, Before Update, After Insert, After Update) {
    TriggerFactory.createAndExecuteHandler(CaseTriggerHandler.class);
}