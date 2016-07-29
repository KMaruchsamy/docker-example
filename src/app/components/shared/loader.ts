import {Component, OnInit, Input} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {Auth} from '../../services/auth';
// import '../../lib/modal.js';

@Component({
    selector: 'loader',
    providers:[Auth],
    templateUrl: 'templates/shared/loader.html',
    directives: [ROUTER_DIRECTIVES],
    inputs:['loaderMessage','greetingMessage']
})

export class Loader implements OnInit{
    @Input() loaderMessage;
    @Input() greetingMessage;
    constructor(public auth: Auth, public router:Router) {
        
    }   
    
    ngOnInit(): void{
    }
   
}

	