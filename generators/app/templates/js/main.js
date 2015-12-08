/**
 *  main.js is responsible for the organization of features and cache control.
 *
 *  @author  <%= answers.username %>
 *  @date    <%= answers.date %>
 *
 */
'use strict';

define([
    'angular',
    'init/main',
    'ext/main',
    'config/main',
    'service/main',
    'features/main',
    'splash-screen'
], function(angular, Initializers, Extensions, Configurators, Services, Features, Splash) {

    require(['less/main.less']);

    var App = function() {
        this.appName = '<%= answers.name %>';
        this.features = [];
        Features.forEach(function(Feature) {
            this.features.push(new Feature());
        }, this);
    };

    App.prototype.findDependencies = function() {
        this.depends = Extensions.slice(0);
        var featureNames = this.features.filter(function(feature) {
            return feature.export;
        })
            .map(function(feature) {
                return feature.export;
            });
        this.depends.push(...featureNames);
        Array.prototype.push.apply(this.depends, featureNames);
    };

    App.prototype.beforeStart = function() {
        Initializers.forEach(function(Initializer) {
            (new Initializer(this.features)).execute();
        }, this);

        this.features.forEach(function(feature) {
            feature.beforeStart();
        });
    };

    App.prototype.createApp = function() {
        this.features.forEach(function(feature) {
            feature.execute();
        });
        this.app = angular.module(this.appName, this.depends);
    };

    App.prototype.configApp = function() {
        Configurators.forEach(function(Configurator) {
            (new Configurator(this.features, this.app)).execute();
        }, this);
    };

    App.prototype.registerService = function() {
        Services.forEach(function(Service) {
            (new Service(this.features, this.app)).execute();
        }, this);
    };

    App.prototype.destroySplash = function() {
        var _this = this;
        Splash.destroy();
        require('splash-screen/splash.min.css').unuse();
        setTimeout(function() {
            if (Splash.isRunning()) {
                _this.destroySplash();
            }
        }, 100);
    };

    App.prototype.launch = function() {
        angular.bootstrap(document, [this.appName]);
    };

    App.prototype.run = function() {
        this.findDependencies();
        this.beforeStart();
        this.createApp();
        this.configApp();
        this.registerService();
        this.destroySplash();
        this.launch();
    };

    return App;
});
