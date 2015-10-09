import {Component, View} from 'angular2/angular2';
import {Router} from 'angular2/router';
import {PageHeader} from '../shared/page-header';
import {PageFooter} from '../shared/page-footer';
import {Auth} from '../../services/auth';
import {Common} from '../../services/common';
import {Validations} from '../../services/validations';

@Component({
    selector: 'account',
    viewBindings: [Auth, Common,Validations]
})
@View({
    templateUrl: '../../templates/account/account.html',
    directives: [PageHeader,PageFooter]
})

export class Account {
    constructor(router: Router,auth:Auth,common:Common,validations:Validations) {
        this.router = router;
        this.auth=auth;
        this.common = common;
        this.validations=validations;
        this.errorMessages = "";
        this.successMessage = "";
        this.getErrorMessages();
        this.config = "";
        this.apiServer = "";
        this.getConfig();
        this.initialize();
        this.sStorage = this.common.sStorage;
    }
    
    getErrorMessages() {
        let self = this;
        this.common.getErrorMessages().then(function (response) {
            return response.json();
        }).then(function (json) {
            self.errorMessages = json;
            self.successMessage = json;
        }).catch(function (ex) {
            console.log('parsing failed', ex);
        });
    }
    
    getConfig() {
        let self = this;
        this.common.getConfig().then(function (response) {
            return response.json()
        }).then(function (json) {
            self.config = json
            self.getApiServer();
        }).catch(function (ex) {
            console.log('parsing failed', ex)
        });
    }
    
    getApiServer() {
        let configJSON = this.config;
        if (location.hostname.indexOf('localhost') > -1)
            this.apiServer = configJSON.links.api.local.server;
        if (location.hostname.indexOf('dev') > -1)
            this.apiServer = configJSON.links.api.dev.server;
        if (location.hostname.indexOf('qa') > -1)
            this.apiServer = configJSON.links.api.qa.server;
    }
    
    getInitialize()
    {  
        this.sStorage = this.common.sStorage;
        if(this.auth.isAuth()){
            $('title').html('Kaplan Nursing | Account');        
            $('#firstName').val(this.sStorage.getItem('firstname'));
            $('#lastName').val(this.sStorage.getItem('lastname'));
            $('#facultyTitle').val(this.sStorage.getItem('title'));
            this.setInstitutionName(this.sStorage.getItem('institutions'));
            $('#emailId').text(this.sStorage.getItem('useremail'));}
        else{
            this.RedirectToLogin();
        }
    }
    
    setInstitutionName(institutename)
    {
        if(institutename!=null && institutename!="")
        {            
            if(institutename.indexOf('|')>0){
                let name=institutename.split('|');
                let institutionlist="";
                for(let i=0;i<name.length;i++)
                {
                    if(institutionlist==="")
                        institutionlist=name[i]+"<br/>";
                    else
                        institutionlist=institutionlist+ name[i]+"<br/>";
                }
                $('#schoolName').html(institutionlist);
            }
            else{
                $('#schoolName').html(institutename=='undefined'?"":institutename);
            }
        }
    }
    
