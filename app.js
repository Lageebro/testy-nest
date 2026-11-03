/**
 * Normalizes image paths by stripping any leading 'images/' or './images/'
 */
function normalizeImagePath(url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();
  if (/^(\.\/|\/)?images\//i.test(url)) {
    return url.replace(/^(\.\/|\/)?images\//i, '');
  }
  return url;
}

/**
 * Tasty Nest Main Application Controller
 * Matches exact editorial culinary design with Newsreader serif, warm palette, and Pinterest integration
 */

// Application State
const AppState = {
  currentView: 'home',
  currentRecipeId: null,
  activeCategory: 'All Popular',
  searchQuery: '',
  maxTime: 0,
  sortBy: 'pinned',
  adminSession: localStorage.getItem('tastynest_admin_token') || null,
  adminCategoryFilter: 'All',
  
  // Detail View State
  detailRecipe: null,
  scaledServings: 1,
  originalServings: 1,
  checkedIngredients: new Set(),
  completedSteps: new Set(),

  // Kitchen Timer State
  timerSeconds: 0,
  timerInterval: null,
  timerRunning: false,

  // Multi-Photo Gallery State (Up to 5 images)
  editingGalleryImages: [],
  detailGalleryImages: [],
  detailCurrentPhotoIdx: 0,

  // Recipes Grid Limits
  recipesLimit: 9,
  showAllRecipes: false
};

const CATEGORY_META = {
  'Quick Dinners': {
    lucideIcon: 'zap',
    title: 'Quick & Easy Dinners',
    desc: 'Ready in 25 minutes or less. Flavor-packed, comforting weeknight meals with effortless prep.'
  },
  'Desserts': {
    lucideIcon: 'cake',
    title: 'Handcrafted Desserts & Sweets',
    desc: 'Decadent molten chocolate cakes, traditional steamed Kithul watalappan, and artisan bakes.'
  },
  'Healthy Eats': {
    lucideIcon: 'leaf',
    title: 'Plant-Based & Healthy Eats',
    desc: 'Wholesome Sri Lankan tempered red lentil dhal, clean energy chia bowls, and nourishing vegan staples.'
  },
  'Sri Lankan & Asian': {
    lucideIcon: 'flame',
    title: 'Sri Lankan & Asian Heirloom Specials',
    desc: 'Authentic roasted pepper crab curry, skillet coconut pol roti, and sizzling street-style kottu.'
  },
  'Drinks': {
    lucideIcon: 'cup-soda',
    title: 'Refreshing Drinks & Beverages',
    desc: 'Hydrating natural King Coconut coolers, fragrant spiced Ceylon milk tea, and sparkling fruit mocktails.'
  },
  'Breakfast & Brunch': {
    lucideIcon: 'sunrise',
    title: 'Breakfast & Morning Delights',
    desc: 'Energizing chia breakfast bowls, tropical fruit parfaits, and wholesome morning fuel.'
  }
};

// ==========================================
// TOAST NOTIFICATION UTILITY
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-700 text-white',
    error: 'bg-red-700 text-white',
    info: 'bg-zinc-900 text-white',
    brand: 'bg-brand-700 text-white'
  };

  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    info: 'info',
    brand: 'sparkles'
  };

  toast.className = `toast flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="w-4 h-4 shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// AUDIO SYNTHESIZER FOR KITCHEN TIMER
// ==========================================
function playTimerChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    osc.frequency.setValueAtTime(1174.66, audioCtx.currentTime + 0.3); // D6

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
  } catch (e) {
    console.log("Audio alert not supported on this context");
  }
}

// ==========================================
// ROUTER & VIEW SWITCHER
// ==========================================
function navigateTo(view, param = null) {
  AppState.currentView = view;
  
  const homeView = document.getElementById('home-view');
  const detailView = document.getElementById('recipe-detail-view');
  const favoritesView = document.getElementById('favorites-view');
  const adminView = document.getElementById('admin-view');

  // Hide all views first
  homeView.classList.add('hidden');
  detailView.classList.add('hidden');
  favoritesView.classList.add('hidden');
  adminView.classList.add('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (view === 'home') {
    homeView.classList.remove('hidden');
    if (window.location.hash !== '#home' && window.location.hash !== '') {
      window.location.hash = '#home';
    }
    document.title = "Tasty Nest | Handcrafted Home Recipes & Pinterest Kitchen";
    renderHeroSection();
    renderRecipes();
    renderPinterestBoards();
  } else if (view === 'detail') {
    detailView.classList.remove('hidden');
    if (param) {
      window.location.hash = `#recipe/${param}`;
      loadRecipeDetail(param);
    }
  } else if (view === 'favorites') {
    favoritesView.classList.remove('hidden');
    window.location.hash = '#favorites';
    document.title = "My Saved Recipes | Tasty Nest";
    renderFavorites();
  } else if (view === 'admin') {
    adminView.classList.remove('hidden');
    window.location.hash = '#admin';
    document.title = "Admin Dashboard | Tasty Nest";
    setupAdminView();
  }

  updateFavoritesBadge();
  lucide.createIcons();
}

function handleHashChange() {
  const hash = window.location.hash || '#home';
  if (hash.startsWith('#recipe/')) {
    const id = hash.replace('#recipe/', '');
    navigateTo('detail', id);
  } else if (hash === '#favorites') {
    navigateTo('favorites');
  } else if (hash === '#admin') {
    navigateTo('admin');
  } else {
    navigateTo('home');
  }
}

// ==========================================
// HERO FEATURED DISH CONTROLLER
// ==========================================
async function renderHeroSection() {
  const heroTitle = document.getElementById('hero-dish-title');
  if (!heroTitle) return;

  const config = await TastyDB.getHeroConfig();

  // Populate title & description
  heroTitle.textContent = config.title || 'Spicy Sri Lankan Black Pepper Crab Curry';
  
  const subEl = document.getElementById('hero-dish-sub');
  if (subEl) {
    if (config.subtitle && config.subtitle.trim()) {
      subEl.textContent = config.subtitle;
      subEl.classList.remove('hidden');
    } else {
      subEl.textContent = '';
      subEl.classList.add('hidden');
    }
  }

  const descEl = document.getElementById('hero-dish-description');
  if (descEl) descEl.textContent = config.description || '';

  // 4 Stats
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setTxt('hero-stat-rating', config.rating || '4.9');
  setTxt('hero-stat-reviews', config.reviewsText || '428 Verified Reviews');
  setTxt('hero-stat-cooktime', config.cookTime || '35 Mins');
  setTxt('hero-stat-cooktime-sub', config.cookTimeSub || 'Total Cook Time');
  setTxt('hero-stat-calories', config.calories || '450 kcal');
  setTxt('hero-stat-calories-sub', config.caloriesSub || 'Nutritious / Serving');
  setTxt('hero-stat-difficulty', config.difficulty || 'Intermediate');
  setTxt('hero-stat-diff-sub', config.difficultySub || 'One-Pot Magic');

  // Chef & Heritage Tag
  setTxt('hero-chef-name', config.chefName || 'Dilrukshi P.');
  setTxt('hero-chef-badge', config.chefBadge || 'Verified Chef');
  setTxt('hero-chef-sub', config.chefSub || 'Tested 3 times in test kitchen • Pinned 8.1k times');
  setTxt('hero-series-tag', config.seriesTag || 'Heirloom Heritage Series');

  // Key Flavor Overlay
  setTxt('hero-flavor-initial', config.flavorInitial || 'TL');
  setTxt('hero-flavor-text', config.flavorBase || 'Key Flavor Base');
  setTxt('hero-flavor-count', config.flavorIngredients || '9');

  // Image & Pinterest
  const coverImg = document.getElementById('hero-cover-img');
  if (coverImg && config.imageUrl) {
    coverImg.src = normalizeImagePath(config.imageUrl);
    coverImg.alt = config.title;
  }

  const pinBtn = document.getElementById('hero-pinterest-btn');
  const floatingPin = document.getElementById('hero-floating-pin-btn');
  if (pinBtn && config.pinterestUrl) pinBtn.href = config.pinterestUrl;
  if (floatingPin && config.pinterestUrl) floatingPin.href = config.pinterestUrl;

  // Buttons: View Full Recipe & Bookmark
  const viewBtn = document.getElementById('btn-hero-view-recipe');
  if (viewBtn) {
    viewBtn.onclick = () => navigateTo('detail', config.recipeId || 'rec-crab-curry');
  }

  const bookmarkBtn = document.getElementById('btn-hero-bookmark');
  if (bookmarkBtn) {
    bookmarkBtn.onclick = function() {
      handleToggleFavorite(config.recipeId || 'rec-crab-curry', this);
    };
    const isFav = await TastyDB.isFavorite(config.recipeId || 'rec-crab-curry');
    const bIcon = bookmarkBtn.querySelector('i');
    if (bIcon) {
      if (isFav) {
        bIcon.classList.add('text-brand-700', 'fill-brand-700');
        bIcon.classList.remove('text-zinc-600');
      } else {
        bIcon.classList.remove('text-brand-700', 'fill-brand-700');
        bIcon.classList.add('text-zinc-600');
      }
    }
  }

  if (window.lucide) lucide.createIcons();
}

