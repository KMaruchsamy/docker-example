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
        v2baseurl:"api/v2/",
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
                tests: "scheduling/institutions/§institutionid/tests?subject=§subject&testType=§testtype&searchString=§searchString", //Added Searchstring parameter.
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
                refreshTestingStatus: "scheduling/refreshRetestingStatus",
                searchStudents: "scheduling/institutions/§institutionid/students?searchString=§searchstring&testId=§testid&windowStart=§windowstart&windowEnd=§windowend",
                modifyInProgressSearchStudents: "scheduling/modifyInProgress/studentsInInstitution?searchString=§searchString&testingSessionId=§testingSessionId",
                modifyInProgressCohortStudent:"scheduling/modifyInProgress/cohorts/§cohortId/students?testingSessionId=§testingSessionId",
                refreshStudentsWhoStarted: "scheduling/testingSessions/§testingSessionId/students?filter=§filter",
                updateModifyInProgressStudents: "scheduling/modifyInProgress/testingSessions/§testSessionId"
            },
            logging: {
                error: 'error/Log'
            }
        }
    },
    nursingit: {
        local: {
            server: "http://localhost:55611/"
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
        ReportingLandingPage: "UX_ALogin.aspx",
        exceptionpage: "§environment/accounterror"
    },
    faculty: {
        local: {
            server: "http://localhost:3000/"
        },
        dev: {
            server: "https://dev-nit.kaplan.com/"
        },
        qa: {
            server: "https://qa-nit.kaplan.com/"
        },
        stg: {
            server: "https://stg-nit.kaplan.com/"
        },
        prod: {
            server: "https://nit.kaplan.com/"
        },
    },
    resetemailexpire: {
        expirytime: "8"
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
    MODIFYVIEW: 'TESTS/MODIFY/VIEW',
    CONFIRMATIONMODIFYINPROGRESS:'TESTS/CONFIRMATIONMODIFYINPROGRESS'
};

export const constants = {
    USERGUIDEMODIFICATIONDATE: '03/15/2016'
}

export const teststatus = {
    Completed: 'Completed',
    Scheduled: 'Scheduled',
    InProgress: 'InProgress'
}

export let Timezones = {
    GMTminus12: 'Pacific/Midway', // need to investigate 
    GMTminus11: 'US/Samoa',
    GMTminus10: 'US/Hawaii',
    GMTminus9: 'US/Alaska',
    GMTminus8: 'US/Pacific',
    GMTminus7: 'US/Mountain',
    GMTminus6: 'Canada/Central',
    GMTminus5: 'America/New_York',
    GMTminus4: 'America/Dominica',
    GMTminus3: 'America/Cayenne',
    GMTminus2: 'America/Noronha',
    GMTminus1: 'America/Scoresbysund',
    GMT: 'Europe/London',
    GMTplus1: 'Europe/Amsterdam',
    GMTplus2: 'Europe/Athens',
    GMTplus3: 'Asia/Baghdad',
    GMTplus4: 'Asia/Dubai',
    GMTplus5: 'Asia/Karachi',
    GMTplus6: 'Asia/Dhaka',
    GMTplus7: 'Asia/Bangkok',
    GMTplus8: 'Asia/Singapore',
    GMTplus9: 'Asia/Tokyo',
    GMTplus10: 'Australia/Sydney',
    GMTplus11: 'Antarctica/Macquarie',
    GMTplus12: 'Pacific/Auckland',
    GMTplus13: 'Pacific/Apia',
    GMTplus14: 'Pacific/Kiritimati'
}