    initialize() {
        let self = this;
        if (this.auth.isAuth()) {
            let $btnResetResetPassword = $('#btnResetResetPassword');
            let $successResetPasswordContainer = $('#successResetPasswordContainer');
            
            let $btnClearResetStudentPassword = $('#btnClearResetStudentPassword');
            let $successResetStudentPasswordContainer = $('#successResetStudentPasswordContainer');

            self.getInitialize();
            self.resetProfileFields();
            self.HideChangeEmail();
            self.initializeResetPassword();
            self.initializeResetStudentPassword();
            
            $('#firstName').bind('input', function () {
                self.checkfirstnamelastname();
                self.resetProfileFields();
            });
            $('#lastName').bind('input', function () {
                self.checkfirstnamelastname();
                self.resetProfileFields();
            });
            $('#facultyTitle').bind('input', function () {
                self.checkfirstnamelastname();
                self.resetProfileFields();
            });
            $('#emailAddress').bind('input', function () {
                self.checkemailpassword();
            });
            $('#txtPassword').bind('input', function () {
                self.checkemailpassword();
            });
            $('#currentPassword').bind('input', function () {
                self.checkpasswordlength();
                if ($btnResetResetPassword.hasClass('hidden'))
                    self.resetSuccess($btnResetResetPassword, $successResetPasswordContainer);
            });
            $('#newPassword').bind('input', function () {
                self.checkpasswordlength();
                if ($btnResetResetPassword.hasClass('hidden'))
                    self.resetSuccess($btnResetResetPassword, $successResetPasswordContainer);
            });
            $('#confirmNewPassword').bind('input', function () {
                self.checkpasswordlength();
                if ($btnResetResetPassword.hasClass('hidden'))
                    self.resetSuccess($btnResetResetPassword, $successResetPasswordContainer);
            });
            $('#resetStudentPassword').bind('input', function () {
                self.checkstudentemail();
                 if ($btnClearResetStudentPassword.hasClass('hidden'))
                    self.resetSuccess($btnClearResetStudentPassword, $successResetStudentPasswordContainer);
            });
        }
        else {
            self.RedirectToLogin();
        }
    }
    
    RedirectToLogin() {
        this.router.parent.navigate('/login');
    }

    onSubmitSaveProfile(txtFirstname,txtLastname,txtTitle,btnSaveProfile,resetSaveProfile,successContainer,event)
    {
        event.preventDefault();
        let self = this;
        let fname = txtFirstname.value;
        let lname = txtLastname.value;
        let title=txtTitle.value;
        let userid=self.auth.userid;
        let email=self.auth.useremail;
        let authheader=self.auth.authheader;
        let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.resetprofileapi;
        let promise = self.saveProfile(apiURL,authheader,userid,fname,lname,title,email);
        promise.then(function(response) {
            return response.status;
        }).then(function(status) {
            if (status.toString()===self.config.errorcode.SUCCESS) {
                self.showSuccess(resetSaveProfile,successContainer,btnSaveProfile);
                self.sStorage.setItem('firstname',fname);
                self.sStorage.setItem('lastname',lname);
                self.sStorage.setItem('title',title);
                self.getInitialize();
            }
            else if (status.toString()===self.config.errorcode.UNAUTHORIZED){
                self.RedirectToLogin();
            }
            else {		console.log('failed because of '+status+' error.');	
            }
        }).catch(function(ex) {
            console.log('Exception');
        });        
    }
    
    onCancelSaveProfile(btnSaveProfile,event){
        event.preventDefault();
        let self=this;
        self.getInitialize();
        $(btnSaveProfile).attr("disabled", "true");
        $(btnSaveProfile).attr("aria-disabled", "true");
    }
    
    resetProfileFields(){
        $('#profilecancel').removeClass('hidden');
        $('#successmsg').removeProp('display');
        $('#successmsg').css('display', 'none');
       
    }
    
