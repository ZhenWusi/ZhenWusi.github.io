/**
 * Flavor 主题 - 主脚本文件
 * 包含：导航栏、搜索、深色模式、回到顶部、音乐播放器等功能
 */

(function () {
  'use strict';

  /* ========================================
   * 页面加载完成后隐藏加载动画
   * ======================================== */
  window.addEventListener('load', function () {
    var mask = document.getElementById('loading-mask');
    if (mask) {
      mask.classList.add('loaded');
      // 动画结束后移除元素
      setTimeout(function () { mask.remove(); }, 500);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {

    /* ========================================
     * 导航栏滚动效果 - 滚动后变为实心背景
     * ======================================== */
    var header = document.getElementById('site-header');
    function updateHeader() {
      if (!header) return;
      if (window.scrollY > 80) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', updateHeader);
    updateHeader(); // 页面加载时立即检查

    /* ========================================
     * 移动端侧滑菜单
     * ======================================== */
    var menuToggle = document.getElementById('mobile-menu-toggle');
    var mobileMenu = document.getElementById('mobile-menu');
    var menuOverlay = document.getElementById('mobile-menu-overlay');

    function openMenu() {
      if (mobileMenu) mobileMenu.classList.add('active');
      if (menuOverlay) menuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // 禁止背景滚动
    }

    function closeMenu() {
      if (mobileMenu) mobileMenu.classList.remove('active');
      if (menuOverlay) menuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (menuToggle) menuToggle.addEventListener('click', openMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    /* ========================================
     * 搜索功能
     * ======================================== */
    var searchToggle = document.getElementById('search-toggle');
    var searchOverlay = document.getElementById('search-overlay');
    var searchClose = document.getElementById('search-close');
    var searchInput = document.getElementById('search-input');
    var searchResults = document.getElementById('search-results');
    var searchData = null; // 缓存搜索数据

    // 打开搜索弹窗
    function openSearch() {
      if (searchOverlay) {
        searchOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (searchInput) searchInput.focus();
        // 首次打开时加载搜索数据
        if (!searchData) loadSearchData();
      }
    }

    // 关闭搜索弹窗
    function closeSearch() {
      if (searchOverlay) {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.innerHTML = '';
      }
    }

    if (searchToggle) searchToggle.addEventListener('click', openSearch);
    if (searchClose) searchClose.addEventListener('click', closeSearch);
    // 点击遮罩关闭
    if (searchOverlay) {
      searchOverlay.addEventListener('click', function (e) {
        if (e.target === searchOverlay) closeSearch();
      });
    }
    // ESC 键关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeSearch();
        closeMenu();
      }
    });

    // 加载搜索索引数据（search.xml）
    function loadSearchData() {
      fetch('/search.xml')
        .then(function (res) { return res.text(); })
        .then(function (text) {
          var parser = new DOMParser();
          var xml = parser.parseFromString(text, 'text/xml');
          var entries = xml.querySelectorAll('entry');
          searchData = [];
          entries.forEach(function (entry) {
            searchData.push({
              title: entry.querySelector('title') ? entry.querySelector('title').textContent : '',
              url: entry.querySelector('url') ? entry.querySelector('url').textContent : '',
              content: entry.querySelector('content') ? entry.querySelector('content').textContent : ''
            });
          });
        })
        .catch(function () {
          searchData = [];
        });
    }

    // 实时搜索 - 用户输入时过滤结果
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        var query = this.value.trim().toLowerCase();
        if (!query || !searchData) {
          if (searchResults) searchResults.innerHTML = '';
          return;
        }
        var results = searchData.filter(function (item) {
          return item.title.toLowerCase().indexOf(query) !== -1 ||
                 item.content.toLowerCase().indexOf(query) !== -1;
        }).slice(0, 10); // 最多显示 10 条

        if (searchResults) {
          if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item"><h4>没有找到相关文章</h4></div>';
          } else {
            searchResults.innerHTML = results.map(function (item) {
              // 截取包含关键词的摘要
              var idx = item.content.toLowerCase().indexOf(query);
              var start = Math.max(0, idx - 30);
              var snippet = item.content.substring(start, start + 100).replace(/</g, '&lt;');
              return '<a href="' + item.url + '" class="search-result-item">' +
                     '<h4>' + item.title + '</h4>' +
                     '<p>' + snippet + '...</p></a>';
            }).join('');
          }
        }
      });
    }

    /* ========================================
     * 深色模式切换
     * ======================================== */
    var themeToggle = document.getElementById('theme-toggle');
    var savedTheme = localStorage.getItem('theme');

    // 初始化主题
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      updateThemeIcon('dark');
    }

    function updateThemeIcon(theme) {
      if (!themeToggle) return;
      var icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        if (next === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
      });
    }

    /* ========================================
     * 回到顶部按钮
     * ======================================== */
    var backToTop = document.getElementById('back-to-top');
    function updateBackToTop() {
      if (!backToTop) return;
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
    window.addEventListener('scroll', updateBackToTop);
    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ========================================
     * 简洁音乐播放器
     * ======================================== */
    var playBtn = document.getElementById('play-btn');
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    var modeBtn = document.getElementById('mode-btn');
    var lyricsBtn = document.getElementById('lyrics-btn');
    var lyricsPanel = document.getElementById('lyrics-panel');
    var lyricsClose = document.getElementById('lyrics-close');
    var songTitle = document.getElementById('song-title');
    var songArtist = document.getElementById('song-artist');
    var lyricsContent = document.getElementById('lyrics-content');

    // 歌曲数据
    var songs = [
      { title: "夜曲", artist: "周杰伦" },
      { title: "晴天", artist: "周杰伦" },
      { title: "七里香", artist: "周杰伦" },
      { title: "稻香", artist: "周杰伦" },
      { title: "青花瓷", artist: "周杰伦" },
      { title: "告白气球", artist: "周杰伦" }
    ];

    // 歌词数据
    var lyricsData = [
      "♪ 音乐播放中... ♪",
      "♪ 享受美好时光 ♪",
      "♪ 让音乐陪伴你我 ♪",
      "♪ 生活的美好瞬间 ♪",
      "♪ 在音乐中找到自己 ♪",
      "♪ 每一个音符都是故事 ♪",
      "♪ 让心灵得到治愈 ♪",
      "♪ 音乐是生活的调味剂 ♪"
    ];

    var currentSongIndex = 0;
    var isPlaying = false;
    var playMode = 'order'; // order, random, single
    var currentLyricIndex = 0;

    // 播放/暂停
    if (playBtn) {
      playBtn.addEventListener('click', function() {
        isPlaying = !isPlaying;
        updatePlayButton();
        if (isPlaying) {
          startLyricsAnimation();
        } else {
          stopLyricsAnimation();
        }
      });
    }

    // 上一首
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (playMode === 'random') {
          currentSongIndex = Math.floor(Math.random() * songs.length);
        } else {
          currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        }
        updateSongInfo();
      });
    }

    // 下一首
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (playMode === 'random') {
          currentSongIndex = Math.floor(Math.random() * songs.length);
        } else {
          currentSongIndex = (currentSongIndex + 1) % songs.length;
        }
        updateSongInfo();
      });
    }

    // 播放模式切换
    if (modeBtn) {
      modeBtn.addEventListener('click', function() {
        var modes = ['order', 'random', 'single'];
        var currentIndex = modes.indexOf(playMode);
        playMode = modes[(currentIndex + 1) % modes.length];
        updateModeButton();
      });
    }

    // 歌词面板
    if (lyricsBtn) {
      lyricsBtn.addEventListener('click', function() {
        lyricsPanel.classList.toggle('active');
      });
    }

    if (lyricsClose) {
      lyricsClose.addEventListener('click', function() {
        lyricsPanel.classList.remove('active');
      });
    }

    // 更新播放按钮
    function updatePlayButton() {
      if (playBtn) {
        var icon = playBtn.querySelector('i');
        if (isPlaying) {
          icon.className = 'fas fa-pause';
          playBtn.classList.add('playing');
        } else {
          icon.className = 'fas fa-play';
          playBtn.classList.remove('playing');
        }
      }
    }

    // 更新模式按钮
    function updateModeButton() {
      if (modeBtn) {
        var icon = modeBtn.querySelector('i');
        modeBtn.classList.remove('active');
        
        switch(playMode) {
          case 'order':
            icon.className = 'fas fa-list';
            break;
          case 'random':
            icon.className = 'fas fa-random';
            modeBtn.classList.add('active');
            break;
          case 'single':
            icon.className = 'fas fa-redo';
            break;
        }
      }
    }

    // 更新歌曲信息
    function updateSongInfo() {
      if (songTitle && songArtist) {
        var song = songs[currentSongIndex];
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
      }
    }

    // 歌词动画
    var lyricsInterval;
    function startLyricsAnimation() {
      stopLyricsAnimation();
      lyricsInterval = setInterval(function() {
        updateLyrics();
      }, 3000);
    }

    function stopLyricsAnimation() {
      if (lyricsInterval) {
        clearInterval(lyricsInterval);
      }
    }

    function updateLyrics() {
      if (lyricsContent) {
        currentLyricIndex = (currentLyricIndex + 1) % lyricsData.length;
        
        var lyricsHTML = '';
        for (var i = -1; i <= 1; i++) {
          var index = (currentLyricIndex + i + lyricsData.length) % lyricsData.length;
          var isActive = i === 0;
          lyricsHTML += '<div class="lyrics-line' + (isActive ? ' active' : '') + '">' + lyricsData[index] + '</div>';
        }
        
        lyricsContent.innerHTML = lyricsHTML;
        
        // 滚动到当前歌词
        var activeLine = lyricsContent.querySelector('.lyrics-line.active');
        if (activeLine) {
          activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    // 初始化
    updateSongInfo();
    updateModeButton();
    updateLyrics();

    /* ========================================
     * 文章目录（TOC）高亮跟随
     * ======================================== */
    var tocLinks = document.querySelectorAll('.toc-content a');
    if (tocLinks.length > 0) {
      var headings = [];
      tocLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href) {
          var id = decodeURIComponent(href.replace('#', ''));
          var heading = document.getElementById(id);
          if (heading) headings.push({ el: heading, link: link });
        }
      });

      // 滚动时高亮当前章节
      function updateTocHighlight() {
        var scrollPos = window.scrollY + 100;
        var current = null;
        headings.forEach(function (item) {
          if (item.el.offsetTop <= scrollPos) {
            current = item;
          }
        });
        tocLinks.forEach(function (l) { l.classList.remove('active'); });
        if (current) current.link.classList.add('active');
      }

      window.addEventListener('scroll', updateTocHighlight);
      updateTocHighlight();
    }

    /* ========================================
     * 图片懒加载 - 使用 IntersectionObserver
     * ======================================== */
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window && lazyImages.length > 0) {
      var imgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            imgObserver.unobserve(img);
          }
        });
      });
      lazyImages.forEach(function (img) { imgObserver.observe(img); });
    }

    /* ========================================
     * 外部链接自动新窗口打开
     * ======================================== */
    document.querySelectorAll('.markdown-body a').forEach(function (link) {
      if (link.hostname !== window.location.hostname) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    /* ========================================
     * 平滑滚动到锚点
     * ======================================== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href').substring(1);
        var target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          var top = target.offsetTop - 80;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

  }); // DOMContentLoaded 结束
})();