async function openHeroCustomizerModal() {
  const modal = document.getElementById('hero-customizer-modal');
  if (!modal) return;

  const config = await TastyDB.getHeroConfig();
  const allRecipes = await TastyDB.getAllRecipes();

  // Populate Select Recipe Dropdowns
  const selectRecipe = document.getElementById('hero-form-select-recipe');
  const targetRecipe = document.getElementById('hero-form-target-recipe-id');

  if (selectRecipe) {
    selectRecipe.innerHTML = `
      <option value="">-- Choose from your published recipes --</option>
      ${allRecipes.map(r => `<option value="${r.id}">${r.title} (${r.category})</option>`).join('')}
    `;
  }

  if (targetRecipe) {
    targetRecipe.innerHTML = allRecipes.map(r => 
      `<option value="${r.id}" ${r.id === config.recipeId ? 'selected' : ''}>${r.title} (${r.category})</option>`
    ).join('');
  }

  // Populate form fields
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('hero-form-title', config.title);
  setVal('hero-form-subtitle', config.subtitle);
  setVal('hero-form-description', config.description);
  setVal('hero-form-image-url', config.imageUrl);
  setVal('hero-form-rating', config.rating);
  setVal('hero-form-reviews', config.reviewsText);
  setVal('hero-form-cooktime', config.cookTime);
  setVal('hero-form-cooktime-sub', config.cookTimeSub);
  setVal('hero-form-calories', config.calories);
  setVal('hero-form-calories-sub', config.caloriesSub);
  setVal('hero-form-difficulty', config.difficulty);
  setVal('hero-form-diff-sub', config.difficultySub);
  setVal('hero-form-flavor-initial', config.flavorInitial);
  setVal('hero-form-flavor-base', config.flavorBase);
  setVal('hero-form-flavor-ingredients', config.flavorIngredients);
  setVal('hero-form-pinterest-url', config.pinterestUrl);
  setVal('hero-form-chef-name', config.chefName);
  setVal('hero-form-chef-badge', config.chefBadge);
  setVal('hero-form-series-tag', config.seriesTag);
  setVal('hero-form-chef-sub', config.chefSub);

  const preview = document.getElementById('hero-form-preview');
  if (preview) preview.src = config.imageUrl || 'sri_lankan_crab_curry.jpg';

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeHeroCustomizerModal() {
  const modal = document.getElementById('hero-customizer-modal');
  if (modal) modal.classList.add('hidden');
}

async function setRecipeAsHero(recipeId) {
  const recipe = await TastyDB.getRecipe(recipeId);
  if (!recipe) return;

  const cleanTitle = recipe.title || 'Featured Recipe';
  const config = {
    recipeId: recipe.id,
    title: cleanTitle,
    subtitle: recipe.category ? `Authentic ${recipe.category}` : '',
    description: recipe.description || 'Specially crafted recipe from Tasty Nest test kitchen.',
    rating: recipe.rating ? String(recipe.rating) : '4.9',
    reviewsText: `${recipe.reviewsCount || 120} Verified Reviews`,
    cookTime: `${recipe.cookTime || 30} Mins`,
    cookTimeSub: 'Total Cook Time',
    calories: recipe.nutrition?.calories ? `${recipe.nutrition.calories} kcal` : '450 kcal',
    caloriesSub: 'Nutritious / Serving',
    difficulty: recipe.difficulty || 'Intermediate',
    difficultySub: 'One-Pot Magic',
    imageUrl: recipe.imageUrl || 'sri_lankan_crab_curry.jpg',
    pinterestUrl: `https://www.pinterest.com/pin/create/button/?url=https://www.pinterest.com/tastynest917&media=${encodeURIComponent(recipe.imageUrl || '')}&description=${encodeURIComponent(cleanTitle)}`,
    flavorInitial: cleanTitle.substring(0, 2).toUpperCase(),
    flavorBase: recipe.category || 'Handcrafted Flavor',
    flavorIngredients: `${recipe.ingredients ? recipe.ingredients.length : 8} Ingredients`,
    chefName: recipe.author || 'Tasty Nest Chef',
    chefBadge: 'Verified Chef',
    chefSub: 'Tested in test kitchen',
    seriesTag: 'Heirloom Heritage Series'
  };

  await TastyDB.saveHeroConfig(config);
  await renderHeroSection();
  await renderAdminTable();
  if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  showToast(`Set "${cleanTitle}" as the Homepage Hero Dish!`, "success");
}

// ==========================================
// RECIPES RENDERER (MATCHING SCREENSHOT)
// ==========================================
async function renderRecipes() {
  const grid = document.getElementById('recipes-grid');
  const emptyState = document.getElementById('recipes-empty-state');
  if (!grid) return;

  const recipes = await TastyDB.getAllRecipes({
    category: AppState.activeCategory,
    query: AppState.searchQuery,
    maxTime: AppState.maxTime,
    sort: AppState.sortBy
  });

  // Filter out the hero recipe in normal browse mode so it doesn't duplicate the hero section
  let displayList = recipes;
  if (!AppState.searchQuery && AppState.activeCategory === 'All Popular') {
    const heroCfg = await TastyDB.getHeroConfig();
    displayList = recipes.filter(r => r.id !== heroCfg.recipeId && !r.isHero);
  }

  // Update Category Showcase Banner
  const catBanner = document.getElementById('category-active-banner');
  if (catBanner) {
    if (AppState.activeCategory && AppState.activeCategory !== 'All Popular' && AppState.activeCategory !== 'All') {
      const meta = CATEGORY_META[AppState.activeCategory] || {
        lucideIcon: 'sparkles',
        title: `${AppState.activeCategory} Collection`,
        desc: `Explore our handcrafted collection of ${AppState.activeCategory.toLowerCase()} recipes.`
      };
      const bannerIcon = document.getElementById('cat-banner-icon');
      if (bannerIcon) {
        bannerIcon.innerHTML = `<i data-lucide="${meta.lucideIcon || 'sparkles'}" class="w-6 h-6 text-brand-600"></i>`;
      }
      document.getElementById('cat-banner-title').textContent = meta.title;
      document.getElementById('cat-banner-desc').textContent = meta.desc;
      document.getElementById('cat-banner-count').textContent = `${displayList.length} ${displayList.length === 1 ? 'recipe' : 'recipes'} found`;
      catBanner.classList.remove('hidden');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } else {
      catBanner.classList.add('hidden');
    }
  }

  const viewAllContainer = document.getElementById('recipes-view-all-container');
  const viewAllText = document.getElementById('view-all-text');
  const viewAllIcon = document.getElementById('view-all-icon');

  if (displayList.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    if (viewAllContainer) viewAllContainer.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  // Limit to 9 recipes by default, unless user toggled "View All"
  const totalCount = displayList.length;
  let listToRender = displayList;

  if (!AppState.showAllRecipes && totalCount > AppState.recipesLimit) {
    listToRender = displayList.slice(0, AppState.recipesLimit);
    if (viewAllContainer) {
      viewAllContainer.classList.remove('hidden');
      if (viewAllText) viewAllText.textContent = `View All Recipes (${totalCount})`;
      if (viewAllIcon) viewAllIcon.classList.remove('rotate-180');
    }
  } else if (AppState.showAllRecipes && totalCount > AppState.recipesLimit) {
    listToRender = displayList;
    if (viewAllContainer) {
      viewAllContainer.classList.remove('hidden');
      if (viewAllText) viewAllText.textContent = `Show Less (Showing all ${totalCount})`;
      if (viewAllIcon) viewAllIcon.classList.add('rotate-180');
    }
  } else {
    // 9 or fewer recipes (or specific small category)
    if (viewAllContainer) {
      viewAllContainer.classList.add('hidden');
    }
  }

  // Badge color selector based on tag
  const getBadgeBg = (badge) => {
    return 'bg-[#181513]/75 text-white';
  };

  grid.innerHTML = listToRender.map(recipe => {
    const authorInitials = recipe.author && recipe.author.includes('Dilrukshi') ? 'DP' : 'TN';
    const authorName = recipe.author && recipe.author.includes('Dilrukshi') ? 'Dilrukshi P.' : 'Tasty Nest Team';
    const badgeTopText = recipe.badgeTop || `${recipe.cookTime || 20} Mins`;
    const badgeBottomText = recipe.badgeBottom || `${recipe.nutrition?.calories || 450} kcal`;

    return `
      <article class="recipe-card group bg-white rounded-3xl overflow-hidden border border-[#e8e2d8] shadow-subtle hover:shadow-card flex flex-col cursor-pointer transition-all duration-300" style="display: flex; flex-direction: column; height: 100%;" onclick="navigateTo('detail', '${recipe.id}')">
        
        <!-- Strict Uniform Image & Floating Badges Container (230px Fixed Height) -->
        <div class="recipe-card-img-wrapper" style="height: 230px; min-height: 230px; max-height: 230px; width: 100%; position: relative; overflow: hidden; background-color: #f6f1ea; flex-shrink: 0;">
          <img 
            src="${normalizeImagePath(recipe.imageUrl)}" 
            alt="${recipe.title}" 
            loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80'"
            class="img-zoom w-full h-full object-cover"
            style="height: 230px; width: 100%; object-fit: cover; object-position: center; display: block;"
          >
          
          <!-- Top Left Badge -->
          <div class="absolute top-3 left-3 bg-[#181513]/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-subtle">
            ${badgeTopText}
          </div>

          <!-- Top Right Pinterest Save Button -->
          <a 
            href="https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.origin + window.location.pathname + '#recipe/' + recipe.id)}&media=${encodeURIComponent(recipe.imageUrl)}&description=${encodeURIComponent(recipe.title)}" 
            target="_blank" 
            rel="noopener noreferrer" 
            onclick="event.stopPropagation()"
            class="absolute top-3 right-3 bg-white/90 hover:bg-white text-pinterest px-2.5 py-1 rounded-full text-[10px] font-bold shadow-subtle flex items-center gap-1 transition"
            title="Save to Pinterest"
          >
            <span class="w-3.5 h-3.5 bg-pinterest text-white rounded-full flex items-center justify-center text-[9px] font-black">P</span>
            <span>Save</span>
          </a>

          <!-- Bottom Left Badge on Image -->
          <div class="absolute bottom-3 left-3 flex items-center gap-1.5">
            <div class="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-stone-800 shadow-subtle flex items-center gap-1">
              <span>${badgeBottomText}</span>
            </div>
            ${(recipe.images && recipe.images.length > 1) ? `
              <div class="bg-[#181513]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-subtle flex items-center gap-1" title="${recipe.images.length} Photos in gallery">
                <i data-lucide="camera" class="w-3 h-3 text-amber-400"></i>
                <span>${recipe.images.length}</span>
              </div>
            ` : ''}
          </div>

          <!-- Bookmark Heart Toggle Overlay (Bottom Right) -->
          <button 
            onclick="event.stopPropagation(); handleToggleFavorite('${recipe.id}', this);" 
            class="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-stone-700 hover:text-[#c2410c] flex items-center justify-center shadow-subtle transition"
            title="Bookmark"
          >
            <i data-lucide="bookmark" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Uniform Content Body -->
        <div class="recipe-card-body" style="padding: 1.25rem; flex: 1 1 auto; display: flex; flex-direction: column; justify-content: space-between; gap: 0.75rem;">
          
          <div>
            <!-- Category & Rating Row -->
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="text-[10px] uppercase font-bold tracking-wider text-[#c2410c]">${recipe.category || 'Handcrafted'}</span>
              <div class="flex items-center gap-1 text-xs">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-amber-500 text-amber-500"></i>
                <span class="text-stone-900 font-bold">${recipe.rating || 4.9}</span>
                <span class="text-stone-400 font-medium text-[11px]">(${recipe.reviewsCount >= 1000 ? (recipe.reviewsCount/1000).toFixed(1) + 'k' : (recipe.reviewsCount || 120)})</span>
              </div>
            </div>

            <!-- Title (Strict 2-Line Fixed Height Box) -->
            <h3 class="recipe-card-title group-hover:text-[#c2410c] transition" style="height: 2.8rem; line-height: 1.4rem; font-size: 1.125rem; font-family: 'Newsreader', Georgia, serif; font-weight: 700; color: #181513; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; margin-top: 0.25rem;" title="${recipe.title}">
              ${recipe.title}
            </h3>

            <!-- Description (Strict 2-Line Fixed Height Box) -->
            <p class="recipe-card-desc font-normal" style="height: 2.4rem; line-height: 1.2rem; font-size: 0.8rem; color: #57534e; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; margin-top: 0.35rem;">
              ${recipe.description}
            </p>
          </div>

          <!-- Bottom Footer Details: Author & Cook -->
          <div class="recipe-card-footer" style="margin-top: auto; padding-top: 0.75rem; border-top: 1px solid #e8e2d8; display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem;">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-full ${authorInitials === 'DP' ? 'bg-[#181513] text-[#faf8f5]' : 'bg-[#f4eee6] text-stone-800'} flex items-center justify-center font-bold text-[9px]">
                ${authorInitials}
              </div>
              <span class="text-stone-600 font-medium text-[11px]">By ${authorName}</span>
            </div>
            <span class="font-bold text-[#c2410c] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
              <span>View Recipe</span>
              <span>→</span>
            </span>
          </div>

        </div>

      </article>
    `;
  }).join('');

  lucide.createIcons();
}

// ==========================================
// PINTEREST VIDEO BOARDS CONTROLLER (HOVER LIVE PLAY)
// ==========================================
async function renderPinterestBoards() {
  const container = document.getElementById('pinterest-boards-grid');
  if (!container) return;

  const boards = await TastyDB.getPinterestBoards();

  container.innerHTML = boards.map(board => {
    return `
      <div 
        class="pinterest-video-card group relative rounded-3xl overflow-hidden aspect-[9/16] w-[76vw] sm:w-[320px] lg:w-[calc(25%-18px)] shrink-0 snap-start bg-stone-100 border border-[#eee7de] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer select-none"
        data-board-id="${board.id}"
      >
        <!-- Poster Image (instant load) -->
        <img 
          src="${normalizeImagePath(board.imageUrl)}" 
          alt="${board.title}" 
          class="poster-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        >

        <!-- Live Video Element (plays and fades in on hover) -->
        ${board.videoUrl ? `
          <video 
            class="preview-video absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 pointer-events-none" 
            src="${board.videoUrl}" 
            muted 
            loop 
            playsinline 
            preload="metadata"
          ></video>
        ` : ''}

        <!-- Dark Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-35% to-transparent pointer-events-none"></div>

        <!-- Top Right Live Status Pill -->
        <div class="video-status-badge absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs">
          <span class="w-1.5 h-1.5 rounded-full bg-red-500 live-dot-pulse"></span>
          <span class="badge-text">${board.videoUrl ? 'Hover to Play' : 'Pin Board'}</span>
        </div>

        <!-- Sound Toggle Button -->
        ${board.videoUrl ? `
          <button 
            type="button"
            onclick="event.stopPropagation(); toggleVideoAudio(this);" 
            class="sound-toggle-btn opacity-0 group-hover:opacity-100 absolute top-3.5 left-3.5 bg-black/60 hover:bg-black/90 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs backdrop-blur-md transition-opacity shadow-xs"
            title="Toggle Sound"
          >
            <i data-lucide="volume-x" class="w-3.5 h-3.5"></i>
          </button>
        ` : ''}

        <!-- Bottom Text Info -->
        <div class="absolute bottom-4 left-4 right-4 text-white pointer-events-none space-y-1">
          <p class="text-sm sm:text-base font-bold leading-snug drop-shadow-md text-white tracking-tight">${board.title}</p>
          <div class="flex items-center justify-between text-xs text-white/85 pt-0.5">
            <span class="font-medium">${board.pinsCount || '500+ Pins'}</span>
            <span class="flex items-center gap-1 font-semibold text-white group-hover:text-amber-300 transition-colors">
              <span>Watch Pin</span>
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
            </span>
          </div>
        </div>

      </div>
    `;
  }).join('');

  lucide.createIcons();
  setupPinterestScrollControls();

  // Attach hover play/pause and mobile tap handlers to each card
  const cards = container.querySelectorAll('.pinterest-video-card');
  cards.forEach(card => {
    const video = card.querySelector('video');
    const badge = card.querySelector('.video-status-badge');
    const badgeText = card.querySelector('.badge-text');
    const dot = card.querySelector('.live-dot-pulse');
    const soundBtn = card.querySelector('.sound-toggle-btn');
    const boardId = card.dataset.boardId;
    const currentBoard = boards.find(b => b.id === boardId);

    if (video) {
      card.addEventListener('mouseenter', () => {
        if (video.src) {
          video.play().then(() => {
            video.style.opacity = '1';
            if (badge) {
              badge.classList.remove('bg-black/60');
              badge.classList.add('bg-red-600');
            }
            if (badgeText) badgeText.textContent = '▶ Playing';
            if (dot) dot.style.display = 'none';
            if (soundBtn) soundBtn.classList.remove('opacity-0');
          }).catch(() => {});
        }
      });

      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
        video.style.opacity = '0';
        if (badge) {
          badge.classList.remove('bg-red-600');
          badge.classList.add('bg-black/60');
        }
        if (badgeText) badgeText.textContent = 'Hover to Play';
        if (dot) dot.style.display = 'inline-block';
        if (soundBtn) soundBtn.classList.add('opacity-0');
      });
    }

    // Click / Touch Handler: On mobile tap, plays preview video; second tap opens Pinterest
    card.addEventListener('click', (e) => {
      if (e.target.closest('.sound-toggle-btn')) return;

      if (window.matchMedia('(hover: none)').matches && video && video.paused) {
        e.preventDefault();
        video.play().then(() => {
          video.style.opacity = '1';
          if (badge) {
            badge.classList.remove('bg-black/60');
            badge.classList.add('bg-red-600');
          }
          if (badgeText) badgeText.textContent = '▶ Playing';
          if (dot) dot.style.display = 'none';
          if (soundBtn) soundBtn.classList.remove('opacity-0');
        }).catch(() => {});
        return;
      }

      window.open(currentBoard?.pinUrl || 'https://www.pinterest.com/tastynest917', '_blank');
    });
  });
}

function setupPinterestScrollControls() {
  const leftBtn = document.getElementById('btn-pboard-scroll-left');
  const rightBtn = document.getElementById('btn-pboard-scroll-right');
  const grid = document.getElementById('pinterest-boards-grid');
  if (!grid) return;

  if (leftBtn) {
    leftBtn.onclick = () => {
      const card = grid.querySelector('.pinterest-video-card');
      const amount = card ? (card.offsetWidth + 24) : 320;
      grid.scrollBy({ left: -amount, behavior: 'smooth' });
    };
  }
  if (rightBtn) {
    rightBtn.onclick = () => {
      const card = grid.querySelector('.pinterest-video-card');
      const amount = card ? (card.offsetWidth + 24) : 320;
      grid.scrollBy({ left: amount, behavior: 'smooth' });
    };
  }
}

