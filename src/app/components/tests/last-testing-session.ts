import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router-deprecated';
import {Common} from '../../services/common';
import {Auth} from '../../services/auth';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {TestService} from '../../services/test.service';


@Component({
    selector: 'last-testing-session',
    templateUrl: 'templates/tests/last-testing-session.html',
    directives: [RouterLink, PageHeader, PageFooter]
})
export class LastTestingSession{
}