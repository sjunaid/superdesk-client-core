
'use strict';

var desks = require('./helpers/desks');

xdescribe('desks_management', function () {

    beforeEach(function() {
        desks.openDesksSettings();
    });

    xit('lists macros under the Macro tab for new desks', function () {
        desks.newDeskBtn.click();
        desks.showTab('macros');
        expect(desks.listedMacros.count()).toBeGreaterThan(0);
    });
});
