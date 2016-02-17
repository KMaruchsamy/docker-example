import {Component} from 'angular2/core';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';

@Component({
    selector: 'reports',
    providers: [Auth],
    templateUrl: '../../templates/shared/page-footer.html',
    directives: [RouterLink]
})

export class PageFooter {
    constructor(public auth: Auth, public router: Router) {

    }
}