import {Component, OnInit, Input} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {Auth} from '../../services/auth';
// import '../../plugins/dropdown.js';

@Component({
    selector: 'dropdown-menu',
    inputs: ['ariaDisabled'],
    templateUrl: 'templates/controls/dropdown-menu.html',
    providers:[Auth],
    directives: [ROUTER_DIRECTIVES]
})
export class DropdownMenu implements OnInit {
    @Input() ariaDisabled;
    @Input() hideDropdown;
    constructor(public router: Router, public auth: Auth) {
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