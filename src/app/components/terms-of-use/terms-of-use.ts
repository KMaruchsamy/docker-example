import {Component, OnInit, Input, Output, ViewEncapsulation, EventEmitter} from '@angular/core';
import {Router, ROUTER_DIRECTIVES, CanActivate} from '@angular/router';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {NgIf} from '@angular/common';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {links} from '../../constants/config';
import {Utility} from '../../scripts/utility';
import {Observable, Subscription} from 'rxjs/Rx';
import {Angulartics2On} from 'angulartics2';

@Component({
    selector: 'terms-of-use',
    templateUrl: 'templates/terms-of-use/terms-of-use.html',
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
        height: 450px;
        overflow: auto;
        padding: 15px 15px 20px 15px;
        border: 2px solid gainsboro;
        border-radius: 4px;
    }
    @media (min-height: 800px) {
        .terms {
            height: 600px;
        }
    }
    header > h1 {
      margin-bottom: 0;
    }
    .branding-logo {
      margin-bottom: .5em;
      margin-top: .25em;
    }
    .agree-button {
      padding: .8em 3em;
      margin-top: 1.5em;
      margin-bottom: 1em;
    }`],
    providers: [Auth, Utility, Common],
    directives: [ROUTER_DIRECTIVES, Angulartics2On]
})
export class TermsOfUse {
    
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
    constructor(private http: Http, public router: Router, public auth: Auth, public common: Common) {
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

    onAccept(accepted:boolean) {
       this.termsAccepted = accepted;
    }

}
