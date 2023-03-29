export enum AttendanceMessage {
  BeforeTestWindow = "Attendance confirmation function is currently unavailable. You can confirm students’ attendance for this test 20 minutes before the testing window begins.",
  DuringTestWindow = "For test security purposes, please ensure the students are present before you confirm their attendance.",
  AfterTestWindow = "The testing session has ended. You can reschedule this test to students that were not present.",
  EmptyNotConfirmed = "No students need attendance confirmation.",
  EmptyConfirmed = "No students have been confirmed."
}
