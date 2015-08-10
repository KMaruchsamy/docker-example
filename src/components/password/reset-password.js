import {Component, View} from 'angular2/angular2';
import {Router,Location,RouterLink} from 'angular2/router';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {PasswordHeader} from '../password/password-header';

@Component({
        selector: 'reset-password',
        viewInjector: [Auth,Common]
   
})
@View({
    templateUrl: '../../templates/password/reset-password.html',
    directives:[PasswordHeader,RouterLink]
})

export class ResetPassword {
    constructor(router: Router,auth:Auth,common:Common,location:Location) {
        this.location=location;
        this.router = router;
        this.auth=auth;
        this.common=common;
        this.errorMessages="";
        this.successMessage="";
        this.getErrorMessages();
        this.config="";
        this.apiServer="";
        this.getConfig();
        this.initialize();
    }
    
    initialize(){
        $('title').html('Kaplan Nursing | Reset Password');
    }
    
    getErrorMessages(){
        let self = this;
        this.common.getErrorMessages().then(function(response) {
            return response.json()
        }).then(function(json) {
            console.log('parsed json', json)
            self.errorMessages = json
            self.successMessage=json
        }).catch(function(ex) {
            console.log('parsing failed', ex)
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
    onResetPassword(txtnPassword,txtcPassword,btnResetPassword,lnkhomeredirect,errorContainer,successcontainer,event){
        event.preventDefault();
        let self=this;
        let newpassword=txtnPassword.value;
        let confirmpassword=txtcPassword.value;
        if(this.validate(newpassword,confirmpassword,btnResetPassword,lnkhomeredirect,errorContainer,successcontainer))
        { 
            let url=this.location.path();
            let encryptedExpiry=url.substr(url.lastIndexOf('/')+1);
            let urlOnlyId=url.substr(0,url.lastIndexOf('/'));
            let encryptedId=urlOnlyId.substr(urlOnlyId.lastIndexOf('/')+1);

            let decryptedId =this.decryption(encryptedId);
            let decryptedTime =this.decryption(encryptedExpiry);

            let currentTime=new Date();
            let isExpire=new Date(decryptedTime)-currentTime;

            if(isExpire<0)
            {alert('Page has been expired!');}
            else if(isExpire.toString()==="NaN")
            {alert('Please refresh the page and try once again.');}
            else{

                let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.settemporarypasswordapi;
                let promise = this.auth.settemporarypassword(apiURL,decryptedId,newpassword);
                promise.then(function(response) {
                    return response.status;
                }).then(function(status) {
                    if (status===200) {
                        txtnPassword.value="";
                        txtcPassword.value="";
                        self.AuthanticateUser(decryptedId,newpassword,'admin');
                        self.showSuccess(self.successMessage.temp_password.newpass_success,successcontainer,lnkhomeredirect,btnResetPassword);
                    }
                    else {			
                        self.showError(self.errorMessages.temp_password.valid_emailid,errorContainer);	
                    }
                }).catch(function(ex) {
                    self.showError(self.errorMessages.general.exception,errorContainer);
                });
            }
        }
    }

    RedirectToLogin(event) {
        event.preventDefault(); 
        this.router.parent.navigate('/login');    
    }
     route(path,e) {
         this.utility.route(path,this.router,e);    
    }
    validate(newpassword,confirmpassword,btnResetPassword,lnkhomeredirect,errorContainer,successContainer){
        this.clearError(errorContainer,successContainer,lnkhomeredirect);        
        if(!this.comparePasswords(newpassword,confirmpassword)){
            this.showError(this.errorMessages.reset_password.newpass_match,errorContainer);
            return false;
        }else if(!this.validateLength(newpassword)){
            this.showError(this.errorMessages.reset_password.newpass_character_count,errorContainer);
            return false;
        }  else if(!this.validateSpecialCharacterCount(confirmpassword) && !this.validateNumberCount(confirmpassword) ){
            this.showError(this.errorMessages.reset_password.newpass_number_specialcharacter_validation,errorContainer);
            return false;
        } else if(!this.validateSpecialCharacterCount(confirmpassword)){
            this.showError(this.errorMessages.reset_password.newpass_specialcharacter_validation,errorContainer);
            return false;
        }   else if(!this.validateNumberCount(confirmpassword)){
            this.showError(this.errorMessages.reset_password.newpass_number_validation,errorContainer);
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
    showSuccess(SuccessMessage,successContainer,lnkhomeredirect,btnResetPassword){
        $(lnkhomeredirect).css("display","block");
        $(btnResetPassword).attr("disabled","true");
        $(btnResetPassword).attr("aria-disabled","true");
        $(successContainer).css("display","inline-block");     
    }
    checkpasswordlength(txtnewpassword,txtConfirmPassword,btnResetPassword,event){
        let newpassword=txtnewpassword.value;
        let confirmpassword=txtConfirmPassword.value;
        if(newpassword.length>0 && confirmpassword.length>0){
            $(btnResetPassword).removeAttr("disabled");
            $(btnResetPassword).attr("aria-disabled","false");
        }
        else{
            $(btnResetPassword).attr("disabled","true");
            $(btnResetPassword).attr("aria-disabled","true");
        }
    }
    decryption(strToDecrypt)
    {
        let key = CryptoJS.enc.Base64.parse("#base64Key#");
        let iv  = CryptoJS.enc.Base64.parse("#base64IV#");         
        let addedEscapeIntoStr=strToDecrypt.replace(/#/g,"/");
        let decryptedStr = CryptoJS.AES.decrypt(addedEscapeIntoStr,key, {iv: iv}).toString(CryptoJS.enc.Utf8);
        return decryptedStr;
    }

    AuthanticateUser(useremail,password,userType)
    {
        let self=this;
        let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.authenticationapi;
        let promise = this.auth.login(apiURL,useremail,password,userType);
        promise.then(function(response) {
            return response.json();

        }).then(function(json) {
            if (json.AccessToken!=null && json.AccessToken!='') {      
                                
                if (self.common.isPrivateBrowsing()) {
                    sessionStorage = window.sessionStorage.__proto__;                        
                }                  
                sessionStorage.setItem('jwt', json.AccessToken);
                sessionStorage.setItem('useremail', json.Email);       
                sessionStorage.setItem('istemppassword', json.TemporaryPassword);   
            }
            else {			
                self.showError(self.errorMessages.login.auth_failed,errorContainer);	
            }
        }).catch(function(ex) {
            self.showError(self.errorMessages.general.exception,errorContainer);
        });
    }
}