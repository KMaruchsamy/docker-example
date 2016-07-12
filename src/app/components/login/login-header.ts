import {Component} from '@angular/core';

@Component({
	selector:'login-header',
	templateUrl:'templates/login/login-header.html'
})

export class LoginHeader{
    constructor(){}

    closeMessage(spnMessage):void{        
        $(spnMessage).closest('.alert').slideUp(function(){
            $(this).addClass('hidden');
        });
    }
}




