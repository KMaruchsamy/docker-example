import {Component, OnInit, Input} from '@angular/core';
import {Router} from '@angular/router';
import { AuthService } from './../../services/auth.service';

@Component({
    selector: 'dropdown-menu',
    template: `<nav class="dropdown" [class.hidden]="hideDropdown" role="navigation" aria-label="primary">
	<div class="dropdown-container">
		<a href="javascript:void(0)"  id="lnkMenu"  role="button" class="dropdown-button" data-toggle="dropdown"  [attr.aria-disabled]="ariaDisabled" aria-haspopup="true">Main Menu</a>
		<ul class="dropdown-menu dropdown-select">
			<li><a [routerLink]="['/home']" class="menu-icon home-icon" >Home</a></li>
			<li><a [routerLink]="['/reports']" class="menu-icon reporting-icon" >View Reports</a></li>
			<li><a [routerLink]="['/rosters']" class="menu-icon student-icon" >View Rosters</a></li>
			<li><a [routerLink]="['/tests']" class="menu-icon test-icon" >Manage Tests</a></li>
			<li><a [routerLink]="['/account']" class="menu-icon manage-icon" >Manage Account</a></li>
			<li><a href="#" class="menu-icon sign-out-icon" (click)="logout($event);">Sign Out</a></li>
		</ul>
	</div>
</nav>`
})
export class DropdownMenuComponent implements OnInit {
    @Input() ariaDisabled;
    @Input() hideDropdown;
    constructor(public router: Router, public auth: AuthService) {
    }

    ngOnInit() {
        this.makeControlAccessible();
    }

    makeControlAccessible(): void {
        let toggle = 'a[data-toggle=dropdown]'
            , $par
            , firstItem
            , focusDelay = 200
            , menus = $(toggle).parent().find('ul').attr('role', 'menu')
            , lis = menus.find('li').attr('role', 'presentation');


        $(document).off('click.dropdown.data-api', 'header .dropdown-menu');
        $(document).off('focusout.dropdown.data-api', 'header .dropdown-menu');
        $(document).off('keydown.bs.dropdown.data-api', toggle + ', [role=menu]')

        lis.find('a').attr({ 'role': 'menuitem', 'tabIndex': '-1' })
        $(toggle).attr({ 'aria-haspopup': 'true', 'aria-expanded': 'false' })


        $(toggle).parent().on('shown.bs.dropdown', function(e) {
            $par = $(this)
            let $toggle = $par.find(toggle)
            $toggle.attr('aria-expanded', 'true')
            $toggle.on('keydown.bs.dropdown', $.proxy(function(ev) {
                setTimeout(function() {
                    firstItem = $('header .dropdown-menu [role=menuitem]:visible', $par)[0]
                    try { firstItem.focus() } catch (ex) { }
                }, focusDelay)
            }, this))

        })

        $(toggle).parent().on('hidden.bs.dropdown', function(e) {
            $par = $(this)
            let $toggle = $par.find(toggle)
            $toggle.attr('aria-expanded', 'false')
        })

        $(document)
            .on('click.dropdown.data-api', 'header .dropdown-menu', function(e) {
                var $this = $(this)
                    , that = this
                if (!$.contains(that, document.activeElement)) {
                    $this.parent().removeClass('open')
                    $this.parent().find('[data-toggle=dropdown]').attr('aria-expanded', 'false')
                }
            });

        $(document)
            .on('focusout.dropdown.data-api', 'header .dropdown-menu', function(e) {
                let $this = $(this)
                    , that = this
                setTimeout(function() {
                    if (!$.contains(that, document.activeElement)) {
                        $this.parent().removeClass('open')
                        $this.parent().find('[data-toggle=dropdown]').attr('aria-expanded', 'false')
                    }
                }, 150)
            })
            .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]', $.fn.dropdown.Constructor.prototype.keydown)
    }

    logout(e) {
        // this.auth.logout();
        e.preventDefault();
        this.router.navigate(['/logout']);
    }
}