import {View,Component,NgClass,Input} from 'angular2/angular2';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {DropdownMenu} from '../controls/dropdown-menu';


@Component({
	selector:'page-header',
    viewBindings:[Auth],
    inputs:['showCover','ariaDisabled']
})
@View({
    templateUrl:'../../templates/shared/page-header.html',
    directives: [RouterLink,DropdownMenu,NgClass]
})

export class PageHeader{
    constructor(public router: Router,public auth : Auth ){
        //public inputs will not be available here .. will be bound in the onInit event
    }
    
    onInit(){
        //public input available here
       //console.log(this.showCover);
    }
}

	