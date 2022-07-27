using { nebula.com as rm } from '../db/schema';

 @path: 'service/masteradmin'
 service MasterService {
  entity MasterProfesions as projection on rm.MasterProfesions;     
 entity MasterLevels as projection on rm.MasterLevels;
 entity MasterFrequences as projection on rm.MasterFrequences;
 entity MasterModalitys as projection on rm.MasterModalitys;
 entity MasterData as select from rm.MasterProfesions as m {
		m.ID,
        m.description,		
        null as groupMaster:String(20)
	};
     
 }