# 🍳 Tasty Nest - Full-Stack Recipe Platform (Client-Side & CDN Architecture)

> **Inspired by Allrecipes & Integrated with Official Pinterest Profile:** [`https://www.pinterest.com/tastynest917`](https://www.pinterest.com/tastynest917)

A modern, responsive, high-aesthetic recipe sharing and discovery web platform. Built strictly using **HTML5, Tailwind CSS (CDN), Vanilla JavaScript, and Dexie.js (IndexedDB)** with **zero Node.js dependencies**.

---

## 🚀 Quick Start (No Node.js Required!)

You can run this project directly in any browser:

1. Simply double-click [`index.html`](file:///c:/Users/Lagee/Documents/testy%20nest/index.html) or open it with your favorite browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, open it with VS Code / IDE **Live Server** or run Python's built-in lightweight server:
   ```powershell
   python -m http.server 8000
   ```
   and visit `http://localhost:8000`.

---

## ✨ Key Features

### 1. 🌟 Public Recipe Hub & Categories
- **Uniform Balanced "Explore by Craving" Cards (Equal Dimensions & Symmetry):**
  - Completely redesigned from uneven text pills into a **6-column symmetrical visual card grid** where every card has identical width, height, and balanced proportions.
  - Features high-resolution circular local photography with distinct colored gradient ring borders:
    - **All Popular:** Sizzling Sri Lankan Crab Curry with active checkmark badge.
    - **⏱️ Quick Dinners:** Creamy Tuscan Garlic Chicken Pasta.
    - **🍰 Desserts:** Decadent Molten Dark Chocolate Lava Cake.
    - **🌱 Healthy Eats:** Wholesome Golden Tempered Parippu Dhal.
    - **🌶️ Sri Lankan:** Traditional Skillet Coconut Pol Roti.
    - **🍹 Drinks:** Chilled Sparkling Tropical Mint-Lime Mocktail Cooler.
  - Clicking any craving card activates the category and smoothly scrolls to the filtered recipe grid.
- **Interactive Category Showcase Banner:** Displays icon, description, and live recipe count upon selecting any category, with a one-click reset.
- **Dynamic Category & Time Filtering:**
  - Sorting: *Most Pinned, Quick & Easy, Top Rated ⭐*.
- **Mouthwatering Recipe Cards with Multi-Photo Indicator:**
  - Curated high-resolution imagery, hover zoom effects, prep/cook time pills, rating stars, calorie counters, and direct Pinterest Pin It buttons.
  - **📷 Multi-Photo Badge:** Shows photo counter (e.g., `📷 5`) on recipe cards when multiple gallery photos exist.

### 2. 🍲 Immersive Recipe Detail Experience & 5-Photo Interactive Gallery
- **📸 5-Photo Interactive Carousel & Thumbnail Strip:**
  - Displays up to 5 curated high-resolution photography angles for each dish.
  - Smooth fade transitions between angles.
  - Left & right chevron navigation controls.
  - Floating badge indicator (e.g. `1 / 5 Photos`).
  - Interactive bottom thumbnail strip: clicking any thumbnail switches the main photo with an active ring border.
- **Interactive Servings Scaler:** Adjust serving sizes with `[-]` and `[+]` buttons. Ingredient amounts (fractions, decimals, grams, cups, lbs) dynamically recalculate in real-time!
- **Cooking Checklist:** Clickable ingredient rows with strikethrough feedback to check off pantry items as you cook.
- **Step-by-Step Cooking Guide:** Numbered instructions with click-to-complete tracking and a live completion progress bar.
- **Interactive Kitchen Timer:** Preset quick timers (+3m, +5m, +15m, +40m), custom countdown, start/pause controls, and an audible synthesized audio chime upon completion.
- **100% Recipe Completion Celebration:** Confetti burst animation upon completing all steps!
- **Nutritional Information Breakdown:** Detailed card with calories, protein, carbohydrates, and fat.
- **Print & Share Ready:** Dedicated print stylesheet (`window.print()`) that formats clean recipe cards without navigation or footers.

### 3. 📌 Pinterest Integration
- Directly integrated with [`https://www.pinterest.com/tastynest917`](https://www.pinterest.com/tastynest917).
- Header & announcement bars with direct links.
- Official Pinterest SDK integration (`//assets.pinterest.com/js/pinit.js`).
- "Pin It" buttons on every recipe card and detail page so home chefs can pin dishes directly to their Pinterest boards.

### 4. 🔒 Secret Admin Portal (`#admin`)
- **Completely Hidden from Public View:** No visible admin links or edit buttons exist on the public website.
- **Secret Ways to Access Admin Portal (Hidden at Bottom):**
  1. **Discreet Footer Secret Button:** Scroll to the bottom of the page and click the discreet lock icon at the very bottom right (`#btn-footer-secret-admin`) or click the copyright text (`#secret-admin-footer`).
  2. **Direct URL Hash:** Navigate directly to [`index.html#admin`](file:///c:/Users/Lagee/Documents/testy%20nest/index.html#admin).
  3. **Logo Double-Click:** Double-click the **Tasty Nest logo** in the header.
  4. **Keyboard Shortcut (Optional):** <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd>.
- **Authentication:**
  - Login Credentials:
    - **Username:** `Supun@admin`
    - **Password:** `1999$#@`
    - *(Or click "Click to Quick Fill" for 1-second instant auto-fill!)*
- **Admin Control Center Features:**
  - **Category Tabs & Filtered Management:** Filter all recipes by category (`Quick Dinners`, `Desserts`, `Healthy Eats`, `Sri Lankan & Asian`, `Drinks`) with live count badges.
  - **Per-Category Upload:** Dedicated "+ Upload to [Category]" button automatically pre-selects the category for seamless content entry.
  - **Create / Edit / Delete Recipes with 5-Photo Gallery Uploader:** Full control over title, author, category, description, prep/cook times, servings, ingredients list, step-by-step instructions, nutrition, and uploading up to 5 photos per recipe. Features a visual 5-slot preview grid, multiple file selection via `FileReader` (Base64), image URL pasting, "Cover Photo" badge designation, and instant photo removal.
  - **Manage Pinterest Videos:** Configure the 4 live video pins shown in the Pinterest Showcase section. Supports direct video links (MP4 / Pinterest video URLs) or local MP4/WebM video file uploads directly stored in Dexie.js for offline hover playback.
  - **Data Backup & Restore:** Export all recipes and boards to a standalone `.json` backup file or restore default initial seeds with one click.

---

### 5. 📬 Newsletter Leads & Subscriber Messages
- **Public Opt-In Form:** In the "Get Our 7-Day Recipe Book" section, visitors enter their email address to claim free meal plans.
- **Immediate Feedback:** Instant confirmation toast + festive confetti burst upon entering an email.
- **Admin Inbox ("Subscriber Messages"):**
  - Live count badge in Admin Control Center (`#admin-subscribers-badge`).
  - View all subscriber emails with timestamps and campaign sources in a clean modal table.
  - "Copy All Emails" button (one-click copy of comma-separated email list for newsletter campaigns).
  - "Export CSV" button (downloads a CSV spreadsheet of leads).
  - Delete individual leads with automatic table update.

### 6. ⭐ 5-Star Recipe Ratings & Public Reviews System
- **Interactive 5-Star Rating Form:**
  - Located on every recipe detail page (`#recipe-detail-view`).
  - Interactive clickable star picker (1 to 5 stars) with dynamic descriptors (e.g. *Needs Improvement, Fair, Good, Really Delicious, Outstanding Heirloom Dish!*).
  - Name/author input and cooking tips / serving suggestions.
  - Review text with immediate public publishing and celebratory confetti.
- **Real-Time Dynamic Star Recalculation:**
  - Submitting a review recalculates the average recipe rating and total reviews count dynamically.
  - Updates the hero rating badge, detail header, and recipe cards on the home page.
- **Public Community Reviews Feed:**
  - Shows verified home cook reviews with avatar gradient badges, star ratings, relative timestamps, and cooking notes.
- **Admin Reviews Moderation:**
  - Admin button "Manage Reviews" with live reviews count badge.
  - Filter reviews by recipe or view all.
  - Delete spam or unwanted reviews with automatic rating score recalculation.

---

## 🗄️ Database Architecture (Dexie.js / IndexedDB)

Matches the Prisma schema from `testynestinstructions.md` within client-side IndexedDB:

- **`recipes`**: `id, title, slug, category, prepTime, cookTime, servings, imageUrl, videoUrl, rating, reviewsCount, createdAt, updatedAt`
- **`ingredients`**: `id, recipeId, name, amount`
- **`instructions`**: `id, recipeId, stepNumber, description`
- **`nutrition`**: `id, recipeId, calories, protein, carbs, fat`
- **`users`**: `id, username, email, password, name`
- **`favorites`**: `id, recipeId, savedAt`
- **`pinterestBoards`**: `id, title, pinsCount, pinUrl, imageUrl, videoUrl, order`
- **`subscribers`**: `id, email, subscribedAt, source`
- **`reviews`**: `id, recipeId, author, rating, comment, createdAt`

---

## 📁 File Structure

```text
testy nest/
├── index.html               # Main SPA markup, layout, modals, templates
├── css/
│   └── style.css            # Custom typography, glassmorphism, animations, print rules
├── js/
│   ├── db.js                # Dexie.js database schema, CRUD methods, seed data & reviews
│   └── app.js               # Application controller, routing, search/filters, timer, scaler, reviews & subscribers
├── testynestinstructions.md # Original requirements document
└── README.md                # Documentation and guide
```

---

## 🇱🇰 සිංහල සටහන (Sinhala Guide)

- මෙම වෙබ් අඩවිය සම්පූර්ණයෙන්ම **HTML, Tailwind CSS (CDN), JavaScript සහ Dexie.js (IndexedDB)** මගින් සකසා ඇති බැවින් කිසිදු **Node.js** හෝ අමතර Server එකක් අවශ්‍ය නොවේ.
- [`index.html`](file:///c:/Users/Lagee/Documents/testy%20nest/index.html) file එක කෙලින්ම ඕනෑම browser එකකින් open කර run කළ හැක.
- **රහසිගත Admin Portal එකට පිවිසීමට (Secret Access):**
  - ඕනෑම වෙලාවක කීබෝඩ් එකෙන් **`Ctrl + Shift + A`** ඔබන්න, නැතහොත් Header එකේ ඇති **Tasty Nest Logo** එක හෝ Footer එකේ ඇති **Copyright text** එක මත **Double-Click** කරන්න (නැතහොත් URL එකට `#admin` එකතු කරන්න).
  - Admin Email: `admin@tastynest.com` | Password: `admin123` (හෝ "Click to Quick Fill" ක්ලික් කරන්න).
- **📬 Subscriber Messages (ඊමේල් ලැයිස්තුව Admin Panel එකෙන් බැලීම):**
  - Newsletter කාඩ්පතෙන් ("Get Our 7-Day Recipe Book") visitors ලා ඇතුළත් කරන සියලුම ඊමේල් Admin Control Center එකේ ඇති **"Subscriber Messages"** බටන් එක ක්ලික් කිරීමෙන් බැලිය හැක.
  - එතැනින් සියලු ඊමේල් එකවර Copy කර ගැනීමට ("Copy All Emails") සහ Excel/CSV ලෙස Export කර ගැනීමටද හැක.
- **⭐ Recipes සඳහා 5-Star Reviews ලබා දීම සහ Public පෙන්වීම:**
  - ඕනෑම Recipe එකක් open කළ විට එහි පහළින් **"Cooked This Dish? Leave a 5-Star Review"** කොටසින් 1 සිට 5 දක්වා තරු ගණන තෝරා තමන්ගේ නම සහ අදහස් ඇතුළත් කර Review එකක් Submit කළ හැක.
  - Submit කළ විගස එය Public Reviews ලැයිස්තුවේ දිස්වන අතර Recipe එකේ Average Star Rating එකද Real-Time Update වේ.
  - Admin Panel එකෙන් **"Manage Reviews"** බටන් එක හරහා සියලුම Reviews පරීක්ෂා කිරීමට හෝ අනවශ්‍ය reviews Delete කිරීමටද පුළුවන.
- **📐 Uniform Recipe Card Layout & Symmetrical Design (එකම ප්‍රමාණයේ Images & Cards):**
  - සියලුම Recipe Cards වල Images එකම උසකින් (`230px`) සහ `object-fit: cover` මගින් සකසා ඇති අතර, Title, Stars, Description සහ Author Footer පේළි සියල්ල එකම රේඛාවකට සමානව පෙළගස්වා ඇත.
- **✨ 9-Recipe Limit & "View All" Toggle Button:**
  - මුල් පිටුවේ එකවර පෙන්වන්නේ උපරිම Recipe 9ක් පමණි (පිරිසිදු 3x3 Grid එකක්).
  - පහළින් ඇති **"View All Recipes"** බටන් එක ක්ලික් කළ විට ඉතිරි සියලුම Recipes විවෘත වේ (බටන් එක "Show Less" බවට පත්වේ).
  - නැවත "Show Less" ක්ලික් කළ විට එය නැවත recipes 9 දක්වා සංකෝචනය වී Smooth Scroll එකකින් ඉහළට ගමන් කරයි.
- සියලුම දත්ත බ්‍රවුසරයේ Dexie / IndexedDB හි ස්ථිරව සුරැකේ.
