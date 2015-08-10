import {Component, View} from 'angular2/angular2';
import {Router,RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {PasswordHeader} from '../password/password-header';


@Component({
    selector: 'set-password-first-time',
    viewInjector: [Auth,Common]
})
@View({
    templateUrl: '../../templates/password/set-password-first-time.html',
    directives:[PasswordHeader,RouterLink]
})

export class SetPasswordFirstTime {
    constructor(router: Router,auth:Auth,common:Common) {
        this.router = router;
        this.auth=auth;
        this.common=common;
        this.errorMessages="";
        this.successMessage="";
        this.getErrorMessages();
        this.config="";
        this.apiServer="";
        this.getConfig();
        this.reset();
        this.initialize();
    }
    
    initialize(){
        $('title').html('Kaplan Nursing | Change Password');
    }
    
    reset(){
       $('#newPassword').val('');
       $('#passwordConfirmation').val('');
       $('.error').hide();
        $('#homelink').css("display","none");
        $('#successmsg').css("display","none");
       $('#resetPassword').attr("disabled","true");
       $('#resetPassword').attr("aria-disabled","true");
    }   
    
    getErrorMessages(){
        let self = this;
        this.common.getErrorMessages().then(function(response) {
            return response.json();
        }).then(function(json) {
            console.log('parsed json', json)
            self.errorMessages = json;
            self.successMessage=json;
        }).catch(function(ex) {
            console.log('parsing failed', ex);
        });
    }
    getConfig(){
        let self = this;
        this.common.getConfig().then(function(response) {
            return response.json()
        }).then(function(json) {
            console.log('parsed json', json)            
            self.config = json
            self.getApiServer();
        }).catch(function(ex) {
            console.log('parsing failed', ex)
        });
    }
    getApiServer(){
        let configJSON = this.config;
        if(location.hostname.indexOf('localhost')>-1)
            this.apiServer = configJSON.links.api.local.server; 
        if(location.hostname.indexOf('dev')>-1)
            this.apiServer = configJSON.links.api.dev.server;
        if(location.hostname.indexOf('qa')>-1)
            this.apiServer = configJSON.links.api.qa.server;
    }
    onSetPasswordFirstTime(txtnPassword,txtcPassword,btnSetPassword,lnkhomeredirect,errorContainer,successcontainer,event){
        event.preventDefault();
        let self=this;
        let emailid=  self.auth.useremail;
        let newpassword=txtnPassword.value;
        let confirmpassword=txtcPassword.value;
        if(this.validate(newpassword,confirmpassword,btnSetPassword,lnkhomeredirect,errorContainer,successcontainer))
        { 
            let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.settemporarypasswordapi;
            let promise = this.auth.settemporarypassword(apiURL,emailid,newpassword);
            promise.then(function(response) {
                return response.status;
            }).then(function(status) {
                if (status===200) {debugger;
                    txtnPassword.value="";
                    txtcPassword.value="";
                    sessionStorage.setItem('istemppassword', false);
                    self.showSuccess(self.successMessage.temp_password.newpass_success,successcontainer,lnkhomeredirect,btnSetPassword);
                }
                else {			
                    self.showError(self.errorMessages.temp_password.valid_emailid,errorContainer);	
                }
            }).catch(function(ex) {
                self.showError(self.errorMessages.general.exception,errorContainer);
            });
        }
    }

    RedirectToLogin(event) {
        event.preventDefault(); 
        this.router.parent.navigate('/login');    
    }
    RedirectToHome(event) {
        event.preventDefault(); 
        this.router.parent.navigate('/home');    
    }

    validate(newpassword,confirmpassword,btnSetPassword,lnkhomeredirect,errorContainer,successContainer){
        this.clearError(errorContainer,successContainer,lnkhomeredirect);
        if(!this.comparePasswords(newpassword,confirmpassword)){
            this.showError(this.errorMessages.temp_password.newpass_match,errorContainer);
            return false;
        }else if(!this.validateLength(newpassword)){
            this.showError(this.errorMessages.temp_password.newpass_character_count,errorContainer);
            return false;
        } else if(!this.validateSpecialCharacterCount(confirmpassword) && !this.validateNumberCount(confirmpassword) ){
            this.showError(this.errorMessages.temp_password.newpass_number_specialcharacter_validation,errorContainer);
            return false;
        } else if(!this.validateSpecialCharacterCount(confirmpassword)){
            this.showError(this.errorMessages.temp_password.newpass_specialcharacter_validation,errorContainer);
            return false;
        }   else if(!this.validateNumberCount(confirmpassword)){
            this.showError(this.errorMessages.temp_password.newpass_number_validation,errorContainer);
            return false;
        }       
       
        return true;
    }

    validateLength(password){
        if(password.length<8)
            return false;
        return true;
    }
    validateSpecialCharacterCount(password){
        var regexItem = new RegExp("^[a-zA-Z0-9 ]*$");
        if(regexItem.exec(password))
            return false;
        return true;
    }
    validateNumberCount(password){
        if(password.search(/\d/) == -1)
            return false;
        return true;
    }

    comparePasswords(newpassword,confirmpassword){
        if(newpassword===confirmpassword)
            return true;
        return false;
    }
    clearError(errorContainer,successContainer,lnkhomeredirect){
        $(lnkhomeredirect).css("display","none");
        $(successContainer).css("display","none");
        let $container = $(errorContainer).find('span#spnErrorMessage');
        let $outerContainer = $(errorContainer);
        $container.html('');
        $outerContainer.hide();
    }

    showError(errorMessage,errorContainer){
        let $container = $(errorContainer).find('span#spnErrorMessage');
        let $outerContainer = $(errorContainer);
        $container.html(errorMessage);
        $outerContainer.show();
    }
    showSuccess(SuccessMessage,successContainer,lnkhomeredirect,btnSetPassword){
        $(lnkhomeredirect).css("display","block");
        $(btnSetPassword).attr("disabled","true");
        $(btnSetPassword).attr("aria-disabled","true");
        $(successContainer).css("display","inline-block");
    }
    checkpasswordlength(txtNewpassword,txtConfirmPassword,btnSetPassword,event){
        let newpassword=txtNewpassword.value;
        let confirmpassword=txtConfirmPassword.value;
        if(newpassword.length>0 && confirmpassword.length>0){
            $(btnSetPassword).removeAttr("disabled");
            $(btnSetPassword).attr("aria-disabled","false");
        }
        else{
            $(btnSetPassword).attr("disabled","true");
            $(btnSetPassword).attr("aria-disabled","true");
        }
    }
}