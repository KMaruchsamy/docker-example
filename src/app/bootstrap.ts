import {Component, provide, enableProdMode, ComponentRef} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {Title} from '@angular/platform-browser';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {HTTP_PROVIDERS} from '@angular/http';
import {ExceptionHandler} from '@angular/core';
import {MyExceptionHandler} from './scripts/myexception-handler';
import {Angulartics2} from 'angulartics2';
import {App} from './app';
import {APP_ROUTES_PROVIDER} from './app.routes';
import {SharedDeactivateGuard} from './components/shared/shared.deactivate.guard';

enableProdMode();


bootstrap(App, [
    SharedDeactivateGuard,
    APP_ROUTES_PROVIDER,
    HTTP_PROVIDERS,
    provide(ExceptionHandler, { useClass: MyExceptionHandler }),
    Angulartics2,
    Title    
])