function toggleVideoAudio(btn) {
  const card = btn.closest('.pinterest-video-card');
  const video = card?.querySelector('video');
  if (video) {
    video.muted = !video.muted;
    btn.innerHTML = video.muted ? '<i data-lucide="volume-x" class="w-3.5 h-3.5"></i>' : '<i data-lucide="volume-2" class="w-3.5 h-3.5"></i>';
    if (window.lucide) lucide.createIcons();
  }
}

// ==========================================
// FAVORITES CONTROLLER
// ==========================================
async function handleToggleFavorite(recipeId, buttonElement) {
  const favorited = await TastyDB.toggleFavorite(recipeId);
  
  if (buttonElement) {
    const icon = buttonElement.querySelector('i');
    if (favorited) {
      buttonElement.classList.add('text-brand-700');
      buttonElement.classList.remove('text-zinc-600');
      if (icon) icon.classList.add('fill-brand-700');
      showToast("Saved to your Bookmarks!", "success");
    } else {
      buttonElement.classList.remove('text-brand-700');
      buttonElement.classList.add('text-zinc-600');
      if (icon) icon.classList.remove('fill-brand-700');
      showToast("Removed from Bookmarks", "info");
    }
  }

  updateFavoritesBadge();

  if (AppState.currentView === 'favorites') {
    renderFavorites();
  }
}

async function updateFavoritesBadge() {
  const badge = document.getElementById('nav-fav-badge');
  if (!badge) return;
  const count = await db.favorites.count();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-block' : 'none';
}

async function renderFavorites() {
  const grid = document.getElementById('favorites-grid');
  const empty = document.getElementById('favorites-empty');
  const favRecipes = await TastyDB.getFavoriteRecipes();

  if (favRecipes.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  grid.innerHTML = favRecipes.map(recipe => {
    return `
      <article class="recipe-card group bg-white rounded-3xl overflow-hidden border border-[#eee7de] shadow-xs flex flex-col cursor-pointer" onclick="navigateTo('detail', '${recipe.id}')">
        <div class="relative aspect-4/3 overflow-hidden bg-stone-100">
          <img src="${normalizeImagePath(recipe.imageUrl)}" alt="${recipe.title}" class="img-zoom w-full h-full object-cover">
          <div class="absolute top-3 left-3 bg-brand-700 text-white px-3 py-1 rounded-full text-[11px] font-bold">
            ${recipe.category}
          </div>
          <button 
            onclick="event.stopPropagation(); handleToggleFavorite('${recipe.id}');" 
            class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-md transition"
            title="Remove from bookmarks"
          >
            <i data-lucide="trash-2" class="w-4 h-4 text-rose-500"></i>
          </button>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h3 class="font-serif font-bold text-lg text-zinc-900 group-hover:text-brand-700 transition leading-snug">
              ${recipe.title}
            </h3>
            <p class="text-xs text-zinc-500 mt-1 line-clamp-2">${recipe.description}</p>
          </div>
          <div class="pt-3 border-t border-[#eee7de] flex items-center justify-between text-xs text-zinc-500">
            <span class="flex items-center gap-1.5"><i data-lucide="clock" class="w-3.5 h-3.5 text-brand-600"></i> ${(recipe.prepTime || 0) + (recipe.cookTime || 0)}m total</span>
            <span class="font-bold text-brand-700 hover:text-brand-800 transition">Open Recipe →</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  lucide.createIcons();
}

// ==========================================
// RECIPE DETAIL CONTROLLER (ALLRECIPES STYLE)
// ==========================================
async function loadRecipeDetail(recipeId) {
  const recipe = await TastyDB.getRecipe(recipeId);
  if (!recipe) {
    showToast("Recipe not found", "error");
    navigateTo('home');
    return;
  }

  AppState.detailRecipe = recipe;
  AppState.originalServings = recipe.servings || 4;
  AppState.scaledServings = recipe.servings || 4;
  AppState.checkedIngredients.clear();
  AppState.completedSteps.clear();

  resetKitchenTimer();

  document.title = `${recipe.title} Recipe | Tasty Nest`;
  document.getElementById('detail-title').textContent = recipe.title;
  document.getElementById('detail-category-badge').textContent = recipe.category;
  document.getElementById('detail-description').textContent = recipe.description;
  document.getElementById('detail-rating').textContent = recipe.rating || 4.9;
  document.getElementById('detail-reviews').textContent = `(${recipe.reviewsCount || 120} reviews)`;
  document.getElementById('detail-author').textContent = recipe.author || 'Tasty Nest Culinary Lab';
  
  // Setup 5-Photo Interactive Gallery Carousel
  const rawImages = ((Array.isArray(recipe.images) && recipe.images.length > 0) ? recipe.images : (recipe.imageUrl ? [recipe.imageUrl] : [])).map(normalizeImagePath);
  AppState.detailGalleryImages = rawImages.slice(0, 5);
  AppState.detailCurrentPhotoIdx = 0;
  renderDetailGallery();

  const videoBtn = document.getElementById('btn-toggle-video');
  const videoContainer = document.getElementById('detail-video-container');
  const videoFrame = document.getElementById('detail-video-frame');
  
  if (recipe.videoUrl && recipe.videoUrl.trim() !== '') {
    videoBtn.classList.remove('hidden');
    videoFrame.src = typeof TastyMedia !== 'undefined' ? TastyMedia.formatVideoEmbedUrl(recipe.videoUrl) : recipe.videoUrl;
  } else {
    videoBtn.classList.add('hidden');
    videoContainer.classList.add('hidden');
    videoFrame.src = '';
  }

  const prep = recipe.prepTime || 0;
  const cook = recipe.cookTime || 0;
  document.getElementById('detail-prep-time').textContent = `${prep} mins`;
  document.getElementById('detail-cook-time').textContent = `${cook} mins`;
  document.getElementById('detail-total-time').textContent = `${prep + cook} mins`;
  document.getElementById('detail-servings-stat').textContent = recipe.servings;
  document.getElementById('detail-calories-stat').textContent = recipe.nutrition?.calories ? `${recipe.nutrition.calories} kcal` : '450 kcal';

  document.getElementById('scaler-current-servings').textContent = AppState.scaledServings;

  if (recipe.nutrition) {
    document.getElementById('nut-cal').textContent = recipe.nutrition.calories || 450;
    document.getElementById('nut-protein').textContent = recipe.nutrition.protein || '25g';
    document.getElementById('nut-carbs').textContent = recipe.nutrition.carbs || '35g';
    document.getElementById('nut-fat').textContent = recipe.nutrition.fat || '20g';
  }

  const favBtn = document.getElementById('btn-detail-favorite');
  const isFav = await TastyDB.isFavorite(recipe.id);
  favBtn.innerHTML = `<i data-lucide="bookmark" class="w-4 h-4 ${isFav ? 'text-brand-700 fill-brand-700' : 'text-zinc-700'}"></i>`;
  favBtn.onclick = async () => {
    await handleToggleFavorite(recipe.id);
    const updatedFav = await TastyDB.isFavorite(recipe.id);
    favBtn.innerHTML = `<i data-lucide="bookmark" class="w-4 h-4 ${updatedFav ? 'text-brand-700 fill-brand-700' : 'text-zinc-700'}"></i>`;
    lucide.createIcons();
  };

  const pinBtn = document.getElementById('btn-detail-pinterest');
  if (pinBtn) {
    const pinUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&media=${encodeURIComponent(recipe.imageUrl)}&description=${encodeURIComponent(recipe.title + " on Tasty Nest")}`;
    pinBtn.href = pinUrl;
  }

  renderScaledIngredients();
  renderInstructions();
  document.getElementById('recipe-completed-banner').classList.add('hidden');

  // Load Public 5-Star Reviews and setup Interactive Star Rating
  setupStarPicker();
  await loadRecipeReviews(recipe.id);

  const scrollReviewBtn = document.getElementById('btn-scroll-to-review-form');
  if (scrollReviewBtn) {
    scrollReviewBtn.onclick = () => {
      document.getElementById('review-form-container')?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('review-author')?.focus();
    };
  }

  lucide.createIcons();
}

function calculateScaledAmount(originalAmountStr, ratio) {
  if (!originalAmountStr || ratio === 1) return originalAmountStr || '';

  return originalAmountStr.replace(/(\d+\s+\d+\/\d+|\d+\/\d+|\d+(\.\d+)?)/g, (match) => {
    let num = 0;
    if (match.includes('/')) {
      if (match.includes(' ')) {
        const parts = match.split(' ');
        const fractionParts = parts[1].split('/');
        num = parseFloat(parts[0]) + (parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]));
      } else {
        const fractionParts = match.split('/');
        num = parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]);
      }
    } else {
      num = parseFloat(match);
    }

    const scaled = num * ratio;
    
    if (Number.isInteger(scaled)) return scaled.toString();
    if (Math.abs(scaled - 0.25) < 0.05) return '1/4';
    if (Math.abs(scaled - 0.33) < 0.05) return '1/3';
    if (Math.abs(scaled - 0.5) < 0.05) return '1/2';
    if (Math.abs(scaled - 0.66) < 0.05) return '2/3';
    if (Math.abs(scaled - 0.75) < 0.05) return '3/4';
    return scaled.toFixed(1).replace(/\.0$/, '');
  });
}

function renderScaledIngredients() {
  const container = document.getElementById('detail-ingredients-list');
  if (!container || !AppState.detailRecipe) return;

  const ingredients = AppState.detailRecipe.ingredients || [];
  const ratio = AppState.scaledServings / AppState.originalServings;

  if (ingredients.length === 0) {
    container.innerHTML = '<li class="text-xs text-stone-400 py-4 text-center">No ingredients specified.</li>';
    return;
  }

  container.innerHTML = ingredients.map((ing, idx) => {
    const isChecked = AppState.checkedIngredients.has(idx);
    const scaledAmount = calculateScaledAmount(ing.amount, ratio);

    return `
      <li 
        class="ingredient-item flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${isChecked ? 'bg-[#faf8f5] border-transparent text-stone-400 line-through' : 'bg-white border-[#f0ebe3] hover:border-[#d8cfc2] hover:bg-[#faf8f5] text-stone-800'}"
        onclick="toggleIngredientCheck(${idx})"
      >
        <div class="w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${isChecked ? 'bg-[#c2410c] border-[#c2410c] text-white shadow-2xs' : 'border-[#d8cfc2] bg-[#faf8f5]'}" title="${isChecked ? 'Checked' : 'Check off'}">
          ${isChecked ? '<i data-lucide="check" class="w-3.5 h-3.5 stroke-[2.5]"></i>' : ''}
        </div>
        <div class="flex-1 text-xs sm:text-sm font-medium leading-snug">
          ${scaledAmount ? `<strong class="font-bold text-stone-900 ${isChecked ? 'line-through text-stone-400' : ''}">${scaledAmount}</strong> ` : ''}
          <span class="${isChecked ? 'text-stone-400 line-through' : 'text-stone-700'}">${ing.name}</span>
        </div>
      </li>
    `;
  }).join('');

  lucide.createIcons();
}

function toggleIngredientCheck(idx) {
  if (AppState.checkedIngredients.has(idx)) {
    AppState.checkedIngredients.delete(idx);
  } else {
    AppState.checkedIngredients.add(idx);
  }
  renderScaledIngredients();
}

