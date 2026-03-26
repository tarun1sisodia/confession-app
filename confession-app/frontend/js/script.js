let currentPostId = null;
let currentFeedData = [];
let currentCategory = ''; 
let currentCommentSort = 'top';
let currentPage = 1;
let isFeedEnd = false;

let myDeviceId = localStorage.getItem('deviceId');
if (!myDeviceId) {
    myDeviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    localStorage.setItem('deviceId', myDeviceId);
}
let userSettings = { theme: 'system', revealEnabled: true };

window.applyTheme = function(themeStr) {
    if (themeStr === 'system') {
        const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-mode', isDark);
    } else {
        document.body.classList.toggle('dark-mode', themeStr === 'dark');
    }
};

window.cycleTheme = async function() {
    // Simplify to 2-speed toggle: Light or Dark
    userSettings.theme = (userSettings.theme === 'dark') ? 'light' : 'dark';
    
    window.applyTheme(userSettings.theme);
    window.updateSettingsUI();
    await API.updateSettings(myDeviceId, { theme: userSettings.theme });
};

window.toggleRevealSetting = async function() {
    userSettings.revealEnabled = !userSettings.revealEnabled;
    window.updateSettingsUI();
    await API.updateSettings(myDeviceId, { revealEnabled: userSettings.revealEnabled });
    if (document.getElementById('feed')) window.loadFeed(currentCategory);
};

window.updateSettingsUI = function() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        if (userSettings.theme === 'dark') themeBtn.innerHTML = '🌙';
        else if (userSettings.theme === 'light') themeBtn.innerHTML = '☀️';
        else themeBtn.innerHTML = '⚙️';
    }
    
    const revealBtn = document.getElementById('revealToggleBtn');
    if (revealBtn) {
        revealBtn.innerHTML = userSettings.revealEnabled ? '👁️ Blur: ON' : '🔓 Blur: OFF';
    }
};

window.initSettings = async function() {
    const data = await API.getSettings(myDeviceId);
    userSettings = data;
    window.applyTheme(userSettings.theme);
    window.updateSettingsUI();
};

window.appendHashtag = function() {
    const tags = ['#secret', '#truth', '#vent', '#heartbreak', '#crush', '#life', '#mood'];
    const tag = tags[Math.floor(Math.random() * tags.length)];
    confessionInput.value += ' ' + tag;
    confessionInput.dispatchEvent(new Event('input'));
};

window.appendHeart = function() {
    const hearts = ['❤️', '✨', '🔥', '🥺', '🦋', '🙌', '💯'];
    const heart = hearts[Math.floor(Math.random() * hearts.length)];
    confessionInput.value += ' ' + heart;
    confessionInput.dispatchEvent(new Event('input'));
};

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (currentTheme === 'system') window.applyTheme('system');
    });
}

const feedContainer = document.getElementById('feed');
const confessionInput = document.getElementById('confessionInput');
const postBtn = document.getElementById('postBtn');
const categoryBtns = document.querySelectorAll('.category-btn');

if (confessionInput) {
    confessionInput.addEventListener('input', (e) => {
        postBtn.disabled = e.target.value.length < 5;
    });
}

window.toggleDrawer = function(id, show) {
    const el = document.getElementById(id);
    if (!el) return;
    if (show) el.classList.add('active');
    else el.classList.remove('active');
};

function formatPassage(text, id, isBlurred) {
    if(text.length <= 150) {
        return `<p class="confession-text ${isBlurred ? 'blur-overlay select-none' : ''}" id="txt-${id}">${escapeHTML(text)}</p>`;
    } else {
        const shortForm = escapeHTML(text.substring(0, 150)) + '...';
        const fullForm = escapeHTML(text);
        return `
            <p class="confession-text ${isBlurred ? 'blur-overlay select-none' : ''}" id="txt-${id}">
                <span id="short-${id}">${shortForm} <button onclick="event.stopPropagation(); expandText('${id}')" class="text-blue-500 text-sm font-bold ml-1 active:scale-95 transition-transform">Read more</button></span>
                <span id="long-${id}" class="hidden">${fullForm}</span>
            </p>
        `;
    }
}

window.expandText = function(id) {
    document.getElementById(`short-${id}`).classList.add('hidden');
    document.getElementById(`long-${id}`).classList.remove('hidden');
};

