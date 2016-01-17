export const links = {
    api: {
		local: {
			server: "https://qa-nursing.kaptest.com/"
		},
		dev: {
			server: "https://dev01-nursing.kaptest.com/"
		},
		qa: {
			server : "https://qa-nursing.kaptest.com/"			
		},
        stg: {
			server : "https://stg-nursing.kaptest.com/"			
		},
        prod: {
			server : "https://nursing.kaplan.com/"			
		},
		baseurl: "api/v1/",
		admin: {
			authenticationapi: "admin/login",
			forgotpasswordapi: "admin/forgetPassword",
			settemporarypasswordapi: "admin/resetPassword",
			resetprofileapi: "admin/resetProfile",
			resetemailapi: "admin/resetEmail",
			resetfacultypasswordafterloginapi: "admin/resetPasswordAfterLogin",
			resetstudentpassword: "admin/sendStudentEmail",
            profilesapi: "profile",
            test: {
                subjects: "scheduling/institutions/§institutionid/subjects?testType=§testtype",
                tests:"scheduling/institutions/§institutionid/tests?subject=§subject&testType=§testtype"
            }
		}
    },
    nursingit: {
		local: {
			server: "http://localhost/"
		},
		dev: {
			server: "https://dev01-nursing.kaptest.com/"
		},
		qa: {
			server: "https://qa-nursing.kaptest.com/"
		},
        stg: {
			server: "https://stg-nursing.kaptest.com/"
		},
        prod: {
			server: "https://nursing.kaplan.com/"
		},
		landingpage: "NewSiteLandingPage.aspx?facultylogin=1",
		ReportingLandingPage: "UX_ALogin.aspx"
    },
    faculty:{
        local: {
			server: "http://localhost:3000/"
		},
		dev: {
			server: "https://dev-nit.kaptest.com/"
		},
		qa: {
			server : "https://qa-nit.kaptest.com/ "			
		},
        stg: {
			server : "https://stg-nit.kaptest.com/faculty"			
		},
        prod: {
			server : "https://nit.kaplan.com/faculty"			
		},
    },
    resetemailexpire: {
		expirytime: "2"
    },
	profile:{
		accountmanager:{
			defaultimage : 'images/profile-noimage.jpg'
		},
		nurseconsultant:{
			defaultimage:'images/profile-noimage.jpg'
		}
	}
};

export const errorcodes = {
    UNAUTHORIZED: "401",
    SUCCESS: "200",
    ERROR: "400",
    SERVERERROR: "500",
    API: "422"
};
  
  