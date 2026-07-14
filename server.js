const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, "data", "db.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---- Helpers to read/write the "database" (a JSON file) ----
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ---- Login (very basic, no sessions/JWT — kept simple on purpose) ----
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

// ---- Doctors list (for patients to search/book) ----
app.get("/api/doctors", (req, res) => {
  const db = readDB();
  const doctors = db.users
    .filter(u => u.role === "doctor")
    .map(({ password, ...d }) => d);
  res.json(doctors);
});

// ---- Patient: book an appointment ----
app.post("/api/appointments", (req, res) => {
  const { patientId, doctorId, date, time, symptoms } = req.body;
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const db = readDB();

  // basic double-booking check
  const clash = db.appointments.find(
    a => a.doctorId === doctorId && a.date === date && a.time === time && a.status === "booked"
  );
  if (clash) return res.status(409).json({ error: "Slot already booked" });

  const appt = {
    id: "a" + (db.appointments.length + 1) + "_" + Date.now(),
    patientId,
    doctorId,
    date,
    time,
    symptoms: symptoms || "",
    status: "booked"
  };
  db.appointments.push(appt);
  writeDB(db);
  res.status(201).json(appt);
});

// ---- Patient: view own appointments ----
app.get("/api/appointments/patient/:id", (req, res) => {
  const db = readDB();
  const list = db.appointments.filter(a => a.patientId === req.params.id);
  res.json(list);
});

// ---- Doctor: view own appointments ----
app.get("/api/appointments/doctor/:id", (req, res) => {
  const db = readDB();
  const list = db.appointments.filter(a => a.doctorId === req.params.id);
  res.json(list);
});

// ---- Doctor: cancel an appointment ----
app.post("/api/appointments/:id/cancel", (req, res) => {
  const db = readDB();
  const appt = db.appointments.find(a => a.id === req.params.id);
  if (!appt) return res.status(404).json({ error: "Not found" });
  appt.status = "cancelled";
  writeDB(db);
  res.json(appt);
});

// ---- Admin: view all users ----
app.get("/api/admin/users", (req, res) => {
  const db = readDB();
  res.json(db.users.map(({ password, ...u }) => u));
});

// ---- Admin: add a doctor ----
app.post("/api/admin/doctors", (req, res) => {
  const { name, email, password, specialisation, workingHours } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const db = readDB();
  const newDoctor = {
    id: "u" + (db.users.length + 1),
    name,
    email,
    password,
    role: "doctor",
    specialisation: specialisation || "",
    workingHours: workingHours || ""
  };
  db.users.push(newDoctor);
  writeDB(db);
  const { password: _pw, ...safe } = newDoctor;
  res.status(201).json(safe);
});

// ---- Admin: view all appointments ----
app.get("/api/admin/appointments", (req, res) => {
  const db = readDB();
  res.json(db.appointments);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
