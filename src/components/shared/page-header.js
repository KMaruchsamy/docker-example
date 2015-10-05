import {View,Component} from 'angular2/angular2';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {DropdownMenu} from '../controls/dropdown-menu';


@Component({
	selector:'page-header',
    viewBindings:[Auth]
})
@View({
    templateUrl:'../../templates/shared/page-header.html',
    directives: [RouterLink,DropdownMenu]
})

export class PageHeader{
    constructor(router: Router,auth : Auth){       
        this.router=router;
        this.auth = auth;
    }
}

	