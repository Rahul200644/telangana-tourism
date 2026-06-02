// data/db.js - Database setup with better-sqlite3
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './data/tourism.db';
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── CREATE TABLES ───────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    description TEXT,
    best_season TEXT,
    famous_for TEXT
  );

  CREATE TABLE IF NOT EXISTS tourist_places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    timing TEXT,
    entry_fee TEXT,
    lat REAL,
    lng REAL,
    FOREIGN KEY (district_id) REFERENCES districts(id)
  );

  CREATE TABLE IF NOT EXISTS trip_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    from_district TEXT NOT NULL,
    to_district TEXT NOT NULL,
    days INTEGER NOT NULL,
    style TEXT,
    budget TEXT,
    itinerary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ─── SEED USERS ──────────────────────────────────────
function seedUsers() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c > 0) return;

  const hash1 = bcrypt.hashSync('telangana123', 10);
  const hash2 = bcrypt.hashSync('pass123', 10);

  db.prepare(`INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)`).run('admin','admin@telangana.gov.in',hash1,'admin');
  db.prepare(`INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)`).run('tourist','tourist@gmail.com',hash2,'user');
  console.log('✅ Users seeded');
}

// ─── SEED DISTRICTS ──────────────────────────────────
const DISTRICT_DATA = [
  {name:'Hyderabad',color:'#2563eb',lat:17.385,lng:78.4867,description:'The City of Pearls — Capital of Telangana with Mughal & Nizam heritage',best_season:'October–March',famous_for:'Charminar, Biryani, Golconda, IT Hub'},
  {name:'Warangal',color:'#d97706',lat:18.0,lng:79.58,description:'Ancient Kakatiya capital with magnificent fort and temples',best_season:'October–February',famous_for:'Warangal Fort, Ramappa Temple (UNESCO), Thousand Pillar Temple'},
  {name:'Adilabad',color:'#e85d04',lat:19.67,lng:78.53,description:'Tribal district with stunning waterfalls and dense forests',best_season:'July–January',famous_for:'Kuntala Waterfall, Fossil Park, Tribal Culture'},
  {name:'Karimnagar',color:'#0d9488',lat:18.44,lng:79.13,description:'Silver filigree craft capital with ancient forts on river banks',best_season:'October–March',famous_for:'Elgandal Fort, Karimnagar Silver Filigree, Manair Dam'},
  {name:'Nizamabad',color:'#0891b2',lat:18.67,lng:78.1,description:'Gateway to northern Telangana with historic forts and sanctuaries',best_season:'October–February',famous_for:'Nizamabad Fort, Pocharam Sanctuary, Turmeric farms'},
  {name:'Khammam',color:'#7c3aed',lat:17.25,lng:80.15,description:'Forested district with wildlife and the sacred Bhadrachalam temple',best_season:'October–March',famous_for:'Bhadrachalam Temple, Kinnerasani Sanctuary, Nagarjuna Sagar'},
  {name:'Nalgonda',color:'#dc2626',lat:17.05,lng:79.27,description:'Land of ancient Buddhist heritage and massive dam projects',best_season:'October–February',famous_for:'Nagarjunakonda, Nagarjuna Sagar, Yadagirigutta'},
  {name:'Mahbubnagar',color:'#059669',lat:16.74,lng:77.99,description:'District of natural wonders including India\'s oldest banyan tree',best_season:'November–February',famous_for:'Pillalamarri Banyan Tree, Alampur Temples, Jurala Dam'},
  {name:'Medak',color:'#9333ea',lat:18.05,lng:78.27,description:'Home to one of Asia\'s largest churches and ancient forts',best_season:'October–March',famous_for:'Medak Church, Medak Fort, Pocharam Dam'},
  {name:'Rangareddy',color:'#0284c7',lat:17.33,lng:78.55,description:'Suburban district with scenic lakes and spiritual temples',best_season:'October–March',famous_for:'Chilkur Balaji Temple, Osman Sagar, Mrugavani Park'},
  {name:'Siddipet',color:'#cc2b5e',lat:18.1,lng:78.85,description:'Newly developed district with Kaleshwaram project\'s scenic reservoirs',best_season:'October–February',famous_for:'Kondapochamma Sagar, Kaleshwaram Lift Irrigation'},
  {name:'Vikarabad',color:'#16a34a',lat:17.33,lng:77.9,description:'Hill station district near Hyderabad with trekking and nature',best_season:'July–December',famous_for:'Ananthagiri Hills, Kotepally Reservoir, Jungle Trekking'},
  {name:'Yadadri Bhuvanagiri',color:'#b45309',lat:17.57,lng:79.33,description:'Pilgrimage and heritage district with famous Narasimha temple',best_season:'October–March',famous_for:'Yadagirigutta Temple, Bhongir Fort, Narasimha Swamy'},
  {name:'Jagtiyal',color:'#0f766e',lat:18.8,lng:78.92,description:'Cultural district along the Godavari river with ancient forts',best_season:'October–February',famous_for:'Jagtial Fort, Godavari Ghats, Kondagattu Temple'},
  {name:'Bhadradri Kothagudem',color:'#7e22ce',lat:17.55,lng:80.62,description:'Sacred district of Lord Ram temple on the banks of Godavari',best_season:'October–March',famous_for:'Bhadrachalam Temple, Papikonda National Park, Godavari'},
  {name:'Hanumakonda',color:'#be123c',lat:17.97,lng:79.56,description:'Twin city of Warangal with magnificent Kakatiya temples',best_season:'October–February',famous_for:'Thousand Pillar Temple, Padmakshi Temple, Warangal Lake'},
  {name:'Mulugu',color:'#1d4ed8',lat:18.19,lng:80.08,description:'Tribal district with UNESCO heritage and world\'s largest tribal festival',best_season:'November–February',famous_for:'Ramappa Temple (UNESCO), Medaram Jatara, Kawal Tiger Reserve'},
  {name:'Mancherial',color:'#15803d',lat:18.87,lng:79.44,description:'Industrial and natural district on the Godavari',best_season:'October–March',famous_for:'Godavari Ghats, Ramagundham, Forest Trekking'},
  {name:'Nagarkurnool',color:'#b91c1c',lat:16.48,lng:78.32,description:'Gateway to Srisailam, one of 12 Jyotirlinga shrines',best_season:'November–February',famous_for:'Srisailam Temple, Srisailam Wildlife Sanctuary, Nallamala'},
  {name:'Wanaparthy',color:'#0369a1',lat:16.36,lng:78.07,description:'Historic zamindari town with magnificent palaces',best_season:'October–March',famous_for:'Wanaparthy Palace, Gattu Hanuman Temple'},
  {name:'Suryapet',color:'#a16207',lat:17.14,lng:79.62,description:'Agricultural district with scenic lakes and river confluences',best_season:'October–February',famous_for:'Chetla Lake, Triveni Sangamam, Huzurnagar'},
  {name:'Rajanna Sircilla',color:'#166534',lat:18.38,lng:78.83,description:'Weaving capital and pilgrimage district',best_season:'October–March',famous_for:'Vemulawada Temple, Handloom Weaving, Koulas Fort'},
  {name:'Peddapalli',color:'#7c3aed',lat:18.62,lng:79.38,description:'Godavari district with ancient temples and scenic ghats',best_season:'October–February',famous_for:'Godavari Ghats, Ramagiri Fort, Manthani Temple'},
  {name:'Kamareddy',color:'#0e7490',lat:18.32,lng:78.33,description:'Agricultural district with scenic reservoirs',best_season:'October–March',famous_for:'Nizamsagar Dam, Tribal Culture, Anjaneya Temples'},
  {name:'Sangareddy',color:'#6d28d9',lat:17.62,lng:78.08,description:'Fast-developing district near Hyderabad with forts',best_season:'October–March',famous_for:'Narayankhed Fort, Sangareddy Fort'},
  {name:'Jayashankar Bhupalpally',color:'#047857',lat:18.44,lng:79.97,description:'Dense forest district with Kawal Tiger Reserve',best_season:'November–February',famous_for:'Kawal Tiger Reserve, Godavari Gorge, Tribes'},
  {name:'Jogulamba Gadwal',color:'#dc2626',lat:16.23,lng:77.81,description:'Sacred district with a Shakti Peetha and Chalukya temples',best_season:'November–February',famous_for:'Jogulamba Temple (Shakti Peetha), Alampur, Krishna backwaters'},
  {name:'Narayanpet',color:'#4f46e5',lat:16.73,lng:77.49,description:'Famous for handloom Narayanpet sarees',best_season:'October–March',famous_for:'Narayanpet Sarees, Makthal Fort'},
  {name:'Nirmal',color:'#b45309',lat:19.09,lng:78.35,description:'Craft town famous for Nirmal paintings and wooden art',best_season:'October–February',famous_for:'Nirmal Paintings, Kuntala Waterfall, Nirmal Toys'},
  {name:'Jangaon',color:'#0f766e',lat:17.72,lng:79.15,description:'Cultural district with ancient temples and fort ruins',best_season:'October–March',famous_for:'Jangaon Fort, Ancient Temples'},
  {name:'Mahabubabad',color:'#1e40af',lat:17.6,lng:80.02,description:'Tribal district with forested landscapes',best_season:'October–March',famous_for:'Mahabubabad Fort, Dense Forests, Tribal Heritage'},
  {name:'Kumurambheem Asifabad',color:'#7e22ce',lat:19.28,lng:79.31,description:'Tribal hero memorial district with tiger reserves',best_season:'November–March',famous_for:'Kumurambheem Memorial, Jannaram Sanctuary, Sirpur Lake'},
  {name:'Medchal-Malkajgiri',color:'#0369a1',lat:17.6,lng:78.58,description:'Suburban Hyderabad district with scenic lakes and parks',best_season:'October–March',famous_for:'Hussain Sagar, Keesaragutta Temple, Shamirpet Lake'}
];

