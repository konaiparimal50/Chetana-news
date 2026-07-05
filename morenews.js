// moreNews.js

// ১. প্রথমে সিএসএস ডিজাইন তৈরি করে পেজের <head>-এ যুক্ত করা হচ্ছে
const style = document.createElement('style');
style.innerHTML = `
  .dynamic-more-news {
    margin-top: 40px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .dynamic-more-news-header {
    font-size: 1.5rem;
    color: #b71c1c;
    border-left: 5px solid #b71c1c;
    padding-left: 10px;
    margin-bottom: 20px;
    font-family: 'Tiro Bangla', serif;
  }
  .dynamic-news-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  .dynamic-news-item {
    display: flex;
    gap: 15px;
    align-items: center;
    text-decoration: none;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    transition: background 0.2s, padding-left 0.2s;
  }
  .dynamic-news-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .dynamic-news-item:hover {
    background: #fcfcfc;
    padding-left: 5px;
  }
  .dynamic-news-img {
    width: 100px;
    height: 75px;
    object-fit: cover;
    border-radius: 5px;
    flex-shrink: 0;
  }
  .dynamic-news-title {
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.4;
  }
  .dynamic-news-date {
    font-size: 0.85rem;
    color: #777;
    margin-top: 5px;
    font-family: sans-serif;
  }
  @media (max-width: 600px) {
    .dynamic-news-item { flex-direction: column; align-items: flex-start; gap: 10px; }
    .dynamic-news-img { width: 100%; height: 160px; }
  }
`;
document.head.appendChild(style);

// ২. খবর লোড করার মূল ফাংশন
async function loadDynamicMoreNews(containerId, basePath = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // লোডিং টেক্সট
  container.innerHTML = '<p style="text-align:center; color:#777; padding: 20px;">আরও খবর লোড হচ্ছে...</p>';

  try {
    const response = await fetch('https://news-server-ut0z.onrender.com/api/news');
    if (!response.ok) throw new Error("Server error");
    const data = await response.json();

    // বর্তমান পেজের আইডি বের করা (যাতে যে খবরটা পড়া হচ্ছে সেটা 'আরও খবর'-এ না দেখায়)
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get('id');

    // বর্তমান খবরটি বাদ দিয়ে বাকি সব খবর থেকে ৫টি খবর বেছে নেওয়া
    const filteredData = data.filter(item => item.id !== currentId && item._id !== currentId).slice(0, 5);

    if (filteredData.length === 0) {
      container.innerHTML = '';
      return;
    }

    // এইচটিএমএল (HTML) তৈরি করা
    let html = `
      <div class="dynamic-more-news">
        <h3 class="dynamic-more-news-header"><i class="far fa-newspaper"></i> আরও খবর</h3>
        <div class="dynamic-news-list">
    `;

    filteredData.forEach(item => {
      const imgUrl = item.image || 'https://via.placeholder.com/100x75?text=No+Image';
      const title = item.headline ? item.headline.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'শিরোনাম নেই';
      const date = item.date || 'June 25, 2026';
      const itemId = item.id || item._id;
      
      html += `
        <a href="${basePath}details/details.html?id=${itemId}" class="dynamic-news-item">
          <img src="${imgUrl}" alt="News Image" class="dynamic-news-img" loading="lazy">
          <div>
            <div class="dynamic-news-title">${title}</div>
            <div class="dynamic-news-date">${date}</div>
          </div>
        </a>
      `;
    });

    html += `</div></div>`;
    
    // পেজে কোডটুকু ঢুকিয়ে দেওয়া
    container.innerHTML = html;

  } catch (error) {
    console.error('Error fetching more news:', error);
    container.innerHTML = ''; 
  }
}
