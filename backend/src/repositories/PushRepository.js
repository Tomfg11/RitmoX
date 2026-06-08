const pool = require('../config/db');

class PushRepository {
  async saveSubscription(usuarioId, subscription) {
    const { endpoint, keys } = subscription;
    
    // Check if subscription already exists
    const res = await pool.query('SELECT id FROM push_subscriptions WHERE endpoint = $1 AND usuario_id = $2', [endpoint, usuarioId]);
    
    if (res.rows.length === 0) {
      await pool.query(
        'INSERT INTO push_subscriptions (usuario_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, $4)',
        [usuarioId, endpoint, keys.p256dh, keys.auth]
      );
    } else {
      await pool.query(
        'UPDATE push_subscriptions SET p256dh = $1, auth = $2 WHERE endpoint = $3 AND usuario_id = $4',
        [keys.p256dh, keys.auth, endpoint, usuarioId]
      );
    }
  }

  async getSubscriptionsByUser(usuarioId) {
    const res = await pool.query('SELECT * FROM push_subscriptions WHERE usuario_id = $1', [usuarioId]);
    return res.rows;
  }

  async getAllSubscriptions() {
    const res = await pool.query('SELECT * FROM push_subscriptions');
    return res.rows;
  }

  async removeSubscription(endpoint) {
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
  }
}

module.exports = new PushRepository();
