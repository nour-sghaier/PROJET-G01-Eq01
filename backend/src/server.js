require('dotenv').config();

const express = require('express');
const cors = require('cors');
require('./config/firebase'); // initialise Firebase Admin au démarrage

const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN || 'http://localhost:5173' }));
// Les photos des offres sont envoyées en base64 : limite relevée (erreur 413 sinon).
app.use(express.json({ limit: '2mb' }));

// Route de santé : http://localhost:3000/api
app.get('/api', (req, res) => res.json({ message: 'API CampusSave OK' }));

// Routes décrites dans config/API.md
app.use('/api/users', require('./routes/users'));
app.use('/api/commerces', require('./routes/commerces'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/payments', require('./routes/paiements'));
app.use('/api/admin', require('./routes/admin'));

// Les clients affichent le champ "message" des erreurs tel quel.
app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));
app.use((err, req, res, next) => {
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Erreur serveur' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API CampusSave sur http://localhost:${port}/api`));