function renderInstructions() {
  const container = document.getElementById('detail-instructions-list');
  const progressBar = document.getElementById('steps-progress-bar');
  const progressText = document.getElementById('steps-progress-text');
  if (!container || !AppState.detailRecipe) return;

  const instructions = AppState.detailRecipe.instructions || [];
  const totalSteps = instructions.length;
  const completedCount = AppState.completedSteps.size;

  if (progressText) progressText.textContent = `${completedCount} of ${totalSteps} completed`;
  if (progressBar) progressBar.style.width = totalSteps > 0 ? `${(completedCount / totalSteps) * 100}%` : '0%';

  const completedBanner = document.getElementById('recipe-completed-banner');
  if (totalSteps > 0 && completedCount === totalSteps) {
    if (completedBanner) completedBanner.classList.remove('hidden');
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  } else {
    if (completedBanner) completedBanner.classList.add('hidden');
  }

  if (instructions.length === 0) {
    container.innerHTML = '<p class="text-xs text-stone-400 py-6 text-center">No step-by-step instructions provided for this dish.</p>';
    return;
  }

  container.innerHTML = instructions.map((step, idx) => {
    const isDone = AppState.completedSteps.has(idx);
    const stepNum = step.stepNumber || (idx + 1);
    const stepNumFormatted = String(stepNum).padStart(2, '0');

    return `
      <div 
        class="instruction-card group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${isDone ? 'is-completed bg-[#faf9f7] border-emerald-300/80 shadow-none' : 'bg-white border-[#e8e2d8] hover:border-stone-400 hover:shadow-card'}"
        onclick="toggleStepCompletion(${idx})"
      >
        <div class="flex items-start gap-3.5 sm:gap-4">
          <!-- Step Number / Status Badge -->
          <div class="instruction-badge w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all duration-200 ${isDone ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-600/20' : 'bg-[#faf8f5] border border-[#e8e2d8] text-stone-800 group-hover:border-[#c2410c] group-hover:text-[#c2410c] group-hover:bg-[#fff7ed]'}" title="${isDone ? 'Completed' : 'Click to mark as done'}">
            ${isDone ? '<i data-lucide="check" class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]"></i>' : `<span class="font-serif">${stepNumFormatted}</span>`}
          </div>

          <!-- Step Details -->
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-extrabold uppercase tracking-widest ${isDone ? 'text-emerald-700' : 'text-stone-400 group-hover:text-[#c2410c]'} transition-colors">
                Step ${stepNum}
              </span>

              <!-- Status Action Pill -->
              <div class="flex items-center gap-1.5 transition-all">
                ${isDone 
                  ? '<span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200"><i data-lucide="check" class="w-3 h-3 stroke-[2.5]"></i><span>Done</span></span>' 
                  : '<span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-400 group-hover:text-[#c2410c] transition-colors"><span class="w-2 h-2 rounded-full border border-stone-300 group-hover:border-[#c2410c] group-hover:bg-[#c2410c] transition-all"></span><span class="hidden sm:inline">Mark done</span></span>'
                }
              </div>
            </div>

            <!-- Step Instruction Text -->
            <p class="text-sm sm:text-[15px] leading-relaxed transition-colors ${isDone ? 'text-stone-400 line-through' : 'text-stone-800 font-normal'}">
              ${step.description}
            </p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function toggleStepCompletion(idx) {
  if (AppState.completedSteps.has(idx)) {
    AppState.completedSteps.delete(idx);
  } else {
    AppState.completedSteps.add(idx);
  }
  renderInstructions();
}

// ==========================================
// KITCHEN TIMER CONTROLLER
// ==========================================
function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  if (!display) return;
  const mins = Math.floor(AppState.timerSeconds / 60);
  const secs = AppState.timerSeconds % 60;
  display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleKitchenTimer() {
  const btn = document.getElementById('btn-timer-toggle');
  const container = document.querySelector('.timer-container');

  if (AppState.timerRunning) {
    clearInterval(AppState.timerInterval);
    AppState.timerRunning = false;
    btn.textContent = 'Resume';
    btn.classList.replace('bg-amber-600', 'bg-brand-700');
    container?.classList.remove('timer-running');
  } else {
    if (AppState.timerSeconds <= 0) {
      AppState.timerSeconds = 300;
    }
    AppState.timerRunning = true;
    btn.textContent = 'Pause';
    btn.classList.replace('bg-brand-700', 'bg-amber-600');
    container?.classList.add('timer-running');

    AppState.timerInterval = setInterval(() => {
      if (AppState.timerSeconds > 0) {
        AppState.timerSeconds--;
        updateTimerDisplay();
      } else {
        clearInterval(AppState.timerInterval);
        AppState.timerRunning = false;
        btn.textContent = 'Start';
        container?.classList.remove('timer-running');
        playTimerChime();
        showToast("⏰ Kitchen Timer Finished! Time to check the stove!", "brand");
      }
    }, 1000);
  }
}

function resetKitchenTimer() {
  clearInterval(AppState.timerInterval);
  AppState.timerRunning = false;
  AppState.timerSeconds = 0;
  updateTimerDisplay();
  const btn = document.getElementById('btn-timer-toggle');
  if (btn) btn.textContent = 'Start';
  document.querySelector('.timer-container')?.classList.remove('timer-running');
}

// ==========================================
// ADMIN PORTAL CONTROLLER (/admin)
// ==========================================
function setupAdminView() {
  const loginScreen = document.getElementById('admin-login-screen');
  const dashScreen = document.getElementById('admin-dashboard-screen');
  const displayElem = document.getElementById('admin-user-display');

  if (AppState.adminSession) {
    loginScreen.classList.add('hidden');
    dashScreen.classList.remove('hidden');
    if (displayElem) {
      displayElem.textContent = "Administrator";
    }
    renderAdminTable();
  } else {
    loginScreen.classList.remove('hidden');
    dashScreen.classList.add('hidden');
    const userInp = document.getElementById('admin-input-username');
    const passInp = document.getElementById('admin-input-password');
    if (userInp) userInp.value = '';
    if (passInp) passInp.value = '';
  }
}

async function renderAdminTable() {
  const tbody = document.getElementById('admin-recipes-tbody');
  const countDisplay = document.getElementById('admin-table-count');
  const headingDisplay = document.getElementById('admin-table-heading');
  const catUploadLabel = document.getElementById('admin-cat-upload-label');
  const allRecipes = await TastyDB.getAllRecipes();

  // Calculate live counts per category
  const countQuick = allRecipes.filter(r => matchesCategory(r.category, 'Quick Dinners')).length;
  const countDesserts = allRecipes.filter(r => matchesCategory(r.category, 'Desserts')).length;
  const countHealthy = allRecipes.filter(r => matchesCategory(r.category, 'Healthy Eats')).length;
  const countSriLankan = allRecipes.filter(r => matchesCategory(r.category, 'Sri Lankan & Asian')).length;
  const countDrinks = allRecipes.filter(r => matchesCategory(r.category, 'Drinks')).length;

  const setElText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setElText('admin-cat-count-all', allRecipes.length);
  setElText('admin-cat-count-quick', countQuick);
  setElText('admin-cat-count-desserts', countDesserts);
  setElText('admin-cat-count-healthy', countHealthy);
  setElText('admin-cat-count-srilankan', countSriLankan);
  setElText('admin-cat-count-drinks', countDrinks);
  setElText('kpi-recipes-count', allRecipes.length);

  const activeCat = AppState.adminCategoryFilter || 'All';

  // Filter recipes for table based on selected category tab
  let recipes = activeCat === 'All' 
    ? allRecipes 
    : allRecipes.filter(r => matchesCategory(r.category, activeCat));

  // Live search in admin table
  const searchVal = document.getElementById('admin-recipes-search')?.value?.trim().toLowerCase() || '';
  if (searchVal) {
    recipes = recipes.filter(r => 
      (r.title && r.title.toLowerCase().includes(searchVal)) || 
      (r.id && r.id.toLowerCase().includes(searchVal)) ||
      (r.category && r.category.toLowerCase().includes(searchVal))
    );
  }

  if (countDisplay) {
    countDisplay.textContent = activeCat === 'All' 
      ? `${allRecipes.length} total recipes` 
      : `${recipes.length} recipes in ${activeCat}`;
  }

  if (headingDisplay) {
    headingDisplay.textContent = activeCat === 'All' 
      ? 'All Published Recipes' 
      : `${activeCat} Collection`;
  }

  if (catUploadLabel) {
    catUploadLabel.textContent = activeCat === 'All' 
      ? '+ Upload New Recipe' 
      : `+ Upload to ${activeCat}`;
  }

  if (!tbody) return;

  if (recipes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-stone-400">
          <p class="font-serif text-base font-bold text-stone-700">No recipes found${searchVal ? ` matching "${searchVal}"` : ` in ${activeCat}`}</p>
          <p class="text-xs text-stone-400 mt-1">Click '+ Upload New Recipe' above to publish a dish!</p>
        </td>
      </tr>
    `;
    return;
  }

  const currentHero = await TastyDB.getHeroConfig();

  tbody.innerHTML = recipes.map(r => {
    const totalTime = (r.prepTime || 0) + (r.cookTime || 0);
    const isHero = r.id === currentHero.recipeId;
    return `
      <tr class="hover:bg-[#faf8f5] transition admin-table-row">
        <td class="px-5 py-3.5 flex items-center gap-3">
          <img src="${normalizeImagePath(r.imageUrl)}" alt="${r.title}" class="w-11 h-11 rounded-xl object-cover border border-[#e8e2d8] shadow-subtle shrink-0">
          <div class="min-w-0">
            <h4 class="font-bold text-stone-900 truncate text-xs sm:text-sm" title="${r.title}">${r.title}</h4>
            <span class="text-[10px] text-stone-400 font-mono">ID: ${r.id}</span>
          </div>
        </td>
        <td class="px-5 py-3.5">
          <span class="bg-[#faf8f5] border border-[#e8e2d8] text-stone-800 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">${r.category}</span>
        </td>
        <td class="px-5 py-3.5 text-xs text-stone-600 whitespace-nowrap">
          <i data-lucide="clock" class="w-3.5 h-3.5 inline mr-1 text-stone-400"></i>${totalTime}m
        </td>
        <td class="px-5 py-3.5 text-xs font-bold text-stone-700 whitespace-nowrap">
          ${r.servings} Servings
        </td>
        <td class="px-5 py-3.5 text-xs text-stone-500 whitespace-nowrap">
          ${r.author || 'Tasty Nest'}
        </td>
        <td class="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
          ${isHero 
            ? `<span class="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 rounded-lg inline-flex items-center gap-1 shadow-subtle"><i data-lucide="star" class="w-3 h-3 fill-amber-500 text-amber-500"></i> Hero</span>`
            : `<button onclick="setRecipeAsHero('${r.id}')" class="px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-50 border border-amber-200 rounded-lg cursor-pointer transition shadow-subtle" title="Set as Homepage Hero Dish">Set Hero</button>`
          }
          <button onclick="navigateTo('detail', '${r.id}')" class="px-2.5 py-1 text-[11px] font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-[#e8e2d8] rounded-lg transition" title="Preview Dish">
            View
          </button>
          <button onclick="openRecipeEditor('${r.id}')" class="px-2.5 py-1 text-[11px] font-bold text-[#c2410c] hover:bg-orange-50 border border-orange-200 rounded-lg transition" title="Edit Recipe">
            Edit
          </button>
          <button onclick="handleDeleteRecipe('${r.id}')" class="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition" title="Delete Recipe">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');

  await updateAdminBadges();
  lucide.createIcons();
}

async function handleDeleteRecipe(id) {
  if (confirm("Are you sure you want to delete this recipe?")) {
    await TastyDB.deleteRecipe(id);
    showToast("Recipe deleted successfully", "info");
    renderAdminTable();
    renderRecipes();
  }
}

async function openRecipeEditor(recipeId = null, preselectedCategory = null) {
  if (!AppState.adminSession) {
    showToast("Admin access required to create or edit recipes.", "error");
    navigateTo('admin');
    return;
  }

  const modal = document.getElementById('recipe-modal');
  const modalTitle = document.getElementById('modal-form-title');
  const form = document.getElementById('recipe-editor-form');
  
  form.reset();
  if (document.getElementById('form-video-url')) {
    document.getElementById('form-video-url').value = '';
  }
  document.getElementById('form-ingredients-rows').innerHTML = '';
  document.getElementById('form-instructions-rows').innerHTML = '';

  if (recipeId) {
    modalTitle.textContent = "Edit Recipe";
    const recipe = await TastyDB.getRecipe(recipeId);
    if (!recipe) return;

    document.getElementById('form-recipe-id').value = recipe.id;
    document.getElementById('form-title').value = recipe.title;

    // Match select dropdown value
    const catSelect = document.getElementById('form-category');
    let matched = false;
    for (let opt of catSelect.options) {
      if (matchesCategory(opt.value, recipe.category)) {
        catSelect.value = opt.value;
        matched = true;
        break;
      }
    }
    if (!matched) catSelect.value = recipe.category;

    document.getElementById('form-author').value = recipe.author || '';
    document.getElementById('form-description').value = recipe.description;
    document.getElementById('form-prep-time').value = recipe.prepTime;
    document.getElementById('form-cook-time').value = recipe.cookTime;
    document.getElementById('form-servings').value = recipe.servings;
    document.getElementById('form-image-url').value = recipe.imageUrl || '';
    if (document.getElementById('form-video-url')) {
      document.getElementById('form-video-url').value = recipe.videoUrl || '';
    }

    if (recipe.nutrition) {
      document.getElementById('form-nut-cal').value = recipe.nutrition.calories;
      document.getElementById('form-nut-protein').value = recipe.nutrition.protein;
      document.getElementById('form-nut-carbs').value = recipe.nutrition.carbs;
      document.getElementById('form-nut-fat').value = recipe.nutrition.fat;
    }

    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach(ing => addIngredientRow(ing.amount, ing.name));
    } else {
      addIngredientRow();
    }

    if (recipe.instructions && recipe.instructions.length > 0) {
      recipe.instructions.forEach(inst => addInstructionRow(inst.description));
    } else {
      addInstructionRow();
    }

    // Set existing multi-photos
    const images = (Array.isArray(recipe.images) && recipe.images.length > 0)
      ? [...recipe.images].slice(0, 5)
      : (recipe.imageUrl ? [recipe.imageUrl] : []);
    AppState.editingGalleryImages = images;

  } else {
    const targetCat = preselectedCategory || (AppState.adminCategoryFilter !== 'All' ? AppState.adminCategoryFilter : 'Quick Dinners');
    modalTitle.textContent = targetCat !== 'All' ? `Upload New Recipe to ${targetCat}` : "Create New Recipe";
    document.getElementById('form-recipe-id').value = '';
    
    const catSelect = document.getElementById('form-category');
    for (let opt of catSelect.options) {
      if (matchesCategory(opt.value, targetCat)) {
        catSelect.value = opt.value;
        break;
      }
    }

    addIngredientRow();
    addIngredientRow();
    addInstructionRow();
    addInstructionRow();

    // Reset multi-photos for new recipe
    AppState.editingGalleryImages = [];
  }

  renderGallerySlots();
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function addIngredientRow(amount = '', name = '') {
  const container = document.getElementById('form-ingredients-rows');
  const row = document.createElement('div');
  row.className = 'ingredient-row flex items-center gap-2';
  row.innerHTML = `
    <input type="text" placeholder="Amount (e.g., 2 tbsp)" value="${amount}" class="row-amount w-1/3 px-3 py-1.5 bg-white border border-[#eee7de] rounded-xl text-xs">
    <input type="text" placeholder="Ingredient name (e.g., Black Peppercorns)" value="${name}" class="row-name flex-1 px-3 py-1.5 bg-white border border-[#eee7de] rounded-xl text-xs">
    <button type="button" onclick="this.parentElement.remove()" class="p-1 text-zinc-400 hover:text-rose-500 rounded-lg transition" title="Remove">
      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
    </button>
  `;
  container.appendChild(row);
  lucide.createIcons();
}

function addInstructionRow(desc = '') {
  const container = document.getElementById('form-instructions-rows');
  const count = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'instruction-row flex items-start gap-2';
  row.innerHTML = `
    <span class="w-5 h-5 rounded-full bg-orange-100 text-brand-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-1.5">${count}</span>
    <textarea rows="2" placeholder="Describe this cooking step..." class="row-desc flex-1 px-3 py-1.5 bg-white border border-[#eee7de] rounded-xl text-xs">${desc}</textarea>
    <button type="button" onclick="this.parentElement.remove()" class="p-1 text-zinc-400 hover:text-rose-500 rounded-lg transition mt-1" title="Remove">
      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
    </button>
  `;
  container.appendChild(row);
  lucide.createIcons();
}

// ==========================================
// EVENT LISTENERS & INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Ensure DB is seeded and ready
  await TastyDB.init();

  // Initial Hero & Pinterest Boards Render
  await renderHeroSection();
  await renderPinterestBoards();

  // Hash Routing
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  // Navigation & Secret Admin Entry
  document.getElementById('nav-btn-favorites')?.addEventListener('click', () => navigateTo('favorites'));
  document.getElementById('btn-back-to-recipes')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-fav-back-home')?.addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-fav-explore-now')?.addEventListener('click', () => navigateTo('home'));

  // ADMIN ACCESS AT THE BOTTOM: Discreet lock icon or footer copyright
  document.getElementById('btn-footer-secret-admin')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast("Admin Portal opened", "brand");
  });

  document.getElementById('secret-admin-footer')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast("Admin Portal opened", "brand");
  });

  // Admin Hero Customizer Trigger
  document.getElementById('btn-admin-customize-hero')?.addEventListener('click', openHeroCustomizerModal);
  document.getElementById('btn-close-hero-modal')?.addEventListener('click', closeHeroCustomizerModal);
  document.getElementById('btn-hero-cancel')?.addEventListener('click', closeHeroCustomizerModal);

  // Quick Auto-fill button in Hero Customizer
  document.getElementById('btn-hero-autofill')?.addEventListener('click', async () => {
    const selId = document.getElementById('hero-form-select-recipe')?.value;
    if (!selId) {
      showToast("Please choose a recipe from the dropdown first", "info");
      return;
    }
    const r = await TastyDB.getRecipe(selId);
    if (!r) return;

    document.getElementById('hero-form-target-recipe-id').value = r.id;
    document.getElementById('hero-form-title').value = r.title;
    document.getElementById('hero-form-subtitle').value = r.category ? `Authentic ${r.category}` : '';
    document.getElementById('hero-form-description').value = r.description || '';
    document.getElementById('hero-form-image-url').value = r.imageUrl || '';
    const prev = document.getElementById('hero-form-preview');
    if (prev) prev.src = r.imageUrl || '';
    document.getElementById('hero-form-cooktime').value = `${r.cookTime || 30} Mins`;
    document.getElementById('hero-form-calories').value = r.nutrition?.calories ? `${r.nutrition.calories} kcal` : '450 kcal';
    document.getElementById('hero-form-chef-name').value = r.author || 'Tasty Nest Culinary Lab';
    document.getElementById('hero-form-flavor-initial').value = (r.title || 'TN').substring(0, 2).toUpperCase();
    document.getElementById('hero-form-flavor-base').value = r.category || 'Key Flavor Base';
    document.getElementById('hero-form-flavor-ingredients').value = `${r.ingredients ? r.ingredients.length : 8} Ingredients`;
    document.getElementById('hero-form-pinterest-url').value = `https://www.pinterest.com/pin/create/button/?url=https://www.pinterest.com/tastynest917&media=${encodeURIComponent(r.imageUrl || '')}&description=${encodeURIComponent(r.title)}`;
    showToast(`Auto-filled hero dish details from "${r.title}"!`, "success");
  });

  // Hero Image URL live preview
  document.getElementById('hero-form-image-url')?.addEventListener('input', (e) => {
    const prev = document.getElementById('hero-form-preview');
    if (prev && e.target.value.trim()) {
      prev.src = e.target.value.trim();
    }
  });

  // Hero File Upload (compression & preview)
  document.getElementById('hero-form-file-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const statusEl = document.getElementById('hero-form-upload-status');
    if (statusEl) statusEl.textContent = "Compressing photo under 1MB...";

    try {
      const compressed = await TastyMedia.compressImageUnder1MB(file);
      document.getElementById('hero-form-image-url').value = compressed.base64;
      const prev = document.getElementById('hero-form-preview');
      if (prev) prev.src = compressed.base64;
      if (statusEl) statusEl.textContent = `Optimized (${compressed.savings} smaller)`;
      showToast("Hero photo compressed and loaded!", "success");
    } catch (err) {
      console.error(err);
      if (statusEl) statusEl.textContent = "Compression failed";
      showToast("Could not process image file", "error");
    }
  });

  // Hero Form Submit (Save changes)
  document.getElementById('hero-customizer-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const getVal = id => document.getElementById(id)?.value?.trim() || '';

    const newConfig = {
      recipeId: getVal('hero-form-target-recipe-id') || 'rec-crab-curry',
      title: getVal('hero-form-title') || 'Featured Recipe',
      subtitle: getVal('hero-form-subtitle'),
      description: getVal('hero-form-description'),
      imageUrl: getVal('hero-form-image-url') || 'sri_lankan_crab_curry.jpg',
      rating: getVal('hero-form-rating') || '4.9',
      reviewsText: getVal('hero-form-reviews') || '428 Verified Reviews',
      cookTime: getVal('hero-form-cooktime') || '35 Mins',
      cookTimeSub: getVal('hero-form-cooktime-sub') || 'Total Cook Time',
      calories: getVal('hero-form-calories') || '450 kcal',
      caloriesSub: getVal('hero-form-calories-sub') || 'Nutritious / Serving',
      difficulty: getVal('hero-form-difficulty') || 'Intermediate',
      difficultySub: getVal('hero-form-diff-sub') || 'One-Pot Magic',
      flavorInitial: getVal('hero-form-flavor-initial') || 'TL',
      flavorBase: getVal('hero-form-flavor-base') || 'Key Flavor Base',
      flavorIngredients: getVal('hero-form-flavor-ingredients') || '9 Ingredients',
      pinterestUrl: getVal('hero-form-pinterest-url'),
      chefName: getVal('hero-form-chef-name') || 'Dilrukshi P.',
      chefBadge: getVal('hero-form-chef-badge') || 'Verified Chef',
      seriesTag: getVal('hero-form-series-tag') || 'Heirloom Heritage Series',
      chefSub: getVal('hero-form-chef-sub') || 'Tested in test kitchen'
    };

    await TastyDB.saveHeroConfig(newConfig);
    await renderHeroSection();
    await renderAdminTable();
    closeHeroCustomizerModal();

    if (typeof confetti === 'function') confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    showToast("Homepage Hero Dish updated successfully!", "success");
  });

  // Hero Reset Button
  document.getElementById('btn-hero-reset-default')?.addEventListener('click', async () => {
    if (confirm("Reset Homepage Hero Dish back to default Sri Lankan Crab Curry?")) {
      await TastyDB.resetHeroConfig();
      await renderHeroSection();
      await openHeroCustomizerModal();
      await renderAdminTable();
      showToast("Reset Hero Dish to default settings", "info");
    }
  });

  // Hero Share button
  document.getElementById('btn-hero-share')?.addEventListener('click', async () => {
    const heroCfg = await TastyDB.getHeroConfig();
    const shareTitle = `${heroCfg.title} | Tasty Nest`;
    const shareUrl = window.location.origin + window.location.pathname + `#recipe/${heroCfg.recipeId || 'rec-crab-curry'}`;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast(`Link to ${heroCfg.title} copied!`, "success");
    }
  });

  // Search Inputs
  const handleSearch = (val) => {
    AppState.searchQuery = val;
    renderRecipes();
  };

  const navSearch = document.getElementById('nav-search-input');
  const mobileSearch = document.getElementById('mobile-search-input');
  const clearBtn = document.getElementById('nav-search-clear');

  navSearch?.addEventListener('input', (e) => {
    handleSearch(e.target.value);
    if (clearBtn) clearBtn.classList.toggle('hidden', !e.target.value);
  });
  clearBtn?.addEventListener('click', () => {
    navSearch.value = '';
    clearBtn.classList.add('hidden');
    handleSearch('');
  });

  mobileSearch?.addEventListener('input', (e) => handleSearch(e.target.value));

  // Category Pills
  const catPills = document.querySelectorAll('.cat-pill');
  const headerLinks = document.querySelectorAll('.header-cat-link');

  const activateCategory = (cat) => {
    AppState.activeCategory = cat;
    AppState.showAllRecipes = false;

    // Update Cat Pills active state
    catPills.forEach(p => {
      if (matchesCategory(p.dataset.category, cat)) {
        p.classList.add('bg-brand-700', 'text-white', 'shadow-2xs');
        p.classList.remove('bg-white', 'text-zinc-700');
      } else {
        p.classList.remove('bg-brand-700', 'text-white', 'shadow-2xs');
        p.classList.add('bg-white', 'text-zinc-700');
      }
    });

    // Update Header links active state
    headerLinks.forEach(link => {
      if (matchesCategory(link.dataset.category, cat)) {
        link.classList.add('text-brand-600', 'font-bold');
      } else {
        link.classList.remove('text-brand-600', 'font-bold');
      }
    });

    // Update Explore by Craving Cards active state
    const cravingCards = document.querySelectorAll('.craving-card');
    cravingCards.forEach(card => {
      const isSelected = matchesCategory(card.dataset.category, cat);
      const badge = card.querySelector('.craving-active-badge');
      if (isSelected) {
        card.classList.add('active', 'border-brand-500', 'bg-brand-50/40');
        card.classList.remove('border-stone-200');
        if (badge) badge.classList.remove('hidden');
      } else {
        card.classList.remove('active', 'border-brand-500', 'bg-brand-50/40');
        card.classList.add('border-stone-200');
        if (badge) badge.classList.add('hidden');
      }
    });

    renderRecipes();
  };

  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      activateCategory(pill.dataset.category);
    });
  });

  // Explore by Craving uniform cards click handlers
  document.querySelectorAll('.craving-card').forEach(card => {
    card.addEventListener('click', () => {
      activateCategory(card.dataset.category);
      const target = document.getElementById('recipes-grid');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Header quick links
  headerLinks.forEach(link => {
    link.addEventListener('click', () => {
      const cat = link.dataset.category;
      navigateTo('home');
      activateCategory(cat);
      // Smooth scroll to category banner or grid
      const target = document.getElementById('category-active-banner') || document.getElementById('recipes-grid');
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // Category Active Banner Reset Button
  document.getElementById('cat-banner-reset-btn')?.addEventListener('click', () => {
    activateCategory('All Popular');
  });

  // Reset Filters Refresh button
  document.getElementById('btn-refresh-filters')?.addEventListener('click', () => {
    AppState.activeCategory = 'All Popular';
    AppState.searchQuery = '';
    if (navSearch) navSearch.value = '';
    catPills[0]?.click();
  });

  document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
    AppState.activeCategory = 'All Popular';
    AppState.searchQuery = '';
    if (navSearch) navSearch.value = '';
    catPills[0]?.click();
  });

  // Navbar Filter Button - Smooth scroll to Craving & Filter Bar
  document.getElementById('nav-filter-btn')?.addEventListener('click', () => {
    navigateTo('home');
    const catSection = document.getElementById('category-pills');
    if (catSection) {
      catSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      catSection.classList.add('ring-2', 'ring-brand-600', 'ring-offset-2');
      setTimeout(() => {
        catSection.classList.remove('ring-2', 'ring-brand-600', 'ring-offset-2');
      }, 1500);
    }
  });

  // "Browse all 20 collections →" button
  document.getElementById('btn-browse-collections')?.addEventListener('click', () => {
    AppState.activeCategory = 'All Popular';
    AppState.searchQuery = '';
    if (navSearch) navSearch.value = '';
    catPills[0]?.click();
    document.getElementById('recipes-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Trending Sort tabs (Most Pinned, Quick & Easy, Top Rated)
  const sortTabs = document.querySelectorAll('.sort-tab-btn');
  sortTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      sortTabs.forEach(b => {
        b.classList.remove('bg-brand-700', 'text-white');
        b.classList.add('text-zinc-600');
      });
      btn.classList.add('bg-brand-700', 'text-white');
      btn.classList.remove('text-zinc-600');

      AppState.sortBy = btn.dataset.sort;
      renderRecipes();
    });
  });

  // View All Recipes Toggle Button (Limits to 9 by default)
  document.getElementById('btn-view-all-recipes')?.addEventListener('click', () => {
    AppState.showAllRecipes = !AppState.showAllRecipes;
    renderRecipes();
    if (!AppState.showAllRecipes) {
      document.getElementById('recipes-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Serving Scaler
  document.getElementById('btn-scale-up')?.addEventListener('click', () => {
    if (AppState.scaledServings < 24) {
      AppState.scaledServings += 1;
      document.getElementById('scaler-current-servings').textContent = AppState.scaledServings;
      renderScaledIngredients();
    }
  });
  document.getElementById('btn-scale-down')?.addEventListener('click', () => {
    if (AppState.scaledServings > 1) {
      AppState.scaledServings -= 1;
      document.getElementById('scaler-current-servings').textContent = AppState.scaledServings;
      renderScaledIngredients();
    }
  });

  // Clear Ingredients Checkbox
  document.getElementById('btn-clear-ingredients-check')?.addEventListener('click', () => {
    AppState.checkedIngredients.clear();
    renderScaledIngredients();
  });

  // Reset Completed Steps
  document.getElementById('btn-reset-steps')?.addEventListener('click', () => {
    AppState.completedSteps.clear();
    renderInstructions();
  });

  // Video Toggle in Recipe Detail
  document.getElementById('btn-toggle-video')?.addEventListener('click', () => {
    const container = document.getElementById('detail-video-container');
    const text = document.getElementById('video-btn-text');
    if (container.classList.contains('hidden')) {
      container.classList.remove('hidden');
      text.textContent = 'Hide Video';
    } else {
      container.classList.add('hidden');
      text.textContent = 'Watch Video Tutorial';
    }
  });

  // Print Recipe Button
  document.getElementById('btn-detail-print')?.addEventListener('click', () => {
    window.print();
  });

  // Share Recipe Button
  document.getElementById('btn-detail-share')?.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: `Check out this delicious recipe on Tasty Nest: ${AppState.detailRecipe?.title}`,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Recipe link copied to clipboard!", "success");
    }
  });

  // Kitchen Timer Buttons
  document.getElementById('btn-timer-toggle')?.addEventListener('click', toggleKitchenTimer);
  document.getElementById('btn-timer-reset')?.addEventListener('click', resetKitchenTimer);
  document.querySelectorAll('.quick-timer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sec = parseInt(btn.dataset.seconds) || 300;
      AppState.timerSeconds += sec;
      updateTimerDisplay();
    });
  });

  // Newsletter Form Submit with Dexie persistence & celebratory confetti
  document.getElementById('newsletter-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) return;

    try {
      await TastyDB.saveSubscriber(email, "7-Day Recipe Book Claim");
      showToast(`7-Day Recipe Book claimed! Download sent to ${email}`, "success");
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
      e.target.reset();
      await updateAdminBadges();
    } catch (err) {
      showToast(err.message || "Could not save subscriber", "error");
    }
  });

  // Admin Login Form (Supports Username 'Supun@admin' and Password '1999$#@')
  document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = (document.getElementById('admin-input-username')?.value || '').trim();
    const pass = (document.getElementById('admin-input-password')?.value || '').trim();

    const authUser = await TastyDB.authenticateUser(userInput, pass);
    if (authUser) {
      AppState.adminSession = 'session_' + Date.now();
      localStorage.setItem('tastynest_admin_token', AppState.adminSession);
      const displayElem = document.getElementById('admin-user-display');
      if (displayElem) displayElem.textContent = "Administrator";
      showToast("Welcome back, Administrator!", "success");
      setupAdminView();
    } else {
      showToast("Invalid username or password. Please try again.", "error");
    }
  });

  // Show / Hide Password Toggle
  document.getElementById('btn-toggle-password-visibility')?.addEventListener('click', () => {
    const passInp = document.getElementById('admin-input-password');
    const eyeBtn = document.getElementById('btn-toggle-password-visibility');
    if (passInp) {
      const isPass = passInp.type === 'password';
      passInp.type = isPass ? 'text' : 'password';
      eyeBtn.innerHTML = isPass ? '<i data-lucide="eye-off" class="w-4 h-4"></i>' : '<i data-lucide="eye" class="w-4 h-4"></i>';
      lucide.createIcons();
    }
  });

  // Admin Logout
  document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
    AppState.adminSession = null;
    localStorage.removeItem('tastynest_admin_token');
    showToast("Logged out of Admin Portal", "info");
    setupAdminView();
  });

  // Admin Reset DB
  document.getElementById('btn-admin-reset-db')?.addEventListener('click', async () => {
    if (confirm("Reset all recipes and data to default initial seed?")) {
      await TastyDB.seed();
      showToast("Database successfully restored to defaults!", "success");
      renderAdminTable();
      renderRecipes();
    }
  });

  // Admin Export JSON
  document.getElementById('btn-admin-export-json')?.addEventListener('click', async () => {
    const jsonStr = await TastyDB.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasty-nest-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Database backup exported to JSON file", "success");
  });

  // Admin Category Tabs Filter
  const adminCatTabs = document.querySelectorAll('.admin-cat-tab');
  adminCatTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminCatTabs.forEach(t => {
        t.classList.remove('bg-[#181513]', 'text-white', 'shadow-subtle', 'bg-brand-700', 'shadow-2xs');
        t.classList.add('bg-stone-100', 'text-stone-700');
      });
      tab.classList.add('bg-[#181513]', 'text-white', 'shadow-subtle');
      tab.classList.remove('bg-stone-100', 'text-stone-700');

      AppState.adminCategoryFilter = tab.dataset.adminCat;
      renderAdminTable();
    });
  });

  // Admin Recipes Instant Search Filter
  document.getElementById('admin-recipes-search')?.addEventListener('input', () => {
    renderAdminTable();
  });

  // Dedicated Admin Category Upload Button
  document.getElementById('btn-admin-cat-upload')?.addEventListener('click', () => {
    openRecipeEditor(null, AppState.adminCategoryFilter !== 'All' ? AppState.adminCategoryFilter : null);
  });

  // Admin Modal Handlers
  document.getElementById('btn-admin-add-recipe')?.addEventListener('click', () => {
    openRecipeEditor(null, AppState.adminCategoryFilter !== 'All' ? AppState.adminCategoryFilter : null);
  });
  document.getElementById('btn-close-modal')?.addEventListener('click', () => {
    document.getElementById('recipe-modal').classList.add('hidden');
  });
  document.getElementById('btn-cancel-modal')?.addEventListener('click', () => {
    document.getElementById('recipe-modal').classList.add('hidden');
  });
  document.getElementById('btn-add-ingredient-row')?.addEventListener('click', () => addIngredientRow());
  document.getElementById('btn-add-instruction-row')?.addEventListener('click', () => addInstructionRow());

  // Multi-Photo Gallery Upload Listeners (Up to 5 images) with Auto-Compression (<1MB) & Google Drive Upload
  const galleryFileInput = document.getElementById('form-gallery-files');
  const progressBox = document.getElementById('gallery-upload-progress');
  const progressText = document.getElementById('gallery-upload-progress-text');

  galleryFileInput?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (!AppState.editingGalleryImages) AppState.editingGalleryImages = [];
    const remainingSlots = 5 - AppState.editingGalleryImages.length;
    if (remainingSlots <= 0) {
      showToast("Maximum 5 photos reached! Delete one to add another.", "info");
      galleryFileInput.value = '';
      return;
    }

    const filesToLoad = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      showToast(`Only adding ${remainingSlots} photo(s). Limit is 5 photos.`, "info");
    }

    // Show progress UI
    if (progressBox) {
      progressBox.classList.remove('hidden');
      progressBox.classList.add('flex');
    }

    const isDriveConfigured = typeof TastyConfig !== 'undefined' && TastyConfig.isGoogleDriveConfigured();
    let loadedCount = 0;

    for (let i = 0; i < filesToLoad.length; i++) {
      const file = filesToLoad[i];
      if (progressText) {
        progressText.textContent = `Compressing photo ${i + 1}/${filesToLoad.length} under 1MB${isDriveConfigured ? ' & uploading to Google Drive...' : '...'}`;
      }

      try {
        // Step 1: Compress image strictly under 1MB using HTML5 Canvas
        const compressed = await TastyMedia.compressImageUnder1MB(file);
        let finalUrl = compressed.base64;

        // Step 2: Upload to Google Drive (or Firebase Storage if Drive script not yet set)
        try {
          const fileName = `recipe-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const uploadResult = await TastyMedia.uploadMedia(compressed.blob, fileName);
          if (uploadResult && uploadResult.url) {
            finalUrl = uploadResult.url;
          }
        } catch (uploadErr) {
          console.warn("[TastyNest] Cloud media upload fallback to local:", uploadErr);
        }

        if (AppState.editingGalleryImages.length < 5) {
          AppState.editingGalleryImages.push(finalUrl);
          loadedCount++;
        }
      } catch (err) {
        console.error("Error processing photo:", err);
        showToast(`Failed to process photo "${file.name}": ${err.message}`, "error");
      }
    }

    // Hide progress UI
    if (progressBox) {
      progressBox.classList.add('hidden');
      progressBox.classList.remove('flex');
    }

    renderGallerySlots();
    if (loadedCount > 0) {
      const msg = isDriveConfigured 
        ? `Added & uploaded ${loadedCount} photo(s) to Google Drive! (<1MB compressed)`
        : `Added ${loadedCount} photo(s) compressed strictly under 1MB!`;
      showToast(msg, "success");
    }
    galleryFileInput.value = '';
  });

  const btnAddUrl = document.getElementById('btn-add-gallery-url');
  const urlInput = document.getElementById('form-gallery-url-input');
  btnAddUrl?.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) return;
    if (!AppState.editingGalleryImages) AppState.editingGalleryImages = [];
    if (AppState.editingGalleryImages.length >= 5) {
      showToast("Maximum 5 photos reached! Delete one to add another.", "error");
      return;
    }
    AppState.editingGalleryImages.push(url);
    urlInput.value = '';
    renderGallerySlots();
    showToast("Photo added to gallery!", "success");
  });

  // Carousel Controls for Recipe Detail View
  document.getElementById('btn-gallery-prev')?.addEventListener('click', () => switchDetailPhoto(-1));
  document.getElementById('btn-gallery-next')?.addEventListener('click', () => switchDetailPhoto(1));

  document.getElementById('recipe-editor-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('form-recipe-id').value;
    const title = document.getElementById('form-title').value.trim();
    const category = document.getElementById('form-category').value;
    const author = document.getElementById('form-author').value.trim() || 'Tasty Nest Team';
    const description = document.getElementById('form-description').value.trim();
    const prepTime = document.getElementById('form-prep-time').value;
    const cookTime = document.getElementById('form-cook-time').value;
    const servings = document.getElementById('form-servings').value;
    const fallbackUrl = document.getElementById('form-image-url')?.value.trim() || '';

    const ingredientRows = document.querySelectorAll('#form-ingredients-rows .ingredient-row');
    const ingredients = [];
    ingredientRows.forEach(row => {
      const amount = row.querySelector('.row-amount').value.trim();
      const name = row.querySelector('.row-name').value.trim();
      if (name) ingredients.push({ amount, name });
    });

    const instructionRows = document.querySelectorAll('#form-instructions-rows .instruction-row');
    const instructions = [];
    instructionRows.forEach((row, idx) => {
      const desc = row.querySelector('.row-desc').value.trim();
      if (desc) instructions.push({ stepNumber: idx + 1, description: desc });
    });

    const nutrition = {
      calories: document.getElementById('form-nut-cal').value,
      protein: document.getElementById('form-nut-protein').value,
      carbs: document.getElementById('form-nut-carbs').value,
      fat: document.getElementById('form-nut-fat').value
    };

    // Up to 5 photos saved in images array; first image is the cover
    const galleryImages = (AppState.editingGalleryImages && AppState.editingGalleryImages.length > 0)
      ? AppState.editingGalleryImages.slice(0, 5)
      : (fallbackUrl ? [fallbackUrl] : ['https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80']);
    const primaryImage = galleryImages[0];

    const videoUrlRaw = document.getElementById('form-video-url')?.value.trim() || '';
    const videoUrl = typeof TastyMedia !== 'undefined' ? TastyMedia.formatVideoEmbedUrl(videoUrlRaw) : videoUrlRaw;

    const recipeData = {
      id: id || undefined,
      title,
      category,
      author,
      description,
      prepTime,
      cookTime,
      servings,
      imageUrl: primaryImage,
      images: galleryImages,
      videoUrl: videoUrl,
      ingredients,
      instructions,
      nutrition
    };

    try {
      await TastyDB.saveRecipe(recipeData);
      showToast(id ? "Recipe updated with gallery photos!" : "New recipe published with gallery!", "success");
      document.getElementById('recipe-modal').classList.add('hidden');
      renderAdminTable();
      renderRecipes();
    } catch (err) {
      console.error(err);
      showToast("Error saving recipe: " + err.message, "error");
    }
  });

  // Pinterest Video Modal Handlers (Admin Control Center)
  document.getElementById('btn-admin-manage-pboard-videos')?.addEventListener('click', openPinterestVideoModal);
  document.getElementById('btn-manage-pinterest-videos')?.addEventListener('click', openPinterestVideoModal);
  document.getElementById('btn-close-pboard-modal')?.addEventListener('click', () => {
    document.getElementById('pinterest-video-modal').classList.add('hidden');
  });
  document.getElementById('btn-cancel-pboard-modal')?.addEventListener('click', () => {
    document.getElementById('pinterest-video-modal').classList.add('hidden');
  });

  // Preview video link input live change
  document.getElementById('pboard-form-video-url')?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    const preview = document.getElementById('pboard-form-preview-video');
    const emptyNote = document.getElementById('pboard-preview-empty');
    if (val) {
      preview.src = val;
      preview.classList.remove('hidden');
      preview.play().catch(() => {});
      emptyNote?.classList.add('hidden');
    } else {
      preview.src = '';
      preview.classList.add('hidden');
      emptyNote?.classList.remove('hidden');
    }
  });

  // Local Video File Upload -> Base64 Data URL
  document.getElementById('pboard-form-video-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        document.getElementById('pboard-form-video-url').value = dataUrl;
        const preview = document.getElementById('pboard-form-preview-video');
        preview.src = dataUrl;
        preview.classList.remove('hidden');
        preview.play().catch(() => {});
        document.getElementById('pboard-preview-empty')?.classList.add('hidden');
        showToast("Local video file loaded into player!", "brand");
      };
      reader.readAsDataURL(file);
    }
  });

  // Save Pinterest Board Form Submit (Create or Update)
  document.getElementById('pboard-edit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('pboard-form-id').value;
    const title = document.getElementById('pboard-form-title').value.trim();
    const pinsCount = document.getElementById('pboard-form-count').value.trim();
    const pinUrl = document.getElementById('pboard-form-url').value.trim();
    const imageUrl = document.getElementById('pboard-form-image').value.trim();
    const videoUrl = document.getElementById('pboard-form-video-url').value.trim();

    const isNew = !id || id === 'new';
    const boardId = isNew ? ('pboard-' + Date.now()) : id;
    const existing = isNew ? null : (await db.pinterestBoards.get(boardId));
    const allBoards = await TastyDB.getPinterestBoards();

    const updatedBoard = {
      ...(existing || {}),
      id: boardId,
      title: title || 'Delicious Recipe Video',
      pinsCount: pinsCount || '500+ Pins',
      pinUrl: pinUrl || 'https://www.pinterest.com/tastynest917',
      imageUrl: imageUrl || 'sri_lankan_crab_curry.jpg',
      videoUrl: videoUrl || '',
      order: existing?.order || (allBoards.length + 1)
    };

    await TastyDB.savePinterestBoard(updatedBoard);
    showToast(isNew ? "New Pinterest video board added!" : "Pinterest video pin updated!", "success");
    document.getElementById('pinterest-video-modal').classList.add('hidden');
    await renderPinterestBoards();
  });

  // Add New Pinterest Board Trigger
  document.getElementById('btn-add-new-pboard')?.addEventListener('click', () => {
    switchPBoardTab('new');
  });

  // Delete Pinterest Board Trigger
  document.getElementById('btn-delete-pboard')?.addEventListener('click', async () => {
    if (!currentEditingBoardId || currentEditingBoardId === 'new') return;
    const all = await TastyDB.getPinterestBoards();
    if (all.length <= 1) {
      showToast("At least one Pinterest video board must remain.", "warning");
      return;
    }
    if (confirm("Are you sure you want to delete this Pinterest video board?")) {
      await TastyDB.deletePinterestBoard(currentEditingBoardId);
      showToast("Pinterest video board deleted.", "info");
      document.getElementById('pinterest-video-modal').classList.add('hidden');
      await renderPinterestBoards();
    }
  });

  // Reset Pinterest Defaults Button
  document.getElementById('btn-reset-pboard-defaults')?.addEventListener('click', async () => {
    if (confirm("Reset all Pinterest video boards to defaults?")) {
      await TastyDB.resetPinterestBoards();
      showToast("Reset to default Pinterest video boards", "info");
      document.getElementById('pinterest-video-modal').classList.add('hidden');
      await renderPinterestBoards();
    }
  });

  // Public 5-Star Recipe Review Form Submit
  document.getElementById('recipe-review-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!AppState.detailRecipe) return;

    const recipeId = AppState.detailRecipe.id;
    const rating = parseInt(document.getElementById('review-rating-value')?.value) || 5;
    const author = (document.getElementById('review-author')?.value || '').trim();
    const tip = (document.getElementById('review-tip')?.value || '').trim();
    let comment = (document.getElementById('review-comment')?.value || '').trim();

    if (tip) {
      comment = `Serving Note: ${tip}\n\n${comment}`;
    }

    try {
      await TastyDB.addRecipeReview({ recipeId, author, rating, comment });
      showToast(`Thank you ${author}! Your ${rating}-star review is published publicly.`, "success");
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
      document.getElementById('recipe-review-form').reset();
      setupStarPicker();
      await loadRecipeReviews(recipeId);
      await updateAdminBadges();
    } catch (err) {
      showToast(err.message || "Failed to submit review", "error");
    }
  });

  // Admin Subscriber Messages / Leads Modal Handlers
  document.getElementById('btn-admin-messages')?.addEventListener('click', openAdminSubscribersModal);
  document.getElementById('kpi-card-subscribers')?.addEventListener('click', openAdminSubscribersModal);
  document.getElementById('btn-close-subscribers-modal')?.addEventListener('click', () => {
    document.getElementById('admin-subscribers-modal')?.classList.add('hidden');
  });
  document.getElementById('btn-close-subscribers-footer')?.addEventListener('click', () => {
    document.getElementById('admin-subscribers-modal')?.classList.add('hidden');
  });

  // Copy All Emails
  document.getElementById('btn-copy-all-subscribers')?.addEventListener('click', async () => {
    const subs = await TastyDB.getSubscribers();
    if (subs.length === 0) {
      showToast("No subscriber emails found", "info");
      return;
    }
    const emailList = subs.map(s => s.email).join(', ');
    copyToClipboard(emailList, `Copied ${subs.length} emails to clipboard!`);
  });

  // Export CSV
  document.getElementById('btn-export-subscribers-csv')?.addEventListener('click', async () => {
    const subs = await TastyDB.getSubscribers();
    if (subs.length === 0) {
      showToast("No subscribers to export", "info");
      return;
    }
    let csv = 'Email,Campaign Source,Date Subscribed\n';
    subs.forEach(s => {
      csv += `"${s.email}","${s.source || '7-Day Recipe Book'}","${s.subscribedAt}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasty-nest-subscriber-leads-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${subs.length} subscriber leads to CSV!`, "success");
  });

  // Admin 5-Star Reviews Moderation Modal Handlers
  document.getElementById('btn-admin-reviews')?.addEventListener('click', () => openAdminReviewsModal('all'));
  document.getElementById('kpi-card-reviews')?.addEventListener('click', () => openAdminReviewsModal('all'));
  document.getElementById('btn-close-reviews-modal')?.addEventListener('click', () => {
    document.getElementById('admin-reviews-modal')?.classList.add('hidden');
  });
  document.getElementById('btn-close-reviews-footer')?.addEventListener('click', () => {
    document.getElementById('admin-reviews-modal')?.classList.add('hidden');
  });
  document.getElementById('admin-reviews-filter-recipe')?.addEventListener('change', (e) => {
    openAdminReviewsModal(e.target.value);
  });

  // Initial render
  renderRecipes();
  renderPinterestBoards();
  updateFavoritesBadge();
  updateAdminBadges();
});

