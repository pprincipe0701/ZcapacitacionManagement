using { nebula.com as rm } from '../db/schema';

 @path: 'service/zcapacitacion'
 service ZcapacitacionService {
  entity Competitors   as projection on rm.Competitors;     
 entity Courses  as projection on rm.Courses{
     *,
     masterLevel.description as descriptionLevel
 };
 entity Calendars  as projection on rm.Calendars;
 entity Tuitions  as projection on rm.Tuitions;
 entity TuitionCustom as select from rm.Tuitions as t inner join rm.Competitors as c on t.competitor.ID = c.ID {
        t.ID,
        t.code,
        t.calendar.ID as idCalendar,
        t.calendar.course.name as nombreCurso,
        t.calendar.course.masterLevel.ID as levelId,
        t.calendar.course.masterLevel.description as levelDescription,
        t.calendar.course.totalHours as totalHours,
        t.calendar.masterFrequence.ID as FrequenceId,
        t.calendar.masterFrequence.description as frequenceDescription,
        t.calendar.masterModality.ID as ModalityId,
        t.calendar.masterModality.description as modalityDescription,
        t.competitor.ID as idCompetitor,
        t.competitor.name as nameCompetitor,
        t.competitor.lastName as lastNameCompetitor,
        t.competitor.masterProfesion.ID as idMasterProfesionCompetitor,
        t.competitor.documentNumber as documentNumberCompetitor,
        t.competitor.sex as sexCompetitor,
        t.competitor.status as statusCompetitor,
        t.competitor.role as roleCompetitor,
        t.competitor.age as ageCompetitor,
        t.calendar.startDate as startDateCalendar
        
    };
   
     
 }