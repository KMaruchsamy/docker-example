import {Component,Input, OnInit} from 'angular2/core';
import {NgClass} from 'angular2/common';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {DropdownMenu} from '../controls/dropdown-menu';


@Component({
	selector:'page-header',
    providers:[Auth],
    inputs:['showCover','ariaDisabled', 'hideDropdown'],
    templateUrl:'../../templates/shared/page-header.html',
    directives: [RouterLink,DropdownMenu,NgClass]
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

	