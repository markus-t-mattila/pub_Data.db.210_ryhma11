import cron from 'node-cron';
import { releaseExpiredReservations } from './purchase.js';

// Aja joka minuutti
cron.schedule('* * * * *', () => {
  console.log('Tarkistetaan vanhentuneet varaukset...');
  releaseExpiredReservations();
});
