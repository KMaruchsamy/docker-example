import {View, Component} from 'angular2/angular2';
import {Router, RouterLink} from 'angular2/router';

@Component({
    selector: 'page-footer'
})
@View({
    templateUrl: '../../templates/shared/page-footer.html',
    directives: [RouterLink]
})

export class PageFooter {
    constructor() { }
}

	