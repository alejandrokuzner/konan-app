/*
 * native-app.js — חיבור דפי ה-web לאפליקציית האנדרואיד (Capacitor)
 *
 * להוסיף לכל דף של המערכת, לפני </body>:
 *   <script src="/landpages/it/native-app.js"></script>
 *
 * בדפדפן רגיל הקובץ לא עושה כלום. בתוך האפליקציה הוא:
 *   - מבקש הרשאת התראות ורושם את המכשיר בשרת (FCM)
 *   - יוצר ערוץ התראות "קריאות" בעדיפות גבוהה (צליל + רטט)
 *   - בלחיצה על התראה פותח את הדף הרלוונטי
 *   - מגדיר window.KONAN_NATIVE = true כדי שהדף יוכל להסתיר את כפתור "הפעל התראות" של הדפדפן
 */
(function () {
  var C = window.Capacitor;
  if (!C || typeof C.isNativePlatform !== 'function' || !C.isNativePlatform()) return;
  window.KONAN_NATIVE = true;

  var API = window.KONAN_API || (location.origin + '/landpages/closures-api/api');
  var Push = C.registerPlugin ? C.registerPlugin('PushNotifications') : (C.Plugins || {}).PushNotifications;
  if (!Push) { console.warn('[native] PushNotifications plugin missing'); return; }

  // שם הטכנאי, אם הדף שומר אותו (לא חובה — ההתראות נשלחות לכולם כמו ב-web)
  function currentTech() {
    try { return window.KONAN_TECH || localStorage.getItem('technician') || null; }
    catch (_) { return null; }
  }

  var lastToken = null;
  // konan.html קורא לזה כשהטכנאי בוחר את שמו — מעדכן את השם של המכשיר בשרת
  window.konanNativeSetTech = function () { if (lastToken) register(lastToken); };

  function register(token) {
    lastToken = token;
    var key = 'konan_native_token';
    var body = JSON.stringify({ token: token, platform: C.getPlatform(), tech: currentTech() });
    fetch(API + '/push/native-register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body })
      .then(function () { try { localStorage.setItem(key, token); } catch (_) {} })
      .catch(function (e) { console.warn('[native] register failed', e); });
  }

  Push.addListener('registration', function (t) { register(t.value); });
  Push.addListener('registrationError', function (e) { console.warn('[native] registration error', e); });
  Push.addListener('pushNotificationActionPerformed', function (a) {
    var url = a && a.notification && a.notification.data && a.notification.data.url;
    if (url) location.href = url; else location.reload();
  });

  // כשפותחים את האפליקציה או חוזרים אליה — מנקים את ההתראות שנשארו בלוח ההתראות,
  // כדי שהמספר על האייקון ייעלם (סמסונג סופר התראות שלא הוסרו)
  function clearDelivered() {
    try { if (Push.removeAllDeliveredNotifications) Push.removeAllDeliveredNotifications(); } catch (_) {}
  }
  clearDelivered();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') clearDelivered();
  });

  (async function init() {
    try {
      if (C.getPlatform() === 'android') {
        await Push.createChannel({
          id: 'calls', name: 'קריאות', description: 'קריאות שירות חדשות',
          importance: 5, visibility: 1, sound: 'default', vibration: true, lights: true
        });
      }
      var perm = await Push.checkPermissions();
      if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') perm = await Push.requestPermissions();
      if (perm.receive !== 'granted') { console.warn('[native] notifications not allowed'); return; }
      await Push.register();
    } catch (e) { console.warn('[native] init failed', e); }
  })();
})();
