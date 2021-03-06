(function() {

'use strict';

MetadataCtrl.$inject = [
    '$scope', 'desks', 'metadata', '$filter', 'privileges', 'datetimeHelper',
    'preferencesService', 'archiveService'
];
function MetadataCtrl(
    $scope, desks, metadata, $filter,
    privileges, datetimeHelper, preferencesService, archiveService) {

    desks.initialize()
    .then(function() {
        $scope.deskLookup = desks.deskLookup;
        $scope.userLookup = desks.userLookup;
    });

    metadata.initialize().then(function() {
        $scope.metadata = metadata.values;
        return preferencesService.get();
    })
    .then(setAvailableCategories);

    $scope.processGenre = function() {
        $scope.item.genre = _.map($scope.item.genre, function(g) {
            return _.pick(g, 'name');
        });
    };

    $scope.disableAddingTargetedFor = function() {
        return !$scope.item._editable || angular.isUndefined($scope.item.targeted_for_value) || $scope.item.targeted_for_value === '';
    };

    $scope.addTargeted = function() {
        if (angular.isUndefined($scope.item.targeted_for)) {
            $scope.item.targeted_for = [];
        }

        if (!angular.isUndefined($scope.item.targeted_for_value) && $scope.item.targeted_for_value !== '') {
            var targeted_for = {'name': $scope.item.targeted_for_value};

            if (angular.isUndefined(_.find($scope.item.targeted_for, targeted_for))) {
                targeted_for.allow = angular.isUndefined($scope.item.negation) ? true : !$scope.item.negation;
                $scope.item.targeted_for.push(targeted_for);
                $scope.autosave($scope.item);
            }
        }

    };

    $scope.removeTargeted = function(to_remove) {
        if (angular.isDefined(_.find($scope.item.targeted_for, to_remove))) {
            $scope.item.targeted_for = _.without($scope.item.targeted_for, to_remove);
            $scope.autosave($scope.item);
        }
    };

    /**
    * Builds a list of categories available for selection in scope. Used by
    * the "category" menu in the Authoring metadata section.
    *
    * @function setAvailableCategories
    * @param {Object} prefs - user preferences setting, including the
    *   preferred categories settings, among other things
    */
    function setAvailableCategories(prefs) {
        var all,        // all available categories
            assigned = {},   // category codes already assigned to the article
            filtered,
            itemCategories,  // existing categories assigned to the article

            // user's category preference settings , i.e. a map
            // object (<category_code> --> true/false)
            userPrefs;

        all = metadata.values.categories || [];
        userPrefs = prefs['categories:preferred'].selected || {};

        // gather article's existing category codes
        itemCategories = $scope.item.anpa_category || [];

        itemCategories.forEach(function (cat) {
            assigned[cat.qcode] = true;
        });

        filtered = _.filter(all, function (cat) {
            return userPrefs[cat.qcode] && !assigned[cat.qcode];
        });

        $scope.availableCategories = _.sortBy(filtered, 'name');
    }

    $scope.$watch('item.publish_schedule_date', function(newValue, oldValue) {
        setPublishScheduleDate(newValue, oldValue);
    });

    $scope.$watch('item.publish_schedule_time', function(newValue, oldValue) {
        setPublishScheduleDate(newValue, oldValue);
    });

    function setPublishScheduleDate(newValue, oldValue) {
        if (newValue !== oldValue) {
            if ($scope.item.publish_schedule_date && $scope.item.publish_schedule_time) {
                $scope.item.publish_schedule = datetimeHelper.mergeDateTime($scope.item.publish_schedule_date,
                    $scope.item.publish_schedule_time).format();
            } else {
                $scope.item.publish_schedule = null;
            }

            $scope.autosave($scope.item);
        }
    }

    $scope.$watch('item.embargo_date', function(newValue, oldValue) {
        setEmbargoTS(newValue, oldValue);
    });

    $scope.$watch('item.embargo_time', function(newValue, oldValue) {
        setEmbargoTS(newValue, oldValue);
    });

    /**
     * Listener method which gets invoked when either Embargo Date or Embargo Time has changed. This function takes
     * values of both Embargo Date and Embargo Time to form Timestamp.
     */
    function setEmbargoTS(newValue, oldValue) {
        if (newValue !== oldValue) {
            if ($scope.item.embargo_date && $scope.item.embargo_time) {
                $scope.item.embargo = datetimeHelper.mergeDateTime(
                    $scope.item.embargo_date, $scope.item.embargo_time).format();
            } else {
                $scope.item.embargo = null;
            }

            $scope.autosave($scope.item);
        }
    }

    /**
     * Publish Schedule and Embargo are saved as Timestamps in DB but each field has date and time as two different
     * inputs in UI. This function breaks the timestamp fetched from API to Date and Time and assigns those values to
     * the appropriate field.
     */
    function resolvePublishScheduleAndEmbargoTS() {
        if ($scope.item.embargo) {
            var embargoTS = new Date(Date.parse($scope.item.embargo));
            $scope.item.embargo_date = $filter('formatDateTimeString')(embargoTS, 'MM/DD/YYYY');
            $scope.item.embargo_time = $filter('formatDateTimeString')(embargoTS, 'HH:mm:ss');
        }

        if ($scope.item.publish_schedule) {
            var publishSchedule = new Date(Date.parse($scope.item.publish_schedule));
            $scope.item.publish_schedule_date = $filter('formatDateTimeString')(publishSchedule, 'MM/DD/YYYY');
            $scope.item.publish_schedule_time = $filter('formatDateTimeString')(publishSchedule, 'HH:mm:ss');
        }
    }

    $scope.unique_name_editable = Boolean(privileges.privileges.metadata_uniquename);
    resolvePublishScheduleAndEmbargoTS();
}

MetadropdownFocusDirective.$inject = ['$timeout', 'keyboardManager'];
function MetadropdownFocusDirective($timeout, keyboardManager) {
    return {
        require: 'dropdown',
        link: function(scope, elem, attrs, dropdown) {
            scope.$watch(dropdown.isOpen, function(isOpen) {
                if (isOpen) {
                    _.defer(function() {
                            var keyboardOptions = {inputDisabled: false};
                            // narrow the selection to consider only dropdown list's button items
                            var buttonList = elem.find('.dropdown-menu button');

                            if (buttonList.length > 0) {
                                buttonList[0].focus();
                            }

                            keyboardManager.push('up', function () {
                                if (buttonList.length > 0) {
                                    var focusedElem = elem.find('button:focus')[0];
                                    var indexValue = _.findIndex(buttonList, function(chr) {
                                        return chr === focusedElem;
                                    });
                                    // select previous item on key UP
                                    if (indexValue > 0 && indexValue < buttonList.length) {
                                        buttonList[indexValue - 1].focus();
                                    }
                                }
                            }, keyboardOptions);

                            keyboardManager.push('down', function () {
                                if (buttonList.length > 0) {
                                    var focusedElem = elem.find('button:focus')[0];
                                    var indexValue = _.findIndex(buttonList, function(chr) {
                                        return chr === focusedElem;
                                    });
                                    // select next item on key DOWN
                                    if (indexValue < buttonList.length - 1) {
                                        buttonList[indexValue + 1].focus();
                                    }
                                }
                            }, keyboardOptions);
                        });
                } else if (isOpen === false) {
                    keyboardManager.pop('down');
                    keyboardManager.pop('up');
                }
            });
        }
    };
}

MetadataDropdownDirective.$inject = ['$timeout', '$filter', 'keyboardManager'];
function MetadataDropdownDirective($timeout, $filter, keyboardManager) {
    return {
        scope: {
            list: '=',
            disabled: '=ngDisabled',
            item: '=',
            field: '@',
            icon: '@',
            label: '@',
            change: '&'
        },
        templateUrl: 'scripts/superdesk-authoring/metadata/views/metadata-dropdown.html',
        link: function(scope, elem) {
            scope.select = function(item) {
                var o = {};

                if (angular.isDefined(item)) {
                    o[scope.field] = (scope.field === 'place' || scope.field === 'genre') ? [item] : item.value;
                } else {
                    o[scope.field] = null;
                }

                _.extend(scope.item, o);
                scope.change({item: scope.item});

                //retain focus on same dropdown control after selection.
                _.defer (function() {
                    elem.find('.dropdown-toggle').focus();
                });
            };

            $timeout(function() {
                if (scope.list) {
                    if (scope.field === 'place') {
                        scope.places = _.groupBy(scope.list, 'group');
                    } else if (scope.field === 'genre') {
                        scope.list = $filter('sortByName')(scope.list);
                    }
                }
            });
        }
    };
}

MetadataWordsListEditingDirective.$inject = ['$timeout'];
function MetadataWordsListEditingDirective($timeout) {
    return {
        scope: {
            item: '=',
            field: '@',
            disabled: '=',
            list: '=',
            change: '&',
            header: '@'
        },
        templateUrl: 'scripts/superdesk-authoring/metadata/views/metadata-words-list.html',
        link: function(scope, element) {
            scope.words = [];
            scope.selectedTerm = '';

            $timeout(function() {
                element.find('input, select').addClass('line-input');

                if (scope.list) {
                    scope.words = scope.list;
                }
            });

            /**
             * sdTypeahead directive invokes this method and is responsible for searching word(s) where the word.name
             * matches word_to_find.
             *
             * @return {Array} list of word(s)
             */
            scope.search = function(word_to_find) {
                if (!word_to_find) {
                    scope.words = scope.list;
                } else {
                    scope.words = _.filter(scope.list, function (t) {
                        return ((t.name.toLowerCase().indexOf(word_to_find.toLowerCase()) !== -1));
                    });
                }

                scope.selectedTerm = word_to_find;
                return scope.words;
            };

            /**
             * sdTypeahead directive invokes this method and is responsible for updating the item with user selected
             * word.
             *
             * @param {Object} item selected word object
             */
            scope.select = function(item) {
                var keyword = item ? item.value : scope.selectedTerm;
                var t = _.clone(scope.item[scope.field]) || [];
                var index = _.findIndex(t, function (word) {
                    return word.toLowerCase() === keyword.toLowerCase();
                });

                if (index < 0) {
                    t.push(keyword.toUpperCase());

                    var o = {};
                    o[scope.field] = t;
                    _.extend(scope.item, o);
                    scope.change({item: scope.item});
                }

                scope.selectedTerm = '';
            };

            /**
             * Removes the term from the user selected terms
             */
            scope.removeTerm = function(term) {
                var temp = _.without(scope.item[scope.field], term);

                //build object
                var o = {};
                o[scope.field] = temp;

                _.extend(scope.item, o);

                scope.change({item: scope.item});
            };
        }
    };
}

/**
 * Wraping  'sd-typeahead' directive for editing of metadata list attributes
 *
 * @param {Object} item - specify the content item itself
 * @param {String} field - specify the (metadata) filed under the item which will be edited
 * @param {Boolean} disabled - whether component should be disabled for editing or not
 * @param {Array} list - list of available values that can be added
 * @param {String} unique - specify the name of the field, in list item which is unique (qcode, value...)
 *
 */
MetadataListEditingDirective.$inject = ['metadata', '$filter', '$timeout'];
function MetadataListEditingDirective(metadata, $filter, $timeout) {
    return {
        scope: {
            item: '=',
            field: '@',
            disabled: '=ngDisabled',
            list: '=',
            unique: '=',
            postprocessing: '&',
            change: '&',
            header: '@',
            reloadList: '@'
        },
        templateUrl: 'scripts/superdesk-authoring/metadata/views/metadata-terms.html',
        link: function(scope, elem) {
            metadata.subjectScope = scope;
            var reloadList = scope.reloadList === 'true'? true : false;
            scope.combinedList = [];

            scope.$watch('unique', function(value) {
                scope.uniqueField = value || 'qcode';
            });

            scope.$watch('list', function(items) {
                if (!items || items.length === 0) {
                    return;
                }

                var tree = {};
                angular.forEach(items, function(item) {
                    var parent = item.parent || null;
                    if (!tree.hasOwnProperty(parent)) {
                        tree[parent] = [item];
                    } else {
                        tree[parent].push(item);
                    }
                });

                scope.terms = items;
                scope.tree = tree;
                scope.activeTree = tree[null];
                scope.combinedList = _.union(scope.list, scope.item[scope.field] ? scope.item[scope.field] : []);
            });

            scope.$on('$destroy', function() {
                metadata.subjectScope = null;
            });

            scope.openParent = function(term, $event) {
                var parent = _.find(scope.list, {qcode: term.parent});
                scope.openTree(parent, $event);
            };

            scope.openTree = function(term, $event) {
                scope.activeTerm = term;
                scope.activeTree = scope.tree[term ? term.qcode : null];
                $event.stopPropagation();
                _.defer(function () {
                    elem.find('button:not([disabled]):not(.dropdown-toggle)')[0].focus();
                });
            };

            scope.activeList = false;
            scope.selectedTerm = '';

            scope.searchTerms = function(term) {
                if (!term) {
                    scope.terms = scope.list;
                    scope.activeList = false;
                } else {
                    var searchList = reloadList? scope.list : scope.combinedList;
                    scope.terms = _.filter(searchList, function(t) {
                        var searchObj = {};
                        searchObj[scope.uniqueField] = t[scope.uniqueField];
                        return ((t.name.toLowerCase().indexOf(term.toLowerCase()) !== -1) &&
                            !_.find(scope.item[scope.field], searchObj));
                    });
                    scope.activeList = true;
                }
                return scope.terms;
            };

            scope.selectTerm = function(term) {
                if (term) {
                    // Only select terms that are not already selected
                    if (!_.find(scope.item[scope.field], function(i) {return i.qcode === term.qcode;})) {
                        //instead of simple push, extend the item[field] in order to trigger dirty $watch
                        var t = _.clone(scope.item[scope.field]) || [];
                        t.push(term);

                        //build object
                        var o = {};
                        o[scope.field] = t;
                        _.extend(scope.item, o);
                    }

                    scope.selectedTerm = '';

                    if (!reloadList) {
                        // Remove the selected term from the terms
                        scope.terms = _.without(scope.terms, term);
                        scope.activeTree = _.without(scope.activeTree, term);
                    }

                    $timeout(function() {
                        scope.postprocessing();
                        scope.change({item: scope.item});
                    }, 50);

                    //retain focus and initialise activeTree on same dropdown control after selection.
                    _.defer (function() {
                        elem.find('.dropdown-toggle').focus();
                        if (reloadList) {
                            scope.activeTerm = null;
                            scope.searchTerms(null);
                            scope.activeTree = scope.tree[null];
                        } else {
                            scope.terms = _.clone(scope.activeTree) || [];
                            scope.allSelected = (scope.item[scope.field].length === scope.list.length) ? true : false;
                        }
                    });
                }
            };

            scope.removeTerm = function(term) {
                var tempItem = {},
                    subjectCodesArray = scope.item[scope.field],
                    filteredArray = _.without(subjectCodesArray, term);

                if (subjectCodesArray && filteredArray.length === subjectCodesArray.length) {
                    _.remove(filteredArray, {name: term});
                }

                tempItem[scope.field] = filteredArray;
                _.extend(scope.item, tempItem);

                if (!reloadList) {
                    scope.terms.push(term);
                    scope.activeTree.push(term);
                    scope.activeTree = $filter('sortByName')(scope.activeTree);
                    scope.allSelected = false;
                }

                scope.terms = $filter('sortByName')(scope.terms);
                scope.change({item: scope.item});
                elem.find('.dropdown-toggle').focus(); // retain focus
            };
        }
    };
}

MetadataLocatorsDirective.$inject = ['$timeout'];
function MetadataLocatorsDirective($timeout) {
    return {
        scope: {
            item: '=',
            fieldprefix: '@',
            field: '@',
            disabled: '=ngDisabled',
            list: '=',
            change: '&',
            postprocessing: '&',
            header: '@'
        },

        templateUrl: 'scripts/superdesk-authoring/metadata/views/metadata-locators.html',
        link: function(scope, element) {
            scope.selectedTerm = '';

            $timeout(function() {
                if (scope.item) {
                    if (scope.fieldprefix && scope.item[scope.fieldprefix] && scope.item[scope.fieldprefix][scope.field]) {
                        scope.selectedTerm = scope.item[scope.fieldprefix][scope.field].city;
                    } else if (scope.item[scope.field]) {
                        scope.selectedTerm = scope.item[scope.field].city;
                    }
                }

                if (scope.list) {
                    scope.locators = scope.list;
                }
            });

            /**
             * sdTypeahead directive invokes this method and is responsible for searching located object(s) where the
             * city name matches locator_to_find.
             *
             * @return {Array} list of located object(s)
             */
            scope.searchLocator = function(locator_to_find) {
                if (!locator_to_find) {
                    scope.locators = scope.list;
                } else {
                    scope.locators = _.filter(scope.list, function(t) {
                        return ((t.city.toLowerCase().indexOf(locator_to_find.toLowerCase()) !== -1));
                    });
                }

                scope.selectedTerm = locator_to_find;
                return scope.locators;
            };

            /**
             * sdTypeahead directive invokes this method and is responsible for updating the item with user selected
             * located object.
             *
             * @param {Object} locator user selected located object
             */
            scope.selectLocator = function(locator) {
                var updates = {};

                if (!locator && scope.selectedTerm) {
                    var previousLocator = scope.fieldprefix ? scope.item[scope.fieldprefix][scope.field] :
                                            scope.item[scope.field];

                    if (scope.selectedTerm === previousLocator.city) {
                        locator = previousLocator;
                    } else {
                        locator = {'city': scope.selectedTerm, 'city_code': scope.selectedTerm, 'tz': 'UTC',
                            'dateline': 'city', 'country': '', 'country_code': '', 'state_code': '', 'state': ''};
                    }
                }

                if (locator) {
                    if (angular.isDefined(scope.fieldprefix)) {
                        if (!angular.isDefined(scope.item[scope.fieldprefix]))
                        {
                            _.extend(scope.item, {dateline: {}});
                        }
                        updates[scope.fieldprefix] = scope.item[scope.fieldprefix];
                        updates[scope.fieldprefix][scope.field] = locator;
                    } else {
                        updates[scope.field] = locator;
                    }

                    scope.selectedTerm = locator.city;
                    _.extend(scope.item, updates);
                }

                var selectedLocator = {item: scope.item, city: scope.selectedTerm};

                scope.postprocessing(selectedLocator);
                scope.change(selectedLocator);
            };
        }
    };
}

MetadataService.$inject = ['api', '$q'];
function MetadataService(api, $q) {

    var service = {
        values: {},
        subjectScope: null,
        loaded: null,
        fetchMetadataValues: function() {
            var self = this;

            return api('vocabularies').query().then(function(result) {
                _.each(result._items, function(vocabulary) {
                    self.values[vocabulary._id] = vocabulary.items;
                });
                self.values.targeted_for = _.sortBy(_.union(self.values.geographical_restrictions, self.values.subscriber_types),
                    function(target) { return target.value.toLowerCase() === 'all' ? '' : target.name; });
            });
        },
        fetchSubjectcodes: function(code) {
            var self = this;
            return api.get('/subjectcodes').then(function(result) {
                self.values.subjectcodes = result._items;
            });
        },
        removeSubjectTerm: function(term) {
            var self = this,
                tempItem = {},
                subjectCodesArray = self.subjectScope.item[self.subjectScope.field],
                filteredArray = _.without(subjectCodesArray, term);

            if (filteredArray.length === subjectCodesArray.length) {
                _.remove(filteredArray, {name: term});
            }

            tempItem[self.subjectScope.field] = filteredArray;

            _.extend(self.subjectScope.item, tempItem);

            self.subjectScope.change({item: self.subjectScope.item});
        },
        fetchCities: function() {
            var self = this;
            return api.get('/cities').then(function(result) {
                self.values.cities = result._items;
            });
        },
        initialize: function() {
            if (!this.loaded) {
                this.loaded = this.fetchMetadataValues()
                    .then(angular.bind(this, this.fetchSubjectcodes))
                    .then(angular.bind(this, this.fetchCities));
            }

            return this.loaded;
        }
    };

    return service;
}

angular.module('superdesk.authoring.metadata', ['superdesk.authoring.widgets'])
    .config(['authoringWidgetsProvider', function(authoringWidgetsProvider) {
        authoringWidgetsProvider
            .widget('metadata', {
                icon: 'info',
                label: gettext('Info'),
                removeHeader: true,
                template: 'scripts/superdesk-authoring/metadata/views/metadata-widget.html',
                order: 1,
                side: 'right',
                display: {authoring: true, packages: true, killedItem: true, legalArchive: true, archived: true}
            });
    }])

    .controller('MetadataWidgetCtrl', MetadataCtrl)
    .service('metadata', MetadataService)
    .directive('sdMetaTerms', MetadataListEditingDirective)
    .directive('sdMetaDropdown', MetadataDropdownDirective)
    .directive('sdMetaWordsList', MetadataWordsListEditingDirective)
    .directive('sdMetadropdownFocus', MetadropdownFocusDirective)
    .directive('sdMetaLocators', MetadataLocatorsDirective);
})();
