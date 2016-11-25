import {Component, provide, enableProdMode, ComponentRef} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {Title} from '@angular/platform-browser';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {HTTP_PROVIDERS} from '@angular/http';
import {ExceptionHandler} from '@angular/core';
import {MyExceptionHandler} from './scripts/myexception-handler';
import {Angulartics2} from 'angulartics2';
import {APP_ROUTES_PROVIDER} from './app.routes';
import { AppComponent } from './app.component';
import { SharedDeactivateGuard } from './guards/shared.deactivate.guard';
import { LogService } from './services/log.service';
import { AuthService } from './services/auth.service';
import { RosterChangesModel } from './models/roster-changes.model';

enableProdMode();


bootstrap(AppComponent, [
    SharedDeactivateGuard,
    APP_ROUTES_PROVIDER,
    HTTP_PROVIDERS,
    provide(ExceptionHandler, { useClass: MyExceptionHandler }),
    Angulartics2,
    Title,
    LogService,
    AuthService,
    RosterChangesModel
])
