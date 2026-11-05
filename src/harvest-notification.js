const HARVEST_READY_NOTIFICATION_ID = 3600;
const HARVEST_REMINDER_NOTIFICATION_ID = 3601;
const HARVEST_DELAY_MS = 60 * 60 * 1000;
const HARVEST_REMINDER_MS = 2 * 60 * 60 * 1000;

let browserReadyTimer = null;
let browserReminderTimer = null;
let browserReminderInterval = null;

export function harvestNotificationPlan(lastHarvest, now = Date.now()) {
  const readyAt = Math.max(Number(lastHarvest) + HARVEST_DELAY_MS, now);
  return { readyAt, readyDelay: Math.max(0, readyAt - now), reminderAt: now + HARVEST_REMINDER_MS };
}

function clearBrowserSchedule() {
  clearTimeout(browserReadyTimer);
  clearTimeout(browserReminderTimer);
  clearInterval(browserReminderInterval);
  browserReadyTimer = null;
  browserReminderTimer = null;
  browserReminderInterval = null;
}

function showBrowserHarvestNotification() {
  new Notification('Hasat hazır!', {
    body: 'Diyarların Fethi’nde toplanabilir hasadın seni bekliyor.',
    icon: './app-icon.png',
  });
}

export async function scheduleHarvestNotification(lastHarvest = Date.now(), requestPermission = true) {
  const now = Date.now();
  const plan = harvestNotificationPlan(lastHarvest, now);
  if (window.Capacitor?.isNativePlatform?.()) {
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [
        { id: HARVEST_READY_NOTIFICATION_ID },
        { id: HARVEST_REMINDER_NOTIFICATION_ID },
      ] });
      let permission = await LocalNotifications.checkPermissions();
      if (permission.display === 'prompt' && requestPermission) permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') return { scheduled: false, reason: permission.display === 'denied' ? 'denied' : 'prompt' };
      const notifications = [];
      if (plan.readyDelay > 0) notifications.push({
        id: HARVEST_READY_NOTIFICATION_ID,
        title: 'Hasat hazır!',
        body: 'Diyarların Fethi’nde hasadın artık toplanabilir.',
        schedule: { at: new Date(plan.readyAt) },
      });
      notifications.push({
        id: HARVEST_REMINDER_NOTIFICATION_ID,
        title: 'Hasadın seni bekliyor!',
        body: 'Toplanabilir hasadın hâlâ ambara alınmadı.',
        schedule: { at: new Date(plan.reminderAt), repeats: true },
      });
      await LocalNotifications.schedule({ notifications });
      return { scheduled: true, kind: 'native', recurring: true };
    } catch {
      return { scheduled: false, reason: 'unavailable' };
    }
  }

  clearBrowserSchedule();
  if (!('Notification' in window)) return { scheduled: false, reason: 'unsupported' };
  let permission = Notification.permission;
  if (permission === 'default' && requestPermission) permission = await Notification.requestPermission();
  if (permission !== 'granted') return { scheduled: false, reason: permission === 'denied' ? 'denied' : 'prompt' };
  if (plan.readyDelay > 0) browserReadyTimer = setTimeout(showBrowserHarvestNotification, plan.readyDelay);
  const firstReminderDelay = Math.max(HARVEST_REMINDER_MS, plan.readyDelay + HARVEST_REMINDER_MS);
  browserReminderTimer = setTimeout(() => {
    showBrowserHarvestNotification();
    browserReminderInterval = setInterval(showBrowserHarvestNotification, HARVEST_REMINDER_MS);
  }, firstReminderDelay);
  return { scheduled: true, kind: 'browser', recurring: true };
}

export { HARVEST_DELAY_MS, HARVEST_REMINDER_MS };
