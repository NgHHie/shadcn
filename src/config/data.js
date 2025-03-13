export const ACCESS_TOKEN = 'access_token'
export const REFRESH_TOKEN = 'refresh_token'
export const PAGE_SIZE = 10
export const PAGE_SIZE_SUBMIT_USER = 5

export const MEDIA_TYPE = {
  JSON: 'application/json',
  FORM_URLENCODE: 'application/x-www-form-urlencoded'
}

export const QUESTION_TYPE = [
  {
    "name": "Select",
    "value": "SELECT"
  },
  {
    "name": "Insert",
    "value": "INSERT"
  },
  {
    "name": "Update",
    "value": "UPDATE"
  },
  {
    "name": "Delete",
    "value": "DELETE"
  },
  {
    "name": "Create",
    "value": "CREATE"
  },
  {
    "name": "Procedure",
    "value": "PROCEDURE"
  },
  {
    "name": "Trigger",
    "value": "TRIGGER"
  }
];

export const CONTEST_STATUS = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  SCHEDULED: 'SCHEDULED'
}

export const CONTEST_MODE = {
  PRACTICE: "PRACTICE",
  EXAM: "EXAM"
}

export const CONTEST_TYPE = {
  PRACTICE: "PRACTICE",
  CONTEST: "CONTEST"
}

export const DATABASE = [
  {
    "id": 1,
    "name":"Mysql"
  },
  {
    "id": 2,
    "name":"Postgres"
  },
  {
    "id": 3,
    "name":"SQLite"
  },
  {
    "id": 4,
    "name":"Oracle"
  },
]

export const TYPE_MODAL = {
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
  INFOMATION: 'INFOMATION'
}

export const ERROR_CODE = {
  SUCCESS: 1,
  ERROR: 0,
  INVALID_US_PW: 10001,
  USER_EXIST: 10002,
  EMAIL_ALREADY_USE: 10003
}

export const ROLE_NAME = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN'
}