import {Component, provide, enableProdMode, ComponentRef} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {HTTP_PROVIDERS} from '@angular/http';
import {ExceptionHandler} from '@angular/core';
import {MyExceptionHandler} from './scripts/myexception-handler';
import {Angulartics2} from 'angulartics2';
import {App} from './app';

enableProdMode();

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide(ExceptionHandler, { useClass: MyExceptionHandler }),
    Angulartics2
])