// ==========================================
// PINTEREST VIDEO BOARDS MODAL CONTROLLER
// ==========================================
let currentEditingBoardId = 'pboard-spices';

async function openPinterestVideoModal() {
  if (!AppState.adminSession) {
    showToast("Admin access required to configure Pinterest videos.", "error");
    navigateTo('admin');
    return;
  }

  const modal = document.getElementById('pinterest-video-modal');
  const boards = await TastyDB.getPinterestBoards();
  if (!boards || boards.length === 0) return;

  currentEditingBoardId = boards[0].id;
  renderPBoardTabs(boards);
  loadPBoardForm(currentEditingBoardId);

  modal.classList.remove('hidden');
  lucide.createIcons();
}

async function renderPBoardTabs(boards) {
  const container = document.getElementById('pboard-tabs');
  if (!container) return;

  const tabsHtml = boards.map(b => {
    const isActive = b.id === currentEditingBoardId;
    return `
      <button 
        type="button" 
        onclick="switchPBoardTab('${b.id}')"
        class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold truncate transition cursor-pointer ${isActive ? 'bg-[#c2410c] text-white shadow-subtle' : 'bg-white text-stone-600 hover:bg-[#faf8f5] border border-[#e8e2d8]'}"
      >
        ${b.title.replace('Board: ', '')}
      </button>
    `;
  }).join('');

  const isNewActive = currentEditingBoardId === 'new';
  const newTabHtml = `
    <button
      type="button"
      onclick="switchPBoardTab('new')"
      class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold truncate transition cursor-pointer flex items-center gap-1 ${isNewActive ? 'bg-[#c2410c] text-white shadow-subtle' : 'bg-orange-50 text-brand-700 hover:bg-orange-100 border border-orange-200'}"
    >
      <span>+ Add Video</span>
    </button>
  `;

  container.innerHTML = tabsHtml + newTabHtml;
}

