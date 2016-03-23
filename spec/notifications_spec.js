
'use strict';

var authoring = require('./helpers/authoring'),
    monitoring = require('./helpers/monitoring'),
    desks = require('./helpers/desks');

var Login = require('./helpers/pages').login;
var logout = require('./helpers/pages').logout;

xdescribe('notifications', function() {

    beforeEach(function() {
        desks.openDesksSettings();
        desks.showMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0);
        browser.sleep(2000);
        expect(element(by.id('unread-count')).getText()).toBe('2');
        monitoring.openMonitoring();
        browser.sleep(7500);
    });

    it('create a new user mention', function() {
        expect(monitoring.getTextItem(1, 0)).toBe('item5');
        monitoring.actionOnItem('Edit', 1, 0);
        authoring.showComments();
        authoring.writeTextToComment('@admin1 hello');

        var comments = element.all(by.repeater('comment in comments'));

        browser.wait(function() {
            return comments.count();
        }, 2000);

        expect(comments.count()).toBe(1);

        logout();
        var modal = new Login();
        modal.login('admin1', 'admin');

        expect(element(by.id('unread-count')).getText()).toBe('3');
        element(by.css('button.current-user')).click();
        expect(element(by.id('unread-count')).getText()).toBe('');

    });

    it('create a new desk mention', function() {
        expect(monitoring.getTextItem(1, 0)).toBe('item5');

        desks.openDesksSettings();
        desks.showMonitoringSettings('POLITIC DESK');
        monitoring.turnOffDeskWorkingStage(0, false);

        monitoring.toggleDesk(1);
        monitoring.toggleStage(1, 0);
        monitoring.nextStages();
        monitoring.nextSearches();
        monitoring.nextReorder();
        monitoring.saveSettings();

        monitoring.openMonitoring();
        browser.sleep(5000);

        monitoring.actionOnItem('Edit', 1, 0);
        authoring.showComments();
        authoring.writeTextToComment('#Politic_Desk hello');
        browser.sleep(1000);
        expect(element(by.id('deskNotifications')).getText()).toBe('1');

    });
});
