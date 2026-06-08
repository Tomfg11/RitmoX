const cron = require('node-cron');
const pool = require('../config/db');
const webpush = require('web-push');

class CronService {
  start() {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    console.log("Serviço de Cron Jobs iniciado.");

    // Verifica eventos a cada minuto
    cron.schedule('* * * * *', async () => {
      try {
        // Encontra eventos onde a data está entre agora e daqui a 65 minutos (para dar margem de 1 hora) e ainda não notificado
        const resEventos = await pool.query(`
          SELECT t.id, t.titulo, t.data, t.usuario_id 
          FROM tarefas t
          WHERE t.tipo = 'EVENTO' 
            AND t.data > NOW() 
            AND t.data <= NOW() + interval '65 minutes'
            AND (t.notificado IS NULL OR t.notificado = false)
        `);

        if (resEventos.rows.length > 0) {
          for (const evento of resEventos.rows) {
            await this.sendPushToUser(evento.usuario_id, "Lembrete de Compromisso", `O seu evento '${evento.titulo}' começará em breve!`);
            // Marcar como notificado
            await pool.query("UPDATE tarefas SET notificado = true WHERE id = $1", [evento.id]);
          }
        }
      } catch (error) {
        console.error("Erro no cron de eventos:", error);
      }
    });

    // Tarefas diárias - Resumo da Manhã (Roda todo dia às 09:00 AM)
    cron.schedule('0 9 * * *', async () => {
      try {
        const resTarefas = await pool.query(`
          SELECT usuario_id, COUNT(*) as qtd
          FROM tarefas
          WHERE tipo = 'TAREFA' 
            AND concluida = false
            AND data_limite::date <= CURRENT_DATE
          GROUP BY usuario_id
        `);

        if (resTarefas.rows.length > 0) {
          for (const row of resTarefas.rows) {
            const mensagem = row.qtd === '1' 
              ? 'Você tem 1 tarefa pendente para hoje!' 
              : `Você tem ${row.qtd} tarefas pendentes para hoje!`;
              
            await this.sendPushToUser(row.usuario_id, "Bom dia! ☀️", mensagem);
          }
        }
      } catch (error) {
        console.error("Erro no cron de tarefas (manhã):", error);
      }
    });

    // Tarefas diárias - Fechamento da Tarde/Noite (Roda todo dia às 18:00)
    cron.schedule('0 18 * * *', async () => {
      try {
        const resTarefas = await pool.query(`
          SELECT usuario_id, COUNT(*) as qtd
          FROM tarefas
          WHERE tipo = 'TAREFA' 
            AND concluida = false
            AND data_limite::date <= CURRENT_DATE
          GROUP BY usuario_id
        `);

        if (resTarefas.rows.length > 0) {
          for (const row of resTarefas.rows) {
            const mensagem = row.qtd === '1' 
              ? 'Ainda dá tempo! Você tem 1 tarefa para fechar o dia.' 
              : `O dia está acabando, e você ainda tem ${row.qtd} tarefas pendentes. Vamos lá!`;
              
            await this.sendPushToUser(row.usuario_id, "Boa tarde! 🌅", mensagem);
          }
        }
      } catch (error) {
        console.error("Erro no cron de tarefas (tarde):", error);
      }
    });
  }

  async sendPushToUser(usuarioId, title, body) {
    try {
      const resSubs = await pool.query("SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE usuario_id = $1", [usuarioId]);
      
      const payload = JSON.stringify({ title, body, icon: '/logo-ritmox.png' });
      
      const promises = resSubs.rows.map(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        };
        return webpush.sendNotification(pushSubscription, payload).catch(err => {
          if (err.statusCode === 404 || err.statusCode === 410) {
            return pool.query("DELETE FROM push_subscriptions WHERE endpoint = $1", [sub.endpoint]);
          }
        });
      });

      await Promise.all(promises);
    } catch (err) {
      console.error("Erro ao enviar push para usuário:", err);
    }
  }
}

module.exports = new CronService();
