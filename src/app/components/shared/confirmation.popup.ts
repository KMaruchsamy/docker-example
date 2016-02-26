import {Component, Input, Output, EventEmitter, OnInit} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';

@Component({
    selector: 'confirmation-popup',
    providers: [],
    templateUrl: '../../templates/shared/confirmation.popup.html',
    directives: [RouterLink],
    inputs: ['cancelButtonText', 'okButtonText', 'message']
})

export class ConfirmationPopup implements OnInit {
    @Input() popupId: number;
    @Input() cancelButtonText:string;
    @Input() okButtonText:string;
    @Input() message: string;
    @Input() hideClose: boolean;
    @Output('onCancel') cancelEvent = new EventEmitter();
    @Output('onOK') okEvent = new EventEmitter();
    constructor(public router: Router) {

    }
    
    ngOnInit(): void{
    }

    onOK(e): void {
        this.okEvent.emit(e);
    }
    
    onCancel(e): void{
        this.cancelEvent.emit(e);
    }
    

}

	