window.loadFeed = async function(category = '', isLoadMore = false) {
    const feed = document.getElementById('exploreFeed') || document.getElementById('feed');
    if (!feed) return;

    if (!isLoadMore) {
        currentPage = 1;
        isFeedEnd = false;
        currentFeedData = [];
        feed.innerHTML = '<div class="text-center py-20 text-gray-400 font-bold animate-pulse text-sm">Loading secrets...</div>';
    }
    
    currentCategory = category;
    const data = await API.getFeed(category, currentPage);

    if (data === null) {
        // Offline / Error fallback
        const cached = localStorage.getItem('cachedFeed_' + category);
        if (cached && !isLoadMore) {
            currentFeedData = JSON.parse(cached);
            window.renderFeed(feed, currentFeedData);
            feed.insertAdjacentHTML('afterbegin', '<div class="bg-blue-50 text-blue-600 text-[10px] font-bold p-3 rounded-2xl mb-6 text-center">Offline Mode: Showing cached posts</div>');
        } else if (!isLoadMore) {
            feed.innerHTML = '<div class="text-center py-20 text-gray-400 font-bold">Failed to connect. Please check your internet.</div>';
        }
        return;
    }

    if (data.length < 10) isFeedEnd = true;
    
    currentFeedData = isLoadMore ? [...currentFeedData, ...data] : data;
    
    // Cache the first page
    if (currentPage === 1) {
        localStorage.setItem('cachedFeed_' + category, JSON.stringify(data));
    }

    window.renderFeed(feed, currentFeedData);
};

window.loadMore = function() {
    if (isFeedEnd) return;
    currentPage++;
    window.loadFeed(currentCategory, true);
};

let selectedFile = null;

