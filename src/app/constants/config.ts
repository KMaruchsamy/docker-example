export const links = {
    api: {
		local: {
			server: "http://localhost/"
		},
		dev: {
			server: "https://dev01-nursing.kaptest.com/"
		},
		qa: {
			server : "https://qa-nursing.kaptest.com/"			
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
			profilesapi: "profile"
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
		landingpage: "NewSiteLandingPage.aspx?facultylogin=1",
		ReportingLandingPage: "UX_ALogin.aspx"
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
  
  