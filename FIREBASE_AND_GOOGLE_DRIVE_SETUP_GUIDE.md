# 🚀 Tasty Nest: Firebase Firestore & Google Drive Setup Guide
*(සිංහල සහ English සම්පූර්ණ මාර්ගෝපදේශය)*

Tasty Nest වෙබ් අඩවියට **Firebase Firestore** (සෑම visitor කෙනෙකුටම එකවර upload කරන recipes පෙනෙන සේ cloud database එක සම්බන්ධ කිරීම) සහ **Google Drive Storage** (Upload කරන images 1MB වලට අඩුවෙන් auto-compress වී Google Drive හි save වීම) සාර්ථකව සම්බන්ධ කරගන්නා ආකාරය මෙහි විස්තර කර ඇත.

---

## 🌟 පද්ධතිය ක්‍රියාත්මක වන ආකාරය (How It Works):
1. **Cloud Database (Firebase Firestore):** ඔබ recipe එකක් add/edit/delete කළ සැණින් එය Firebase Firestore වෙත save වේ. Real-time sync හරහා ඕනෑම රටක හෝ browser එකක සිට වෙබ් අඩවිය බලන සියලුම අයට එම recipes එකවර පෙනේ.
2. **Auto Image Compression (< 1MB):** ඔබ high-resolution photo එකක් (e.g., 5MB - 15MB) select කළත්, ඔබගේ browser එකෙන්ම HTML5 Canvas මගින් quality එක නොබිඳෙන සේ **1MB වලට අඩුවෙන් (200KB - 600KB)** auto-compress වේ!
3. **Google Drive Cloud Storage:** Compress වූ image එක Google Apps Script හරහා ඔබගේ Google Drive එකේ `TastyNest_Uploads` නම් folder එකක save වී, high-speed direct CDN link එකක් වෙබ් අඩවියට සම්බන්ධ වේ.
4. **Video Support:** Google Drive video links (`https://drive.google.com/file/d/.../view`), YouTube හෝ direct MP4 links recipe detail player එකේ ඍජුවම play කළ හැක.

---

## 📌 පියවර 1: Firebase Project එකක් සාදා ගැනීම (Firebase Setup) - මිනිත්තු 3යි