async function switchPBoardTab(boardId) {
  currentEditingBoardId = boardId;
  const boards = await TastyDB.getPinterestBoards();
  renderPBoardTabs(boards);
  loadPBoardForm(boardId);
}

async function loadPBoardForm(boardId) {
  const deleteBtn = document.getElementById('btn-delete-pboard');
  const preview = document.getElementById('pboard-form-preview-video');
  const emptyNote = document.getElementById('pboard-preview-empty');

  if (boardId === 'new') {
    document.getElementById('pboard-form-id').value = 'new';
    document.getElementById('pboard-form-title').value = '';
    document.getElementById('pboard-form-count').value = '500+ Pins';
    document.getElementById('pboard-form-url').value = 'https://www.pinterest.com/tastynest917';
    document.getElementById('pboard-form-image').value = 'sri_lankan_pol_roti.jpg';
    document.getElementById('pboard-form-video-url').value = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

    if (deleteBtn) {
      deleteBtn.classList.add('hidden');
      deleteBtn.classList.remove('inline-flex');
    }

    if (preview) {
      preview.src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
      preview.classList.remove('hidden');
      preview.play().catch(() => {});
      emptyNote?.classList.add('hidden');
    }
    return;
  }

  const board = await db.pinterestBoards.get(boardId);
  if (!board) return;

  const allBoards = await TastyDB.getPinterestBoards();
  if (deleteBtn) {
    if (allBoards.length > 1) {
      deleteBtn.classList.remove('hidden');
      deleteBtn.classList.add('inline-flex');
    } else {
      deleteBtn.classList.add('hidden');
      deleteBtn.classList.remove('inline-flex');
    }
  }

  document.getElementById('pboard-form-id').value = board.id;
  document.getElementById('pboard-form-title').value = board.title;
  document.getElementById('pboard-form-count').value = board.pinsCount || '';
  document.getElementById('pboard-form-url').value = board.pinUrl || '';
  document.getElementById('pboard-form-image').value = board.imageUrl || '';
  document.getElementById('pboard-form-video-url').value = board.videoUrl || '';

  if (board.videoUrl) {
    preview.src = board.videoUrl;
    preview.classList.remove('hidden');
    preview.play().catch(() => {});
    emptyNote?.classList.add('hidden');
  } else {
    preview.src = '';
    preview.classList.add('hidden');
    emptyNote?.classList.remove('hidden');
  }
}

