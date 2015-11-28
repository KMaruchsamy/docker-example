export class Validations
{
    constructor(){
    }

    validateValidEmailId(emailId):boolean {
        var regexItem = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
        return regexItem.test(emailId);
    }
    validateLength(password):boolean{
        if(password.length<8)
            return false;
        return true;
    }
    validateSpecialCharacterCount(password):boolean{
        var regexItem = new RegExp("^[a-zA-Z0-9 ]*$");
        if(regexItem.exec(password))
            return false;
        return true;
    }
    validateNumberCount(password):boolean{
        if(password.search(/\d/) == -1)
            return false;
        return true;
    }

    comparePasswords(newpassword,confirmpassword):boolean{
        if(newpassword===confirmpassword)
            return true;
        return false;
    }

    RequiredFields(txtFirstName,txtLastName):boolean
    {
        let fname=txtFirstName.value;
        let lname=txtLastName.value;
        if(fname.length>0 && lname.length>0)
            return true;
        return false;
    }
    
}