1. [https://console.firebase.google.com/](https://console.firebase.google.com/) වෙත යන්න.
2. **"Add project"** (හෝ "Create a project") click කර, project එකට නමක් දෙන්න (උදා: `tasty-nest-app`).
3. Google Analytics අවශ්‍ය නම් Enable කර **"Create project"** click කරන්න.
4. Project Dashboard එකේ **Firestore Database** වෙත යන්න:
   - වම් පස menu එකෙන් **Build -> Firestore Database** click කරන්න.
   - **"Create database"** click කරන්න.
   - Location එකක් තෝරන්න (Default හෝ ආසන්න region එකක්, උදා: `asia-south1` or `us-central1`).
   - Security Rules සඳහා **"Start in test mode"** තෝරා **Create** / **Enable** click කරන්න.
5. Project Settings වෙත ගොස් Web App එකක් සාදන්න:
   - Project Overview අසල ඇති **Settings (Gear icon) -> Project settings** වෙත යන්න.
   - පහළට scroll කර **"Your apps"** යටතේ ඇති **Web icon `</>`** click කරන්න.
   - App nickname එකක් දෙන්න (උදා: `TastyNestWeb`) -> **Register app** click කරන්න.
   - එහි ලැබෙන `firebaseConfig` object එක copy කරගන්න:
     ```javascript
     const firebaseConfig = {
       apiKey: "AIzaSy...",
       authDomain: "tasty-nest-app.firebaseapp.com",
       projectId: "tasty-nest-app",
       storageBucket: "tasty-nest-app.appspot.com",
       messagingSenderId: "...",
       appId: "..."
     };
     ```

---

## 📌 පියවර 2: Google Drive Upload Script එක සකස් කිරීම (Google Apps Script) - මිනිත්තු 2යි

1. [https://script.google.com/](https://script.google.com/) වෙත ඔබගේ Google Account එකෙන් පිවිසෙන්න.
2. **"+ New project"** click කරන්න.
3. Editor එකේ ඇති code සියල්ල delete කර, Tasty Nest project එකේ ඇති `google-apps-script/Code.gs` ගොනුවේ code එක සම්පූර්ණයෙන්ම paste කරන්න.
4. දකුණු පස ඉහළ ඇති නිල් පැහැති **"Deploy"** button එක click කර **"New deployment"** තෝරන්න.
5. "Select type" අසල ඇති Gear icon එක click කර **"Web app"** තෝරන්න.
6. පහත විස්තර සකසන්න:
   - **Description:** `Tasty Nest Media Uploader`
   - **Execute as:** `Me (your-email@gmail.com)`
   - **Who has access:** `Anyone`  *(⚠️ ඉතා වැදගත්! Anyone ලෙස තැබිය යුතුය)*
7. **"Deploy"** click කරන්න.
8. පළමු වරට Google Account එකෙන් Permissions ඉල්ලන විට:
   - **Authorize access** click කරන්න.
   - ඔබගේ Google email එක තෝරන්න.
   - "Google hasn't verified this app" යනුවෙන් ආවොත්, **"Advanced"** click කර **"Go to Untitled project (unsafe)"** click කරන්න.
   - **"Allow"** click කරන්න.
9. අවසානයේ ලැබෙන **"Web app URL"** එක (අගට `/exec` ඇති URL එක) copy කරගන්න!
   - ඔබගේ සක්‍රිය Google Apps Script URL එක:
     `https://script.google.com/macros/s/AKfycbxRMh_3_-YmF2GqdyT7z6UfmNvX8ybcregXgZvv5z1luo9XmPXGLX-MZz8IXcnLy68k/exec`
   - මෙය දැනටමත් code එකෙහි (`js/firebase-config.js`) සාර්ථකව සම්බන්ධ කර ඇත! ✅

---

## 📌 පියවර 3: Tasty Nest Admin Panel එකෙන් Connect කිරීම (Easy 1-Click Connection)

1. ඔබගේ Tasty Nest වෙබ් අඩවිය browser එකේ open කරගන්න (`index.html`).
2. පහළට scroll කර Footer එකේ ඇති රහස් lock icon එක click කර හෝ Logo එක double-click කර Admin Panel එකට login වන්න:
   - **Username:** `Supun@admin`
   - **Password:** `1999$#@`
3. Admin Control Center මුදුනේ ඇති **"Cloud & Drive Sync"** button එක click කරන්න.
4. Modal එකක් open වනු ඇත:
   - **Firebase Config:** ඉහත පියවර 1 හි copy කරගත් සම්පූර්ණ `firebaseConfig = { ... }` එක **Quick Paste** box එකට paste කර **"Auto-Fill Fields ↓"** click කරන්න.
   - **Google Apps Script URL:** පියවර 2 හි copy කරගත් Web App URL එක paste කරන්න.
   - **"Test Connection"** click කර බලන්න.
   - **"Save & Connect Cloud"** click කරන්න!
5. **පැරණි Recipes Cloud එකට දැමීමට:**
   - එම Modal එකේම ඇති **"Upload Local Recipes to Cloud"** button එක click කරන්න. දැනට ඇති සියලුම recipes එකවර Firebase Firestore වෙත upload වී cloud database එක සක්‍රිය වේ!

---

## 🎯 සාර්ථකව සම්බන්ධ වූ පසු:
- ඔබ Admin panel එකෙන් upload කරන ඕනෑම recipe එකක් **Firebase Firestore** එකෙහි save වන නිසා ලෝකයේ ඕනෑම තැනක සිට site එකට එන ඕනෑම visitor කෙනෙකුට එකවර live පෙනේ!
- ඔබ upload කරන ඕනෑම photo එකක් **1MB වලට අඩුවෙන් compress වී** ඔබගේ Google Drive හි `TastyNest_Uploads` folder එකේ පිළිවෙළකට save වේ!
- Google Drive video links ද recipe එකට embed කළ හැක.
