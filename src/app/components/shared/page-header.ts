import {Component,Input, OnInit} from '@angular/core';
import {NgClass} from '@angular/common';
import {Router, RouterLink, ROUTER_DIRECTIVES,RouterLinkActive} from '@angular/router';
import {Auth} from '../../services/auth';
import {DropdownMenu} from '../controls/dropdown-menu';


@Component({
	selector:'page-header',
    providers:[Auth],
    inputs:['showCover','ariaDisabled', 'hideDropdown'],
    templateUrl:'templates/shared/page-header.html',
    directives: [ROUTER_DIRECTIVES,DropdownMenu,NgClass,RouterLinkActive]
})

export class PageHeader implements OnInit{
    @Input() showCover:boolean;
    @Input() ariaDisabled: boolean;
    @Input() hideDropdown: boolean;
    constructor(public router: Router,public auth : Auth ){
        //public inputs will not be available here .. will be bound in the onInit event
    }
    
    ngOnInit():void{
    }
}

	