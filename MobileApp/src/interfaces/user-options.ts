
export interface UserOptions {
  username: string,
  password: string,
  Confirmpassword: string,
  Email: string,
  PhoneNumber: string,
  Name:string
}


export interface contacts {
  name: string,
  email: string,
  phone: string
}

export interface ForgotPwd {
  LoginId: string
}

export interface AddMeeting {
  title: string,
  notes: string,
  startDate: string,
  endDate: string,
  Location: string,
  Category_Type:string,
  //All_Day : string,
  AddContact:string[],
  email: string[]
}

export interface UserProfile {
  UserID: string,
  LoginID: string,
  UserName:string,
  Password: string,
  Confirmpassword: string,
  NewPassword: string,
  Email: string,
  PhoneNumber: Number
  //EmailNotification: Boolean,
  //BusinessColor: string,
  //PersonalColor: string
  //AddContact:string[],
  //email: string[]
}
