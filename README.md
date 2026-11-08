# קונאן — אפליקציית אנדרואיד

מעטפת Capacitor שטוענת את מערכת קונאן מהשרת (`https://ruppin.ac.il/landpages/it/konan-schedule.html`).
כל שינוי באתר מגיע לאפליקציה אוטומטית — אין צורך לבנות APK מחדש.
APK חדש נדרש רק כשמשנים את המעטפת עצמה (אייקון, הרשאות, כתובת התחלה, Firebase).

## בנייה
כל push ל-`main` בונה APK חתום ב-GitHub Actions ומפרסם אותו ב-Releases (`konan.apk`).

Secrets נדרשים (Settings → Secrets and variables → Actions):
- `KEYSTORE_PASSWORD` — סיסמת מפתח החתימה (`android/app/konan-release.jks`). **לא לאבד — בלעדיה אי אפשר לעדכן את האפליקציה המותקנת.**
- `GOOGLE_SERVICES_JSON` — (אופציונלי) תוכן `google-services.json` מ-Firebase, להתראות native.

## התראות
- בשרת: קובץ `firebase-service-account.json` בתיקייה `F:\apps\closures-api\`.
- בדפי האתר: `web-snippet/native-app.js` → להעתיק ל-`F:\landpages\it\` ולהוסיף `<script src="/landpages/it/native-app.js"></script>`.

## שינוי כתובת ההתחלה
`capacitor.config.json` → `server.url`.
