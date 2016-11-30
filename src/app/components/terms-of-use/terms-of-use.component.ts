import { Component, OnInit, Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
// import { Http, Response, Headers, RequestOptions } from '@angular/http';
// import { NgIf } from '@angular/common';
// import {AuthService} from '../../services/auth';
// import {CommonService} from '../../services/common';
import { links } from '../../constants/config';
import { UtilityService } from '../../services/utility.service';
import { Observable, Subscription } from 'rxjs/Rx';
import { Angulartics2On } from 'angulartics2';
import { AuthService } from './../../services/auth.service';
import { CommonService } from './../../services/common.service';

@Component({
    selector: 'terms-of-use',
    templateUrl: './terms-of-use.component.html',
    encapsulation: ViewEncapsulation.None,
    styles: [`  
    .modal-full-screen {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 99999999999;
        -webkit-overflow-scrolling: touch;
        outline: 0; 
    }
    .modal-full-screen {
    background-color: #fff;
    overflow: auto; 
    }
    .modal-full-screen .close {
        position: absolute;
        top: 17px;
        right: 17px; 
    }
    .terms {
        height: 400px;
        overflow: auto;
        padding: 15px 15px 20px 15px;
        border: 2px solid gainsboro;
        border-radius: 4px;
    }
    .branding-logo {
      margin-bottom: .25em;     
      margin-top: 0;
    }
    @media (min-height: 800px) {
        .terms {
            height: 600px;
        }
        .branding-logo {
            margin-bottom: .5em;
            margin-top: .25em;
        }
    }
    header > h1 {
      margin-bottom: 0;
    }
    .agree-button {
      padding: .8em 3em;
      margin-top: 1.5em;
      margin-bottom: 1em;
    }`]
})
export class TermsOfUseComponent {

    termSubscription: Subscription;
    @Input() showTerms: boolean;
    @Input() showCancel: boolean;
    @Input() showCheckbox: boolean;
    @Input() buttonText: string;
    @Input() showX: boolean;
    @Input() termsAccepted: boolean = false;
    @Output() buttonEvent = new EventEmitter();
    @Output() cancelEvent = new EventEmitter();
    @Output() closeEvent = new EventEmitter();
    constructor() {
    }

    clickButton(e): void {
        this.buttonEvent.emit(e);
    }

    cancel(e): void {
        this.cancelEvent.emit(e);
    }

    closeModal(e): void {
        this.closeEvent.emit(e);
    }

    onAccept(accepted: boolean) {
        this.termsAccepted = accepted;
    }

}
