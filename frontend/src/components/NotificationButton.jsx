import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import api from '../services/api';

const VAPID_PUBLIC_KEY = 'BHaadQIKdarObjPx8Quvx33sjnpB8TJSZltZDyC8e55T4Om-nK3F6Dm2WNYPM_Dti3-wqEonjdD8PPLoeuesFjQ';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Service Worker erro:', error);
    }
  }

  async function subscribeUser() {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permissão para notificações negada.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
      };

      const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);

      // Envia a inscrição para o servidor
      await api.post('/notifications/subscribe', pushSubscription);
      
      setIsSubscribed(true);
      alert('Notificações ativadas com sucesso!');
    } catch (error) {
      console.error('Erro ao assinar push:', error);
      alert('Erro ao ativar notificações.');
    }
  }

  if (!isSupported) return null;

  return (
    <button 
      onClick={subscribeUser}
      disabled={isSubscribed}
      title={isSubscribed ? "Notificações Ativas" : "Ativar Notificações"}
      className={`p-2 rounded-full transition-all flex items-center justify-center ${isSubscribed ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
      {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
    </button>
  );
}
