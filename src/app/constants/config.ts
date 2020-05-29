export const links = {
    api: {
        local: {
            server: "https://nursing.qa.kaptest.com/"
        },
        dev: {
            server: "https://dev01-nursing.kaptest.com/"
        },
        qa: {
            server: "https://nursing.qa.kaptest.com/"
        },
        stg: {
            server: "https://nursing.stg.kaptest.com/"
        },
        prod: {
            server: "https://nursing.kaplan.com/"
        },
        baseurl: "api/v1/",
        v2baseurl: "api/v2/",
        admin: {
            authenticationapi: "admin/login",
            forgotpasswordapi: "admin/forgetPassword",
            settemporarypasswordapi: "admin/resetPassword",
            resetprofileapi: "admin/resetProfile",
            resetemailapi: "admin/resetEmail",
            resetfacultypasswordafterloginapi: "admin/resetPasswordAfterLogin",
            resetstudentpassword: "admin/sendStudentEmail",
            profilesapi: "profile",
            terms: "admin/enrollmentAgreement",
            examityProfileapi: "examity/adminsso/§adminId",
            accessPingToken :"admin/accessPingToken",
            facultyAMLoginUrl : "admin/facultyAMLoginUrl",
            ihpSSoLoginApi: "ihp/ltiRequestFormForIHP",
            test: {
                subjects: "scheduling/institutions/§institutionid/subjects?testType=§testtype",
                tests: "scheduling/institutions/§institutionid/tests?subject=§subject&testType=§testtype&searchString=§searchString", //Added Searchstring parameter.
                openintegratedtests: "scheduling/OpenIntegratedTests",
                cohorts: "scheduling/institutions/§institutionid/activeCohorts?windowStart=§windowstart&windowEnd=§windowend&testType=§testtype",
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
                modifyInProgressCohortStudent: "scheduling/modifyInProgress/cohorts/§cohortId/students?testingSessionId=§testingSessionId",
                refreshStudentsWhoStarted: "scheduling/testingSessions/§testingSessionId/students?filter=§filter",
                updateModifyInProgressStudents: "scheduling/modifyInProgress/testingSessions/§testSessionId",
                updateScheduleDatesModifyInProgress: "scheduling/modifyInProgress/testingSessions/§scheduleId/windowDates",
                updateIsExamityEnabled: "scheduling/testingSessions/§scheduleId/examityEnable"
            },
            logging: {
                error: 'error/LogService'
            },
            rosters: {
                cohorts: 'admin/rosters/institutions/§institutionId/cohorts',
                cohortStudents: 'admin/rosters/cohorts/§cohortId/students',
                search: 'admin/rosters/institutions/§institutionId/students?searchString=§searchString',
                saveUserPreference: 'preferenceService/setPreference',
                getUserPreference: 'preferenceService/users/§userId/preferences/§preferenceTypeName?userType=§userType',
                moveToCohortStudents: 'admin/rosters/institution/§institutionId/cohort/§cohortId/students?searchString=§searchString',
                addEmailValidation: 'admin/rosters/institution/§institutionId/student?searchEmailId=§searchEmailId',
                saveRosterCohortChanges:'admin/rosters/RequestChange'
            }
        }
    },

    log: {
        local: {
            server: "http://localhost:3000/create_log"
        },
        dev: {
            server: "https://dev-nit.kaplan.com:3000/create_log"
        },
    },

    nursingit: {
        local: {
            server: "http://localhost:55611/"
        },
        dev: {
            server: "https://dev01-nursing.kaptest.com/"
        },
        qa: {
            server: "https://nursing.qa.kaptest.com/"
        },
        stg: {
            server: "https://nursing.stg.kaptest.com/"
        },
        prod: {
            server: "https://nursing.kaplan.com/"
        },
        landingpage: "NewSiteLandingPage.aspx?facultylogin=1",
        ReportingLandingPage: "UX_ALogin.aspx",
        apolloLaunchPage:"Admin/LaunchApollo.aspx?redirectToApollo=true",
        exceptionpage: "§environment/accounterror"
    },
    faculty: {
        local: {
            server: "http://localhost:3000/"
        },
        dev: {
            server: "https://dev-nit.kaplan.com/"
        },
        qa_old: {
            server:"https://qa-nit.kaplan.com/"
        },
        qa: {
            server:"https://nit.qa.ktp.io/"
        },
        qa_new: {
            server:"https://nit.qa.kaptest.com/"
        },
        stg_old: {
            server: "https://stg-nit.kaplan.com/"
        },
        stg: {
            server: "https://nit.stg.ktp.io/"
        },
        stg_new: {
            server: "https://nit.stg.kaptest.com/"
        },
        prod_old: {
            server: "https://nit.kaplan.com/"
        },
        prod: {
            server: "https://nit.ktp.io/"
        },
        prod_new: {
            server: "https://nit.kaptest.com/"
        }
    },
    resetemailexpire: {
        expirytime: "8"
    },
    profile: {
        accountmanager: {
            defaultimage: 'assets/images/profile-noimage.jpg'
        },
        nurseconsultant: {
            defaultimage: 'assets/images/profile-noimage.jpg'
        }
    },
    tests: {
        defaultScheduleDurationHours: 3
    },
    atomStudyPlan:{
        local: {
            server: "https://www.qa01.kaptest.net/"            
        },
        dev: {
            server: "https://www.qa01.kaptest.net/"
        },
        qa: {
            server: "https://www.qa01.kaptest.net/"
        },
        stg: {
            server: "https://www.stg.kaptest.net/"
        },
        prod: {
            server: "https://www.kaptest.com/"
        },
        login:"rest-services/userLogin/oamLogin?oam=§facultyEmail&enc=false"
    },
    examity : {
        local: {
            server: "https://test.examity.com/"            
        },
        dev: {
            server: "https://test.examity.com/"
        },
        qa: {
            server: "https://test.examity.com/"
        },
        stg: {
            server: "https://prod.examity.com/"
        },
        prod: {
            server: "https://prod.examity.com/"
        },
        login:"kaplan/login.aspx",
        examstatus:"kaplan/examstatus.aspx"
    },
    pingfederate : {
        local: {
            server: "https://pingfederate.qa.ktp.io/as/token.oauth2"            
        },
        dev: {
            server: "https://pingfederate.qa.ktp.io/as/token.oauth2"
        },
        qa: {
            server: "https://pingfederate.qa.ktp.io/as/token.oauth2"
        },
        stg: {
            server: "https://pingfederate.stg.ktp.io/as/token.oauth2"
        },
        prod: {
            server: "https://pingfederate.ktp.io/as/token.oauth2"
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
    CONFIRMATIONMODIFYINPROGRESS: 'TESTS/CONFIRMATIONMODIFYINPROGRESS'
};

export const RosterChangesPages = {
    MAKECHANGES: 'ROSTERS/CHANGE-UPDATE',
    EXTENDACCESS: 'ROSTERS/EXTEND-ACCESS',
    REVIEWCHANGES: 'ROSTERS/ROSTER-CHANGES-SUMMARY',
    CHANGESCONFIRMATION: 'ROSTERS/CONFIRMATION',
    CHANGESNOTE: 'rosters/changes-note',
    VIEWROSTERS: 'rosters'
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

export const cohortRosterChangeUserPreference = {
    UserType: "admin",
    PreferenceTypeName: "CohortRosterChangeIntro",
    PreferenceTypeShowValueName: "Show",
    PreferenceTypeHideValueName: "Hide"
}

export const roster = {
    classRosterForm: 'https://nursing-assets-web-ktp.s3.amazonaws.com/admin/userguide/kaplan-new-class-roster-sheet.xlsx',
    formstack: 'https://kaptest.formstack.com/forms/kaplan_nursing_new_roster_submission_form'
}

export const telNumbers = {
    supportHotline: '1-866-920-6311',
    outsideUSCanadaSupportHotline: '+1-407-423-6620'
}

// export const Examity = {
//     examityLoginURL: 'https://test.examity.com/kaplan/login.aspx',
//     examityExamStatusURL: 'https://test.examity.com/kaplan/examstatus.aspx'
// }

export enum RosterUpdateTypes {
    MoveToDifferentCohort = 1,
    MoveToThisCohort = 2,
    AddToThisCohort = 3,
    ExtendAccess = 4
}

// export const RosterUpdateTypes = {
//     MoveToDifferentCohort : 1,
//     MoveToThisCohort : 2,
//     AddToThisCohort : 3,
//     ExtendAccess : 4
// }


