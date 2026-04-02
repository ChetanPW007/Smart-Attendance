const xlsx = require('xlsx');
const path = require('path');

const students = [
  { Name: 'Abhishek B S',           USN: 'U24E01CY001' },
  { Name: 'Abuzar G N',             USN: 'U24E01CY002' },
  { Name: 'Adishesh Pawar',         USN: 'U24E01CY003' },
  { Name: 'Aishwaraya',             USN: 'U24E01CY004' },
  { Name: 'Amulya T G',             USN: 'U24E01CY006' },
  { Name: 'Anusha K',               USN: 'U24E01CY007' },
  { Name: 'Apoorva Pavithra Rao',   USN: 'U24E01CY008' },
  { Name: 'Arjun R Mattigatti',     USN: 'U24E01CY010' },
  { Name: 'Ashwath H',              USN: 'U24E01CY012' },
  { Name: 'Ayesha Siddiqha Shaikh', USN: 'U24E01CY014' },
  { Name: 'Bapu Gowda Y',           USN: 'U24E01CY015' },
  { Name: 'Bhagyashree H',          USN: 'U24E01CY016' },
  { Name: 'Bhavana M N',            USN: 'U24E01CY017' },
  { Name: 'Bhoomika R K',           USN: 'U24E01CY018' },
  { Name: 'Bhuvan V D',             USN: 'U24E01CY019' },
  { Name: 'C Mohita',               USN: 'U24E01CY020' },
  { Name: 'Chandrakala A S',        USN: 'U24E01CY021' },
  { Name: 'Chetan Prakash Wardi',   USN: 'U24E01CY022' },
  { Name: 'Chethan C H',            USN: 'U24E01CY024' },
  { Name: 'Chidanand V',            USN: 'U24E01CY025' },
  { Name: 'D Pavitra',              USN: 'U24E01CY026' },
  { Name: 'G Ganga Bhavani',        USN: 'U24E01CY029' },
  { Name: 'Ganesh Biradar',         USN: 'U24E01CY030' },
  { Name: 'Harish H R',             USN: 'U24E01CY031' },
  { Name: 'Harshita S',             USN: 'U24E01CY032' },
  { Name: 'Harshith S',             USN: 'U24E01CY033' },
  { Name: 'Jeevan Naik H',          USN: 'U24E01CY034' },
  { Name: 'K Manasvi',              USN: 'U24E01CY035' },
  { Name: 'K S Bindu Shree',        USN: 'U24E01CY036' },
  { Name: 'Kannika T H',            USN: 'U24E01CY037' },
  { Name: 'Karthik Reddy K',        USN: 'U24E01CY038' },
  { Name: 'Lubaba Amber A',         USN: 'U24E01CY040' },
  { Name: 'Nikhitha M',             USN: 'U24E01CY041' },
  { Name: 'Sanjana M S',            USN: 'U24E01CY042' },
  { Name: 'Mazin Mukhtar',          USN: 'U24E01CY045' },
  { Name: 'Mohammed Rehan',         USN: 'U24E01CY046' },
  { Name: 'N Rakshitha',            USN: 'U24E01CY047' },
  { Name: 'Nethrapal M Jali',       USN: 'U24E01CY048' },
  { Name: 'Pavan B M',              USN: 'U24E01CY049' },
  { Name: 'Poojitha M',             USN: 'U24E01CY050' },
  { Name: 'Prakash M S',            USN: 'U24E01CY052' },
  { Name: 'Pranav S Chakrapani',    USN: 'U24E01CY053' },
  { Name: 'Prashant Beli',          USN: 'U24E01CY054' },
  { Name: 'Priyanka B',             USN: 'U24E01CY055' },
  { Name: 'Pushpa S',               USN: 'U24E01CY056' },
  { Name: 'Hazira R',               USN: 'U24E01CY057' },
  { Name: 'Rachana R V',            USN: 'U24E01CY058' },
  { Name: 'Rakshitha L',            USN: 'U24E01CY060' },
  { Name: 'Renukaradhya',           USN: 'U24E01CY061' },
  { Name: 'S Sonal Vaishnav',       USN: 'U24E01CY063' },
  { Name: 'Sanvi V Kori',           USN: 'U24E01CY065' },
  { Name: 'Sreekanth',              USN: 'U24E01CY067' },
  { Name: 'Shreelata',              USN: 'U24E01CY068' },
  { Name: 'Shreyas Wadone V',       USN: 'U24E01CY069' },
  { Name: 'Shubha B M',             USN: 'U24E01CY070' },
  { Name: 'Shukla E N',             USN: 'U24E01CY071' },
  { Name: 'Shinchana R',            USN: 'U24E01CY072' },
  { Name: 'Srusti A S',             USN: 'U24E01CY073' },
  { Name: 'Tejashwini M K',         USN: 'U24E01CY077' },
  { Name: 'Pradeep B',              USN: 'U25E01CY502' },
];

const ws = xlsx.utils.json_to_sheet(students);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Students');

const outPath = path.join(__dirname, '..', 'students_CY_2024.xlsx');
xlsx.writeFile(wb, outPath);
console.log(`✅ Excel file created: ${outPath}`);
console.log(`   Total students: ${students.length}`);
