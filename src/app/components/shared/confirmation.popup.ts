import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {Common} from '../../services/common';

@Component({
    selector: 'confirmation-popup',
    providers: [Common],
    templateUrl: 'templates/shared/confirmation.popup.html',
    directives: [ROUTER_DIRECTIVES]
})

export class ConfirmationPopup {
    @Input() popupId: number;
    @Input() cancelButtonText:string;
    @Input() okButtonText:string;
    @Input() message: string;
    @Input() hideClose: boolean;
    @Output('onCancel') cancelEvent = new EventEmitter();
    @Output('onOK') okEvent = new EventEmitter();
    constructor(public router: Router, public common: Common) {

    }

    onOK(e): void {
        this.okEvent.emit(this.popupId);
    }
    
    onCancel(e): void{
        this.cancelEvent.emit(this.popupId);
    }
    

}

	