export const links = {
    api: {
        local: {
            server: "https://qa-nursing.kaptest.com/"
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
                tests: "scheduling/institutions/§institutionid/tests?subject=§subject&testType=§testtype",
                openintegratedtests: "scheduling/OpenIntegratedTests",
                cohorts: "scheduling/institutions/§institutionid/activeCohorts?windowStart=§windowstart&windowEnd=§windowend",
                cohortstudents: "scheduling/cohorts/§cohortid/students?testId=§testid",
                faculty: "scheduling/institutions/§institutionid/faculty",
                retesters: "scheduling/checkForRetesters?institutionId=§institutionid",
                retestersModify: "scheduling/checkForRetestersModify",
                windowexception: "scheduling/checkForTestingWindowExceptions",
                scheduletest: "scheduling/testingSessions",
                viewtest: "scheduling/testingSessions/§scheduleId",
                deleteSchedule: "scheduling/testingSessions/§scheduleId",
                scheduletests: "scheduling/testingSessions",
                modifyscheduletest: "scheduling/testingSessions/§scheduleId",
                renamesession: "scheduling/testingSessions/§scheduleId/renameSession",
                refreshTestingStatus: "scheduling/refreshRetestingStatus"
            },
            logging: {
                error: 'error/Log'
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
    faculty: {
        local: {
            server: "http://localhost:3000/"
        },
        dev: {
            server: "https://dev-nit.kaptest.com/"
        },
        qa: {
            server: "https://qa-nit.kaptest.com/ "
        },
        stg: {
            server: "https://stg-nit.kaplan.com/"
        },
        prod: {
            server: "https://nit.kaplan.com/"
        },
    },
    resetemailexpire: {
        expirytime: "2"
    },
    profile: {
        accountmanager: {
            defaultimage: 'images/profile-noimage.jpg'
        },
        nurseconsultant: {
            defaultimage: 'images/profile-noimage.jpg'
        }
    },
    tests: {
        defaultScheduleDurationHours: 3
    }
};

export const errorcodes = {
    UNAUTHORIZED: "401",
    SUCCESS: "200",
    ERROR: "400",
    SERVERERROR: "500",
    API: "422"
};

export const TestShedulingPages = {
    CHOOSETEST: 'TESTS/CHOOSE-TEST',
    SCHEDULETEST: 'TESTS/SCHEDULE-TEST',
    ADDSTUDENTS: 'TESTS/ADD-STUDENTS',
    REVIEWTEST: 'TESTS/REVIEW',
    MODIFYCHOOSETEST: 'TESTS/MODIFY/CHOOSE-TEST',
    MODIFYSCHEDULETEST: 'TESTS/MODIFY/SCHEDULE-TEST',
    MODIFYADDSTUDENTS: 'TESTS/MODIFY/ADD-STUDENTS',
    MODIFYREVIEWTEST: 'TESTS/MODIFY/REVIEW',
    MODIFYCONFIRMATION: 'TESTS/MODIFY/CONFIRMATION',
    CONFIRMATION: 'TESTS/CONFIRMATION',
    VIEW: 'TESTS/VIEW',
    MODIFYVIEW: 'TESTS/MODIFY/VIEW'
};

export const constants = {
    USERGUIDEMODIFICATIONDATE: '03/15/2016'
}

export const teststatus = {
    Completed: 'Completed',
    Scheduled: 'Scheduled',
    InProgress: 'InProgress'
}


