import {Component, View} from 'angular2/angular2';
import {Router, RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import '../../plugins/dropdown.js';

@Component({
  selector: 'dropdown-menu',
  inputs: ['ariaDisabled']
})
@View({
  templateUrl: '../../templates/controls/dropdown-menu.html',
  directives: [RouterLink]
})
export class DropdownMenu {
  constructor(public router: Router, public auth: Auth) {
    this.auth = new Auth(); 
  }
  
  ngOnInit():void {
    var toggle = '[data-toggle=dropdown]'
      , $par
      , firstItem
      , focusDelay = 200
      , menus = $(toggle).parent().find('ul').attr('role', 'menu')
      , lis = menus.find('li').attr('role', 'presentation');


    $(document).off('click.dropdown.data-api', '.dropdown-menu');
    $(document).off('focusout.dropdown.data-api', '.dropdown-menu');
    $(document).off('keydown.bs.dropdown.data-api', toggle + ', [role=menu]')

    lis.find('a').attr({ 'role': 'menuitem', 'tabIndex': '-1' })
    $(toggle).attr({ 'aria-haspopup': 'true', 'aria-expanded': 'false' })


    $(toggle).parent().on('shown.bs.dropdown', function (e) {
      $par = $(this)
      var $toggle = $par.find(toggle)
      $toggle.attr('aria-expanded', 'true')
      $toggle.on('keydown.bs.dropdown', $.proxy(function (ev) {
        setTimeout(function () {
          firstItem = $('.dropdown-menu [role=menuitem]:visible', $par)[0]
          try { firstItem.focus() } catch (ex) { }
        }, focusDelay)
      }, this))

    })

    $(toggle).parent().on('hidden.bs.dropdown', function (e) {
      $par = $(this)
      var $toggle = $par.find(toggle)
      $toggle.attr('aria-expanded', 'false')
    })

    $(document)
      .on('click.dropdown.data-api', '.dropdown-menu', function (e) {
        var $this = $(this)
          , that = this        
          if (!$.contains(that, document.activeElement)) {
            $this.parent().removeClass('open')
            $this.parent().find('[data-toggle=dropdown]').attr('aria-expanded', 'false')
          }       
      });

    $(document)
      .on('focusout.dropdown.data-api', '.dropdown-menu', function (e) {
        var $this = $(this)
          , that = this
        setTimeout(function () {
          if (!$.contains(that, document.activeElement)) {
            $this.parent().removeClass('open')
            $this.parent().find('[data-toggle=dropdown]').attr('aria-expanded', 'false')
          }
        }, 150)
      })
      .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]', $.fn.dropdown.Constructor.prototype.keydown)
  }

  onDestroy() {
    // Speak now or forever hold your peace
  }
  onCheck() {
    // Called right after our bindings have been checked
  }
  onChange(changes) {
    // Called right after our bindings have been checked but only
    // if one of our bindings has changed.
    //
    // changes is an object of the format:
    // {
    //   'prop': PropertyUpdate
    // }
	
  }
  onAllChangesDone() {
    // Called right after all of our bindings have been checked
  }

  logout() {
    this.auth.logout();
    this.router.parent.navigateByUrl('/');
  }
}