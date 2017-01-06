export const messages = {
    systemmaintenance: {
        messageid: 1,
        message: "<b>Please note:</b> Kaplan Nursing will be performing routine system maintenance on Sunday, June 21 from 12:00am to 12:00pm Eastern. Resources will be unavailable during this time. We appreciate your patience as we work to ensure the best experience for our customers!",
        active: 1
    }
};

export const general = {
    exception: "We're sorry, an error has occurred. Please try again."
};

export const login = {
    email_required_validation: "Your email address cannot be left blank. Please enter your email address.",
    pass_required_validation: "Your password cannot be left blank. Please enter your password.",
    email_pass_required_validation: "Your email address and password cannot be left blank. Please try again.",
    email_format_validation: "Whoops! That doesn't look like an email address. Please try again.",
    auth_failed: "Whoops! Looks like you entered an invalid email and/or password. Please try again."
};

export const temp_password = {
    newpass_character_count: "Your password must be at least 8 characters long.",
    newpass_number_validation: "Your password must contain at least one number.",
    newpass_specialcharacter_validation: "Your password must contain at least one special character.",
    newpass_number_specialcharacter_validation: "Your password must contain at least one number and one special character.",
    newpass_match: "Your passwords must match. Please try again.",
    newpass_success: "You have successfully set your password."
};

export const forgot_password = {
    failed_sent_mail: "Failure in sending mail. Please try again.",
    email_format_validation: "Whoops! That doesn't look like an email address. Please try again.",
    invalid_emailid: "Whoops! Looks like you entered an invalid email. Please try again."
};


export const reset_password = {
    newpass_character_count: "Your new password must be at least 8 characters long.",
    newpass_number_validation: "Your new password must contain at least one number.",
    newpass_specialcharacter_validation: "Your new password must contain at least one special character.",
    newpass_number_specialcharacter_validation: "Your new password must contain at least one number and one special character.",
    newpass_match: "Your new passwords must match. Please try again.",
    newpass_success: "You have successfully set your new password."
};

export const reset_password_after_login = {
    resetpass_success: "You have successfully reset your password."
};

export const manage_account = {
    email_format_validation: "Whoops! That doesn't look like an email address. Please try again.",
    invalid_emailid: "Whoops! Looks like you entered an invalid email. Please try again.",
    incorrect_password: "Whoops! Looks like you entered an incorrect password. Please try again.",
    newpass_character_count: "Your new password must be at least 8 characters long.",
    newpass_number_validation: "Your new password must contain at least one number.",
    newpass_specialcharacter_validation: "Your new password must contain at least one special character.",
    newpass_number_specialcharacter_validation: "Your new password must contain at least one number and one special character.",
    newpass_match: "Your new passwords must match. Please try again."
};

export const reset_student_password = {
    success_message: "Your student will receive an email with their user name and password in a few minutes."
};


export const rosters = {
    student_already_added: 'You have already added this student',
    student_has_kaplan_account: 'This student already has a Kaplan account:',   
    student_has_kaplan_account_expired : 'This student already has a Kaplan account, but their access has expired. Please contact your Account Manager for more information.',
    student_has_kaplan_account_different_institution: 'This student already has a Kaplan account, but cannot be moved to this cohort at this time. Please contact your Account Manager for more information',
    student_already_in_cohort: 'This student has a Kaplan account and is already in the current cohort',
    no_students: 'We’re sorry, there are no students that match your search. Please try again.',
    expired_message : 'Students with expired access cannot be moved. Please contact your Account Manager for assistance.',
    btn_access_expired: 'Student access has expired',
    btn_same_cohort:'Student is already in cohort'
};
