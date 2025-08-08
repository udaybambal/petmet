const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'registrations.json');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Seed data if file doesn't exist
if (!fs.existsSync(dataFile)) {
  const seed = [
    {
      id: 'seed-1',
      ownerName: 'Aarav Sharma',
      phone: '+91 98765 43210',
      email: 'aarav@example.com',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      breed: 'Labrador Retriever',
      gender: 'Male',
      ageMonths: 24,
      vaccinated: true,
      serviceType: 'Stud Service',
      description: 'Friendly lab with champion lineage, great temperament.',
      imageUrls: ['https://place.dog/600/400'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-2',
      ownerName: 'Diya Patel',
      phone: '+91 99887 76655',
      email: 'diya@example.com',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      breed: 'German Shepherd',
      gender: 'Female',
      ageMonths: 30,
      vaccinated: true,
      serviceType: 'Mating Assistance',
      description: 'Well-trained and healthy, looking for a compatible mate.',
      imageUrls: ['https://place.dog/600/401'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-3',
      ownerName: 'Rohan Gupta',
      phone: '+91 91234 56789',
      email: 'rohan@example.com',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      breed: 'Beagle',
      gender: 'Male',
      ageMonths: 18,
      vaccinated: true,
      serviceType: 'Stud Service',
      description: 'Playful beagle, great with families.',
      imageUrls: ['https://place.dog/600/402'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'seed-4',
      ownerName: 'Meera Nair',
      phone: '+91 90000 11122',
      email: 'meera@example.com',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      breed: 'Golden Retriever',
      gender: 'Female',
      ageMonths: 28,
      vaccinated: true,
      serviceType: 'Stud Service',
      description: 'Calm and loving golden, excellent health records.',
      imageUrls: ['https://place.dog/600/403'],
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(dataFile, JSON.stringify(seed, null, 2));
}

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Static assets
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'public')));

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (/(jpg|jpeg|png|gif)$/i.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

function readRegistrations() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeRegistrations(list) {
  fs.writeFileSync(dataFile, JSON.stringify(list, null, 2));
}

// API: Create registration
app.post('/api/register', upload.array('dogImages', 8), (req, res) => {
  try {
    const {
      ownerName,
      phone,
      email,
      city,
      state,
      pincode,
      breed,
      gender,
      ageMonths,
      vaccinated,
      serviceType,
      description
    } = req.body;

    if (!ownerName || !city || !breed || !gender) {
      return res.status(400).json({ error: 'Missing required fields: ownerName, city, breed, gender' });
    }

    const uploaded = (req.files || []).map((f) => `/uploads/${f.filename}`);

    const registration = {
      id: 'reg-' + Date.now(),
      ownerName,
      phone: phone || '',
      email: email || '',
      city,
      state: state || '',
      pincode: pincode || '',
      breed,
      gender,
      ageMonths: ageMonths ? Number(ageMonths) : undefined,
      vaccinated: String(vaccinated).toLowerCase() === 'true' || vaccinated === 'on',
      serviceType: serviceType || 'Stud Service',
      description: description || '',
      imageUrls: uploaded,
      createdAt: new Date().toISOString()
    };

    const list = readRegistrations();
    list.push(registration);
    writeRegistrations(list);

    res.json({ success: true, registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// API: List registrations with optional filtering by city or pincode
app.get('/api/registrations', (req, res) => {
  const { city, pincode } = req.query;
  const list = readRegistrations();

  let filtered = list;
  if (city) {
    const lc = String(city).toLowerCase();
    filtered = filtered.filter((r) => String(r.city || '').toLowerCase().includes(lc));
  }
  if (pincode) {
    const pc = String(pincode).trim();
    filtered = filtered.filter((r) => String(r.pincode || '').startsWith(pc));
  }

  res.json({ count: filtered.length, results: filtered });
});

// Fallback to index.html for base route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PawMilan server running on http://localhost:${PORT}`);
});