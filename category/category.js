// category.js

const API_URL = "https://news-server-ut0z.onrender.com/api/news"; // আপনার API লিংক

// URL থেকে ক্যাটাগরি, জেলা ও সম্পাদকের নাম বের করা
const urlParams = new URLSearchParams(window.location.search);
const categoryName = urlParams.get('cat');
const districtName = urlParams.get('dist');
const editorParam = urlParams.get('editor');

const categoryTitle = document.getElementById('categoryTitle');
const newsGrid = document.getElementById('newsGrid');
const emptyMessage = document.getElementById('emptyMessage');
const errorMessage = document.getElementById('errorMessage');

// হেডিং টেক্সট সেট করা (dist > editor > cat > ডিফল্ট)
if (districtName) {
  categoryTitle.textContent = `${districtName} জেলার খবর`;
} else if (editorParam) {
  categoryTitle.textContent = `${editorParam} এর সম্পাদিত খবর`;
} else if (categoryName) {
  categoryTitle.textContent = categoryName + " বিভাগের খবর";
} else {
  categoryTitle.textContent = "সকল খবর";
}

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

function formatDate(dateString) {
  if (!dateString) return "June 24, 2026"; 
  return dateString;
}

// স্কেলিটন কার্ড দেখানোর ফাংশন
function showSkeletons() {
  newsGrid.innerHTML = ''; // আগের কিছু থাকলে মুছে ফেলবে
  for (let i = 0; i < 6; i++) {
    newsGrid.innerHTML += `
      <article class="skel-card">
        <div class="skel-thumb shimmer"></div>
        <div class="skel-body">
          <div class="skel-line title-1 shimmer"></div>
          <div class="skel-line title-2 shimmer"></div>
          <div class="skel-line desc-1 shimmer"></div>
          <div class="skel-line desc-2 shimmer"></div>
          <div class="skel-line cta shimmer"></div>
        </div>
      </article>
    `;
  }
}

async function fetchCategoryNews() {
  try {
    // ডাটাবেস থেকে খবর আসার আগে স্কেলিটন দেখাবে
    showSkeletons();

    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Server Error");
    const data = await response.json();

    // একাধিক ফিল্টার (cat, dist, editor) একসাথে ধাপে ধাপে প্রয়োগ করা হচ্ছে
    let filteredData = Array.isArray(data) ? data : [];

    if (categoryName) {
      filteredData = filteredData.filter(item => item.category === categoryName);
    }
    if (districtName) {
      filteredData = filteredData.filter(item => item.district === districtName);
    }
    if (editorParam) {
      filteredData = filteredData.filter(item => item.editor === editorParam);
    }

    // খবর চলে আসার পর স্কেলিটন মুছে ফেলবে
    newsGrid.innerHTML = '';

    if (filteredData.length === 0) {
      emptyMessage.style.display = 'block';
      return;
    }

    // ফিল্টার করা আসল খবরগুলো পেজে দেখানো
    filteredData.forEach(item => {
      const card = document.createElement('article');
      card.className = 'news-card';

      const imageUrl = item.image || 'https://via.placeholder.com/400x250?text=No+Image';
      const headline = escapeHTML(item.headline || 'শিরোনাম নেই');
      const shortBody = escapeHTML(truncateText(item.body, 100));
      const newsDate = formatDate(item.date);
      const itemId = item.id || item._id;

      card.innerHTML = `
        <img src="${imageUrl}" alt="${headline}" loading="lazy">
        <div class="card-content">
          <h3>${headline}</h3>
          <div class="card-date">${newsDate}</div>
          <p>${shortBody}</p>
          <a href="../details/details.html?id=${itemId}" class="read-more">বিস্তারিত পড়ুন →</a>
        </div>
      `;
      newsGrid.appendChild(card);
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    newsGrid.innerHTML = ''; // এরর হলে স্কেলিটন মুছে ফেলবে
    errorMessage.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', fetchCategoryNews);


// =====================================
// সাইডবার মেনু কন্ট্রোল করার কোড
// =====================================
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchBtn = document.getElementById('searchBtn');

if (menuBtn && closeBtn && sidebarMenu && sidebarOverlay) {
  menuBtn.addEventListener('click', () => {
    sidebarMenu.classList.add('active');
    sidebarOverlay.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });

  sidebarOverlay.addEventListener('click', () => {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  });
}

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    alert("সার্চ ফিচারটি খুব শীঘ্রই আসছে!"); 
  });
}

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