    onSubmitChangeEmail(txtNewEmailId,txtPassword,btnChangeEmail,resetEmailSave,SuccessEmailContainer,EmailErrorContainer,PasswordErrorContainer,event)
    {
        event.preventDefault();
        let self=this;
        let status=0;
        let newemailid=txtNewEmailId.value;
        this.clearError(EmailErrorContainer, SuccessEmailContainer,1);
        this.clearError(PasswordErrorContainer, SuccessEmailContainer,2);
        if(this.validateEmail(newemailid,SuccessEmailContainer,EmailErrorContainer,0)){
            let userid=self.auth.userid;
            let email=self.auth.useremail;
            let password = txtPassword.value;
            let authheader= 'Bearer '+this.sStorage.getItem('jwt'); 
            let security=self.auth.securitylevel;
            let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.resetemailapi;
            let promise = self.resetEmail(apiURL,authheader,userid,newemailid,security,password);
            promise.then(function(response) {               
                status=response.status;
                return response.json();
            }).then(function(json) {    
                      
                if (status.toString()===self.config.errorcode.SUCCESS) {
                    $(btnChangeEmail).addClass('button-with-validation');
                    self.showSuccess(resetEmailSave,SuccessEmailContainer,btnChangeEmail);
                    self.sStorage.setItem('jwt', json.AccessToken);
                    self.sStorage.setItem('useremail',newemailid);
                    self.auth.authheader= 'Bearer '+ json.AccessToken;
                    self.auth.useremail = newemailid
                    self.getInitialize();
                    setTimeout(function(){                
                        $( "#changeEmailFormSubmittable" ).slideUp( "slow", function() {
                            $('#changeEmailFormSubmittable').addClass('hidden');
                            $('#showChangeEmail').removeClass('hidden');
                            $(btnChangeEmail).removeClass('button-with-validation');
                        });
                    },1000);               
                }
                else if (status.toString()===self.config.errorcode.API){
                    if(json.Payload.length>0){
                        if(json.Payload[0].Messages.length>0){
                            self.showError(json.Payload[0].Messages[0].toString(), PasswordErrorContainer,2);
                        }
                    }
                }
                else {		
                    self.showError(self.errorMessages.general.exception, PasswordErrorContainer,2);
                } 
                        
                txtPassword.value='';
            }).catch(function(ex) {
                self.showError(self.errorMessages.general.exception, PasswordErrorContainer,2);
                 txtPassword.value='';
            });        
        }
        else{
            txtPassword.value='';
        }

    }
    
    showChangeEmail(btnShowChangeEmail,$event)
    {
        $('#successemailmsg').hide();
        $('#changeEmailFormSubmittable').show().removeClass('hidden');
        $(btnShowChangeEmail).addClass('hidden');
        $('#resetEmailSave').toggleClass('hidden');
    }
    
    HideChangeEmail()
    {
        $('#changeEmailFormSubmittable').hide().addClass('hidden');
        $('#showChangeEmail').removeClass('hidden');
        $('#successemailmsg').removeProp('display');
        $('#successemailmsg').css('display', 'none');
    }
    
    onCancelChangeEmail(txtNewEmailId,txtPassword,btnChangeEmail,event){
        txtNewEmailId.value="";
        txtPassword.value="";
        $(btnChangeEmail).attr("disabled", "true");
        $(btnChangeEmail).attr("aria-disabled", "true");
        $('#spnEmailErrorMessage').text('');
        $('#spnPasswordErrorMessage').text('');
    }
    
    
    
    
    
    onSubmitResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword, btnResetResetPassword, CurrentPasswordErrorContainer, ResetPasswordErrorContainer, SuccessResetPasswordContainer, event) {
        event.preventDefault();
        let currentpassword = txtCurrentPassword.value;
        let newpassword = txtNewPassword.value;
        let confirmpassword = txtConfirmPassword.value;
        let status = 0;
        if (this.validatePassword(newpassword, confirmpassword, ResetPasswordErrorContainer, SuccessResetPasswordContainer)) {
            let authheader = this.auth.authheader;
            let userId = this.auth.userid;
            let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.resetfacultypasswordafterloginapi;
            let self = this;
            let resetPasswordPromise = this.resetPassword(apiURL, authheader, userId, currentpassword, newpassword);
            resetPasswordPromise.then(function (response) {
                status = response.status;
                return response.json();
            }).then(function (json) {
                if (status.toString() === self.config.errorcode.SUCCESS) {
                    SuccessResetPasswordContainer.innerHTML = self.errorMessages.reset_password_after_login.resetpass_success;
                    self.showSuccess(btnResetResetPassword, SuccessResetPasswordContainer, btnResetPassword);
                    self.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
                }
                else if (status.toString() === self.config.errorcode.API) {
                    if (json.Payload.length > 0) {
                        if (json.Payload[0].Messages.length > 0) {
                            self.showError(json.Payload[0].Messages[0].toString(), ResetPasswordErrorContainer, 4);
                            self.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
                        }
                    }
                }
                else {
                    self.showError(self.errorMessages.general.exception, ResetPasswordErrorContainer, 4);
                    self.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
                }
            }).catch(function (ex) {
                self.showError(self.errorMessages.general.exception, ResetPasswordErrorContainer, 4);
                self.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
            });
        }
        else {
            this.clearResetPassword(txtCurrentPassword, txtNewPassword, txtConfirmPassword, btnResetPassword);
        }
    }
    
    
    initializeResetPassword(){
        $('#spnCurrentPasswordErrorMessage').text('');
        $('#spnResetPasswordErrorMessage').text(''); 
        $('#errorResetPasswordContainer').hide();
        $('#successResetPasswordContainer').hide();
        $('#currentPassword').val('');
        $('#newPassword').val('');
        $('#confirmPassword').val('');         
        $('#btnResetPassword').attr("disabled", "true");
        $('#btnResetPassword').attr("aria-disabled", "true");
        $('#btnResetResetPassword').removeClass('hidden');       
    }
    
    clearResetPassword(txtCurrentPassword,txtNewPassword,txtConfirmPassword,btnResetPassword){
        txtNewPassword.value = '';
        txtCurrentPassword.value = '';
        txtConfirmPassword.value = '';          
        $(btnResetPassword).attr("disabled", "true");
        $(btnResetPassword).attr("aria-disabled", "true");      
    }
    
    
    onCancelResetPassword(txtCurrentPassword,txtNewPassword,txtConfirmPassword,btnResetPassword,event){
        event.preventDefault();
        this.clearResetPassword(txtCurrentPassword,txtNewPassword,txtConfirmPassword);  
        $('#spnCurrentPasswordErrorMessage').text('');
        $('#spnResetPasswordErrorMessage').text('');                 
    }
    
    
    initializeResetStudentPassword() {
        let $btnStudentReset = $('#btnStudentReset');
        let $btnClearResetStudentPassword = $('#btnClearResetStudentPassword');
        let $spnResetStudentPasswordErrorMessage = $('#spnResetStudentPasswordErrorMessage');
        let $resetstudentpasswordErrorcontainer = $spnResetStudentPasswordErrorMessage.parent('p.error');
        $btnStudentReset.attr("disabled", "true");
        $btnStudentReset.attr("aria-disabled", "true");
        $btnClearResetStudentPassword.removeClass('hidden');
        $('#resetStudentPassword').val('');
        $spnResetStudentPasswordErrorMessage.text('');
        if ($resetstudentpasswordErrorcontainer.length > 0)
            $resetstudentpasswordErrorcontainer.hide();
        $('#successResetStudentPasswordContainer').hide();
    }
    
    onSubmitResetStudentPassword(txtResetStudentPassword,btnResetStudentPassword,resetStudentPasswordErrorContainer,successResetStudentPasswordContainer,btnClearResetStudentPassword,event){
        event.preventDefault();
        this.clearError(resetStudentPasswordErrorContainer, successResetStudentPasswordContainer,5);
        let studentEmailID=txtResetStudentPassword.value;
        if(this.validateEmail(studentEmailID,successResetStudentPasswordContainer,resetStudentPasswordErrorContainer,1)){
             let authheader = this.auth.authheader;
            let userId = this.auth.userid;
            let apiURL = this.apiServer + this.config.links.api.baseurl + this.config.links.api.admin.resetstudentpassword;
            let self = this;
            let status =0;
            let resetStudentPasswordPromise = this.resetStudentPassword(apiURL, authheader, userId, studentEmailID);
            resetStudentPasswordPromise.then(function (response) {
                status = response.status;
                return response.json();
            }).then(function (json) {
                if (status.toString() === self.config.errorcode.SUCCESS) {
                     successResetStudentPasswordContainer.innerHTML = self.errorMessages.reset_student_password.success_message;
                     self.showSuccess(btnClearResetStudentPassword, successResetStudentPasswordContainer, btnResetStudentPassword);
                     self.clearResetStudentPassword(txtResetStudentPassword, btnResetStudentPassword);
                }
                else if (status.toString() === self.config.errorcode.API) {
                    if (json.Payload.length > 0) {
                        if (json.Payload[0].Messages.length > 0) {
                             self.showError(json.Payload[0].Messages[0].toString(), resetStudentPasswordErrorContainer, 5);
                            self.clearResetStudentPassword(txtResetStudentPassword);
                        }
                    }
                }
                else {
                     self.showError(self.errorMessages.general.exception, resetStudentPasswordErrorContainer, 5);
                   self.clearResetStudentPassword(txtResetStudentPassword);
                }
            }).catch(function (ex) {
                 self.showError(self.errorMessages.general.exception, resetStudentPasswordErrorContainer, 5);
                self.clearResetStudentPassword(txtResetStudentPassword);
            });
        }
    }
    
    clearResetStudentPassword(txtResetStudentPassword, btnClearResetStudentPassword) {
        txtResetStudentPassword.value = '';
        if (btnClearResetStudentPassword) {
            $(btnClearResetStudentPassword).attr("disabled", "true");
            $(btnClearResetStudentPassword).attr("aria-disabled", "true");
        }

    }
    
    onCancelResetStudentPassword(txtResetStudentPassword,btnResetStudentPassword,event){
        txtResetStudentPassword.value="";
        $(btnResetStudentPassword).attr("disabled", "true");
        $(btnResetStudentPassword).attr("aria-disabled", "true");
        $('#spnResetStudentPasswordErrorMessage').text('');
    }
    
    checkfirstnamelastname() {
        let fname = $('#firstName').val();
        let lname =  $('#lastName').val();
        let title=$('#facultyTitle').val();
        if (fname.length > 0 && lname.length > 0) {
            this.sStorage = this.common.sStorage;
            let ofname=this.sStorage.getItem('firstname');
            let olname=this.sStorage.getItem('lastname');
            let otitle=this.sStorage.getItem('title');
            if(!(fname===ofname && lname===olname && title===otitle)){
                $('#btnProfileSave').removeAttr("disabled");
                $('#btnProfileSave').attr("aria-disabled", "false");
            }
            else {
                $('#btnProfileSave').attr("disabled", "true");
                $('#btnProfileSave').attr("aria-disabled", "true");
            }
        }
        else {
            $('#btnProfileSave').attr("disabled", "true");
            $('#btnProfileSave').attr("aria-disabled", "true");
        }
    }
    
    checkemailpassword() {
        let email =$('#emailAddress').val();
        let password =$('#txtPassword').val();
        if (email.length > 0 && password.length > 0) {
            $('#ChangeEmail').removeAttr("disabled");
            $('#ChangeEmail').attr("aria-disabled", "false");
        }
        else {
            $('#ChangeEmail').attr("disabled", "true");
            $('#ChangeEmail').attr("aria-disabled", "true");
        }
    }

    checkpasswordlength(){
        let currentpassword = $('#currentPassword').val();
        let newpassword =$('#newPassword').val();
        let cpassword=$('#confirmNewPassword').val();
        if (currentpassword.length > 0 && newpassword.length > 0 && cpassword.length>0) {
            $('#btnResetPassword').removeAttr("disabled");
            $('#btnResetPassword').attr("aria-disabled", "false");
        }
        else {
            $('#btnResetPassword').attr("disabled", "true");
            $('#btnResetPassword').attr("aria-disabled", "true");
        }
    }
    
    checkstudentemail() {
        let email = $('#resetStudentPassword').val();
        if (email.length > 0 ) {
            $('#btnStudentReset').removeAttr("disabled");
            $('#btnStudentReset').attr("aria-disabled", "false");
        }
        else {
            $('#btnStudentReset').attr("disabled", "true");
            $('#btnStudentReset').attr("aria-disabled", "true");
        }
    }
    
    validateEmail(email,successContainer,errorContainer,flag) {
        if (!this.validations.validateValidEmailId(email)) {
            if(flag==0){
                this.showError(this.errorMessages.manage_account.email_format_validation, errorContainer,1);
            }
            else{                
                this.showError(this.errorMessages.manage_account.email_format_validation, errorContainer,5);
            }
            
            return false;
        } 
        return true;
    }
    
    validatePassword(newpassword, confirmpassword, errorContainer, successContainer) {
        this.clearError(errorContainer, successContainer,4);
        if (!this.validations.comparePasswords(newpassword, confirmpassword)) {
            this.showError(this.errorMessages.manage_account.newpass_match, errorContainer,4);
            return false;
        } else if (!this.validations.validateLength(newpassword)) {
            this.showError(this.errorMessages.manage_account.newpass_character_count, errorContainer,4);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword) && !this.validations.validateNumberCount(confirmpassword)) {
            this.showError(this.errorMessages.manage_account.newpass_number_specialcharacter_validation, errorContainer,4);
            return false;
        } else if (!this.validations.validateSpecialCharacterCount(confirmpassword)) {
            this.showError(this.errorMessages.manage_account.newpass_specialcharacter_validation, errorContainer,4);
            return false;
        } else if (!this.validations.validateNumberCount(confirmpassword)) {
            this.showError(this.errorMessages.manage_account.newpass_number_validation, errorContainer,4);
            return false;
        }
        return true;
    }
    
    clearError(errorContainer, successContainer,fieldcount) {
        $(successContainer).css("display", "none");
        let $container ;
        switch(fieldcount){
            case 1:
                $container = $(errorContainer).find('span#spnEmailErrorMessage');
                break;
            case 2:
                $container = $(errorContainer).find('span#spnPasswordErrorMessage');
                break;
            case 3:
                $container = $(errorContainer).find('span#spnCurrentPasswordErrorMessage');
                break;
            case 4:
                $container = $(errorContainer).find('span#spnResetPasswordErrorMessage');
                break;
            case 5:
                $container = $(errorContainer).find('span#spnResetStudentPasswordErrorMessage');
                break;
        }
        let $outerContainer = $(errorContainer);
        $container.html('');
        $outerContainer.hide();
    }

    showError(errorMessage, errorContainer,fieldcount) {
        let $container ="";
        switch(fieldcount){
            case 1:
                $container = $(errorContainer).find('span#spnEmailErrorMessage');
                break;
            case 2:
                $container = $(errorContainer).find('span#spnPasswordErrorMessage');
                break;
            case 3:
                $container = $(errorContainer).find('span#spnCurrentPasswordErrorMessage');
                break;
            case 4:
                $container = $(errorContainer).find('span#spnResetPasswordErrorMessage');
                break;
            case 5:
                $container = $(errorContainer).find('span#spnResetStudentPasswordErrorMessage');
                break;
        }
        
        let $outerContainer = $(errorContainer);
        $container.html(errorMessage);
        $outerContainer.show();
    }
    
    resetSuccess($resetLink,$successContainer){
        $resetLink.removeClass('hidden');
        $successContainer.hide();
    }
    
    showSuccess(resetLink,successContainer, btnSave) {
        $(resetLink).addClass('hidden');
        $(btnSave).attr("disabled", "true");
        $(btnSave).attr("aria-disabled", "true");
        $(successContainer).css("display", "inline-block");
    }
    
    saveProfile(url,authheader,userid,fname,lname,title,email) {
        return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization':authheader
            },
            body: JSON.stringify({
                userid: userid,
                Firstname: fname,
                LastName: lname,
                Jobtitle:title,
                Email:email
            })
        });
    }
    
    resetEmail(url,authheader,userid,email,security,password) {
        return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization':authheader
            },
            body: JSON.stringify({
                userid: userid,               
                Email:email,
                SecurityLevel:security,
                Password:password
            })
        });
    }    
    
    
    resetPassword(url,authheader,userid,currentPassword,newPassword){
          return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization':authheader
            },
            body: JSON.stringify({
                userid: userid,               
                Password:currentPassword,
                NewPassword:newPassword
            })
        });
    }
    
    
    resetStudentPassword(url,authheader,userid,studentEmail){
          return fetch(url, {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization':authheader
            },
            body: JSON.stringify({
                userid: userid,               
                StudentEmail:studentEmail
            })
        });
    }
}