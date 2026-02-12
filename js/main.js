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
     * 简洁网易云音乐播放器
     * ======================================== */
    var musicToggle = document.getElementById('music-toggle-draggable');
    var musicIndicator = document.getElementById('music-indicator');
    var starsContainer = document.getElementById('stars-container');
    var neteaseMusicPlayer = document.getElementById('netease-music-player');

    // 可拖动功能
    var isDragging = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = 0;
    var yOffset = 0;

    if (musicToggle) {
      // 鼠标事件
      musicToggle.addEventListener('mousedown', dragStart);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);
      
      // 触摸事件
      musicToggle.addEventListener('touchstart', dragStart);
      document.addEventListener('touchmove', drag);
      document.addEventListener('touchend', dragEnd);

      // 双击打开网易云音乐
      musicToggle.addEventListener('dblclick', function() {
        window.open('//music.163.com/#/playlist?id=<%= theme.music.netease_playlist_id %>', '_blank');
      });
    }

    function dragStart(e) {
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === musicToggle) {
        isDragging = true;
        musicToggle.classList.add('dragging');
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;

      isDragging = false;
      if (musicToggle) {
        musicToggle.classList.remove('dragging');
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        
        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, musicToggle);
      }
    }

    function setTranslate(xPos, yPos, el) {
      el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }

    // 模拟音乐播放状态
    var isPlaying = false;
    setInterval(function() {
      if (musicIndicator) {
        isPlaying = !isPlaying;
        musicIndicator.classList.toggle('playing', isPlaying);
      }
    }, 3000);

    // 星星雪花效果
    function createStar() {
      var star = document.createElement('div');
      star.className = 'star';
      star.innerHTML = '✨';
      star.style.left = Math.random() * window.innerWidth + 'px';
      star.style.animationDuration = (Math.random() * 3 + 2) + 's';
      star.style.opacity = Math.random();
      
      starsContainer.appendChild(star);
      
      setTimeout(function() {
        star.remove();
      }, 5000);
    }

    function createSnowflake() {
      var snowflake = document.createElement('div');
      snowflake.className = 'snowflake';
      snowflake.innerHTML = '❄';
      snowflake.style.left = Math.random() * window.innerWidth + 'px';
      snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
      snowflake.style.opacity = Math.random();
      
      starsContainer.appendChild(snowflake);
      
      setTimeout(function() {
        snowflake.remove();
      }, 5000);
    }

    // 鼠标点击创建星星雪花效果
    document.addEventListener('click', function(e) {
      // 排除音乐按钮区域的点击
      if (musicToggle && musicToggle.contains(e.target)) {
        return;
      }
      
      // 随机创建星星或雪花
      if (Math.random() > 0.5) {
        createStar();
      } else {
        createSnowflake();
      }
      
      // 在点击位置创建小星星爆炸效果
      for (var i = 0; i < 5; i++) {
        setTimeout(function() {
          var miniStar = document.createElement('div');
          miniStar.className = 'star';
          miniStar.innerHTML = '⭐';
          miniStar.style.left = e.clientX + 'px';
          miniStar.style.top = e.clientY + 'px';
          miniStar.style.fontSize = '12px';
          miniStar.style.animationDuration = '1s';
          
          starsContainer.appendChild(miniStar);
          
          setTimeout(function() {
            miniStar.remove();
          }, 1000);
        }, i * 100);
      }
    });

    // 自动创建星星雪花
    setInterval(function() {
      if (Math.random() > 0.7) {
        createStar();
      } else {
        createSnowflake();
      }
    }, 3000);

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
