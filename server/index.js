import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Database setup
const db = new sqlite3.Database('./server/game.db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../dist/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Word lists for the game
const words = [
  "Apfel", "Baum", "Haus", "Auto", "Fluss", "Tisch", "Stuhl", "Mond", "Sonne", 
    "Stern", "Wolke", "Regen", "Schnee", "Blume", "Wald", "Berg", "Meer", "Strand", 
    "Himmel", "Vogel", "Fisch", "Hund", "Katze", "Pferd", "Kuh", "Schaf", "Löwe", 
    "Tiger", "Bär", "Wolf", "Fuchs", "Reh", "Hase", "Schlange", "Krokodil", "Adler", 
    "Falke", "Eule", "Pinguin", "Delfin", "Wal", "Haifisch", "Klippe", "Insel", 
    "Wüste", "Oase", "Vulkan", "Höhle", "See", "Teich", "Bach", "Wasserfall", 
    "Nacht", "Stein", "Sand", "Erde", "Steam", "Tornado", "Hurrikan", "Blitz", 
    "Donner", "Nebel", "Frost", "Tau", "Regenbogen", "Brücke", "Turm", "Schloss", 
    "Palast", "Kirche", "Tempel", "Moschee", "Hütte", "Zelt", "Villa", "Wohnung", 
    "Büro", "Schule", "Universität", "Among Us", "Krankenhaus", "Markt", 
    "Supermarkt", "Restaurant", "Café", "Bar", "Park", "Garten", "Spielplatz", 
    "Stadion", "Theater", "Kino", "Museum", "Zoo", "Aquarium", "Flughafen", 
    "Bahnhof", "Hafen", "Straße", "Autobahn", "Weg", "Pfad", "Kreuzung", "Laterne", 
    "Ampel", "Schild", "Zaun", "Tor", "Tür", "Fenster", "Dach", "Wand", "Boden", 
    "Teppich", "Lampe", "Spiegel", "Schrank", "Squid Game", "Sofa", "Bett", "Kissen", 
    "Spider-Man", "Vorhang", "Uhr", "Telefon", "Computer", "Laptop", "Tablet", 
    "Fernseher", "Radio", "Kamera", "Kopfhörer", "Lautsprecher", "Buch", "Heft", 
    "Stift", "Papier", "Bleistift", "Radiergummi", "Lineal", "Schere", "Kleber", 
    "Pinsel", "Farbe", "Leinwand", "Bild", "Foto", "Rahmen", "Skulptur", "Vase", 
    "Kerze", "Blumentopf", "Spongebob", "Schlüssel", "Schloss", "Kette", "Ring", 
    "Armband", "Halskette", "Uhr", "Brille", "Hut", "Schal", "Handschuh", "Mantel", 
    "Jacke", "Hose", "Hemd", "Kleid", "NPC", "Schuhe", "Stiefel", "Socken", 
    "Gürtel", "Tasche", "Rucksack", "Koffer", "Geldbörse", "Messer", "Gabel", 
    "Löffel", "Teller", "Tasse", "Glas", "Schüssel", "Pfanne", "Topf", "Herd", 
    "Ofen", "Kühlschrank", "Mikrowelle", "Toaster", "Wasserkocher", "Kaffeemaschine", 
    "Besen", "Eimer", "Schaufel", "Hammer", "Nagel", "Schraube", "Schraubendreher", 
    "Säge", "Bohrer", "Tastatur", "Werkzeug", "Pinsel", "Farbeimer", "Tapete", 
    "Zahide", "Discord", "Kabel", "Stecker", "Friseur", "Glühbirne", "Batterie", 
    "Kerze", "Streichholz", "Feuerzeug", "Fackel", "Kompass", "Karte", "Globus", 
    "Teleskop", "Mikroskop", "Waage", "Thermometer", "Barometer", "Stoppuhr", 
    "Kalender", "Notizbuch", "Tagebuch", "Brief", "Umschlag", "Briefmarke", 
    "Paket", "Postkarte", "Zeitung", "Magazin", "Roman", "Avengers", "Krater", 
    "Bingo", "Film", "Serie", "Musik", "Lied", "Album", "Konzert", 
    "Band", "Orchester", "Gitarre", "Klavier", "Controller", "Brainrot", "Schlagzeug", 
    "Mikrofon", "Tanz", "Ballett", "Uno", "Musical", "Festival", "Karneval", 
    "Parade", "Feuerwerk", "Spiel", "Brettspiel", "Karten", "Würfel", "Puppe", 
    "Teddybär", "Ball", "Fahrrad", "Roller", "Skateboard", "Schlitten", "Ski", 
    "ChatGPT", "Schlittschuh", "Surfbrett", "Snapchat", "Boot", "Schiff", 
    "Flugzeug", "Hubschrauber", "Rakete", "Ufo", "Astronaut", "Satellit", 
    "Roboter", "Drohne", "Pirat", "Schatz", "Insel", "Pizza", "Winter", 
    "Chaosflo44", "Ritter", "König", "Avatar", "Prinz", "Prinzessin", "Drache", 
    "Zauberer", "Hexe", "Zauberstab", "Trank", "Buch", "Zauber", "Geist", 
    "Vampir", "Werwolf", "Zombie", "Monster", "Skelett", "Kürbis", "Regen", 
    "Halloween", "Weihnachten", "Ostern", "Geburtstag", "Geschenk", "Torte", 
    "Kerze", "Ballon", "Konfetti", "Feier", "Hochzeit", "Baby", "Familie", 
    "KI", "Liebe", "Hund", "Freude", "Trauer", "Angst", "Mut", "Hoffnung", 
    "Träumen", "Wunsch", "Ziel", "Erfolg", "Misserfolg", "Abenteuer", "Anime", 
    "Urlaub", "Hotel", "Camping", "Wandern", "Klettern", "Schwimmen", "Tauchen", 
    "Angeln", "Deutschland", "Sport", "Fußball", "Basketball", "Tennis", "Golf", 
    "Boxen", "Laufen", "Yoga", "Fitness", "Meditation", "Gesundheit", "Arzt", 
    "Medizin", "Tetris", "Spritze", "Verband", "Krankheit", "Fieber", "Husten", 
    "Schmerz", "Wunde", "Blut", "Knochen", "Skbidi Toilet", "Herz", "Gehirn", "Auge", 
    "Ohr", "Nase", "Mund", "Zunge", "Haut", "Haar", "Bart", "Michael Jackson", "Zahn", 
    "Lachen", "Weinen", "Schreien", "Flüstern", "Helene Fischer", "Standartskill", "Schlafen", 
    "Essen", "Trinken", "Kochen", "Dab", "Minecraft", "Pizza", "Burger", 
    "Salat", "Suppe", "Kuchen", "Eis", "Schokolade", "Bonbon", "Kaffee", "Tee", 
    "Wasser", "Saft", "Wein", "Bier", "Milch", "Käse", "Brot", "Butter", "Ei", 
    "Fleisch", "Fisch", "Gemüse", "Obst", "Banane", "Berlin", "Zitrone", "Traube", 
    "Erdbeere", "Kirsche", "Mango", "Ananas", "Kiwi", "Melone", "Nuss", "Korn", 
    "Reis", "Nudeln", "Kartoffel", "Tomate", "Zwiebel", "Knoblauch", "Karotte", 
    "Blumenkohl", "Brokkoli", "Gurke", "Paprika", "Salat", "Pilz", "Oliven", 
    "UwU", "Ohio", "Ariana Grande", "Zimt", "Corona", "Salz", "Zucker", "Honig", 
    "Dreier", "Fortnite", "Sigma", "Soße", "Suppe", "Valorant", "Roblox", "Sushi", 
    "Taco", "Pasta", "Lasagne", "Taylor Swift", "Harry Potter", "Star Wars", 
    "Marvel", "Disney", "Netflix", "Spotify", "Google", "Apple", "Iron Man", 
    "Amazon", "Facebook", "Instagram", "Twitter", "YouTube", "TikTok", "Zahnpasta",
    "Video", "Elefant", "Sex", "Penis", "Elon Musk", "Donald Trump", 
    "Apocalypse", "Vergangenheit", "Zukunft", "Zeit", "Urknall", "Lego",
    "Cola", "Trymacs", "Apored", "Cheeseburger", "Multimillionär", "McDonalds",
    "Burger King", "Ostsee", "Europa", "Sahara", "Hausaufgaben", "Amerika",
    "Kühlschrank", "Meteor", "Sonnensystem", "Obdachlos", "Taschenrechner",
    "Streamer", "Bauarbeiter", "Livestream", "Tagesschau", "Vulkan", "Dorf", "Frankreich",
    "Held", "Batman", "Superman", "Nutella", "Samsung", "MrBeast", "Mülleimer", 
    "Crypto", "Terminator", "Weltuntergang", "Raumschiff", "Spinne", "Müdigkeit",
    "Lachflash", "Wasserstoff", "Konsole", "Katy Perry", "The Rock", "RGB", 
    "Zeus", "Kaktuseis", "Mario", "Luigi", "Popcorn", "Grafikkarte", "Laptop",
    "Unendlichkeit", "Kindheit", "Explosion", "Albert Einstein", "Rapper",
    "Kino", "Fußball", "Fensterbank", "Keks", "Müsli", "Wolldecke", "Trommel", "Schrankwand", "Kühltasche", "Mülleimer",
    "Waschmaschine", "Trockner", "Fernbedienung", "Seife", "Duschgel", "Shampoo", "Handtuch",
    "Spülmittel", "Geschirr", "Wäsche", "Bettwäsche", "Matratze", "Lattenrost", "Wecker", "Kalender",
    "Termin", "Schreibtisch", "Ordner", "Regal", "Ordnung", "Spielzeug", "Puzzle", "Feder", "Ziegel",
    "Nagellack", "Haargummi", "Kamm", "Bürste", "Gießkanne", "Rasen", "Gartenzaun", "Blatt", "Ast",
    "Baumstamm", "Stroh", "Heu", "Mist", "Kuhstall", "Scheune", "Hühnerstall", "Traktor", "Schubkarre",
    "Leiter", "Besenstiel", "Schwamm", "Eimer", "Pfanne", "Teller", "Lappen", "Tuch", "Besen", "Keramik",
    "Zange", "Zange", "Lichtschalter", "Steckdose", "Sicherung", "Kabeltrommel", "Verlängerungskabel",
    "Teppichboden", "Fliese", "Tapete", "Müllsack", "Karton", "Klebeband", "Reißzwecke", "Nadel",
    "Knopf", "Reißverschluss", "Schere", "Tacker", "Locher", "Kugelschreiber", "Textmarker",
    "Karteikarte", "Briefumschlag", "Porto", "Schreibblock", "Radiergummi", "Schulranzen",
    "Turnbeutel", "Trinkflasche", "Brotdose", "Lineal", "Zirkel", "Tafel", "Kreide", "Schulbank",
    "Schulhof", "Klassenzimmer", "Lehrerzimmer", "Hausaufgabe", "Zeugnis", "Noten", "Stundenplan",
    "Pause", "Katzenfutter", "Kantine", "Schulbus", "Haltestelle", "Fußweg", "Zebrastreifen", "Straßenlaterne",
    "Fußgänger", "Ampel", "Radweg", "Bürgersteig", "Straßenbahn", "U-Bahn", "Rolltreppe", "Aufzug",
    "Treppenhaus", "Geländer", "Fensterrahmen", "Gardine", "Vorhang", "Kleiderbügel", "Waschkorb",
    "Bügelbrett", "Wäscheständer", "Sofa", "Couch", "Wohnzimmertisch", "Teppich", "Becher", "Dose",
    "Deckel", "Schraubglas", "Schale", "Topflappen", "Wasserhahn", "Abfluss", "Spüle", "Backofen",
    "Backblech", "Pfannenwender", "Kochlöffel", "Schneebesen", "Sieb", "Reibe", "Toaster", "Mikrowelle",
    "Eierkocher", "Kaffeefilter", "Milchaufschäumer", "Kühlschrank", "Gefrierschrank", "Eisfach",
    "Einkaufskorb", "Einkaufstasche", "Supermarkt", "Regal", "Warenkorb", "Kasse", "Kassenzettel",
    "Quittung", "EC-Karte", "Bargeld", "Geldbeutel", "Münze", "Schein", "Bon", "Tankstelle", "Zapfsäule",
    "Parkplatz", "Parkhaus", "Garage", "Fahrradständer", "Straßenkarte", "Navi", "Rucksack", "Reisetasche",
    "Kofferraum", "Autoschlüssel", "Zündschlüssel", "Autositze", "Lenkrad", "Sitzgurt", "Bremse",
    "Gaspedal", "Kupplung", "Scheibenwischer", "Blinker", "Rückspiegel", "Seitenspiegel", "Kofferraum",
    "Motorhaube", "Kennzeichen", "Scheinwerfer", "Rücklicht", "Reifen", "Felge", "Radkappe", "Luftdruck",
    "Tacho", "Tankanzeige", "Ölstand", "Waschwasser", "Lüftung", "Heizung", "Angela Merkel", "Barack Obama", "Leonardo DiCaprio", "Shakira", "Ronaldo",
    "Messi", "Bill Gates", "Steve Jobs", "Justin Bieber", "Taylor Swift",
    "Ariana Grande", "Elon Musk", "Dwayne Johnson", "MrBeast", "PewDiePie",
    "Gronkh", "Harry Potter", "Spider-Man", "Iron Man", "SpongeBob"
];

// Helper functions
function generateLobbyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

function generateImposterHint(word) {
  if (word.length <= 3) return word;
  
  const visibleCount = Math.max(1, Math.floor(word.length * 0.4));
  const positions = [];
  
  // Always show first character
  positions.push(0);
  
  // Randomly select other positions
  while (positions.length < visibleCount && positions.length < word.length) {
    const pos = Math.floor(Math.random() * word.length);
    if (!positions.includes(pos)) {
      positions.push(pos);
    }
  }
  
  return word.split('').map((char, index) => 
    positions.includes(index) ? char : '_'
  ).join('');
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// API Routes

// User registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, error: 'Benutzername und Passwort sind erforderlich' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.json({ success: false, error: 'Benutzername muss zwischen 3 und 20 Zeichen lang sein' });
  }

  if (password.length < 6) {
    return res.json({ success: false, error: 'Passwort muss mindestens 6 Zeichen lang sein' });
  }

  try {
    // Check if username already exists
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.json({ success: false, error: 'Datenbankfehler' });
      }

      if (row) {
        return res.json({ success: false, error: 'Benutzername bereits vergeben' });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      db.run(
        'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
        [userId, username, hashedPassword],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, error: 'Fehler beim Erstellen des Benutzers' });
          }

          const user = {
            id: userId,
            username: username,
            gamesPlayed: 0,
            timesImposter: 0,
            imposterWins: 0
          };

          res.json({ success: true, user });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.json({ success: false, error: 'Serverfehler' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, error: 'Benutzername und Passwort sind erforderlich' });
  }

  try {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.json({ success: false, error: 'Datenbankfehler' });
        }

        if (!row) {
          return res.json({ success: false, error: 'Benutzername oder Passwort falsch' });
        }

        const isValidPassword = await bcrypt.compare(password, row.password);
        if (!isValidPassword) {
          return res.json({ success: false, error: 'Benutzername oder Passwort falsch' });
        }

        const user = {
          id: row.id,
          username: row.username,
          gamesPlayed: row.games_played || 0,
          timesImposter: row.times_imposter || 0,
          imposterWins: row.imposter_wins || 0
        };

        res.json({ success: true, user });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.json({ success: false, error: 'Serverfehler' });
  }
});