// ==========================================
// UTILITY FUNCTIONS: HTML ESCAPE & CLIPBOARD
// ==========================================
function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, "info");
    }).catch(() => {
      prompt("Copy to clipboard:", text);
    });
  } else {
    prompt("Copy to clipboard:", text);
  }
}

function formatRelativeDate(isoStr) {
  if (!isoStr) return 'Recently';
  const diff = Date.now() - new Date(isoStr).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day}d ago`;
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ==========================================
// ADMIN BADGES CONTROLLER
// ==========================================
async function updateAdminBadges() {
  try {
    const subs = await TastyDB.getSubscribers();
    const subBadge = document.getElementById('admin-subscribers-badge');
    if (subBadge) subBadge.textContent = subs.length;
    const subPill = document.getElementById('subscribers-modal-count-pill');
    if (subPill) subPill.textContent = subs.length;
    const kpiSubs = document.getElementById('kpi-subscribers-count');
    if (kpiSubs) kpiSubs.textContent = subs.length;

    const revs = await TastyDB.getAllReviews();
    const revBadge = document.getElementById('admin-reviews-badge');
    if (revBadge) revBadge.textContent = revs.length;
    const revPill = document.getElementById('reviews-modal-count-pill');
    if (revPill) revPill.textContent = revs.length;
    const kpiRevs = document.getElementById('kpi-reviews-count');
    if (kpiRevs) kpiRevs.textContent = revs.length;

    const allRecipes = await TastyDB.getAllRecipes();
    const kpiRecipes = document.getElementById('kpi-recipes-count');
    if (kpiRecipes) kpiRecipes.textContent = allRecipes.length;

    const boards = await TastyDB.getPinterestBoards();
    const kpiBoards = document.getElementById('kpi-boards-count');
    if (kpiBoards) kpiBoards.textContent = boards.length;
  } catch (e) {
    console.warn("Badge update warning:", e);
  }
}

// ==========================================
// 5-STAR REVIEWS & RATINGS CONTROLLER
// ==========================================
function setupStarPicker() {
  const container = document.getElementById('star-picker-container');
  const ratingInput = document.getElementById('review-rating-value');
  const label = document.getElementById('star-rating-label');
  if (!container || !ratingInput) return;

  const labels = {
    1: "1.0 - Needs Improvement",
    2: "2.0 - Fair",
    3: "3.0 - Good Comfort Dish",
    4: "4.0 - Really Delicious!",
    5: "5.0 - Outstanding Heirloom Dish!"
  };

  const updateStars = (val) => {
    ratingInput.value = val;
    if (label) label.textContent = labels[val] || `${val} Stars`;
    const stars = container.querySelectorAll('.star-btn');
    stars.forEach(btn => {
      const sVal = parseInt(btn.dataset.star);
      if (sVal <= val) {
        btn.classList.add('text-amber-400');
        btn.classList.remove('text-stone-300');
      } else {
        btn.classList.remove('text-amber-400');
        btn.classList.add('text-stone-300');
      }
    });
  };

  container.querySelectorAll('.star-btn').forEach(btn => {
    btn.onclick = () => {
      const val = parseInt(btn.dataset.star) || 5;
      updateStars(val);
    };
  });

  updateStars(5);
}

async function loadRecipeReviews(recipeId) {
  const reviewsContainer = document.getElementById('detail-reviews-list');
  const countBadge = document.getElementById('detail-reviews-count-badge');
  const summaryAvg = document.getElementById('reviews-summary-avg');
  const summaryCount = document.getElementById('reviews-summary-count');
  const summaryStars = document.getElementById('reviews-summary-stars');
  const detailRating = document.getElementById('detail-rating');
  const detailReviews = document.getElementById('detail-reviews');

  if (!reviewsContainer) return;

  const reviews = await TastyDB.getRecipeReviews(recipeId);
  const total = reviews.length;

  if (countBadge) countBadge.textContent = total;

  if (total === 0) {
    if (summaryAvg) summaryAvg.textContent = "5.0";
    if (summaryCount) summaryCount.textContent = "No community reviews yet";
    if (summaryStars) summaryStars.textContent = "★★★★★";
    if (detailRating) detailRating.textContent = "5.0";
    if (detailReviews) detailReviews.textContent = "(0 reviews)";

    reviewsContainer.innerHTML = `
      <div class="text-center py-8 bg-[#faf7f2] rounded-2xl border border-dashed border-[#eee7de] p-6">
        <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 text-base">
          <i data-lucide="star" class="w-5 h-5 fill-amber-500 text-amber-500"></i>
        </div>
        <p class="font-serif font-bold text-zinc-800 text-sm">Be the first to review this recipe!</p>
        <p class="text-xs text-zinc-500 mt-0.5">Cooked this dish? Share your rating and experience using the form above.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const avg = (sum / total).toFixed(1);
  const starCount = Math.round(avg);
  const starStr = '★'.repeat(starCount) + '☆'.repeat(Math.max(0, 5 - starCount));

  if (summaryAvg) summaryAvg.textContent = avg;
  if (summaryCount) summaryCount.textContent = `${total} verified rating${total > 1 ? 's' : ''}`;
  if (summaryStars) summaryStars.textContent = starStr;
  if (detailRating) detailRating.textContent = avg;
  if (detailReviews) detailReviews.textContent = `(${total} review${total > 1 ? 's' : ''})`;

  // Avatar background colors
  const avatarColors = [
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-rose-500 to-pink-600',
    'from-purple-500 to-violet-600'
  ];

  reviewsContainer.innerHTML = reviews.map((rev, idx) => {
    const initials = rev.author
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'TN';
    const bgGrad = avatarColors[idx % avatarColors.length];
    const rStars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
    const dateFormatted = formatRelativeDate(rev.createdAt);

    return `
      <div class="p-5 rounded-2xl bg-white border border-[#eee7de] shadow-2xs space-y-3 hover:border-amber-200 transition">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-tr ${bgGrad} text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              ${initials}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="font-bold text-zinc-900 text-xs sm:text-sm">${escapeHtml(rev.author)}</h4>
                <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <i data-lucide="check" class="w-3 h-3 text-emerald-600"></i>
                  <span>Verified Cook</span>
                </span>
              </div>
              <span class="text-[11px] text-zinc-400">${dateFormatted}</span>
            </div>
          </div>
          <div class="text-amber-500 text-sm tracking-wider font-bold">
            ${rStars}
          </div>
        </div>
        <p class="text-xs sm:text-sm text-zinc-700 leading-relaxed pl-12 whitespace-pre-line">
          ${escapeHtml(rev.comment)}
        </p>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// ==========================================
// ADMIN SUBSCRIBER MESSAGES MODAL CONTROLLER
// ==========================================
async function openAdminSubscribersModal() {
  const modal = document.getElementById('admin-subscribers-modal');
  const tbody = document.getElementById('admin-subscribers-tbody');
  const countPill = document.getElementById('subscribers-modal-count-pill');
  if (!modal || !tbody) return;

  const subs = await TastyDB.getSubscribers();
  if (countPill) countPill.textContent = subs.length;
  const badge = document.getElementById('admin-subscribers-badge');
  if (badge) badge.textContent = subs.length;

  if (subs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-12 text-center text-zinc-400">
          <p class="font-serif font-bold text-zinc-700 text-sm">No subscriber messages yet</p>
          <p class="text-xs text-zinc-400 mt-1">When visitors claim the '7-Day Recipe Book', their emails appear right here.</p>
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = subs.map((sub, index) => {
      const dateStr = new Date(sub.subscribedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      return `
        <tr class="hover:bg-stone-50 transition">
          <td class="px-5 py-3.5 font-bold text-zinc-400 text-xs">${index + 1}</td>
          <td class="px-5 py-3.5">
            <div class="flex items-center gap-2">
              <span class="font-bold text-zinc-900">${escapeHtml(sub.email)}</span>
              <button onclick="copyToClipboard('${sub.email}', 'Email copied!')" class="p-1 text-zinc-400 hover:text-brand-700 rounded transition" title="Copy email">
                <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </td>
          <td class="px-5 py-3.5">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              ${escapeHtml(sub.source || '7-Day Recipe Book')}
            </span>
          </td>
          <td class="px-5 py-3.5 text-xs text-zinc-500">${dateStr}</td>
          <td class="px-5 py-3.5 text-right">
            <button onclick="handleDeleteSubscriber('${sub.id}')" class="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-full transition">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  lucide.createIcons();
  modal.classList.remove('hidden');
}

async function handleDeleteSubscriber(id) {
  if (confirm("Remove this subscriber from the list?")) {
    await TastyDB.deleteSubscriber(id);
    showToast("Subscriber removed", "info");
    openAdminSubscribersModal();
    updateAdminBadges();
  }
}

// ==========================================
// ADMIN REVIEWS MODERATION MODAL CONTROLLER
// ==========================================
async function openAdminReviewsModal(filterRecipeId = 'all') {
  const modal = document.getElementById('admin-reviews-modal');
  const tbody = document.getElementById('admin-reviews-tbody');
  const countPill = document.getElementById('reviews-modal-count-pill');
  const filterSelect = document.getElementById('admin-reviews-filter-recipe');
  if (!modal || !tbody) return;

  const allReviews = await TastyDB.getAllReviews();
  const allRecipes = await TastyDB.getAllRecipes();

  // Populate dropdown options if empty or changed
  if (filterSelect && filterSelect.options.length <= 1) {
    const currentVal = filterRecipeId || 'all';
    filterSelect.innerHTML = `<option value="all">All Recipes (${allReviews.length})</option>` +
      allRecipes.map(r => `<option value="${r.id}" ${currentVal === r.id ? 'selected' : ''}>${escapeHtml(r.title)}</option>`).join('');
  }

  const filtered = filterRecipeId === 'all' 
    ? allReviews 
    : allReviews.filter(r => r.recipeId === filterRecipeId);

  if (countPill) countPill.textContent = allReviews.length;
  const badge = document.getElementById('admin-reviews-badge');
  if (badge) badge.textContent = allReviews.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-zinc-400">
          <p class="font-serif font-bold text-zinc-700 text-sm">No reviews found</p>
          <p class="text-xs text-zinc-400 mt-1">Visitors can submit 5-star reviews on any recipe page.</p>
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = filtered.map(rev => {
      const dateStr = new Date(rev.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const starStr = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
      return `
        <tr class="hover:bg-stone-50 transition">
          <td class="px-5 py-3.5">
            <span class="font-bold text-zinc-900 block line-clamp-1">${escapeHtml(rev.recipeTitle)}</span>
            <span class="text-[10px] text-zinc-400">${escapeHtml(rev.recipeCategory)}</span>
          </td>
          <td class="px-5 py-3.5">
            <span class="text-amber-500 font-bold text-xs">${starStr} (${rev.rating})</span>
          </td>
          <td class="px-5 py-3.5">
            <span class="font-bold text-zinc-800 text-xs">${escapeHtml(rev.author)}</span>
          </td>
          <td class="px-5 py-3.5 max-w-xs">
            <p class="text-xs text-zinc-600 line-clamp-2">${escapeHtml(rev.comment)}</p>
          </td>
          <td class="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">${dateStr}</td>
          <td class="px-5 py-3.5 text-right whitespace-nowrap">
            <button onclick="handleDeleteReview('${rev.id}')" class="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-full transition">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  lucide.createIcons();
  modal.classList.remove('hidden');
}

async function handleDeleteReview(id) {
  if (confirm("Delete this review? Star rating for the recipe will be recalculated automatically.")) {
    await TastyDB.deleteReview(id);
    showToast("Review deleted and rating recalculated", "info");
    const filterSelect = document.getElementById('admin-reviews-filter-recipe');
    openAdminReviewsModal(filterSelect?.value || 'all');
    updateAdminBadges();
    renderAdminTable();
  }
}

// ==========================================
// 5-PHOTO INTERACTIVE GALLERY CONTROLLERS
// ==========================================
function renderDetailGallery() {
  const imgElem = document.getElementById('detail-image');
  const counterElem = document.getElementById('gallery-counter-text');
  const counterBadge = document.getElementById('detail-gallery-counter');
  const prevBtn = document.getElementById('btn-gallery-prev');
  const nextBtn = document.getElementById('btn-gallery-next');
  const thumbContainer = document.getElementById('detail-gallery-thumbnails');
  
  const images = AppState.detailGalleryImages || [];
  if (images.length === 0) {
    if (imgElem) imgElem.src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';
    if (counterBadge) counterBadge.classList.add('hidden');
    if (prevBtn) prevBtn.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');
    if (thumbContainer) {
      thumbContainer.innerHTML = '';
      thumbContainer.classList.add('hidden');
    }
    return;
  }

  // Ensure index in bounds
  if (AppState.detailCurrentPhotoIdx >= images.length) {
    AppState.detailCurrentPhotoIdx = 0;
  } else if (AppState.detailCurrentPhotoIdx < 0) {
    AppState.detailCurrentPhotoIdx = images.length - 1;
  }

  const currentUrl = images[AppState.detailCurrentPhotoIdx];
  if (imgElem) {
    imgElem.style.opacity = '0.6';
    setTimeout(() => {
      imgElem.src = currentUrl;
      imgElem.style.opacity = '1';
    }, 120);
  }

  if (counterElem) {
    counterElem.textContent = `${AppState.detailCurrentPhotoIdx + 1} / ${images.length} Photos`;
  }

  if (images.length > 1) {
    if (counterBadge) counterBadge.classList.remove('hidden');
    if (prevBtn) prevBtn.classList.remove('hidden');
    if (nextBtn) nextBtn.classList.remove('hidden');
  } else {
    if (counterBadge) counterBadge.classList.add('hidden');
    if (prevBtn) prevBtn.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');
  }

  // Render thumbnail buttons
  if (thumbContainer) {
    if (images.length <= 1) {
      thumbContainer.innerHTML = '';
      thumbContainer.classList.add('hidden');
    } else {
      thumbContainer.classList.remove('hidden');
      thumbContainer.innerHTML = images.map((url, idx) => `
        <button 
          type="button" 
          onclick="switchDetailPhotoTo(${idx})" 
          class="gallery-thumb-btn w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition ${idx === AppState.detailCurrentPhotoIdx ? 'active border-brand-600 ring-2 ring-brand-500/30 scale-105' : 'border-stone-200 opacity-60 hover:opacity-100'}"
          title="Photo ${idx + 1}"
        >
          <img src="${normalizeImagePath(url)}" alt="Thumbnail ${idx + 1}" class="w-full h-full object-cover">
        </button>
      `).join('');
    }
  }

  lucide.createIcons();
}

function switchDetailPhoto(delta) {
  if (!AppState.detailGalleryImages || AppState.detailGalleryImages.length <= 1) return;
  AppState.detailCurrentPhotoIdx = (AppState.detailCurrentPhotoIdx + delta + AppState.detailGalleryImages.length) % AppState.detailGalleryImages.length;
  renderDetailGallery();
}

function switchDetailPhotoTo(idx) {
  if (!AppState.detailGalleryImages || !AppState.detailGalleryImages[idx]) return;
  AppState.detailCurrentPhotoIdx = idx;
  renderDetailGallery();
}

function renderGallerySlots() {
  const container = document.getElementById('form-gallery-slots-container');
  const countBadge = document.getElementById('gallery-count-badge');
  const hiddenUrlInput = document.getElementById('form-image-url');
  if (!container) return;

  const images = AppState.editingGalleryImages || [];
  if (countBadge) {
    countBadge.textContent = `${images.length} / 5`;
    if (images.length === 5) {
      countBadge.className = 'px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold';
    } else {
      countBadge.className = 'px-2.5 py-1 bg-stone-200 text-zinc-700 rounded-full text-xs font-bold';
    }
  }

  if (hiddenUrlInput) {
    hiddenUrlInput.value = images[0] || '';
  }

  let slotsHtml = '';
  for (let i = 0; i < 5; i++) {
    const imgUrl = images[i];
    if (imgUrl) {
      slotsHtml += `
        <div class="gallery-slot-card relative aspect-square rounded-xl overflow-hidden border ${i === 0 ? 'border-[#c2410c] ring-2 ring-[#c2410c]/20' : 'border-[#e8e2d8]'} bg-stone-100 group shadow-subtle">
          <img src="${normalizeImagePath(imgUrl)}" alt="Photo ${i + 1}" class="w-full h-full object-cover">
          ${i === 0 ? `
            <span class="absolute top-1 left-1 bg-[#c2410c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-subtle">
              Cover
            </span>
          ` : `
            <button 
              type="button" 
              onclick="makeCoverGalleryImage(${i})" 
              class="absolute bottom-1 left-1 bg-black/75 hover:bg-[#c2410c] text-white text-[9px] font-bold px-1.5 py-0.5 rounded transition shadow-subtle cursor-pointer"
              title="Set as Cover Photo"
            >
              Set Cover
            </button>
          `}
          <button 
            type="button" 
            onclick="removeGalleryImage(${i})" 
            class="absolute top-1 right-1 w-5 h-5 bg-black/75 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition shadow-subtle cursor-pointer"
            title="Remove Photo"
          >
            ×
          </button>
          <span class="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-bold px-1 rounded">#${i + 1}</span>
        </div>
      `;
    } else {
      slotsHtml += `
        <div class="aspect-square rounded-xl border-2 border-dashed border-[#e8e2d8] bg-white/60 flex flex-col items-center justify-center text-stone-400 p-1 text-center">
          <span class="text-xs font-semibold text-stone-500">Slot ${i + 1}</span>
          <span class="text-[9px] text-stone-400">Empty</span>
        </div>
      `;
    }
  }

  container.innerHTML = slotsHtml;
  lucide.createIcons();
}

function removeGalleryImage(index) {
  if (!AppState.editingGalleryImages) return;
  AppState.editingGalleryImages.splice(index, 1);
  renderGallerySlots();
  showToast("Photo removed from gallery", "info");
}

function makeCoverGalleryImage(index) {
  if (!AppState.editingGalleryImages || !AppState.editingGalleryImages[index]) return;
  const item = AppState.editingGalleryImages.splice(index, 1)[0];
  AppState.editingGalleryImages.unshift(item);
  renderGallerySlots();
  showToast("Photo set as Cover Photo!", "success");
}

/* ==========================================================================
   REAL-TIME CLOUD SYNC HOOK (FIREBASE FIRESTORE)
   ========================================================================== */
window.onFirestoreRecipesUpdated = () => {
  console.log("[TastyNest] ⚡ Real-time update received from Firestore! Refreshing views...");
  renderRecipes();
  renderAdminTable();
};


