app.controller('AlertController', function(
    $scope,
    $window,
    $routeParams,
    AlertMetricsService,
    AlertTransformer,
    AlertWebsocketService
) {
    $scope.alert = AlertMetricsService;
    $scope.alertWebsocket = AlertWebsocketService;

    $scope.loaded = {
        data: false
    };

    $scope.$on('dataLoaded', function() {
        $scope.loaded.data = true;

        // It seems promises causes some issues with Angular. Need to apply the scope to kick it in the nuts.
        $scope.$apply();

        // Alert Countdown && websocket subscription
        if ($scope.alert.details.ended == 0) {
            // Subscribe to alert websocket
            $scope.alertWebsocket.initAndSubscribe($scope.alert.details.id);
        }

        console.log($scope.alert.parsed.players);
        var pl = $('#player-leaderboard').DataTable({
            data: $scope.alert.parsed.players,
            columns: [
                {data: 'name', title: 'Player', className: 'name'},
                {data: 'outfit', title: 'Outfit', className: 'outfit'},
                {data: 'kills', title: 'Kills', className: 'metric'},
                {data: 'deaths' , title: 'Deaths', className: 'metric'},
                {data: 'kd' , title: 'K/D', className: 'metric'},
                {data: 'teamkills', title: 'TKs', className: 'metric'},
                {data: 'suicides', title: 'Suicides', className: 'metric'},
                {data: 'headshots', title: 'Headshots', className: 'metric'},
                {data: 'hsr', title: 'HS %', className: 'metric hsr'},
                {data: 'kpm', title: 'KPM', className: 'metric kpm'},
                {data: 'dpm', title: 'DPM', className: 'metric dpm'},
                {data: 'factionAbv', visible: false},
                {data: 'outfitTag', visible: false},
                {data: 'id', visible: false}
            ],
            order:          [2, 'desc'],
            deferRender:    true,
            scrollY:        450,
            scrollCollapse: true,
            scroller:       true,
            rowCallback: function(row, data) {
                // Format the faction colors
                if (data.factionAbv !== null) {
                    $('.name', row).addClass(data.factionAbv + '-table-text');
                    $('.outfit', row).addClass(data.factionAbv + '-table-text');
                }

                // Add outfit tags
                if (data.outfitTag !== null) {
                    $('.outfit', row).html('[' + data.outfitTag + '] ' + data.outfit);
                }
                $('.hsr', row).html(data.hsr + '%');
            }
        });

        // Mother of all hacks to add position numbers on
        // Fucked - very VERY messy!
        /*pl.on('draw order.dt', function() {
            pl.column(0).nodes().each(function(cell, i) {
                var pos = i + 1;
                if (!_.startsWith(cell.innerHTML, '#')) {
                    // If doesn't have a hash, just add it with the number
                    cell.innerHTML = '#' + pos + ' ' + cell.innerHTML;
                } else {
                    // Otherwise, we need to regex out the trailing numbers
                    _.replace(cell.innerHTML, '/(?:#)[0-9]+\s/g', '#' + pos);
                }
            });
        }).draw('full-hold');*/

        var ol = $('#outfit-leaderboard').DataTable({
            data: $scope.alert.parsed.outfits,
            columns: [
                {data: 'name', title: 'Outfit', className: 'name'},
                {data: 'participants', title: 'Players', className: 'metric'},
                {data: 'kills', title: 'Kills', className: 'metric'},
                {data: 'deaths', title: 'Deaths', className: 'metric'},
                {data: 'kd', title: 'K/D *', className: 'metric kd'},
                {data: 'teamkills', title: 'TKs', className: 'metric'},
                {data: 'suicides', title: 'Suicides', className: 'metric'},
                {data: 'killsPerParticipant', title: 'Kills PP', className: 'metric killsPP'},
                {data: 'deathsPerParticipant', title: 'Deaths PP', className: 'metric deathsPP'},
                {data: 'kpm', title: 'KPM', className: 'metric kpm'},
                {data: 'dpm', title: 'DPM', className: 'metric dpm'},
                {data: 'captures', title: 'Caps', className: 'metric caps'},
                {data: 'tag', title: 'Tag', className: 'metric', visible: false},
                {data: 'factionAbv', visible: false}
            ],
            order:          [2, 'desc'],
            deferRender:    true,
            scrollY:        450,
            scrollCollapse: true,
            scroller:       true,
            rowCallback: function(row, data) {
                // Format the faction colors
                if (data.factionAbv !== null) {
                    $('.name', row).addClass(data.factionAbv + '-table-text');
                }

                // Add outfit tags
                if (data.tag !== null) {
                    $('.name', row).html('[' + data.tag + '] ' + data.name);
                }
            }
        });

        var wl = $('#weapon-leaderboard').DataTable({
            data: $scope.alert.parsed.weapons,
            columns: [
                {data: 'name', title: 'Weapon', className: 'name'},
                {data: 'kills', title: 'Kills', className: 'metric'},
                {data: 'teamkills', title: 'TKs', className: 'metric'},
                {data: 'headshots' , title: 'Headshots', className: 'metric'},
                {data: 'hsr' , title: 'HS %', className: 'metric hsr'},
                {data: 'kpm', title: 'KPM', className: 'metric kpm'},
                {data: 'vehicle', visible: false},
                {data: 'faction' , visible: false}
            ],
            order:          [1, 'desc'],
            deferRender:    true,
            scrollY:        450,
            scrollCollapse: true,
            scroller:       true,
            rowCallback: function(row, data) {
                var vehicle = ' [I]';
                // Format the cells
                if (data.factionAbv !== null) {
                    $('.name', row).addClass(data.factionAbv + '-table-text');
                }

                if (data.vehicle === 1) {
                    vehicle = ' [V]';
                }

                $('.name', row).html(data.name + vehicle);
                $('.hsr', row).html(data.hsr + '%');
            }
        });

        var vl = $('#vehicle-leaderboard').DataTable({
            data: $scope.alert.parsed.vehicles,
            columns: [
                {data: 'name', title: 'Vehicle', className: 'name'},
                {data: 'kills', title: 'Kills', className: 'metric'},
                {data: 'kd', title: 'K/D (total)', className: 'metric kd'},
                {data: 'killsI', title: 'Inf Kills', className: 'metric'},
                {data: 'killsV', title: 'Veh Kills', className: 'metric'},
                {data: 'deaths', title: 'Deaths', className: 'metric'},
                {data: 'deathsI', title: 'Inf Deaths *', className: 'metric'},
                {data: 'deathsV', title: 'Veh Deaths', className: 'metric'},
                {data: 'bails', title: 'Ejections', className: 'metric'},
                {data: 'kpm', title: 'KPM', className: 'metric kpm'},
                {data: 'dpm', title: 'DPM', className: 'metric dpm'},
                {data: 'factionAbv', visible: false},
                {data: 'type', visible: false}
            ],
            order:          [1, 'desc'],
            deferRender:    true,
            scrollY:        450,
            scrollCollapse: true,
            scroller:       true,
            rowCallback: function(row, data) {
                // Format the cells
                if (data.factionAbv !== null) {
                    $('.name', row).addClass(data.factionAbv + '-table-text');
                }
            }
        });

        $(document).ready(function() {
            $('ul.tabs').tabs();
        });

        $(document).ready(function() {
            $('.jumpto').on('click', function() {
                var selector = $(this).attr('data-jumpto');
                var element  = $(selector);
                $('html, body').animate({
                    scrollTop: element.offset().top - 10
                }, 300);
            });
        });

        // Simulate a player leaderboard click as it's opened by default
        var options = {
            hitType: 'event',
            eventCategory: 'Alert',
            eventAction: 'Leaderboards Initial'
        };
        ga('send', options);
    });

    $scope.getTopFacilityOutfit = function() {
        var obj = _.orderBy($scope.alert.parsed.facilities, ['captures'], ['desc']);
    };

    // Instantiate the service
    $scope.alert.init($routeParams.alert);

    $scope.filterByProp = function(prop, val) {
        return function(item) {
            return item[prop] > val;
        };
    };

    // Once we have the correct time, set the clock
    $scope.$on('timeSync', function(event, data) {
        console.log(data);
        data.correctTime++; // To match RTM
        $('#alert-countdown').countdown(data.correctTime * 1000, function(event) {
            $(this).html(event.strftime('%H:%M:%S'));
        });

        // Calculate remaining duration for KPM / DPM
        var startedTime = $scope.alert.details.started / 1000;
        var duration = (data.correctTime - data.remaining - startedTime); // Elapsed time in seconds

        $scope.$apply(function() {
            $scope.alert.metrics.durationMins = duration / 60;
        });
    });

    // Listen for broadcasts from the AlertMetricsService and change the DOM based upon those messages
    $scope.$on('combatMessage', function(event, data) {
        $scope.parseCombatMessage(AlertTransformer.transformCombatMessage(data.data));
    });

    $scope.$on('facilityMessage', function(event, data) {
        $scope.parseFacilityMessage(AlertTransformer.transformFacilityMessage(data.data));
    });

    $scope.$on('alertEnd', function(event, data) {
        $scope.parseAlertEndMessage(AlertTransformer.transformAlertEndMessage(data.data));
    });

    /* PARSING FUNCTIONS */
    $scope.parseCombatMessage = function(message) {
        $scope.$apply(function() {
            $scope.alert.increaseCombatKills(message);
            $scope.alert.processPlayerMetrics(message).then(function() {
            });
        });
    };

    $scope.parseFacilityMessage = function(message) {
        $scope.$apply(function() {
            $scope.alert.processMapCapture(message);
        });
    };

    $scope.parseAlertEndMessage = function(message) {
        $scope.$apply(function() {
            $scope.alert.processEndAlert(message);
        });
    };
});
