const mongoose = require('mongoose');
const Student = require('./models/Student');
const dotenv = require('dotenv');

dotenv.config();

const studentsList = [
  { name: "Abhishek B S", usn: "U24E01CY001" },
  { name: "Abuzar G N", usn: "U24E01CY002" },
  { name: "Adishesh Pawar", usn: "U24E01CY003" },
  { name: "Aishwaraya", usn: "U24E01CY004" },
  { name: "Amulya T G", usn: "U24E01CY006" },
  { name: "Anusha K", usn: "U24E01CY007" },
  { name: "Apoorva Pavithra Rao", usn: "U24E01CY008" },
  { name: "Arjun R Mattigatti", usn: "U24E01CY010" },
  { name: "Ashwath H", usn: "U24E01CY012" },
  { name: "Ayesha Siddiqha Shaikh", usn: "U24E01CY014" },
  { name: "Bapu Gowda Y", usn: "U24E01CY015" },
  { name: "Bhagyashree H", usn: "U24E01CY016" },
  { name: "Bhavana M N", usn: "U24E01CY017" },
  { name: "Bhoomika R K", usn: "U24E01CY018" },
  { name: "Bhuvan V D", usn: "U24E01CY019" },
  { name: "C Mohita", usn: "U24E01CY020" },
  { name: "Chandrakala A S", usn: "U24E01CY021" },
  { name: "Chetan Prakash Wardi", usn: "U24E01CY022" },
  { name: "Chethan C H", usn: "U24E01CY024" },
  { name: "Chidanand V", usn: "U24E01CY025" },
  { name: "D Pavitra", usn: "U24E01CY026" },
  { name: "G Ganga Bhavani", usn: "U24E01CY029" },
  { name: "Ganesh Biradar", usn: "U24E01CY030" },
  { name: "Harish H R", usn: "U24E01CY031" },
  { name: "Harshita S", usn: "U24E01CY032" },
  { name: "Harshith S", usn: "U24E01CY033" },
  { name: "Jeevan Naik H", usn: "U24E01CY034" },
  { name: "K Manasvi", usn: "U24E01CY035" },
  { name: "K S Bindu Shree", usn: "U24E01CY036" },
  { name: "Kannika T H", usn: "U24E01CY037" },
  { name: "Karthik Reddy K", usn: "U24E01CY038" },
  { name: "Lubaba Amber A", usn: "U24E01CY040" },
  { name: "Nikhitha M", usn: "U24E01CY041" },
  { name: "Sanjana M S", usn: "U24E01CY042" },
  { name: "Mazin Mukhtar", usn: "U24E01CY045" },
  { name: "Mohammed Rehan", usn: "U24E01CY046" },
  { name: "N Rakshitha", usn: "U24E01CY047" },
  { name: "Nethrapal M Jali", usn: "U24E01CY048" },
  { name: "Pavan B M", usn: "U24E01CY049" },
  { name: "Poojitha M", usn: "U24E01CY050" },
  { name: "Prakash M S", usn: "U24E01CY052" },
  { name: "Pranav S Chakrapani", usn: "U24E01CY053" },
  { name: "Prashant Beli", usn: "U24E01CY054" },
  { name: "Priyanka B", usn: "U24E01CY055" },
  { name: "Pushpa S", usn: "U24E01CY056" },
  { name: "Hazira R", usn: "U24E01CY057" },
  { name: "Rachana R V", usn: "U24E01CY058" },
  { name: "Rakshitha L", usn: "U24E01CY060" },
  { name: "Renukaradhya", usn: "U24E01CY061" },
  { name: "S Sonal Vaishnav", usn: "U24E01CY063" },
  { name: "Sanvi V Kori", usn: "U24E01CY065" },
  { name: "Sreekanth", usn: "U24E01CY067" },
  { name: "Shreelata", usn: "U24E01CY068" },
  { name: "Shreyas Wadone V", usn: "U24E01CY069" },
  { name: "Shubha B M", usn: "U24E01CY070" },
  { name: "Shukla E N", usn: "U24E01CY071" },
  { name: "Shinchana R", usn: "U24E01CY072" },
  { name: "Srusti A S", usn: "U24E01CY073" },
  { name: "Tejashwini M K", usn: "U24E01CY077" },
  { name: "Pradeep B", usn: "U25E01CY502" }
];

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendanceDb';

mongoose.connect(DB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Wiping existing students...');
    await Student.deleteMany({});
    console.log('Inserting provided students list...');
    await Student.insertMany(studentsList);
    console.log('Data seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failure seeding data:', err);
    process.exit(1);
  });
