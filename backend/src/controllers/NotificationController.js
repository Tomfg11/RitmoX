const PushRepository = require('../repositories/PushRepository');
const webpush = require('web-push');

class NotificationController {
  async subscribe(req, res) {
    const usuarioId = req.usuarioId;
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ detalhe: 'Inscrição inválida.' });
    }

    try {
      await PushRepository.saveSubscription(usuarioId, subscription);
      res.status(201).json({ message: 'Inscrição de push salva com sucesso.' });
    } catch (error) {
      console.error('Erro ao salvar push subscription:', error);
      res.status(500).json({ detalhe: 'Erro no servidor' });
    }
  }

  async testPush(req, res) {
    const usuarioId = req.usuarioId;
    const { title, body } = req.body;

    try {
      const subs = await PushRepository.getSubscriptionsByUser(usuarioId);
      if (subs.length === 0) {
        return res.status(404).json({ detalhe: 'Nenhum dispositivo cadastrado.' });
      }

      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );

      const payload = JSON.stringify({ title, body, icon: '/logo-ritmox.png' });

      const promises = subs.map(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        return webpush.sendNotification(pushSubscription, payload).catch(err => {
          console.error("Erro ao enviar push:", err);
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log('Subscription expirada. Removendo...', sub.endpoint);
            return PushRepository.removeSubscription(sub.endpoint);
          }
        });
      });

      await Promise.all(promises);
      res.status(200).json({ message: 'Notificações enviadas' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ detalhe: 'Erro ao enviar notificação' });
    }
  }
}

module.exports = new NotificationController();
