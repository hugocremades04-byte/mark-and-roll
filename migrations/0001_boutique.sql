-- Référence du schéma. Le site crée ces tables tout seul au premier accès (src/lib/serveur/commandes.server.ts).
-- Boutique Mark & Roll : commandes, demandes de devis, inscrits à la newsletter.
-- Modifications additives uniquement (une seule base, en production).
CREATE TABLE IF NOT EXISTS commandes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT NOT NULL UNIQUE,
  num TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  statut TEXT NOT NULL DEFAULT 'BAT à envoyer',
  paiement TEXT NOT NULL DEFAULT 'a_regler',
  stripe_session TEXT,
  stripe_pi TEXT,
  email TEXT NOT NULL,
  client TEXT NOT NULL,
  livraison TEXT NOT NULL,
  articles TEXT NOT NULL,
  totaux TEXT NOT NULL,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS commandes_email ON commandes (email);

CREATE TABLE IF NOT EXISTS devis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  nom TEXT NOT NULL,
  societe TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  quantite TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS abonnes (
  email TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