// User verification endpoint
app.post('/api/verify-user', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ success: false, error: 'Benutzer-ID ist erforderlich' });
  }

  db.get(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.json({ success: false, error: 'Datenbankfehler' });
      }

      if (!row) {
        return res.json({ success: false, error: 'Benutzer nicht gefunden' });
      }

      const user = {
        id: row.id,
        username: row.username,
        gamesPlayed: row.games_played || 0,
        timesImposter: row.times_imposter || 0,
        imposterWins: row.imposter_wins || 0
      };

      res.json({ success: true, user });
    }
  );
});

// Get user by ID
app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params;

  db.get(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.json({ success: false, error: 'Datenbankfehler' });
      }

      if (!row) {
        return res.json({ success: false, error: 'Benutzer nicht gefunden' });
      }

      const user = {
        id: row.id,
        username: row.username,
        gamesPlayed: row.games_played || 0,
        timesImposter: row.times_imposter || 0,
        imposterWins: row.imposter_wins || 0
      };

      res.json({ success: true, user });
    }
  );
});

// Update user profile
app.post('/api/update-profile', async (req, res) => {
  const { userId, newUsername, currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.json({ success: false, error: 'Benutzer-ID ist erforderlich' });
  }

  try {
    // Get current user data
    db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.json({ success: false, error: 'Datenbankfehler' });
      }

      if (!user) {
        return res.json({ success: false, error: 'Benutzer nicht gefunden' });
      }

      let updateFields = [];
      let updateValues = [];

      // Check if username should be updated
      if (newUsername && newUsername !== user.username) {
        if (newUsername.length < 3 || newUsername.length > 20) {
          return res.json({ success: false, error: 'Benutzername muss zwischen 3 und 20 Zeichen lang sein' });
        }

        // Check if new username is already taken
        db.get('SELECT id FROM users WHERE username = ? AND id != ?', [newUsername, userId], async (err, existingUser) => {
          if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, error: 'Datenbankfehler' });
          }

          if (existingUser) {
            return res.json({ success: false, error: 'Benutzername bereits vergeben' });
          }

          // Continue with update
          await performUpdate();
        });
      } else {
        await performUpdate();
      }

      async function performUpdate() {
        // Add username to update if provided
        if (newUsername && newUsername !== user.username) {
          updateFields.push('username = ?');
          updateValues.push(newUsername);
        }

        // Check password update
        if (currentPassword && newPassword) {
          const isValidPassword = await bcrypt.compare(currentPassword, user.password);
          if (!isValidPassword) {
            return res.json({ success: false, error: 'Aktuelles Passwort ist falsch' });
          }

          if (newPassword.length < 6) {
            return res.json({ success: false, error: 'Neues Passwort muss mindestens 6 Zeichen lang sein' });
          }

          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
          updateFields.push('password = ?');
          updateValues.push(hashedNewPassword);
        }

        if (updateFields.length === 0) {
          return res.json({ success: false, error: 'Keine Änderungen vorgenommen' });
        }

        // Perform the update
        updateValues.push(userId);
        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

        db.run(sql, updateValues, function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.json({ success: false, error: 'Fehler beim Aktualisieren des Profils' });
          }

          // Return updated user data
          db.get('SELECT * FROM users WHERE id = ?', [userId], (err, updatedUser) => {
            if (err) {
              console.error('Database error:', err);
              return res.json({ success: false, error: 'Datenbankfehler' });
            }

            const userData = {
              id: updatedUser.id,
              username: updatedUser.username,
              gamesPlayed: updatedUser.games_played || 0,
              timesImposter: updatedUser.times_imposter || 0,
              imposterWins: updatedUser.imposter_wins || 0
            };

            res.json({ success: true, user: userData });
          });
        });
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.json({ success: false, error: 'Serverfehler' });
  }
});

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', (userData) => {
    if (userData && userData.id) {
      connectedUsers.set(socket.id, userData);
      socket.emit('authenticated', { success: true });
      console.log(`User ${userData.username} authenticated with socket ${socket.id}`);
    } else {
      socket.emit('authenticated', { success: false });
    }
  });

  socket.on('create-lobby', async (data) => {
    try {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'Nicht authentifiziert' });
        return;
      }

      const lobbyId = uuidv4();
      const lobbyCode = generateLobbyCode();
      const playerId = uuidv4();

      // Create lobby in database
      db.run(
        'INSERT INTO lobbies (id, code, host_id) VALUES (?, ?, ?)',
        [lobbyId, lobbyCode, user.id],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            socket.emit('error', { message: 'Fehler beim Erstellen der Lobby' });
            return;
          }

          // Create player entry
          db.run(
            'INSERT INTO players (id, lobby_id, user_id, username, socket_id, is_host) VALUES (?, ?, ?, ?, ?, ?)',
            [playerId, lobbyId, user.id, user.username, socket.id, 1],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                socket.emit('error', { message: 'Fehler beim Beitreten der Lobby' });
                return;
              }

              // Create game state
              db.run(
                'INSERT INTO game_states (lobby_id) VALUES (?)',
                [lobbyId],
                function(err) {
                  if (err) {
                    console.error('Database error:', err);
                    socket.emit('error', { message: 'Fehler beim Erstellen des Spielstatus' });
                    return;
                  }

                  socket.join(lobbyCode);
                  socket.emit('lobby-created', {
                    lobbyId,
                    lobbyCode,
                    playerId,
                    isHost: true,
                    hostUsername: user.username
                  });

                  // Send initial lobby update
                  sendLobbyUpdate(lobbyCode);
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('Create lobby error:', error);
      socket.emit('error', { message: 'Serverfehler beim Erstellen der Lobby' });
    }
  });

  socket.on('join-lobby', async (data) => {
    try {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'Nicht authentifiziert' });
        return;
      }

      const { lobbyCode } = data;

      // Find lobby
      db.get(
        'SELECT * FROM lobbies WHERE code = ?',
        [lobbyCode],
        (err, lobby) => {
          if (err) {
            console.error('Database error:', err);
            socket.emit('error', { message: 'Datenbankfehler' });
            return;
          }

          if (!lobby) {
            socket.emit('error', { message: 'Lobby nicht gefunden' });
            return;
          }

          // Check if user is already in lobby
          db.get(
            'SELECT * FROM players WHERE lobby_id = ? AND user_id = ?',
            [lobby.id, user.id],
            (err, existingPlayer) => {
              if (err) {
                console.error('Database error:', err);
                socket.emit('error', { message: 'Datenbankfehler' });
                return;
              }

              if (existingPlayer) {
                // Update socket ID for existing player
                db.run(
                  'UPDATE players SET socket_id = ? WHERE id = ?',
                  [socket.id, existingPlayer.id],
                  function(err) {
                    if (err) {
                      console.error('Database error:', err);
                      socket.emit('error', { message: 'Fehler beim Wiederbeitreten' });
                      return;
                    }

                    socket.join(lobbyCode);
                    
                    // Get host username
                    db.get(
                      'SELECT u.username FROM players p JOIN users u ON p.user_id = u.id WHERE p.lobby_id = ? AND p.is_host = 1',
                      [lobby.id],
                      (err, hostRow) => {
                        const hostUsername = hostRow ? hostRow.username : '';
                        
                        socket.emit('lobby-joined', {
                          lobbyId: lobby.id,
                          lobbyCode: lobby.code,
                          playerId: existingPlayer.id,
                          isHost: existingPlayer.is_host === 1,
                          hostUsername
                        });

                        sendLobbyUpdate(lobbyCode);
                      }
                    );
                  }
                );
              } else {
                // Check lobby capacity
                db.get(
                  'SELECT COUNT(*) as count FROM players WHERE lobby_id = ? AND is_eliminated = 0',
                  [lobby.id],
                  (err, countRow) => {
                    if (err) {
                      console.error('Database error:', err);
                      socket.emit('error', { message: 'Datenbankfehler' });
                      return;
                    }

                    if (countRow.count >= 10) {
                      socket.emit('error', { message: 'Lobby ist voll' });
                      return;
                    }

                    // Create new player
                    const playerId = uuidv4();
                    db.run(
                      'INSERT INTO players (id, lobby_id, user_id, username, socket_id) VALUES (?, ?, ?, ?, ?)',
                      [playerId, lobby.id, user.id, user.username, socket.id],
                      function(err) {
                        if (err) {
                          console.error('Database error:', err);
                          socket.emit('error', { message: 'Fehler beim Beitreten der Lobby' });
                          return;
                        }

                        socket.join(lobbyCode);
                        
                        // Get host username
                        db.get(
                          'SELECT u.username FROM players p JOIN users u ON p.user_id = u.id WHERE p.lobby_id = ? AND p.is_host = 1',
                          [lobby.id],
                          (err, hostRow) => {
                            const hostUsername = hostRow ? hostRow.username : '';
                            
                            socket.emit('lobby-joined', {
                              lobbyId: lobby.id,
                              lobbyCode: lobby.code,
                              playerId,
                              isHost: false,
                              hostUsername
                            });

                            sendLobbyUpdate(lobbyCode);
                          }
                        );
                      }
                    );
                  }
                );
              }
            }
          );
        }
      );
    } catch (error) {
      console.error('Join lobby error:', error);
      socket.emit('error', { message: 'Serverfehler beim Beitreten der Lobby' });
    }
  });

  socket.on('leave-lobby', async (data) => {
    try {
      const { lobbyId } = data;
      
      // Remove player from lobby
      db.run(
        'DELETE FROM players WHERE socket_id = ? AND lobby_id = ?',
        [socket.id, lobbyId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          // Check if lobby is empty
          db.get(
            'SELECT COUNT(*) as count FROM players WHERE lobby_id = ?',
            [lobbyId],
            (err, countRow) => {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              if (countRow.count === 0) {
                // Delete empty lobby
                db.run('DELETE FROM lobbies WHERE id = ?', [lobbyId]);
                db.run('DELETE FROM game_states WHERE lobby_id = ?', [lobbyId]);
              } else {
                // Check if host left and transfer host to another player
                db.get(
                  'SELECT * FROM players WHERE lobby_id = ? AND is_host = 1',
                  [lobbyId],
                  (err, hostRow) => {
                    if (err) {
                      console.error('Database error:', err);
                      return;
                    }

                    if (!hostRow) {
                      // No host found, make first player host
                      db.get(
                        'SELECT * FROM players WHERE lobby_id = ? ORDER BY id LIMIT 1',
                        [lobbyId],
                        (err, firstPlayer) => {
                          if (err) {
                            console.error('Database error:', err);
                            return;
                          }

                          if (firstPlayer) {
                            db.run(
                              'UPDATE players SET is_host = 1 WHERE id = ?',
                              [firstPlayer.id],
                              function(err) {
                                if (err) {
                                  console.error('Database error:', err);
                                  return;
                                }

                                // Update lobby host_id
                                db.run(
                                  'UPDATE lobbies SET host_id = ? WHERE id = ?',
                                  [firstPlayer.user_id, lobbyId],
                                  function(err) {
                                    if (err) {
                                      console.error('Database error:', err);
                                      return;
                                    }

                                    // Notify new host
                                    io.to(firstPlayer.socket_id).emit('host-transferred', { isHost: true });
                                    
                                    // Get lobby code and send update
                                    db.get(
                                      'SELECT code FROM lobbies WHERE id = ?',
                                      [lobbyId],
                                      (err, lobbyRow) => {
                                        if (err) {
                                          console.error('Database error:', err);
                                          return;
                                        }

                                        if (lobbyRow) {
                                          sendLobbyUpdate(lobbyRow.code);
                                        }
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        }
                      );
                    } else {
                      // Host still exists, just send lobby update
                      db.get(
                        'SELECT code FROM lobbies WHERE id = ?',
                        [lobbyId],
                        (err, lobbyRow) => {
                          if (err) {
                            console.error('Database error:', err);
                            return;
                          }

                          if (lobbyRow) {
                            sendLobbyUpdate(lobbyRow.code);
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      );
    } catch (error) {
      console.error('Leave lobby error:', error);
    }
  });

  socket.on('close-lobby', async (data) => {
    try {
      const { lobbyId } = data;
      
      // Get lobby code first
      db.get(
        'SELECT code FROM lobbies WHERE id = ?',
        [lobbyId],
        (err, lobby) => {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          if (lobby) {
            // Notify all players in the lobby
            io.to(lobby.code).emit('lobby-closed');
            
            // Delete lobby and related data
            db.run('DELETE FROM players WHERE lobby_id = ?', [lobbyId]);
            db.run('DELETE FROM game_states WHERE lobby_id = ?', [lobbyId]);
            db.run('DELETE FROM lobbies WHERE id = ?', [lobbyId]);
          }
        }
      );
    } catch (error) {
      console.error('Close lobby error:', error);
    }
  });

  socket.on('update-settings', async (data) => {
    try {
      const { lobbyId, settings } = data;
      
      // Update lobby settings
      db.run(
        'UPDATE lobbies SET settings = ? WHERE id = ?',
        [JSON.stringify(settings), lobbyId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          // Get lobby code and send update
          db.get(
            'SELECT code FROM lobbies WHERE id = ?',
            [lobbyId],
            (err, lobby) => {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              if (lobby) {
                sendLobbyUpdate(lobby.code);
              }
            }
          );
        }
      );
    } catch (error) {
      console.error('Update settings error:', error);
    }
  });

  socket.on('start-game', async (data) => {
    try {
      const { lobbyId, settings } = data;
      
      // Get all active players
      db.all(
        'SELECT * FROM players WHERE lobby_id = ? AND is_eliminated = 0',
        [lobbyId],
        (err, players) => {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          if (players.length < 3) {
            socket.emit('error', { message: 'Mindestens 3 Spieler erforderlich' });
            return;
          }

          // Select imposters based on settings
          let imposterCount = 1;
          if (settings.threeImposters && players.length >= 5) {
            imposterCount = 3;
          } else if (settings.twoImposters && players.length >= 4) {
            imposterCount = 2;
          }

          const shuffledPlayers = shuffleArray(players);
          const imposters = shuffledPlayers.slice(0, imposterCount);
          const word = getRandomWord();

          // Update players with imposter status
          const updatePromises = players.map(player => {
            const isImposter = imposters.some(imp => imp.id === player.id);
            return new Promise((resolve, reject) => {
              db.run(
                'UPDATE players SET is_imposter = ?, is_ready = 0, vote_target = NULL, ready_for_voting = 0, ready_for_next_round = 0 WHERE id = ?',
                [isImposter ? 1 : 0, player.id],
                function(err) {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          });

          Promise.all(updatePromises).then(() => {
            // Update game state
            db.run(
              'UPDATE game_states SET phase = ?, current_word = ?, speaking_order = NULL, votes_revealed = 0 WHERE lobby_id = ?',
              ['word-reveal', word, lobbyId],
              function(err) {
                if (err) {
                  console.error('Database error:', err);
                  return;
                }

                // Update user statistics
                const statUpdatePromises = players.map(player => {
                  return new Promise((resolve, reject) => {
                    db.run(
                      'UPDATE users SET games_played = games_played + 1 WHERE id = ?',
                      [player.user_id],
                      function(err) {
                        if (err) reject(err);
                        else resolve();
                      }
                    );
                  });
                });

                const imposterStatPromises = imposters.map(imposter => {
                  return new Promise((resolve, reject) => {
                    db.run(
                      'UPDATE users SET times_imposter = times_imposter + 1 WHERE id = ?',
                      [imposter.user_id],
                      function(err) {
                        if (err) reject(err);
                        else resolve();
                      }
                    );
                  });
                });

                Promise.all([...statUpdatePromises, ...imposterStatPromises]).then(() => {
                  // Send game start to all players
                  players.forEach(player => {
                    const isImposter = imposters.some(imp => imp.id === player.id);
                    const gameData = {
                      phase: 'word-reveal',
                      word: isImposter ? null : word,
                      isImposter,
                      imposterHint: isImposter && settings.imposterHint ? generateImposterHint(word) : undefined
                    };

                    io.to(player.socket_id).emit('game-started', gameData);
                  });

                  // Get lobby code and send update
                  db.get(
                    'SELECT code FROM lobbies WHERE id = ?',
                    [lobbyId],
                    (err, lobby) => {
                      if (err) {
                        console.error('Database error:', err);
                        return;
                      }

                      if (lobby) {
                        sendLobbyUpdate(lobby.code);
                      }
                    }
                  );
                }).catch(err => {
                  console.error('Error updating user statistics:', err);
                });
              }
            );
          }).catch(err => {
            console.error('Error updating players:', err);
            socket.emit('error', { message: 'Fehler beim Starten des Spiels' });
          });
        }
      );
    } catch (error) {
      console.error('Start game error:', error);
      socket.emit('error', { message: 'Serverfehler beim Starten des Spiels' });
    }
  });

  socket.on('player-ready', async (data) => {
    try {
      const { lobbyId } = data;
      
      // Mark player as ready
      db.run(
        'UPDATE players SET is_ready = 1 WHERE socket_id = ? AND lobby_id = ?',
        [socket.id, lobbyId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          // Check if all players are ready
          db.all(
            'SELECT * FROM players WHERE lobby_id = ? AND is_eliminated = 0',
            [lobbyId],
            (err, players) => {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              const allReady = players.every(p => p.is_ready === 1);
              
              // Get lobby code and send update
              db.get(
                'SELECT code FROM lobbies WHERE id = ?',
                [lobbyId],
                (err, lobby) => {
                  if (err) {
                    console.error('Database error:', err);
                    return;
                  }

                  if (lobby) {
                    sendLobbyUpdate(lobby.code);

                    if (allReady) {
                      // Get lobby settings
                      db.get(
                        'SELECT settings FROM lobbies WHERE id = ?',
                        [lobbyId],
                        (err, settingsRow) => {
                          if (err) {
                            console.error('Database error:', err);
                            return;
                          }

                          const settings = settingsRow && settingsRow.settings ? JSON.parse(settingsRow.settings) : {};
                          
                          if (settings.wordTimeMode) {
                            startWordTimeMode(lobbyId, lobby.code, players, settings);
                          } else {
                            startDiscussionPhase(lobbyId, lobby.code, players, settings);
                          }
                        }
                      );
                    }
                  }
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('Player ready error:', error);
    }
  });

  socket.on('ready-for-voting', async (data) => {
    try {
      const { lobbyId } = data;
      
      // Mark player as ready for voting
      db.run(
        'UPDATE players SET ready_for_voting = 1 WHERE socket_id = ? AND lobby_id = ?',
        [socket.id, lobbyId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          // Check if all players are ready for voting
          db.all(
            'SELECT * FROM players WHERE lobby_id = ? AND is_eliminated = 0',
            [lobbyId],
            (err, players) => {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              const allReady = players.every(p => p.ready_for_voting === 1);
              
              // Get lobby code and send update
              db.get(
                'SELECT code FROM lobbies WHERE id = ?',
                [lobbyId],
                (err, lobby) => {
                  if (err) {
                    console.error('Database error:', err);
                    return;
                  }

                  if (lobby) {
                    sendLobbyUpdate(lobby.code);

                    if (allReady) {
                      startVotingPhase(lobbyId, lobby.code);
                    }
                  }
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('Ready for voting error:', error);
    }
  });

  socket.on('ready-for-next-round', async (data) => {
    try {
      const { lobbyId } = data;
      
      // Mark player as ready for next round
      db.run(
        'UPDATE players SET ready_for_next_round = 1 WHERE socket_id = ? AND lobby_id = ?',
        [socket.id, lobbyId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          // Check if all players are ready for next round
          db.all(
            'SELECT * FROM players WHERE lobby_id = ? AND is_eliminated = 0',
            [lobbyId],
            (err, players) => {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              const allReady = players.every(p => p.ready_for_next_round === 1);
              
              // Get lobby code and send update
              db.get(
                'SELECT code FROM lobbies WHERE id = ?',
                [lobbyId],
                (err, lobby) => {
                  if (err) {
                    console.error('Database error:', err);
                    return;
                  }

                  if (lobby) {
                    sendLobbyUpdate(lobby.code);

                    if (allReady) {
                      // Get lobby settings
                      db.get(
                        'SELECT settings FROM lobbies WHERE id = ?',
                        [lobbyId],
                        (err, settingsRow) => {
                          if (err) {
                            console.error('Database error:', err);
                            return;
                          }

                          const settings = settingsRow && settingsRow.settings ? JSON.parse(settingsRow.settings) : {};
                          
                          // Get current round number
                          db.get(
                            'SELECT speaking_order FROM game_states WHERE lobby_id = ?',
                            [lobbyId],
                            (err, gameState) => {
                              if (err) {
                                console.error('Database error:', err);
                                return;
                              }

                              let roundNumber = 1;
                              if (gameState && gameState.speaking_order) {
                                try {
                                  const speakingData = JSON.parse(gameState.speaking_order);
                                  roundNumber = (speakingData.roundNumber || 1) + 1;
                                } catch (e) {
                                  roundNumber = 2;
                                }
                              }

                              startWordTimeMode(lobbyId, lobby.code, players, settings, roundNumber);
                            }
                          );
                        }
                      );
                    }
                  }
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('Ready for next round error:', error);
    }
  });

  socket.on('cast-vote', async (data) => {
    try {
      const { lobbyId, targetPlayerId } = data;
      
      // Record vote
      db.run(
        'UPDATE players SET vote_target = ? WHERE socket_id = ? AND lobby_id = ?',
        [targetPlayerId, socket.id, lobbyId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          // Check if all players have voted
          db.all(
            'SELECT * FROM players WHERE lobby_id = ? AND is_eliminated = 0',
            [lobbyId],
            (err, players) => {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              const allVoted = players.every(p => p.vote_target !== null);
              
              // Get lobby code and send update
              db.get(
                'SELECT code FROM lobbies WHERE id = ?',
                [lobbyId],
                (err, lobby) => {
                  if (err) {
                    console.error('Database error:', err);
                    return;
                  }

                  if (lobby) {
                    sendLobbyUpdate(lobby.code);

                    if (allVoted) {
                      processVotingResults(lobbyId, lobby.code);
                    }
                  }
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('Cast vote error:', error);
    }
  });

  socket.on('guess-word', async (data) => {
    try {
      const { lobbyId, guessedWord } = data;
      
      // Get current game state and word
      db.get(
        'SELECT current_word FROM game_states WHERE lobby_id = ?',
        [lobbyId],
        (err, gameState) => {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          if (!gameState || !gameState.current_word) {
            socket.emit('error', { message: 'Kein aktives Spiel gefunden' });
            return;
          }

          // Get the imposter who made the guess
          db.get(
            'SELECT * FROM players WHERE socket_id = ? AND lobby_id = ? AND is_imposter = 1',
            [socket.id, lobbyId],
            (err, imposter) => {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              if (!imposter) {
                socket.emit('error', { message: 'Nur Imposter können das Wort erraten' });
                return;
              }

              const correctWord = gameState.current_word;
              const wasCorrect = guessedWord.toLowerCase().trim() === correctWord.toLowerCase().trim();

              // Update game state to results
              db.run(
                'UPDATE game_states SET phase = ? WHERE lobby_id = ?',
                ['results'],
                function(err) {
                  if (err) {
                    console.error('Database error:', err);
                    return;
                  }

                  // Update imposter win statistics if correct
                  if (wasCorrect) {
                    db.run(
                      'UPDATE users SET imposter_wins = imposter_wins + 1 WHERE id = ?',
                      [imposter.user_id],
                      function(err) {
                        if (err) {
                          console.error('Database error:', err);
                        }
                      }
                    );
                  }

                  // Get lobby code and send results
                  db.get(
                    'SELECT code FROM lobbies WHERE id = ?',
                    [lobbyId],
                    (err, lobby) => {
                      if (err) {
                        console.error('Database error:', err);
                        return;
                      }

                      if (lobby) {
                        const result = {
                          phase: 'results',
                          imposterName: imposter.username,
                          guessedWord: guessedWord,
                          correctWord: correctWord,
                          wasCorrect: wasCorrect
                        };

                        io.to(lobby.code).emit('word-guess-result', result);
                        sendLobbyUpdate(lobby.code);
                      }
                    }
                  );
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('Guess word error:', error);
    }
  });

  socket.on('restart-game', async (data) => {
    try {
      const { lobbyId } = data;
      
      // Reset all players
      db.run(
        'UPDATE players SET is_ready = 0, is_imposter = 0, is_eliminated = 0, vote_target = NULL, ready_for_voting = 0, ready_for_next_round = 0 WHERE lobby_id = ?',
        [lobbyId],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          // Reset game state
          db.run(
            'UPDATE game_states SET phase = ?, current_word = NULL, speaking_order = NULL, votes_revealed = 0 WHERE lobby_id = ?',
            ['lobby', lobbyId],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              // Get lobby code and send restart
              db.get(
                'SELECT code FROM lobbies WHERE id = ?',
                [lobbyId],
                (err, lobby) => {
                  if (err) {
                    console.error('Database error:', err);
                    return;
                  }

                  if (lobby) {
                    io.to(lobby.code).emit('game-restarted', { phase: 'lobby' });
                    sendLobbyUpdate(lobby.code);
                  }
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('Restart game error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedUsers.delete(socket.id);
    
    // Handle player leaving lobby on disconnect
    db.get(
      'SELECT lobby_id FROM players WHERE socket_id = ?',
      [socket.id],
      (err, player) => {
        if (err) {
          console.error('Database error:', err);
          return;
        }

        if (player) {
          // Don't remove player, just update socket_id to null
          db.run(
            'UPDATE players SET socket_id = NULL WHERE socket_id = ?',
            [socket.id],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              // Get lobby code and send update
              db.get(
                'SELECT code FROM lobbies WHERE id = ?',
                [player.lobby_id],
                (err, lobby) => {
                  if (err) {
                    console.error('Database error:', err);
                    return;
                  }

                  if (lobby) {
                    sendLobbyUpdate(lobby.code);
                  }
                }
              );
            }
          );
        }
      }
    );
  });
});

// Helper functions for game logic
function startWordTimeMode(lobbyId, lobbyCode, players, settings, roundNumber = 1) {
  // Generate speaking order
  const activePlayers = players.filter(p => p.is_eliminated === 0);
  let speakingOrder;
  
  if (settings.randomOrder) {
    speakingOrder = shuffleArray(activePlayers.map(p => p.username));
  } else {
    speakingOrder = activePlayers.map(p => p.username);
  }

  // Reset player states
  db.run(
    'UPDATE players SET ready_for_voting = 0, ready_for_next_round = 0 WHERE lobby_id = ?',
    [lobbyId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return;
      }

      // Update game state with countdown phase
      const speakingData = {
        order: speakingOrder,
        roundNumber: roundNumber
      };

      db.run(
        'UPDATE game_states SET phase = ?, speaking_order = ? WHERE lobby_id = ?',
        ['word-time-countdown', JSON.stringify(speakingData)],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          // Start countdown
          let countdown = 3;
          const countdownInterval = setInterval(() => {
            io.to(lobbyCode).emit('word-time-countdown', {
              phase: 'word-time-countdown',
              speakingOrder: speakingOrder,
              timeRemaining: countdown,
              roundNumber: roundNumber
            });

            countdown--;
            if (countdown < 0) {
              clearInterval(countdownInterval);
              startWordTimeSpeaking(lobbyId, lobbyCode, speakingOrder, settings, roundNumber);
            }
          }, 1000);

          sendLobbyUpdate(lobbyCode);
        }
      );
    }
  );
}

function startWordTimeSpeaking(lobbyId, lobbyCode, speakingOrder, settings, roundNumber) {
  let currentSpeakerIndex = 0;
  
  function nextSpeaker() {
    if (currentSpeakerIndex >= speakingOrder.length) {
      // All players have spoken, move to waiting phase
      db.run(
        'UPDATE game_states SET phase = ? WHERE lobby_id = ?',
        ['word-time-waiting'],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          io.to(lobbyCode).emit('word-time-waiting', {
            phase: 'word-time-waiting',
            roundNumber: roundNumber
          });

          sendLobbyUpdate(lobbyCode);
        }
      );
      return;
    }

    const currentSpeaker = speakingOrder[currentSpeakerIndex];
    let timeRemaining = settings.wordTimeSeconds || 10;

    // Update game state
    db.run(
      'UPDATE game_states SET phase = ? WHERE lobby_id = ?',
      ['word-time-speaking'],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return;
        }

        const speakingInterval = setInterval(() => {
          io.to(lobbyCode).emit('word-time-speaking', {
            phase: 'word-time-speaking',
            currentSpeaker: currentSpeaker,
            timeRemaining: timeRemaining,
            roundNumber: roundNumber
          });

          timeRemaining--;
          if (timeRemaining < 0) {
            clearInterval(speakingInterval);
            currentSpeakerIndex++;
            setTimeout(() => nextSpeaker(), 1000); // 1 second pause between speakers
          }
        }, 1000);

        sendLobbyUpdate(lobbyCode);
      }
    );
  }

  nextSpeaker();
}

function startDiscussionPhase(lobbyId, lobbyCode, players, settings) {
  // Generate speaking order
  const activePlayers = players.filter(p => p.is_eliminated === 0);
  let speakingOrder;
  
  if (settings.randomOrder) {
    speakingOrder = shuffleArray(activePlayers.map(p => p.username));
  } else {
    speakingOrder = activePlayers.map(p => p.username);
  }

  // Update game state
  db.run(
    'UPDATE game_states SET phase = ?, speaking_order = ? WHERE lobby_id = ?',
    ['discussion', JSON.stringify(speakingOrder)],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return;
      }

      io.to(lobbyCode).emit('discussion-phase', {
        phase: 'discussion',
        speakingOrder: speakingOrder
      });

      sendLobbyUpdate(lobbyCode);
    }
  );
}

function startVotingPhase(lobbyId, lobbyCode) {
  // Update game state
  db.run(
    'UPDATE game_states SET phase = ? WHERE lobby_id = ?',
    ['voting'],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return;
      }

      io.to(lobbyCode).emit('voting-phase', { phase: 'voting' });
      sendLobbyUpdate(lobbyCode);
    }
  );
}

function processVotingResults(lobbyId, lobbyCode) {
  // Get all votes
  db.all(
    'SELECT vote_target FROM players WHERE lobby_id = ? AND is_eliminated = 0 AND vote_target IS NOT NULL',
    [lobbyId],
    (err, votes) => {
      if (err) {
        console.error('Database error:', err);
        return;
      }

      // Count votes
      const voteCount = {};
      votes.forEach(vote => {
        voteCount[vote.vote_target] = (voteCount[vote.vote_target] || 0) + 1;
      });

      // Find player with most votes
      let maxVotes = 0;
      let eliminatedPlayerId = null;
      
      Object.entries(voteCount).forEach(([playerId, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          eliminatedPlayerId = playerId;
        }
      });

      if (!eliminatedPlayerId) {
        socket.emit('error', { message: 'Fehler bei der Stimmenauszählung' });
        return;
      }

      // Get eliminated player info
      db.get(
        'SELECT * FROM players WHERE id = ?',
        [eliminatedPlayerId],
        (err, eliminatedPlayer) => {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          if (!eliminatedPlayer) {
            socket.emit('error', { message: 'Eliminierter Spieler nicht gefunden' });
            return;
          }

          // Eliminate player
          db.run(
            'UPDATE players SET is_eliminated = 1 WHERE id = ?',
            [eliminatedPlayerId],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              // Get game info for results
              db.get(
                'SELECT current_word FROM game_states WHERE lobby_id = ?',
                [lobbyId],
                (err, gameState) => {
                  if (err) {
                    console.error('Database error:', err);
                    return;
                  }

                  // Get imposter info
                  db.get(
                    'SELECT username FROM players WHERE lobby_id = ? AND is_imposter = 1 AND is_eliminated = 0',
                    [lobbyId],
                    (err, imposter) => {
                      if (err) {
                        console.error('Database error:', err);
                        return;
                      }

                      // Check if game should continue (survival mode)
                      db.get(
                        'SELECT settings FROM lobbies WHERE id = ?',
                        [lobbyId],
                        (err, settingsRow) => {
                          if (err) {
                            console.error('Database error:', err);
                            return;
                          }

                          const settings = settingsRow && settingsRow.settings ? JSON.parse(settingsRow.settings) : {};
                          
                          if (settings.survivalMode) {
                            // Check remaining players
                            db.get(
                              'SELECT COUNT(*) as count FROM players WHERE lobby_id = ? AND is_eliminated = 0',
                              [lobbyId],
                              (err, countRow) => {
                                if (err) {
                                  console.error('Database error:', err);
                                  return;
                                }

                                if (countRow.count <= 2) {
                                  // Game ends, survivors win
                                  db.all(
                                    'SELECT username FROM players WHERE lobby_id = ? AND is_eliminated = 0',
                                    [lobbyId],
                                    (err, survivors) => {
                                      if (err) {
                                        console.error('Database error:', err);
                                        return;
                                      }

                                      // Update game state to results
                                      db.run(
                                        'UPDATE game_states SET phase = ? WHERE lobby_id = ?',
                                        ['results'],
                                        function(err) {
                                          if (err) {
                                            console.error('Database error:', err);
                                            return;
                                          }

                                          io.to(lobbyCode).emit('survival-game-ended', {
                                            phase: 'results',
                                            winners: survivors.map(s => s.username),
                                            lastWord: gameState ? gameState.current_word : ''
                                          });

                                          sendLobbyUpdate(lobbyCode);
                                        }
                                      );
                                    }
                                  );
                                } else {
                                  // Continue with next round
                                  const word = getRandomWord();
                                  
                                  // Get remaining players
                                  db.all(
                                    'SELECT * FROM players WHERE lobby_id = ? AND is_eliminated = 0',
                                    [lobbyId],
                                    (err, remainingPlayers) => {
                                      if (err) {
                                        console.error('Database error:', err);
                                        return;
                                      }

                                      // Select new imposter
                                      const shuffledPlayers = shuffleArray(remainingPlayers);
                                      const newImposter = shuffledPlayers[0];

                                      // Reset and update players
                                      const updatePromises = remainingPlayers.map(player => {
                                        const isImposter = player.id === newImposter.id;
                                        return new Promise((resolve, reject) => {
                                          db.run(
                                            'UPDATE players SET is_imposter = ?, is_ready = 0, vote_target = NULL, ready_for_voting = 0, ready_for_next_round = 0 WHERE id = ?',
                                            [isImposter ? 1 : 0, player.id],
                                            function(err) {
                                              if (err) reject(err);
                                              else resolve();
                                            }
                                          );
                                        });
                                      });

                                      Promise.all(updatePromises).then(() => {
                                        // Update game state
                                        db.run(
                                          'UPDATE game_states SET phase = ?, current_word = ?, speaking_order = NULL WHERE lobby_id = ?',
                                          ['word-reveal', word, lobbyId],
                                          function(err) {
                                            if (err) {
                                              console.error('Database error:', err);
                                              return;
                                            }

                                            // Send new round to players
                                            remainingPlayers.forEach(player => {
                                              const isImposter = player.id === newImposter.id;
                                              const gameData = {
                                                phase: 'word-reveal',
                                                word: isImposter ? null : word,
                                                isImposter,
                                                imposterHint: isImposter && settings.imposterHint ? generateImposterHint(word) : undefined
                                              };

                                              io.to(player.socket_id).emit('survival-next-round', gameData);
                                            });

                                            sendLobbyUpdate(lobbyCode);
                                          }
                                        );
                                      }).catch(err => {
                                        console.error('Error updating players for survival round:', err);
                                      });
                                    }
                                  );
                                }
                              }
                            );
                          } else {
                            // Regular game mode - end game
                            db.run(
                              'UPDATE game_states SET phase = ? WHERE lobby_id = ?',
                              ['results'],
                              function(err) {
                                if (err) {
                                  console.error('Database error:', err);
                                  return;
                                }

                                const result = {
                                  phase: 'results',
                                  eliminatedPlayer: eliminatedPlayer.username,
                                  wasImposter: eliminatedPlayer.is_imposter === 1,
                                  voteCount: voteCount,
                                  word: gameState ? gameState.current_word : '',
                                  imposterName: imposter ? imposter.username : ''
                                };

                                io.to(lobbyCode).emit('voting-results', result);
                                sendLobbyUpdate(lobbyCode);
                              }
                            );
                          }
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

function sendLobbyUpdate(lobbyCode) {
  // Get lobby info
  db.get(
    'SELECT * FROM lobbies WHERE code = ?',
    [lobbyCode],
    (err, lobby) => {
      if (err) {
        console.error('Database error:', err);
        return;
      }

      if (!lobby) return;

      // Get players
      db.all(
        'SELECT p.*, u.username as user_username FROM players p LEFT JOIN users u ON p.user_id = u.id WHERE p.lobby_id = ?',
        [lobby.id],
        (err, players) => {
          if (err) {
            console.error('Database error:', err);
            return;
          }

          // Get game state
          db.get(
            'SELECT * FROM game_states WHERE lobby_id = ?',
            [lobby.id],
            (err, gameState) => {
              if (err) {
                console.error('Database error:', err);
                return;
              }

              // Parse settings
              let settings = {
                randomOrder: true,
                twoImposters: false,
                threeImposters: false,
                imposterHint: false,
                wordTimeMode: false,
                survivalMode: false,
                wordTimeSeconds: 10
              };

              if (lobby.settings) {
                try {
                  settings = { ...settings, ...JSON.parse(lobby.settings) };
                } catch (e) {
                  console.error('Error parsing lobby settings:', e);
                }
              }

              // Parse speaking order
              let speakingOrder = null;
              let currentSpeaker = null;
              let roundNumber = null;

              if (gameState && gameState.speaking_order) {
                try {
                  const speakingData = JSON.parse(gameState.speaking_order);
                  if (Array.isArray(speakingData)) {
                    speakingOrder = speakingData;
                  } else if (speakingData.order) {
                    speakingOrder = speakingData.order;
                    roundNumber = speakingData.roundNumber;
                  }
                } catch (e) {
                  console.error('Error parsing speaking order:', e);
                }
              }

              const formattedPlayers = players.map(p => ({
                id: p.id,
                userId: p.user_id,
                username: p.user_username || p.username,
                isHost: p.is_host === 1,
                isReady: p.is_ready === 1,
                isEliminated: p.is_eliminated === 1,
                hasVoted: p.vote_target !== null,
                readyForVoting: p.ready_for_voting === 1,
                readyForNextRound: p.ready_for_next_round === 1
              }));

              const lobbyData = {
                players: formattedPlayers,
                gameState: {
                  phase: gameState ? gameState.phase : 'lobby',
                  speakingOrder: speakingOrder,
                  currentSpeaker: currentSpeaker,
                  roundNumber: roundNumber
                },
                settings: settings
              };

              io.to(lobbyCode).emit('lobby-updated', lobbyData);
            }
          );
        }
      );
    }
  );
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});