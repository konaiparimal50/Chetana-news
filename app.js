// app.js

const API_URL = "https://news-server-ut0z.onrender.com/api/news";

const newsGrid = document.getElementById('newsGrid');
const errorMessage = document.getElementById('errorMessage');
const emptyMessage = document.getElementById('emptyMessage');

function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// তারিখের ফরম্যাট করার জন্য (ডাটাবেসে তারিখ না থাকলে আজকের তারিখ দেখাবে ব্যাকআপ হিসেবে)
function formatDate(dateString) {
  if (!dateString) return "তারিখ পাওয়া যায়নি"; 

  try {
    const d = new Date(dateString);
    
    // যদি কনভার্ট করতে সমস্যা হয়, তাহলে ডাটাবেসে যেমন আছে তেমনই দেখাবে
    if (isNaN(d.getTime())) return dateString; 

    // তারিখটি সুন্দর ফরম্যাটে দেখানোর জন্য
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-GB', options); 
  } catch (error) {
    return dateString;
  }
}

// স্কেলিটন লোডিং
function renderSkeletons(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skel-card">
        <div class="skel-thumb shimmer"></div>
        <div class="skel-body">
          <div class="skel-line title-1 shimmer"></div>
          <div class="skel-line title-2 shimmer"></div>
          <div class="skel-line desc-1 shimmer"></div>
          <div class="skel-line desc-2 shimmer"></div>
          <div class="skel-line cta shimmer"></div>
        </div>
      </div>`;
  }
  newsGrid.innerHTML = html;
}

function renderNews(newsList) {
  newsGrid.innerHTML = '';

  newsList.forEach(item => {
    const card = document.createElement('article');
    card.className = 'news-card';

    const imageUrl = item.image || 'https://via.placeholder.com/400x250?text=No+Image';
    const headline = escapeHTML(item.headline || 'শিরোনাম নেই');
    const shortBody = escapeHTML(truncateText(item.body, 100));
    
    // ডাটাবেস থেকে এডিটর এবং নতুন date ফিল্ড নেওয়া হচ্ছে
    const editorName = escapeHTML(item.editor || 'P.K EDITOR'); 
    const newsDate = formatDate(item.date); 
    
    const itemId = item.id || item._id;

    card.innerHTML = `
      <img src="${imageUrl}" alt="${headline}" loading="lazy">
      <div class="card-content">
        <div class="card-meta">
          <span class="editor-name"><i class="fas fa-user-edit"></i> ${editorName}</span>
          <span class="publish-date"><i class="far fa-clock"></i> ${newsDate}</span>
        </div>
        
        <h3>${headline}</h3>
        <p>${shortBody}</p>
        <a href="details/details.html?id=${itemId}" class="read-more">বিস্তারিত পড়ুন →</a>
      </div>
    `;

    newsGrid.appendChild(card);
  });
}



async function fetchNews() {
  try {
    errorMessage.style.display = 'none';
    emptyMessage.style.display = 'none';

    renderSkeletons(6);

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      newsGrid.innerHTML = '';
      emptyMessage.style.display = 'block';
      return;
    }

    renderNews(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    newsGrid.innerHTML = '';
    errorMessage.style.display = 'block';
  }
}

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
}

// Initial load
document.addEventListener('DOMContentLoaded', fetchNews);


// =====================================
// সাইডবার মেনু কন্ট্রোল করার কোড
// =====================================
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchBtn = document.getElementById('searchBtn');

if (menuBtn && closeBtn && sidebarMenu && sidebarOverlay) {
  // মেনু খোলার ফাংশন
  menuBtn.addEventListener('click', () => {
    sidebarMenu.classList.add('active');
    sidebarOverlay.classList.add('active');
  });

  // মেনু বন্ধ করার ফাংশন (ক্রস বাটনে ক্লিক করলে)
  closeBtn.addEventListener('click', () => {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });

  // মেনু বন্ধ করার ফাংশন (কালো স্ক্রিনে ক্লিক করলে)
  sidebarOverlay.addEventListener('click', () => {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
}

// সার্চ বাটনের জন্য (ভবিষ্যতে সার্চ লজিক এখানে বসাবেন)
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    alert("সার্চ ফিচারটি খুব শীঘ্রই আসছে!"); 
  });
}

// =====================================
// ডায়নামিক নিউজ টিকার (ব্রেকিং নিউজ)
// =====================================
async function loadDynamicTicker() {
  const tickerMove = document.querySelector('.ticker-move');
  
  // যদি পেজে টিকার না থাকে, তাহলে ফাংশন কাজ করবে না
  if (!tickerMove) return;

  try {
    // আপনার ডাটাবেস থেকে খবর কল করা হচ্ছে (API_URL আপনার app.js এর উপরে দেওয়াই আছে)
    const response = await fetch("https://news-server-ut0z.onrender.com/api/news");
    const data = await response.json();

    // সবচেয়ে নতুন ৩টি খবর বেছে নেওয়া হলো (ডাটাবেসের প্রথম ৩টি)
    const recentNews = data.slice(0, 3);

    if (recentNews.length > 0) {
      let tickerHTML = '';
      
      // হেডিংয়ের আগে বসানোর জন্য ৩টি আকর্ষণীয় কথা
      const prefixes = ["সবচেয়ে বড় খবর: ", "এই মুহূর্তের আপডেট: ", "টাটকা খবর: "];

      // লুপ চালিয়ে ৩টি খবর টিকারে যোগ করা হচ্ছে
      recentNews.forEach((news, index) => {
        const prefix = prefixes[index]; // একেকটা খবরের আগে একেকটা কথা বসবে
        const headline = news.headline ? news.headline : 'শিরোনাম নেই';
        
        tickerHTML += `<span class="ticker-item">${prefix} ${headline}</span>`;
      });

      // আপনার চাওয়া অনুযায়ী একদম শেষের মেসেজটি
      tickerHTML += `<span class="ticker-item">আরও নতুন খবর পেতে আমাদের সাথেই থাকুন...</span>`;

      // এইচটিএমএল (HTML) এর ভেতরে লেখাগুলো ঢুকিয়ে দেওয়া হলো
      tickerMove.innerHTML = tickerHTML;
    }

  } catch (error) {
    console.error("Ticker load error:", error);
    // যদি কোনো কারণে ইন্টারনেট না থাকে বা ডাটাবেস এরর দেয়, তবে এই লেখাটি দেখাবে
    tickerMove.innerHTML = `
      <span class="ticker-item">সার্ভার থেকে খবর আনতে সমস্যা হচ্ছে...</span>
      <span class="ticker-item">আরও নতুন খবর পেতে আমাদের সাথেই থাকুন...</span>
    `;
  }
}

// পেজ লোড হওয়ার সাথে সাথে টিকার চালু করার কমান্ড
document.addEventListener('DOMContentLoaded', loadDynamicTicker);

// =====================================
// সাইডবার সাবমেনু (জেলা সমূহ / সম্পাদক) টগল লজিক
// =====================================
function setupSidebarSubmenu(toggleId, submenuId) {
  const toggle = document.getElementById(toggleId);
  const submenu = document.getElementById(submenuId);
  if (!toggle || !submenu) return;

  toggle.addEventListener('click', (e) => {
    e.preventDefault();

    const isOpen = submenu.style.display === 'block';
    submenu.style.display = isOpen ? 'none' : 'block';

    const icon = toggle.querySelector('.dropdown-icon');
    if (icon) {
      icon.classList.toggle('fa-chevron-down', isOpen);
      icon.classList.toggle('fa-chevron-up', !isOpen);
    }
  });
}

setupSidebarSubmenu('districtToggle', 'districtSubmenu');
setupSidebarSubmenu('editorToggle', 'editorSubmenu');
