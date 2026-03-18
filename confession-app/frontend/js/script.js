let currentPostId = null;
let currentFeedData = [];
let currentCategory = ''; 

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

window.loadFeed = async function(category = '') {
    currentCategory = category;
    if (feedContainer) feedContainer.innerHTML = '<div class="text-center py-10 text-gray-400 font-bold">Loading insights...</div>';
    
    currentFeedData = category === 'trending' 
                        ? await API.getTrending() 
                        : await API.getFeed(category);
    
    window.renderFeed();
};

window.renderFeed = function() {
    if (!feedContainer) return;
    
    if (currentFeedData.length === 0) {
        feedContainer.innerHTML = '<div class="text-center py-10 text-gray-400 font-bold">No posts found.</div>';
        return;
    }

    feedContainer.innerHTML = currentFeedData.map(post => `
        <div class="card card-${post.type || 'deep'} p-6">
            <div class="flex items-center gap-2 mb-3 text-[9px] font-black uppercase text-gray-400">
                <div class="w-1.5 h-1.5 rounded-full bg-gray-300"></div>${post.type || 'deep'}
            </div>
            <div class="relative">
                <p class="confession-text ${post.blurred ? 'blur-overlay select-none' : ''}" id="txt-${post._id}">${escapeHTML(post.text)}</p>
                ${post.blurred ? `<button onclick="reveal('${post._id}')" id="btn-${post._id}" class="absolute inset-0 flex items-center justify-center"><span class="bg-white px-4 py-2 rounded-full text-xs font-bold text-blue-600 shadow-sm">Tap to reveal</span></button>` : ''}
            </div>
            <div class="flex items-center gap-6 mt-6">
                <button class="flex items-center gap-1.5 text-gray-400" onclick="like('${post._id}', this)">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.7 0l-1.1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l1.1 1 8.7 8.7 8.8-8.7 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
                    <span class="text-xs font-bold">${post.likes}</span>
                </button>
                <button class="flex items-center gap-1.5 text-gray-400" onclick="openComments('${post._id}')">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span class="text-xs font-bold">${(post.comments || []).length}</span>
                </button>
            </div>
        </div>
    `).join('');
};

window.reveal = function(id) {
    const txt = document.getElementById(`txt-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    if (txt && btn) {
        txt.classList.remove('blur-overlay', 'select-none');
        btn.remove();
    }
};

window.like = async function(id, btnElement) {
    if (btnElement.classList.contains('text-red-500')) return;
    try {
        await API.likePost(id);
        const countSpan = btnElement.querySelector('span');
        countSpan.textContent = parseInt(countSpan.textContent) + 1;
        btnElement.classList.remove('text-gray-400');
        btnElement.classList.add('text-red-500');
    } catch(e) {}
};

window.openComments = function(postId) {
    currentPostId = postId;
    const post = currentFeedData.find(p => p._id === postId);
    if (!post) return;
    
    const list = document.getElementById('commentList');
    list.innerHTML = (post.comments && post.comments.length) ? post.comments.map(c => `
        <div class="comment-item flex justify-between items-start">
            <div class="pr-4">
                <p class="text-[10px] font-bold text-gray-400 mb-1">Anonymous &middot; ${c.timeAgo || 'Just now'}</p>
                <p class="text-sm text-gray-800">${escapeHTML(c.text)}</p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
                <button class="flex items-center gap-1 text-[10px] text-gray-400" onclick="likeComment('${postId}', '${c._id}', true)"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 10v12M2 10.5a2 2 0 0 1 2-2h3v12H4a2 2 0 0 1-2-2v-8zM7 8.5c0-1.5 1-3 3-3s2.5 1.5 2.5 3v2h5a2 2 0 0 1 2 2v2a6 6 0 0 1-2 5h-7.5"/></svg>${c.likes}</button>
                <button class="flex items-center gap-1 text-[10px] text-gray-400" onclick="likeComment('${postId}', '${c._id}', false)"><svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 14V2m5 7.5a2 2 0 0 0-2-2h-3v12h3a2 2 0 0 0 2-2v-8zM17 15.5c0 1.5-1 3-3 3s-2.5-1.5-2.5-3v-2h-5a2 2 0 0 0-2 2v2a6 6 0 0 0 2 5h7.5"/></svg>${c.dislikes}</button>
            </div>
        </div>
    `).join('') : '<p class="text-center py-10 text-gray-300 text-sm">No comments yet. Be the first!</p>';
    
    window.toggleDrawer('commentDrawer', true);
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
        window.renderFeed();
    } catch(e) {}
};

window.likeComment = async function(pid, cid, isLike) {
    try {
        await API.voteComment(pid, cid, isLike);
        const postIndex = currentFeedData.findIndex(p => p._id === pid);
        const post = currentFeedData[postIndex];
        const comm = post.comments.find(c => c._id === cid);
        if (isLike) comm.likes++; else comm.dislikes++;
        window.openComments(pid);
    } catch(e){}
};

window.addPost = async function() {
    const val = confessionInput.value;
    const type = val.toLowerCase().includes('love') ? 'deep' : (val.length > 100 ? 'secret' : 'funny');
    const blurred = val.length > 50;
    
    postBtn.textContent = 'Posting...';
    postBtn.disabled = true;

    try {
        await API.addPost(val, type, blurred);
        window.toggleDrawer('composeModal', false);
        confessionInput.value = '';
        await window.loadFeed(currentCategory);
    } catch(e) {
        alert("Failed to post");
    } finally {
        postBtn.textContent = 'Post';
    }
};

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

if (document.getElementById('feed')) {
    window.loadFeed('');
}
