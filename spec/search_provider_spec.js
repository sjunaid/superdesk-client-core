'use strict';
var openUrl = require('./helpers/utils').open,
    searchProvider = require('./helpers/pages').searchProvider,
    globalSearch = require('./helpers/search');

xdescribe('search_provider', function() {

    beforeEach(function(done) {
        openUrl('/#/settings/searchProviders').then(done);
    });

    xit('Add Search Provider', function() {
        // create default search provider
        searchProvider.addProvider('AAP Multimedia', 'AAP Multimedia', true);

        // create a second search provider and set it as default
        searchProvider.addProvider('PA Images', 'PA Images', true);

        // the first provider should not be set as default
        searchProvider.editProvider(0);
        expect(searchProvider.checkbox.isSelected()).toBeFalsy();
        searchProvider.checkbox.click();
        searchProvider.saveProvider();

        // the second provider should not be set as default
        searchProvider.editProvider(1);
        expect(searchProvider.checkbox.isSelected()).toBeFalsy();

        // in search the first provider should be selected
        openUrl('/#/search');
        globalSearch.openFilterPanel();
        globalSearch.openParameters();
        expect(element.all(by.css('[value="local"]')).first().isSelected()).toBeFalsy();
        expect(element.all(by.css('[ng-value="provider.search_provider"]')).get(0).isSelected()).toBeTruthy();
        expect(element.all(by.css('[ng-value="provider.search_provider"]')).get(1).isSelected()).toBeFalsy();
    });

});