const PLACES_DATA = {
  'Hyderabad': [
    {name:'Charminar',type:'Heritage',icon:'🏛️',description:'Iconic 16th-century monument and mosque — symbol of Hyderabad, built by Sultan Muhammad Quli Qutb Shah in 1591.',timing:'9AM–5:30PM',entry_fee:'₹25 Indians, ₹300 Foreigners',lat:17.3616,lng:78.4747},
    {name:'Golconda Fort',type:'Heritage',icon:'🏰',description:'Magnificent medieval fort with sound & light shows, famous for its acoustic dome and diamond mines history.',timing:'8AM–5:30PM',entry_fee:'₹15 Indians, ₹200 Foreigners',lat:17.3833,lng:78.4011},
    {name:'Hussain Sagar Lake',type:'Scenic',icon:'🌊',description:'Giant heart-shaped lake with a 17-meter Buddha statue on a rocky island. Boat rides available.',timing:'All day',entry_fee:'Free (Boat: ₹50)',lat:17.4239,lng:78.4738},
    {name:'Ramoji Film City',type:'Entertainment',icon:'🎬',description:'World\'s largest film studio complex covering 2000 acres — a complete fantasy world for families.',timing:'9AM–5:30PM',entry_fee:'₹1500 adults',lat:17.2543,lng:78.6808},
    {name:'Salar Jung Museum',type:'Heritage',icon:'🏛️',description:'India\'s largest one-person collection — priceless art from across the world collected by Mir Yousuf Ali Khan.',timing:'10AM–5PM (closed Fri)',entry_fee:'₹20 adults',lat:17.3716,lng:78.4804},
    {name:'Birla Mandir',type:'Spiritual',icon:'🛕',description:'Stunning white marble Venkateswara temple atop a rocky hill with panoramic views of Hyderabad city.',timing:'7AM–12PM, 2PM–9PM',entry_fee:'Free',lat:17.4062,lng:78.4691}
  ],
  'Warangal': [
    {name:'Warangal Fort',type:'Heritage',icon:'🏰',description:'Ancient Kakatiya capital with spectacular carved stone gateways (Kakatiya Kala Thoranam) — a symbol of Telangana.',timing:'Sunrise–Sunset',entry_fee:'₹25',lat:18.0045,lng:79.5879},
    {name:'Thousand Pillar Temple',type:'Spiritual',icon:'🛕',description:'12th century Kakatiya temple with 1000 intricately carved pillars in star-shaped design.',timing:'6AM–6PM',entry_fee:'Free',lat:17.9745,lng:79.5988},
    {name:'Ramappa Temple',type:'Heritage',icon:'🏛️',description:'UNESCO World Heritage Site built in 1213 AD — famous for its unique floating brick construction and intricate sculptures.',timing:'6AM–6PM',entry_fee:'₹30',lat:18.2557,lng:79.9544},
    {name:'Pakhal Lake',type:'Nature',icon:'🌊',description:'Artificial lake built in 1213 AD by the Kakatiyas, surrounded by the Pakhal Wildlife Sanctuary.',timing:'All day',entry_fee:'Free',lat:17.8167,lng:80.0167}
  ],
  'Adilabad': [
    {name:'Kuntala Waterfall',type:'Nature',icon:'🌊',description:'Tallest waterfall in Telangana at 147 ft — surrounded by dense teak forests and tribal villages.',timing:'All day (monsoon best)',entry_fee:'Free',lat:19.4072,lng:78.3039},
    {name:'Fossil Park',type:'Heritage',icon:'🦕',description:'Unique geological park with 250 million-year-old petrified wood fossils — a rare natural heritage site.',timing:'10AM–5PM',entry_fee:'₹20',lat:19.6917,lng:78.5167},
    {name:'Pochera Waterfall',type:'Nature',icon:'🌊',description:'Scenic 21m waterfall 5km from Adilabad through tribal forest paths.',timing:'All day',entry_fee:'Free',lat:19.7217,lng:78.5367},
    {name:'Kawal Tiger Reserve',type:'Nature',icon:'🐅',description:'Core tiger habitat covering 892 sq km with leopards, sloth bears, and 200+ bird species.',timing:'6AM–6PM (with guide)',entry_fee:'₹200 per jeep',lat:19.2833,lng:79.5}
  ]
};

function seedDistricts() {
  const count = db.prepare('SELECT COUNT(*) as c FROM districts').get();
  if (count.c > 0) return;

  const insertDistrict = db.prepare(`INSERT INTO districts (name,color,lat,lng,description,best_season,famous_for) VALUES (?,?,?,?,?,?,?)`);
  const insertPlace = db.prepare(`INSERT INTO tourist_places (district_id,name,type,icon,description,timing,entry_fee,lat,lng) VALUES (?,?,?,?,?,?,?,?,?)`);

  DISTRICT_DATA.forEach(d => {
    const result = insertDistrict.run(d.name, d.color, d.lat, d.lng, d.description, d.best_season, d.famous_for);
    const districtId = result.lastInsertRowid;
    const places = PLACES_DATA[d.name] || [];
    places.forEach(p => {
      insertPlace.run(districtId, p.name, p.type, p.icon, p.description, p.timing, p.entry_fee, p.lat || d.lat, p.lng || d.lng);
    });
  });
  console.log('✅ Districts and places seeded');
}

// Run seeds
seedUsers();
seedDistricts();

module.exports = db;
