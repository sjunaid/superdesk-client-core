'use strict';

var authoring = require('./helpers/authoring'),
    monitoring = require('./helpers/monitoring'),
    workspace = require('./helpers/workspace'),
    dashboard = require('./helpers/dashboard'),
    desks = require('./helpers/desks');

describe('monitoring', function() {

    // Opens desk settings and configure monitoring settings for the named desk
    function setupDeskMonitoringSettings(name) {
        desks.openDesksSettings();
        browser.sleep(3000);
        desks.showMonitoringSettings(name.toUpperCase());
    }

    xit('configure a stage and show it on monitoring view', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0, false);

        monitoring.toggleStage(0, 1);
        monitoring.toggleStage(0, 2);
        monitoring.toggleStage(0, 4);
        monitoring.nextStages();
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(0, 2)).toBe('item6');
    });

    xit('can configure desk output as default when user switches desks and show it on monitoring view', function() {
        monitoring.openMonitoring();
        expect(monitoring.getGroups().count()).toBe(7);

        workspace.selectDesk('Sports Desk');
        expect(monitoring.getGroups().count()).toBe(7);
    });

    xit('can display the item in Desk Output when it\'s been submitted to a production desk', function () {
        monitoring.openMonitoring();
        workspace.selectDesk('Sports Desk');
        monitoring.actionOnItem('Edit', 2, 0);
        authoring.sendTo('Politic Desk', 'two');
        expect(monitoring.getTextItem(5, 0)).toBe('item3');
        expect(monitoring.getGroupItems(6).count()).toBe(0);
    });

    xit('can display the item in Desk Output when it\'s published in a production desk', function() {
        monitoring.openMonitoring();
        expect(monitoring.getTextItem(3, 2)).toBe('item6');
        monitoring.actionOnItem('Edit', 3, 2);
        authoring.publish();
        expect(monitoring.getTextItem(5, 0)).toBe('item6');
        expect(monitoring.getGroupItems(6).count()).toBe(0);
    });

    xit('can display the item in Desk Output and Scheduled Desk Output when it\'s scheduled for publish ', function() {
        monitoring.openMonitoring();
        expect(monitoring.getTextItem(3, 2)).toBe('item6');
        monitoring.actionOnItem('Edit', 3, 2);
        authoring.schedule();
        expect(monitoring.getTextItem(5, 0)).toBe('item6');
        expect(monitoring.getTextItem(6, 0)).toBe('item6');
    });

    xit('configure personal and show it on monitoring view', function() {
        setupDeskMonitoringSettings('POLITIC DESK');

        monitoring.toggleDesk(0);
        monitoring.togglePersonal();
        monitoring.nextStages();
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(0, 0)).toBe('item1');
        expect(monitoring.getTextItem(0, 1)).toBe('item2');
    });

    xit('configure a saved search and show it on monitoring view', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.toggleDesk(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(0);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(0, 0)).toBe('ingest1');
    });

    xit('configure a stage and a saved search and show them on monitoring view', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.toggleStage(0, 0);
        monitoring.toggleStage(0, 1);
        monitoring.toggleStage(0, 2);
        monitoring.toggleStage(0, 4);
        monitoring.toggleDeskOutput(0);
        monitoring.toggleScheduledDeskOutput(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(0);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(0, 2)).toBe('item6');
        expect(monitoring.getTextItem(2, 0)).toBe('ingest1');
    });

    xit('configure a stage and a saved search then unselect stage and show search on monitoring view',
    function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0, false);

        monitoring.toggleStage(0, 1);
        monitoring.toggleStage(0, 2);
        monitoring.toggleStage(0, 4);
        monitoring.toggleDeskOutput(0);
        monitoring.toggleScheduledDeskOutput(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(0);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        desks.showMonitoringSettings('POLITIC DESK');
        monitoring.toggleStage(0, 3);
        monitoring.nextStages();
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(1, 0)).toBe('ingest1');
    });

    it('configure stage and search and then reorder', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0, false);

        monitoring.toggleStage(0, 1);
        monitoring.toggleStage(0, 2);
        monitoring.toggleStage(0, 4);
        monitoring.toggleDeskOutput(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(0);
        monitoring.toggleGlobalSearch(1);
        monitoring.nextSearches();
        monitoring.moveOrderItem(0, 1);
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.wait(function() {
            return element.all(by.css('.content-list')).isDisplayed();
        });

        expect(monitoring.getTextItem(0, 0)).toBe('ingest1');
        expect(monitoring.getTextItem(1, 2)).toBe('item6');

        desks.openDesksSettings();
        browser.sleep(3000);
        desks.showMonitoringSettings('POLITIC DESK');
        monitoring.nextStages();
        monitoring.nextSearches();
        expect(monitoring.getOrderItemText(0)).toBe('global saved search ingest1');
        expect(monitoring.getOrderItemText(1)).toBe('Politic Desk : two');
    });

    xit('configure a stage, a saved search and personal and then set max items', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0, false);

        // Keep only stage one turn on and turn off the rest of stages
        monitoring.toggleStage(0, 1); // turn off incoming stage
        monitoring.toggleStage(0, 3); // turn off stage two
        monitoring.toggleStage(0, 4); // turn off stage three
        monitoring.toggleDeskOutput(0); // turn off deskoutput stage

        monitoring.togglePersonal();    // turn on personal
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(0);   // turn on global search
        monitoring.nextSearches();
        monitoring.nextReorder();

        monitoring.setMaxItems(0, 2);
        monitoring.setMaxItems(1, 1);
        monitoring.setMaxItems(2, 1);

        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(0, 1)).toBe('item9');     // expect stage one 2nd item
        expect(monitoring.getTextItem(1, 0)).toBe('item1');     // expect personal 1st item
        expect(monitoring.getTextItem(2, 0)).toBe('ingest1');   // expect global serach 1st item
    });

    xit('configure a saved search that contain ingest items', function() {
        setupDeskMonitoringSettings('POLITIC DESK');

        monitoring.toggleDesk(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(0);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(0, 0)).toBe('ingest1');
    });

    xit('configure a saved search that contain both ingest items and content items', function() {
        setupDeskMonitoringSettings('POLITIC DESK');

        monitoring.toggleDesk(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(1);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(0, 0)).toBe('item5');
        expect(monitoring.getTextItem(0, 1)).toBe('item9');
        expect(monitoring.getTextItem(0, 3)).toBe('ingest1');
    });

    xit('configure a saved search from other user', function() {
        monitoring.openMonitoring();
        workspace.createWorkspace('My Workspace');
        browser.sleep(500);
        monitoring.showMonitoringSettings();
        monitoring.nextStages();
        monitoring.switchGlobalSearchOn();
        monitoring.toggleGlobalSearch(3);
        expect(monitoring.getGlobalSearchText(3)).toBe('global saved search other user by first name1 last name1');
        monitoring.togglePrivateSearch(1);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        expect(monitoring.getTextItem(0, 0)).toBe('item5');
        expect(monitoring.getTextItem(0, 1)).toBe('item9');
        monitoring.showMonitoringSettings();
        monitoring.nextStages();
        expect(monitoring.getGlobalSearchText(0)).toBe('global saved search ingest1 by first name last name');
        expect(monitoring.getPrivateSearchText(0)).toBe('saved search ingest1');
    });

    xit('configure monitoring view for more than 1 desk', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0, false);

        monitoring.toggleStage(0, 1);
        monitoring.toggleStage(0, 2);
        monitoring.toggleStage(0, 4);
        monitoring.nextStages();
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        desks.showMonitoringSettings('SPORTS DESK');
        monitoring.turnOffDeskWorkingStage(1, false);

        monitoring.toggleStage(1, 1);
        monitoring.toggleStage(1, 3);
        monitoring.toggleStage(1, 4);
        monitoring.nextStages();
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(workspace.getCurrentDesk()).toEqual('POLITIC DESK');
        expect(monitoring.getTextItem(0, 2)).toBe('item6');

        workspace.selectDesk('Sports Desk');
        expect(workspace.getCurrentDesk()).toEqual('SPORTS DESK');
        expect(monitoring.getTextItem(0, 0)).toBe('item3');
    });

    xit('configure a stage and then delete the stage', function() {
        monitoring.openMonitoring();
        expect(monitoring.getGroups().count()).toBe(7);

        desks.openDesksSettings();
        browser.sleep(3000);
        desks.edit('Politic Desk');
        desks.showTab('stages');
        desks.removeStage('three');
        desks.showTab('macros');
        desks.save();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getGroups().count()).toBe(6);
    });

    xit('can search content', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.toggleDesk(0);
        monitoring.toggleDesk(1);
        monitoring.toggleStage(1, 2);
        monitoring.toggleStage(1, 4);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(2);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(0, 0)).toBe('item3');
        expect(monitoring.getTextItem(1, 0)).toBe('item4');
        expect(monitoring.getTextItem(2, 0)).toBe('item1');
        expect(monitoring.getTextItem(2, 4)).toBe('item7');

        monitoring.searchAction('item3');
        expect(monitoring.getTextItem(0, 0)).toBe('item3');
        expect(monitoring.getTextItem(2, 0)).toBe('item3');

        workspace.selectDesk('Sports Desk');
        setupDeskMonitoringSettings('SPORTS DESK');
        monitoring.turnOffDeskWorkingStage(1);

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(workspace.getCurrentDesk()).toEqual('SPORTS DESK');
        expect(monitoring.getTextItem(1, 0)).toBe('item3');

        workspace.selectDesk('Politic Desk');
        dashboard.openDashboard();
        monitoring.openMonitoring();
        expect(monitoring.getTextItem(0, 0)).toBe('item3');
        expect(monitoring.getTextItem(1, 0)).toBe('item4');
        expect(monitoring.getTextItem(2, 0)).toBe('item1');
        expect(monitoring.getTextItem(2, 4)).toBe('item7');
    });

    xit('can filter content by file type', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.toggleDesk(0);
        monitoring.nextStages();
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(2, 0)).toBe('item5');
        expect(monitoring.getTextItem(2, 1)).toBe('item9');

        monitoring.filterAction('composite');
        expect(monitoring.getTextItem(3, 2)).toBe('package1');

        workspace.selectDesk('Sports Desk');
        expect(monitoring.getGroupItems(0).count()).toBe(0);
        expect(monitoring.getGroupItems(1).count()).toBe(0);
        expect(monitoring.getGroupItems(2).count()).toBe(0);
        expect(monitoring.getGroupItems(3).count()).toBe(0);
    });

    xit('can order content', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0);

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(1, 0)).toBe('item5');
        expect(monitoring.getTextItem(1, 1)).toBe('item9');
        expect(monitoring.getTextItem(1, 2)).toBe('item7');
        expect(monitoring.getTextItem(1, 3)).toBe('item8');
        monitoring.setOrder('Slugline', true);
        expect(monitoring.getTextItem(1, 0)).toBe('item5');
        expect(monitoring.getTextItem(1, 1)).toBe('item7');
        expect(monitoring.getTextItem(1, 2)).toBe('item8');
        expect(monitoring.getTextItem(1, 3)).toBe('item9');
    });

    xit('can preview content', function() {
        monitoring.openMonitoring();

        monitoring.previewAction(3, 2);
        expect(monitoring.getPreviewTitle()).toBe('item6');
        monitoring.closePreview();
    });

    xit('can open read only content', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0);

        monitoring.openMonitoring();
        browser.sleep(7500);

        monitoring.openAction(2, 0);
        expect(authoring.save_button.isPresent()).toBeTruthy();
    });

    xit('can start content upload', function() {
        monitoring.openMonitoring();
        monitoring.openCreateMenu();
        monitoring.startUpload();
        expect(monitoring.uploadModal.isDisplayed()).toBeTruthy();
    });

    xit('show personal', function() {
        monitoring.openMonitoring();
        monitoring.showPersonal();
        expect(monitoring.getPersonalItemText(0)).toBe('item1');
        expect(monitoring.getPersonalItemText(1)).toBe('item2');
    });

    xit('can view items in related item tab', function() {
        monitoring.openMonitoring();
        expect(monitoring.getGroupItems(1).count()).toBe(0);
        expect(monitoring.getGroupItems(2).count()).toBe(4);
        monitoring.actionOnItem('Duplicate', 2, 0);
        monitoring.filterAction('text');
        expect(monitoring.getGroupItems(0).count()).toBe(1);
        expect(monitoring.getTextItem(0, 0)).toBe('item5');
        monitoring.previewAction(0, 0);
        monitoring.tabAction('related');
        monitoring.openRelatedItem(0);
        expect(authoring.getHeadlineText()).toBe('item5');
    });

    xit('updates item group on single item spike-unspike', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0);

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getGroupItems(1).count()).toBe(4);

        monitoring.actionOnItem('Spike', 1, 2);
        expect(monitoring.getGroupItems(1).count()).toBe(3);

        monitoring.showSpiked();
        expect(monitoring.getSpikedTextItem(0)).toBe('item7');

        monitoring.unspikeItem(0);
        expect(monitoring.getSpikedItems().count()).toBe(0);
    });

    xit('updates personal on single item spike', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.toggleDesk(0);
        monitoring.togglePersonal();
        monitoring.nextStages();
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getGroupItems(0).count()).toBe(2);
        monitoring.actionOnItem('Spike', 0, 0);
        expect(monitoring.getGroupItems(0).count()).toBe(1);
    });

    xit('updates item group on multiple item spike-unspike', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0);

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getGroupItems(1).count()).toBe(4);
        monitoring.selectItem(1, 2);
        monitoring.spikeMultipleItems();
        expect(monitoring.getGroupItems(1).count()).toBe(3);
        monitoring.showSpiked();
        expect(monitoring.getSpikedTextItem(0)).toBe('item7');
        monitoring.selectSpikedItem(0);
        monitoring.unspikeMultipleItems();
        expect(monitoring.getSpikedItems().count()).toBe(0);
    });

    xit('can show/hide monitoring list', function() {
        monitoring.openMonitoring();
        monitoring.openAction(2, 0);
        monitoring.showHideList();
        expect(monitoring.hasClass(element(by.id('main-container')), 'hideMonitoring')).toBe(true);

        browser.sleep(1000);

        monitoring.showHideList();
        expect(monitoring.hasClass(element(by.id('main-container')), 'hideMonitoring')).toBe(false);
    });

    xit('can fetch item', function () {
        setupDeskMonitoringSettings('POLITIC DESK');

        monitoring.toggleDesk(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(3);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        monitoring.openAction(0, 3); // creates new item
        expect(monitoring.getTextItem(0, 3)).toBe('ingest1');
        expect(monitoring.getTextItem(0, 4)).toBe('ingest1');
    });

    xit('can fetch as item', function () {
        setupDeskMonitoringSettings('POLITIC DESK');

        monitoring.toggleDesk(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(3);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        monitoring.openFetchAsOptions(0, 3);

        expect(element(by.id('publishScheduleTimestamp')).isPresent()).toBe(false);
        expect(element(by.id('embargoScheduleTimestamp')).isPresent()).toBe(false);

        monitoring.clickOnFetchButton();

        desks.openDesksSettings();
        desks.showMonitoringSettings('POLITIC DESK');

        monitoring.toggleDesk(0);
        monitoring.toggleStage(0, 1);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(3);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getTextItem(0, 0)).toBe('ingest1');
    });

    it('can fetch as and open item', function () {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.toggleDesk(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(3);
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.wait(function() {
            return element.all(by.css('.content-list')).isDisplayed();
        });

        monitoring.fetchAndOpen(0, 3);

        expect(authoring.save_button.isDisplayed()).toBe(true);
    });

    xit('can display desk content in desk single view with their respective titles', function() {
        monitoring.openMonitoring();
        expect(workspace.getCurrentDesk()).toEqual('POLITIC DESK');
        expect(monitoring.getGroups().count()).toBe(7);
        //exclude deskOutput and ScheduledDeskOutput
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.toggleDeskOutput(0);
        monitoring.toggleScheduledDeskOutput(0);
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getGroups().count()).toBe(6);

        //ensure each stage items counts
        expect(monitoring.getGroupItems(0).count()).toBe(0);
        expect(monitoring.getGroupItems(1).count()).toBe(0);
        expect(monitoring.getGroupItems(2).count()).toBe(4);
        expect(monitoring.getGroupItems(3).count()).toBe(4);
        expect(monitoring.getGroupItems(4).count()).toBe(0);

        //view all items in desk single view
        monitoring.actionOnDeskSingleView();
        expect(monitoring.getSingleViewItemCount()).toBe(8);
        expect(monitoring.getDeskSingleViewTitle()).toBe('Politic Desk desk 8');

        //Monitoring Home
        monitoring.actionMonitoringHome();
        expect(monitoring.getMonitoringHomeTitle()).toBe('Monitoring');

        //Stage single view
        monitoring.actionOnStageSingleView();
        expect(monitoring.getSingleViewItemCount()).toBe(0);
        expect(monitoring.getStageSingleViewTitle()).toBe('Politic Desk / Working Stage stage 0');
    });

    xit('can remember multi selection even after scrolling and can reset multi-selection', function() {
        //Initial steps to setup global saved search group as a test group for this case
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0, false);

        // Keep Only global search on and turn off rest of stages
        monitoring.toggleStage(0, 1);
        monitoring.toggleStage(0, 2);
        monitoring.toggleStage(0, 3);
        monitoring.toggleStage(0, 4);
        monitoring.toggleDeskOutput(0);
        monitoring.nextStages();
        monitoring.toggleGlobalSearch(2);
        monitoring.nextSearches();
        monitoring.nextReorder();

        //limit the size of group for the sake of scroll bar
        monitoring.setMaxItems(0, 3);
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(7500);

        expect(monitoring.getGroupItems(0).count()).toBe(9);

        //select first item
        monitoring.selectItem(0, 0);
        monitoring.expectIsChecked(0, 0);

        //scroll down and select last item
        browser.executeScript('window.scrollTo(0,250);').then(function () {
            monitoring.selectItem(0, 8);
            monitoring.expectIsChecked(0, 8);
        });

        //scroll up to top again to see if selection to first item is remembered?
        browser.executeScript('window.scrollTo(0,0);').then(function () {
            monitoring.expectIsChecked(0, 0);
        });

        //scroll down again to see if selection to last item is remembered?
        browser.executeScript('window.scrollTo(0,250);').then(function () {
            monitoring.expectIsChecked(0, 8);
        });

        expect(monitoring.getMultiSelectCount()).toBe('2 Items selected');

        //Now reset multi-selection
        monitoring.clickOnCancelButton();
        monitoring.expectIsNotChecked(0, 0);
        monitoring.expectIsNotChecked(0, 8);
    });

    xit('can view published duplicated item in duplicate tab of non-published original item', function() {
        monitoring.openMonitoring();
        expect(monitoring.getGroupItems(1).count()).toBe(0);
        expect(monitoring.getGroupItems(2).count()).toBe(4);
        expect(monitoring.getTextItem(2, 0)).toBe('item5'); // original item
        monitoring.actionOnItem('Duplicate', 2, 0);
        monitoring.filterAction('text');
        expect(monitoring.getGroupItems(0).count()).toBe(1);
        expect(monitoring.getTextItem(0, 0)).toBe('item5'); // duplicated item
        //publish this duplicated item
        monitoring.actionOnItem('Edit', 0, 0);
        authoring.publish();
        //now preview original item's duplicate tab for duplicated published item
        monitoring.previewAction(2, 0);
        monitoring.tabAction('related');
        expect(authoring.getDuplicatedItemState(0)).toBe('PUBLISHED');
    });

    xit('can view published item as readonly when opened in multiEdit ', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0);

        monitoring.openMonitoring();
        browser.sleep(7500);

        monitoring.actionOnItem('Edit', 1, 0);
        authoring.publish();

        //open published text item
        monitoring.filterAction('text');
        monitoring.actionOnItem('Correct item', 4, 0);

        //press multiEdit button to open publish item in multiEdit
        authoring.multieditOption.click();
        element(by.buttonText('Ok')).click();
        expect(element(by.className('state-label')).getText()).toEqual('PUBLISHED');

        var btnSave = element(by.css('[ng-click="save(item, articleEdit)"]'));
        expect(btnSave.isDisplayed()).toBeFalsy();  // Save button hidden for publish item

        var textField = element(by.className('text-editor'));
        // expect contenteditable=true attribute is missing/null for text-editor field,
        // hence editing is disabled for published item
        expect(textField.getAttribute('contenteditable')).toBe(null);
    });

    xit('can close already opened preview on an item action', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0);

        monitoring.openMonitoring();
        monitoring.openMonitoring();

        monitoring.previewAction(2, 2);
        expect(monitoring.getPreviewTitle()).toBe('item6');
        var previewPane = element(by.id('item-preview'));
        expect(previewPane.isPresent()).toBe(true);
        monitoring.actionOnItem('Edit', 2, 2);
        expect(previewPane.isPresent()).toBe(false);
    });

    xit('can display embargo label when set for published item', function() {
        setupDeskMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0);

        monitoring.openMonitoring();
        browser.sleep(7500);

        monitoring.actionOnItem('Edit', 1, 0);
        authoring.sendToButton.click();
        authoring.setEmbargo();
        authoring.sendToButton.click();
        authoring.save();
        authoring.publish();

        // filter published text item
        monitoring.filterAction('text');
        expect(monitoring.getItem(4, 0).element(by.className('state_embargo')).isDisplayed()).toBe(true);
        expect(monitoring.getItem(4, 0).element(by.className('state_embargo')).getText()).toEqual('EMBARGO');
    });
});
