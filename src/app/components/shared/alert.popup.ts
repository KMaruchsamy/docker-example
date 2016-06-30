import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router-deprecated';
import {Common} from '../../services/common';

@Component({
    selector: 'alert-popup',
    providers: [Common],
    templateUrl: 'templates/shared/alert.popup.html',
    directives: [RouterLink]
})

export class AlertPopup implements OnInit {
    @Input() popupId: number;
    // @Input() cancelButtonText:string;
    @Input() okButtonText:string;
    @Input() message: string;
    @Input() hideClose: boolean;
    // @Output('onCancel') cancelEvent = new EventEmitter();
    @Output('onOK') okEvent = new EventEmitter();
    constructor(public router: Router, public common: Common) {

    }
    
    ngOnInit(): void{
    }

    onOK(e): void {
        this.okEvent.emit(e);
    }
    
    // onCancel(e): void{
    //     this.cancelEvent.emit(e);
    // }
    

}