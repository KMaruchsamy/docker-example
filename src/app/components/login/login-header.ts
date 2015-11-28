import {View,Component} from 'angular2/angular2';

@Component({
	selector:'login-header'
})
@View({
	templateUrl:'../../templates/login/login-header.html'
})

export class LoginHeader{
    constructor(){}

    closeMessage(spnMessage):void{        
        $(spnMessage).closest('.alert').slideUp(function(){
            $(this).addClass('hidden');
        });
    }
}




