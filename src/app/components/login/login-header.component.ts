import {Component} from '@angular/core';

@Component({
	selector:'login-header',
	templateUrl:'./login-header.component.html'
})

export class LoginHeaderComponent{
    sitewideAlert: boolean = false;
    constructor(){}

    closeMessage(spnMessage):void{        
        $(spnMessage).closest('.alert').slideUp(function(){
            $(this).addClass('hidden');
        });
    }
}




