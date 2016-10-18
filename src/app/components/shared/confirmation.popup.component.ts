import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import { CommonService } from './../../services/common.service';

@Component({
    selector: 'confirmation-popup',
    providers: [CommonService],
    templateUrl: 'components/shared/confirmation.popup.component.html',
    directives: [ROUTER_DIRECTIVES]
})

export class ConfirmationPopupComponent {
    @Input() popupId: number;
    @Input() cancelButtonText:string;
    @Input() okButtonText:string;
    @Input() message: string;
    @Input() hideClose: boolean;
    @Output('onCancel') cancelEvent = new EventEmitter();
    @Output('onOK') okEvent = new EventEmitter();
    constructor(public router: Router, public common: CommonService) {

    }

    onOK(e): void {
        this.okEvent.emit(this.popupId);
    }
    
    onCancel(e): void{
        this.cancelEvent.emit(this.popupId);
    }
    

}

	