import sqlite3 from 'sqlite3';
import fs from 'fs';

const dbPath = './server/game.db';

// Delete existing database if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Alte Datenbank gelöscht');
}

// Create new database with updated schema
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Erstelle neue Datenbank-Tabellen...');

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_image TEXT,
    games_played INTEGER DEFAULT 0,
    times_imposter INTEGER DEFAULT 0,
    imposter_wins INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Fehler beim Erstellen der users Tabelle:', err);
    else console.log('✓ users Tabelle erstellt');
  });

  // Lobbies table with settings column
  db.run(`CREATE TABLE IF NOT EXISTS lobbies (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    host_id TEXT,
    settings TEXT DEFAULT '{"randomOrder":true,"twoImposters":false,"threeImposters":false,"imposterHint":false,"wordTimeMode":false,"survivalMode":false,"wordTimeSeconds":10}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users (id)
  )`, (err) => {
    if (err) console.error('Fehler beim Erstellen der lobbies Tabelle:', err);
    else console.log('✓ lobbies Tabelle erstellt (mit settings Spalte)');
  });

  // Players table with user_id column
  db.run(`CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    lobby_id TEXT,
    user_id TEXT,
    username TEXT,
    socket_id TEXT,
    is_host BOOLEAN DEFAULT 0,
    is_ready BOOLEAN DEFAULT 0,
    is_imposter BOOLEAN DEFAULT 0,
    is_eliminated BOOLEAN DEFAULT 0,
    vote_target TEXT,
    ready_for_voting BOOLEAN DEFAULT 0,
    ready_for_next_round BOOLEAN DEFAULT 0,
    FOREIGN KEY (lobby_id) REFERENCES lobbies (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) console.error('Fehler beim Erstellen der players Tabelle:', err);
    else console.log('✓ players Tabelle erstellt');
  });

  // Game states table
  db.run(`CREATE TABLE IF NOT EXISTS game_states (
    lobby_id TEXT PRIMARY KEY,
    phase TEXT DEFAULT 'lobby',
    current_word TEXT,
    speaking_order TEXT,
    votes_revealed BOOLEAN DEFAULT 0,
    FOREIGN KEY (lobby_id) REFERENCES lobbies (id)
  )`, (err) => {
    if (err) console.error('Fehler beim Erstellen der game_states Tabelle:', err);
    else console.log('✓ game_states Tabelle erstellt');
  });
});

db.close((err) => {
  if (err) {
    console.error('Fehler beim Schließen der Datenbank:', err);
  } else {
    console.log('✅ Datenbank-Migration abgeschlossen!');
    console.log('Die Anwendung kann jetzt gestartet werden.');
  }
});