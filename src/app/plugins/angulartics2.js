var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var ReplaySubject_1 = require('rxjs/subject/ReplaySubject');
var router_1 = require('angular2/router');
var Angulartics2 = (function () {
    function Angulartics2(router, location) {
        var _this = this;
        this.settings = {
            pageTracking: {
                autoTrackVirtualPages: true,
                basePath: '',
                excludedRoutes: []
            },
            eventTracking: {},
            developerMode: false
        };
        /*
            @Param: ({url: string, location: Location})
         */
        this.pageTrack = new ReplaySubject_1.ReplaySubject();
        /*
            @Param: ({action: any, properties: any})
         */
        this.eventTrack = new ReplaySubject_1.ReplaySubject();
        /*
            @Param: (properties: any)
         */
        this.exceptionTrack = new ReplaySubject_1.ReplaySubject();
        /*
            @Param: (alias: string)
         */
        this.setAlias = new ReplaySubject_1.ReplaySubject();
        /*
            @Param: (userId: string)
         */
        this.setUsername = new ReplaySubject_1.ReplaySubject();
        /*
            @Param: ({action: any, properties: any})
         */
        this.setUserProperties = new ReplaySubject_1.ReplaySubject();
        /*
            @Param: (properties: any)
         */
        this.setUserPropertiesOnce = new ReplaySubject_1.ReplaySubject();
        /*
            @Param: (properties: any)
         */
        this.setSuperProperties = new ReplaySubject_1.ReplaySubject();
        /*
            @Param: (properties: any)
         */
        this.setSuperPropertiesOnce = new ReplaySubject_1.ReplaySubject();
        /*
            @Param: (properties: any)
         */
        this.userTimings = new ReplaySubject_1.ReplaySubject();
        setTimeout(function () {
            _this.spyRouter(router, location);
        });
    }
    Angulartics2.prototype.spyRouter = function (router, location) {
        var _this = this;
        router.subscribe(function (route) {
            if (!_this.settings.developerMode) {
                setTimeout(function () {
                    var url = location.prepareExternalUrl(route);
                    if (_this.settings.pageTracking.autoTrackVirtualPages && !_this.matchesExcludedRoute(url)) {
                        _this.pageTrack.next({
                            path: _this.settings.pageTracking.basePath.lenght ? _this.settings.pageTracking.basePath + route : location.prepareExternalUrl(url),
                            location: location
                        });
                    }
                });
            }
        });
        if (!this.settings.developerMode) {
            if (this.settings.pageTracking.autoTrackVirtualPages && !this.matchesExcludedRoute(location.path())) {
                this.pageTrack.next({
                    path: this.settings.pageTracking.basePath.lenght ? this.settings.pageTracking.basePath + location.path() : location.prepareExternalUrl(location.path()),
                    location: location
                });
            }
        }
    };
    Angulartics2.prototype.virtualPageviews = function (value) {
        this.settings.pageTracking.autoTrackVirtualPages = value;
    };
    Angulartics2.prototype.excludeRoutes = function (routes) {
        this.settings.pageTracking.excludedRoutes = routes;
    };
    Angulartics2.prototype.firstPageview = function (value) {
        this.settings.pageTracking.autoTrackFirstPage = value;
    };
    Angulartics2.prototype.withBase = function (value) {
        this.settings.pageTracking.basePath = (value);
    };
    Angulartics2.prototype.developerMode = function (value) {
        this.settings.developerMode = value;
    };
    Angulartics2.prototype.matchesExcludedRoute = function (url) {
        for (var _i = 0, _a = this.settings.pageTracking.excludedRoutes; _i < _a.length; _i++) {
            var excludedRoute = _a[_i];
            if ((excludedRoute instanceof RegExp && excludedRoute.test(url)) || url.indexOf(excludedRoute) > -1) {
                return true;
            }
        }
        return false;
    };
    Angulartics2 = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [router_1.Router, router_1.Location])
    ], Angulartics2);
    return Angulartics2;
})();
exports.Angulartics2 = Angulartics2;
//# sourceMappingURL=angulartics2.js.map