window.handleImageSelect = function(e) {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        const reader = new FileReader();
        reader.onload = (re) => {
            document.getElementById('previewImg').src = re.target.result;
            document.getElementById('imagePreview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
};

window.clearImage = function() {
    selectedFile = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').classList.add('hidden');
};

window.vote = async function(id, type, reactionValue = null, btnElement = null) {
    try {
        const data = await API.votePost(id, type, reactionValue);
        if (data.status === 'success') {
            // Update the UI locally for better UX
            const updatedPost = data.data;
            // Find post in currentFeedData and update it
            const idx = currentFeedData.findIndex(p => p._id === id);
            if (idx > -1) {
                currentFeedData[idx] = updatedPost;
                const activeContainer = document.getElementById('feed') || document.getElementById('exploreFeed') || document.getElementById('heartsFeed');
                window.renderFeed(activeContainer, currentFeedData);
            }
        }
    } catch (e) {
        console.error('Vote failed:', e);
    }
};

window.renderFeed = function(targetEl = feedContainer, data = currentFeedData) {
    if (!targetEl) return;
    
    if (data.length === 0) {
        targetEl.innerHTML = '<div class="text-center py-20 text-gray-400 font-bold">No posts found.</div>';
        return;
    }

    targetEl.innerHTML = data.map(post => {
        const reactions = post.reactions || {};
        const reactionCounts = Object.entries(reactions).map(([val, count]) => `
            <button onclick="event.stopPropagation(); vote('${post._id}', 'reaction', '${val}')" class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 rounded-full transition-colors">
                <span class="text-xs">${val}</span>
                <span class="text-[10px] font-bold text-gray-500">${count}</span>
            </button>
        `).join('');

        return `
        <div class="card p-6 mb-6 scale-sm hover:translate-y-[-2px] transition-all cursor-pointer" onclick="openComments('${post._id}')">
            <div class="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <div class="w-1.5 h-1.5 rounded-full bg-gray-300"></div>${post.type || 'deep'}
            </div>
            
            ${post.imageUrl ? `
                <div class="mb-4 rounded-2xl overflow-hidden border border-gray-100">
                    <img src="${post.imageUrl}" class="w-full h-auto max-h-80 object-cover" loading="lazy">
                </div>
            ` : ''}

            <div class="relative">
                ${formatPassage(post.text, post._id, post.blurred && userSettings.revealEnabled)}
                ${(post.blurred && userSettings.revealEnabled) ? `<button onclick="event.stopPropagation(); reveal('${post._id}')" id="btn-${post._id}" class="absolute inset-0 flex items-center justify-center"><span class="bg-white px-4 py-2 rounded-full text-xs font-bold text-blue-600 shadow-sm">Tap to reveal</span></button>` : ''}
            </div>

            <!-- Reactions Row -->
            <div class="flex flex-wrap gap-2 mt-6">
                <button onclick="event.stopPropagation(); vote('${post._id}', 'like')" class="flex items-center gap-2 group ${post.userVote === 'like' ? 'text-blue-600' : 'text-gray-400'} font-bold">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${post.userVote === 'like' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12M2 10.5a2 2 0 0 1 2-2h3v12H4a2 2 0 0 1-2-2v-8zM7 8.5c0-1.5 1-3 3-3s2.5 1.5 2.5 3v2h5a2 2 0 0 1 2 2v2a6 6 0 0 1-2 5h-7.5"/></svg>
                    </div>
                    <span class="text-xs">${post.likes || 0}</span>
                </button>
                <button onclick="event.stopPropagation(); vote('${post._id}', 'dislike')" class="flex items-center gap-2 group ${post.userVote === 'dislike' ? 'text-red-600' : 'text-gray-400'} font-bold">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${post.userVote === 'dislike' ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transform rotate-180 translate-y-[2px]"><path d="M7 10v12M2 10.5a2 2 0 0 1 2-2h3v12H4a2 2 0 0 1-2-2v-8zM7 8.5c0-1.5 1-3 3-3s2.5 1.5 2.5 3v2h5a2 2 0 0 1 2 2v2a6 6 0 0 1-2 5h-7.5"/></svg>
                    </div>
                    <span class="text-xs">${post.dislikes || 0}</span>
                </button>
                
                ${reactionCounts}

                <button onclick="event.stopPropagation(); window.promptReaction('${post._id}')" class="w-10 h-10 rounded-full border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 hover:text-blue-500 hover:border-blue-200 transition-all">
                    <span class="text-xl">+</span>
                </button>

                <div class="flex items-center gap-2 ml-auto text-gray-400 font-bold">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span class="text-xs">${(post.comments || []).length}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');

    if (!isFeedEnd && data.length >= 10) {
        targetEl.insertAdjacentHTML('beforeend', `
            <button id="loadMoreBtn" onclick="loadMore()" class="w-full py-4 mt-4 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors border-2 border-dashed border-gray-100 rounded-2xl">
                Load More Discoveries...
            </button>
        `);
    }
};

window.promptReaction = function(id) {
    const val = prompt("Enter an emoji or short reaction:");
    if (val && val.length > 0 && val.length < 10) {
        window.vote(id, 'reaction', val.trim());
    }
};

window.reveal = function(id) {
    const txt = document.getElementById(`txt-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    if (txt && btn) {
        txt.classList.remove('blur-overlay', 'select-none');
        btn.remove();
    }
};


window.openComments = function(postId) {
    currentPostId = postId;
    const post = currentFeedData.find(p => p._id === postId);
    if (!post) return;
    
    let commentsToRender = [];
    if (post.comments) {
        commentsToRender = [...post.comments];
        if (currentCommentSort === 'newest') {
            commentsToRender.sort((a, b) => b._id.localeCompare(a._id));
        } else {
            commentsToRender.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
        }
    }
    
    const list = document.getElementById('commentList');
    list.innerHTML = commentsToRender.length ? commentsToRender.map(c => `
        <div class="comment-item flex justify-between items-start">
            <div class="pr-4">
                <p class="text-[10px] font-bold text-gray-400 mb-1">Anonymous &middot; ${c.timeAgo || 'Just now'}</p>
                <p class="text-sm text-gray-800">${escapeHTML(c.text)}</p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
                <button onclick="likeComment('${postId}', '${c._id}', true)" class="flex items-center gap-1.5 text-gray-400 hover:text-blue-500 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12M2 10.5a2 2 0 0 1 2-2h3v12H4a2 2 0 0 1-2-2v-8zM7 8.5c0-1.5 1-3 3-3s2.5 1.5 2.5 3v2h5a2 2 0 0 1 2 2v2a6 6 0 0 1-2 5h-7.5"/></svg>
                    <span class="text-[10px] font-bold">${c.likes || 0}</span>
                </button>
                <button onclick="likeComment('${postId}', '${c._id}', false)" class="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transform rotate-180 translate-y-[2px]"><path d="M7 10v12M2 10.5a2 2 0 0 1 2-2h3v12H4a2 2 0 0 1-2-2v-8zM7 8.5c0-1.5 1-3 3-3s2.5 1.5 2.5 3v2h5a2 2 0 0 1 2 2v2a6 6 0 0 1-2 5h-7.5"/></svg>
                    <span class="text-[10px] font-bold">${c.dislikes || 0}</span>
                </button>
            </div>
        </div>
    `).join('') : '<p class="text-center py-10 text-gray-300 text-sm">No comments yet. Be the first!</p>';
    
    window.toggleDrawer('commentDrawer', true);
};

window.setCommentSort = function(mode) {
    currentCommentSort = mode;
    const btnTop = document.getElementById('sortTopBtn');
    const btnNewest = document.getElementById('sortNewestBtn');
    
    if (btnTop && btnNewest) {
        if (mode === 'top') {
            btnTop.className = 'px-3 py-1 text-xs font-bold bg-white text-gray-900 shadow-sm rounded-md transition-all';
            btnNewest.className = 'px-3 py-1 text-xs font-bold text-gray-500 rounded-md transition-all';
        } else {
            btnNewest.className = 'px-3 py-1 text-xs font-bold bg-white text-gray-900 shadow-sm rounded-md transition-all';
            btnTop.className = 'px-3 py-1 text-xs font-bold text-gray-500 rounded-md transition-all';
        }
    }
    
    if (currentPostId) {
        window.openComments(currentPostId);
    }
};

window.submitComment = async function() {
    const input = document.getElementById('commentInput');
    if (!input.value.trim()) return;
    
    try {
        const postIndex = currentFeedData.findIndex(p => p._id === currentPostId);
        const data = await API.addComment(currentPostId, input.value);
        if (postIndex > -1 && data.data) {
            currentFeedData[postIndex] = data.data;
        }
        input.value = '';
        window.openComments(currentPostId);
        
        // Target specifically whatever container is active 
        const activeContainer = document.getElementById('feed') || document.getElementById('exploreFeed');
        window.renderFeed(activeContainer, currentFeedData);
    } catch(e) {}
};

window.likeComment = async function(pid, cid, isLike) {
    try {
        await API.voteComment(pid, cid, isLike, myDeviceId);
        const postIndex = currentFeedData.findIndex(p => p._id === pid);
        const post = currentFeedData[postIndex];
        const comm = post.comments.find(c => c._id === cid);
        // Toggle logic optimization: local state will refresh via openComments
        window.openComments(pid);
    } catch(e){}
};

window.addPost = async function() {
    const val = confessionInput.value;
    const type = val.toLowerCase().includes('love') ? 'deep' : (val.length > 100 ? 'secret' : 'funny');
    const blurred = val.length > 40; // Simplified threshold
    const postBtn = document.getElementById('postBtn');
    
    postBtn.textContent = 'Wait...';
    postBtn.disabled = true;

    try {
        let imageUrl = '';
        if (selectedFile) {
            postBtn.textContent = 'Uploading...';
            const uploadRes = await API.uploadImage(selectedFile);
            if (uploadRes.status === 'success') {
                imageUrl = uploadRes.data.imageUrl;
            }
        }

        postBtn.textContent = 'Posting...';
        const payload = await API.addPost(val, type, blurred, imageUrl);
        
        if (payload?.status === 'success') {
            const myId = payload.data.id || payload.data._id;
            const myPosts = JSON.parse(localStorage.getItem('myConfessions') || '[]');
            myPosts.push(myId);
            localStorage.setItem('myConfessions', JSON.stringify(myPosts));

            window.toggleDrawer('composeModal', false);
            confessionInput.value = '';
            window.clearImage();
            if (document.getElementById('feed')) await window.loadFeed(currentCategory);
        } else {
            alert(payload.message || "Failed to post");
        }
    } catch(e) {
        console.error(e);
        alert("Something went wrong");
    } finally {
        postBtn.textContent = 'Post';
        postBtn.disabled = false;
    }
};

window.doSearch = async function(query) {
    const feed = document.getElementById('exploreFeed');
    if (!feed) return;
    if (!query.trim()) {
        feed.innerHTML = '<p class="text-center py-10 text-gray-400 font-bold">Search any secret...</p>';
        return;
    }
    feed.innerHTML = '<p class="text-center py-10 text-gray-400 font-bold">Searching...</p>';
    currentFeedData = await API.searchPosts(query);
    window.renderFeed(feed, currentFeedData);
};

window.loadHearts = async function() {
    const feed = document.getElementById('heartsFeed');
    if (!feed) return;
    
    const myPosts = JSON.parse(localStorage.getItem('myConfessions') || '[]');
    if (myPosts.length === 0) {
        feed.innerHTML = '<p class="text-center py-10 text-gray-400 font-bold">No activity yet. Create a post first!</p>';
        return;
    }

    feed.innerHTML = '<p class="text-center py-10 text-gray-400 font-bold">Loading activity...</p>';
    currentFeedData = await API.getActivity(myPosts);
    window.renderFeed(feed, currentFeedData);
}

const quotes = ["Be honest here.", "Secrets are lighter when shared.", "You aren't alone.", "Nobody knows it's you."];
setInterval(() => {
    const q = document.getElementById('quote');
    if (q) {
        q.style.opacity = 0;
        setTimeout(() => { q.innerText = quotes[Math.floor(Math.random() * quotes.length)]; q.style.opacity = 1; }, 500);
    }
}, 5000);

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

if (categoryBtns) {
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.hasAttribute('onclick')) return; // handled manually
            categoryBtns.forEach(b => {
                b.classList.remove('bg-black', 'text-white');
                b.classList.add('bg-white', 'text-gray-500');
            });
            btn.classList.add('bg-black', 'text-white');
            btn.classList.remove('bg-white', 'text-gray-500');
            window.loadFeed(btn.dataset.filter);
        });
    });
}

// Bootstrap routes
if (document.getElementById('feed')) window.loadFeed('');
if (document.getElementById('heartsFeed')) window.loadHearts();
window.initSettings();
