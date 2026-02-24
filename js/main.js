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
     * 单独音乐播放器 - 无需额外JS
     * ======================================== */
    // APlayer 和 Meting 会自动处理所有功能
    // 包括真实歌词获取、播放控制等

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

    /* ========================================
     * 阅读进度条
     * ======================================== */
    var progressBar = document.querySelector('.reading-progress__bar');
    var postBody = document.getElementById('post-body');
    function updateProgress() {
      if (!progressBar || !postBody) return;
      var scrollTop = window.scrollY;
      var rect = postBody.getBoundingClientRect();
      var offsetTop = rect.top + scrollTop;
      var height = postBody.offsetHeight;
      var percent = 0;
      if (scrollTop > offsetTop) {
        percent = Math.min(1, (scrollTop - offsetTop) / (height - window.innerHeight + 120));
      }
      progressBar.style.width = (percent * 100) + '%';
    }
    window.addEventListener('scroll', updateProgress);
    updateProgress();

    /* ========================================
     * 代码块复制按钮 & Header
     * ======================================== */
    var codeBlocks = document.querySelectorAll('figure.highlight');

    function createCopyBtn(block) {
      var lang = 'code';
      block.className.split(' ').forEach(function (cls) {
        var c = cls.trim();
        if (c && c !== 'highlight' && c !== 'hljs') {
          lang = c;
        }
      });

      var header = document.createElement('div');
      header.className = 'code-header';

      var dots = document.createElement('span');
      dots.className = 'code-dots';
      dots.innerHTML =
        '<span class="code-dot code-dot-red"></span>' +
        '<span class="code-dot code-dot-yellow"></span>' +
        '<span class="code-dot code-dot-green"></span>';

      var langTag = document.createElement('span');
      langTag.className = 'code-lang';
      langTag.textContent = lang.toUpperCase();

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.innerHTML = '<i class="fas fa-copy"></i> 复制';

      btn.addEventListener('click', function () {
        var codeTd = block.querySelector('td.code');
        var raw = codeTd ? codeTd.innerText : block.innerText;
        var code = raw.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
        if (!code) return;

        function setCopied(state) {
          if (state) {
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
          } else {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fas fa-copy"></i> 复制';
          }
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(function () {
            setCopied(true);
            setTimeout(function () { setCopied(false); }, 2000);
          }).catch(function () {
            fallbackCopy(code, setCopied);
          });
        } else {
          fallbackCopy(code, setCopied);
        }
      });

      header.appendChild(dots);
      header.appendChild(langTag);
      header.appendChild(btn);
      block.insertBefore(header, block.firstChild);
    }

    function fallbackCopy(text, setCopied) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try { document.execCommand('copy'); setCopied(true); } catch (e) { /* ignore */ }
      document.body.removeChild(textarea);
      setTimeout(function () { setCopied(false); }, 2000);
    }

    if (codeBlocks.length) {
      codeBlocks.forEach(function (block) {
        if (!block.querySelector('.code-header')) {
          createCopyBtn(block);
        }
      });
    }

  }); // DOMContentLoaded 结束
})();
