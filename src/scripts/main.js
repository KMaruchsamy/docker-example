$(document).ready(function(){

  //Dropdown Menu
  $(".dropdown-button").on('click', function() {
    $(".dropdown-menu").toggleClass("show-menu");
  });

  $('main').not(".dropdown-button").on('click', function() {
    if ($('.dropdown-menu, .dropdown-button').hasClass('show-menu')) {
      $('.dropdown-menu').removeClass('show-menu') ;
    }
  });
//    $(".dropdown-menu").toggleClass("show-menu");
 //});
  //$(".dropdown-menu > li").click(function(){
  //$("body").not('.dropdown').on('click', function() {
//   $(".dropdown-menu").toggleClass("show-menu");
//  });

  //$(".dropdown-menu > li").click(function(){
  //$(".dropdown-menu").removeClass("show-menu");

 //Disable button
  $('.required-input').change(function(){
    if ($('.required-input:checked').length > 0)
    {
      $('.required-value-btn').removeClass('button--disabled');
    } else {
      $('.required-value-btn').addClass('button--disabled');
    }
  });

  //Disable button
   $('.required-input').on('change paste keyup',function(e){
     if ($('.required-input').length > 0)
     {
       $('.required-value-btn').removeClass('button--disabled');
     } else {
       e.preventDefault();
       $('.required-value-btn').addClass('button--disabled');
     }
   });


  //Password confirmation validation
  $('#reset-password').on('click', function(e){
    if ($('#new-password').val().length <= 0 && $('#password-confirmation').val().length <= 0) {
      e.preventDefault();
    }
    else if ($('#new-password').val() === $('#password-confirmation').val()) {
      $('.error').text('Your password has been reset').removeClass('error').addClass('teal').show();
      e.preventDefault();
    } else {
      $('.error').text('Your new passwords must match. Please try again.')
                  .show();
                  e.preventDefault();
    }

  });


  //Save changes on profile
  $('#personal-info-form input').on('change paste keyup',function(){
    $('#personal-info-form').find('button').removeClass('button--disabled');
  });

  //Login
  $('#faculty-signin').on('click', function(e){
     e.preventDefault();
     if (($('#username').val() == 'nursing@test.edu' ) && ($('#password').val() == 'faculty123') && ($('#faculty_site').prop('checked'))) {
      window.location.href = 'faculty-home.html';
     }
     else if  (($('#username').val() == 'nursing@test.edu' ) && ($('#password').val() == 'faculty123') && ($('#student_site').prop('checked'))) {
      window.location.href = 'http://nursing.kaplan.com/s_login.aspx';
     }
  });

  //Settings - edit basic info

  $('#edit-basic-info-btn').click(function(){
    var $this = $(this);
    $this.toggleClass('dynamic-text');
    if ($this.hasClass('dynamic-text')) {
      $this.text('Edit basic information');
    } else {
      $this.text('Save basic information');
    }
    $('#edit-basic-info, #save-basic-info').slideToggle('slow');

  });

  //Close/hide

  $('.close-icon').click(function(){
    $(this).closest('.container--purple').slideToggle('slow');
  });


  //Expand section
  var expanderTrigger = document.getElementById("js-expander-trigger");
  var expanderContent = document.getElementById("js-expander-content");

   $('#js-expander-trigger').click(function(){
     $(this).toggleClass("expander-hidden");
   });


   $('.student-roster').click(function(){
     var $this = $(this);
     $this.toggleClass('dynamic-text');
     if ($this.hasClass('dynamic-text')){
       $this.text('Hide student roster');
     } else {
       $this.text('Show student roster');
     }
   });

   //tabs
    $('.accordion-tabs-minimal').each(function(index) {
      $(this).children('li').first().children('a').addClass('is-active').next().addClass('is-open').show();
    });

    $('.accordion-tabs-minimal').on('click', 'li > a', function(event) {
      if (!$(this).hasClass('is-active')) {
        event.preventDefault();
        var accordionTabs = $(this).closest('.accordion-tabs-minimal');
        accordionTabs.find('.is-open').removeClass('is-open').hide();

        $(this).next().toggleClass('is-open').toggle();
        accordionTabs.find('.is-active').removeClass('is-active');
        $(this).addClass('is-active');
      } else {
        event.preventDefault();
      }
  });

  //Modal
   var referrer =  document.referrer;
   if (referrer === 'http://kaplantestprep.github.io/NursingIT.UX/index.html') {
     $(".modal").fadeIn('slow');
  }

  $(".modal-close, .modal-close-button").on("click", function() {
    $(".modal").hide();
  });

  $(".modal-inner").on("click", function(e) {
    e.stopPropagation();
  });

  //Sort/Hide Students
  $( ".button-group span" ).on("click", function() {
   var myClass = '.' + $(this).attr("id");
    console.log(myClass);
     if ((myClass) === '.all') {
       $(".student-list > div").show();
     } else {
   $(this).parents($('.expander-content')).find($(".student-list > div")).not(myClass).hide();
   $(myClass).show();
  };

  });



});
