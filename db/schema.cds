namespace nebula.com;
using { Currency, managed, cuid } from '@sap/cds/common';

entity MasterProfesions : managed {
  key ID : Integer;
  description   : String(50);  
}
entity MasterLevels : managed {
  key ID : Integer;
  description   : String(50);  
}
entity MasterFrequences : managed {
  key ID : Integer;
  description   : String(50);  
}
entity MasterModalitys : managed {
  key ID : Integer;
  description   : String(50);  
}

entity Competitors : managed {
  key ID : UUID;
  name   : String(50);
  lastName  : String(150);
  sex  : String(12);
  documentNumber : String(8);
  age : Integer;
  role  : String(12);
  status: String(2);  
  masterProfesion : Association to MasterProfesions;
  tuitions  : Association to many Tuitions on tuitions.competitor = $self;
}

@assert.unique: {
  locale: [ name, masterLevel ]
  
}
entity Courses : managed {
  key ID : UUID;
  name : String(100);
  description   : String(255);  
  totalHours: Integer;
  cost : Decimal(9,2);
  currency: String(3);
  status: String(2);
  masterLevel : Association to MasterLevels;
  calendars    : Composition of many Calendars on calendars.course = $self;

}

entity Calendars : managed {
  key ID : UUID;
  startDate : Date;
  startHour   : String(5);  
  endHour: String(5);  
  masterFrequence : Association to MasterFrequences;
  masterModality : Association to MasterModalitys;
  course : Association to Courses;
}

entity Tuitions : managed {
  key ID : UUID;
  code: String(20);
  calendar : Association to Calendars;
  competitor : Association to Competitors;
  status: String(2);
}


