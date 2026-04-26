/**
 * 更新日志页面交互脚本
 * 作者: HealthJian
 * 日期: 2025-05-19
 * 描述: 为更新日志页面提供交互增强功能
 */

// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 创建滚动到顶部按钮
  const scrollTopBtn = document.createElement('div');
  scrollTopBtn.className = 'scroll-top';
  scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(scrollTopBtn);
  
  // 监听滚动事件
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });
  
  // 点击事件
  scrollTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // 为时间线项添加鼠标悬停效果
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => {
    // 添加鼠标进入动画
    item.addEventListener('mouseenter', function() {
      this.style.transition = 'transform 0.3s ease';
      this.style.transform = 'translateX(5px)';
    });
    
    // 添加鼠标离开动画
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
    });
  });

  // 为每条日志添加“阅览详情/收回内容”开关
  initTimelineDetailsToggle();
  
  // 为标题添加打字机效果
  const title = document.querySelector('.changelog-header h1');
  if (title) {
    const text = title.textContent;
    title.textContent = '';
    let i = 0;
    
    function typeWriter() {
      if (i < text.length) {
        title.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 80);
      }
    }
    
    // 延迟启动打字效果
    setTimeout(typeWriter, 500);
  }
});

function getCurrentLangForTimeline() {
  return document.body.classList.contains('en') ? 'en' : 'zh';
}

function getTimelineToggleLabel(isExpanded, lang) {
  if (lang === 'en') {
    return isExpanded ? 'Collapse' : 'View Details';
  }
  return isExpanded ? '收回内容' : '阅览详情';
}

function initTimelineDetailsToggle() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (!timelineItems.length) return;

  timelineItems.forEach((item, index) => {
    const content = item.querySelector('.timeline-content');
    const list = content ? content.querySelector('ul') : null;
    if (!content || !list) return;

    // 避免重复初始化
    if (content.querySelector('.timeline-toggle-btn')) return;

    const details = document.createElement('div');
    details.className = 'timeline-details is-collapsed';
    details.id = `timeline-details-${index}`;
    details.appendChild(list);
    content.appendChild(details);

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'timeline-toggle-btn';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', details.id);

    const textSpan = document.createElement('span');
    textSpan.className = 'timeline-toggle-text';
    const icon = document.createElement('i');
    icon.className = 'fas fa-chevron-down';

    toggleBtn.appendChild(textSpan);
    toggleBtn.appendChild(icon);
    content.appendChild(toggleBtn);

    function syncToggleLabel() {
      const isExpanded = details.classList.contains('is-expanded');
      const lang = getCurrentLangForTimeline();
      textSpan.textContent = getTimelineToggleLabel(isExpanded, lang);
      icon.className = isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
      toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }

    toggleBtn.addEventListener('click', function() {
      const isExpanded = details.classList.contains('is-expanded');
      details.classList.toggle('is-expanded', !isExpanded);
      details.classList.toggle('is-collapsed', isExpanded);
      syncToggleLabel();
    });

    // 默认收起（显示摘要）
    details.classList.add('is-collapsed');
    syncToggleLabel();
    item._syncTimelineToggleLabel = syncToggleLabel;
  });

  // 监听语言切换（body class 变化）后刷新按钮文案
  const langObserver = new MutationObserver(() => {
    timelineItems.forEach(item => {
      if (typeof item._syncTimelineToggleLabel === 'function') {
        item._syncTimelineToggleLabel();
      }
    });
  });

  langObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
}

// 根据页面滚动位置添加淡入效果
window.addEventListener('scroll', function() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  const windowHeight = window.innerHeight;
  
  timelineItems.forEach(item => {
    const itemPosition = item.getBoundingClientRect().top;
    
    // 当元素即将进入视口时添加显示效果
    if (itemPosition < windowHeight - 100) {
      item.classList.add('show');
    }
  });
});

// 时间大事轴功能
(function() {
  // 确保在DOM加载完成后执行
  function initMilestoneTimeline() {
    const timelineContainer = document.getElementById('milestoneTimeline');
    if (!timelineContainer) {
      console.warn('Milestone timeline container not found');
      return;
    }

    // 从现有时间线提取数据
    const timelineItems = document.querySelectorAll('.timeline-item');
    console.log('Found timeline items:', timelineItems.length);
    
    if (timelineItems.length === 0) {
      console.warn('No timeline items found');
      timelineContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-color); opacity: 0.6;" data-en="No data available" data-zh="暂无数据">暂无数据</div>';
      return;
    }
    
    const milestones = [];

  timelineItems.forEach((item, index) => {
    const date = item.querySelector('.timeline-date')?.textContent.trim() || '';
    const titleEl = item.querySelector('.timeline-content h2');
    const titleZh = titleEl?.getAttribute('data-zh') || titleEl?.textContent.trim() || '';
    const titleEn = titleEl?.getAttribute('data-en') || titleZh;
    
    const listItems = item.querySelectorAll('.timeline-content li');
    const descriptions = [];
    // 只取前3条作为描述，避免内容过长
    const maxDesc = 3;
    listItems.forEach((li, idx) => {
      if (idx < maxDesc) {
        const descZh = li.getAttribute('data-zh') || li.textContent.trim();
        const descEn = li.getAttribute('data-en') || descZh;
        // 清理描述文本，移除开头的空格和特殊字符
        const cleanDescZh = descZh.replace(/^[\s•\-\*]+/, '').trim();
        const cleanDescEn = descEn.replace(/^[\s•\-\*]+/, '').trim();
        descriptions.push({ zh: cleanDescZh, en: cleanDescEn });
      }
    });

    // 提取关键标签（从标题中提取版本号等）
    const tags = [];
    const titleText = titleZh + ' ' + titleEn;
    
    // 版本号
    const versionMatch = titleZh.match(/版本\s*([\d.]+)/) || titleEn.match(/Version\s*([\d.]+)/i);
    if (versionMatch) {
      tags.push({ zh: `v${versionMatch[1]}`, en: `v${versionMatch[1]}` });
    }
    
    // 功能标签
    if (titleText.includes('LaTeX') || titleText.includes('数学')) {
      tags.push({ zh: 'LaTeX', en: 'LaTeX' });
    }
    if (titleText.includes('Markdown') || titleText.includes('博客系统')) {
      tags.push({ zh: 'Markdown', en: 'Markdown' });
    }
    if (titleText.includes('Gallery') || titleText.includes('画廊') || titleText.includes('图集')) {
      tags.push({ zh: '图集', en: 'Gallery' });
    }
    if (titleText.includes('Data') || titleText.includes('数据')) {
      tags.push({ zh: '数据', en: 'Data' });
    }
    if (titleText.includes('Demo') || titleText.includes('演示')) {
      tags.push({ zh: 'Demo', en: 'Demo' });
    }
    if (titleText.includes('UI') || titleText.includes('界面')) {
      tags.push({ zh: 'UI', en: 'UI' });
    }
    if (titleText.includes('Bug') || titleText.includes('错误') || titleText.includes('修复')) {
      tags.push({ zh: '修复', en: 'Fix' });
    }
    if (titleText.includes('Beta') || titleText.includes('测试')) {
      tags.push({ zh: '测试', en: 'Beta' });
    }

    // 合并描述文本（最多3条，用分隔符连接）
    let combinedDesc = { zh: '', en: '' };
    if (descriptions.length > 0) {
      combinedDesc.zh = descriptions.map(d => d.zh).filter(d => d).join(' · ');
      combinedDesc.en = descriptions.map(d => d.en).filter(d => d).join(' · ');
      // 如果合并后太长，只取第一条
      if (combinedDesc.zh.length > 150) {
        combinedDesc.zh = descriptions[0].zh || '';
        combinedDesc.en = descriptions[0].en || '';
      }
    }

    milestones.push({
      date,
      title: { zh: titleZh, en: titleEn },
      description: combinedDesc,
      tags,
      index
    });
  });

  // 生成时间轴节点
  function renderMilestones() {
    const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
    timelineContainer.innerHTML = '';

    milestones.forEach((milestone, index) => {
      const milestoneEl = document.createElement('div');
      milestoneEl.className = 'milestone-item';
      milestoneEl.setAttribute('data-index', index);

      const dateEl = document.createElement('div');
      dateEl.className = 'milestone-date';
      dateEl.textContent = milestone.date;

      const titleEl = document.createElement('div');
      titleEl.className = 'milestone-title';
      titleEl.setAttribute('data-zh', milestone.title.zh);
      titleEl.setAttribute('data-en', milestone.title.en);
      titleEl.textContent = milestone.title[currentLang];

      const descEl = document.createElement('div');
      descEl.className = 'milestone-description';
      const descText = milestone.description[currentLang] || milestone.description.zh || milestone.description.en || '';
      descEl.setAttribute('data-zh', milestone.description.zh || '');
      descEl.setAttribute('data-en', milestone.description.en || '');
      descEl.textContent = descText;

      const tagsEl = document.createElement('div');
      tagsEl.className = 'milestone-tags';
      milestone.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'milestone-tag';
        tagEl.setAttribute('data-zh', tag.zh);
        tagEl.setAttribute('data-en', tag.en);
        tagEl.textContent = tag[currentLang];
        tagsEl.appendChild(tagEl);
      });

      milestoneEl.appendChild(dateEl);
      milestoneEl.appendChild(titleEl);
      milestoneEl.appendChild(descEl);
      if (milestone.tags.length > 0) {
        milestoneEl.appendChild(tagsEl);
      }

      // 添加连接线（除了最后一个）
      if (index < milestones.length - 1) {
        const connector = document.createElement('div');
        connector.className = 'milestone-connector';
        milestoneEl.appendChild(connector);
      }

      timelineContainer.appendChild(milestoneEl);
    });

    // 添加淡入动画
    const items = timelineContainer.querySelectorAll('.milestone-item');
    items.forEach((item, idx) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, idx * 100);
    });
  }

  // 初始化渲染
  console.log('Rendering milestones:', milestones.length);
  if (milestones.length > 0) {
    renderMilestones();
  } else {
    console.warn('No milestones to render');
    timelineContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-color); opacity: 0.6;" data-en="No milestones available" data-zh="暂无里程碑数据">暂无里程碑数据</div>';
  }

  // 监听语言切换 - 使用MutationObserver监听body类变化
  const observer = new MutationObserver(() => {
    const currentLang = document.body.classList.contains('en') ? 'en' : 'zh';
    const items = timelineContainer.querySelectorAll('.milestone-item');
    items.forEach(item => {
      const titleEl = item.querySelector('.milestone-title');
      const descEl = item.querySelector('.milestone-description');
      const tagEls = item.querySelectorAll('.milestone-tag');
      
      if (titleEl) {
        titleEl.textContent = titleEl.getAttribute(`data-${currentLang}`) || titleEl.getAttribute('data-zh');
      }
      if (descEl) {
        descEl.textContent = descEl.getAttribute(`data-${currentLang}`) || descEl.getAttribute('data-zh');
      }
      tagEls.forEach(tagEl => {
        tagEl.textContent = tagEl.getAttribute(`data-${currentLang}`) || tagEl.getAttribute('data-zh');
      });
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });

  // 滑动功能
  let isDown = false;
  let startX;
  let scrollLeft;

  timelineContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    timelineContainer.style.cursor = 'grabbing';
    startX = e.pageX - timelineContainer.offsetLeft;
    scrollLeft = timelineContainer.scrollLeft;
  });

  timelineContainer.addEventListener('mouseleave', () => {
    isDown = false;
    timelineContainer.style.cursor = 'grab';
  });

  timelineContainer.addEventListener('mouseup', () => {
    isDown = false;
    timelineContainer.style.cursor = 'grab';
  });

  timelineContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - timelineContainer.offsetLeft;
    const walk = (x - startX) * 2;
    timelineContainer.scrollLeft = scrollLeft - walk;
  });

  // 触摸滑动支持
  let touchStartX = 0;
  let touchScrollLeft = 0;

  timelineContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].pageX - timelineContainer.offsetLeft;
    touchScrollLeft = timelineContainer.scrollLeft;
  });

  timelineContainer.addEventListener('touchmove', (e) => {
    if (!touchStartX) return;
    const x = e.touches[0].pageX - timelineContainer.offsetLeft;
    const walk = (x - touchStartX) * 2;
    timelineContainer.scrollLeft = touchScrollLeft - walk;
  });

  // 导航按钮
  const prevBtn = document.getElementById('milestonePrev');
  const nextBtn = document.getElementById('milestoneNext');

  function updateNavButtons() {
    const container = timelineContainer;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (prevBtn) {
      prevBtn.disabled = container.scrollLeft <= 0;
    }
    if (nextBtn) {
      nextBtn.disabled = container.scrollLeft >= maxScroll - 10;
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      timelineContainer.scrollBy({
        left: -350,
        behavior: 'smooth'
      });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      timelineContainer.scrollBy({
        left: 350,
        behavior: 'smooth'
      });
    });
  }

  timelineContainer.addEventListener('scroll', updateNavButtons);
  updateNavButtons();

  // 监听窗口大小变化
  window.addEventListener('resize', updateNavButtons);
  }

  // 如果DOM已加载，立即执行；否则等待DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMilestoneTimeline);
  } else {
    // DOM已加载，立即执行
    initMilestoneTimeline();
  }
})();

// ========== 月度归档分组 ==========
(function() {
  function initArchiveGroups() {
    const timeline = document.querySelector('.changelog-timeline');
    if (!timeline) return;
    const items = Array.from(timeline.querySelectorAll(':scope > .timeline-item'));
    if (!items.length) return;

    const MONTH_NAMES_ZH = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const MONTH_NAMES_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const groups = new Map();
    items.forEach(item => {
      const dateText = item.querySelector('.timeline-date')?.textContent.trim() || '';
      const match = dateText.match(/^(\d{4})-(\d{2})/);
      const key = match ? `${match[1]}-${match[2]}` : 'other';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });

    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

    groups.forEach((groupItems, key) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'archive-group';
      wrapper.setAttribute('data-ym', key);

      const header = document.createElement('div');
      header.className = 'archive-group-header';

      const toggle = document.createElement('span');
      toggle.className = 'archive-group-toggle';
      toggle.innerHTML = '<i class="fas fa-chevron-down"></i>';

      const label = document.createElement('span');
      label.className = 'archive-group-label';
      const [y, m] = key.split('-');
      const mi = parseInt(m, 10) - 1;
      label.setAttribute('data-zh', `${y} 年 ${MONTH_NAMES_ZH[mi]}`);
      label.setAttribute('data-en', `${MONTH_NAMES_EN[mi]} ${y}`);
      const lang = getCurrentLangForTimeline();
      label.textContent = lang === 'en' ? `${MONTH_NAMES_EN[mi]} ${y}` : `${y} 年 ${MONTH_NAMES_ZH[mi]}`;

      const count = document.createElement('span');
      count.className = 'archive-group-count';
      const countZh = `${groupItems.length} 条`;
      const countEn = `${groupItems.length} entries`;
      count.setAttribute('data-zh', countZh);
      count.setAttribute('data-en', countEn);
      count.textContent = lang === 'en' ? countEn : countZh;

      header.appendChild(toggle);
      header.appendChild(label);
      header.appendChild(count);

      const body = document.createElement('div');
      body.className = 'archive-group-items';

      const firstItem = groupItems[0];
      timeline.insertBefore(wrapper, firstItem);
      wrapper.appendChild(header);
      wrapper.appendChild(body);
      groupItems.forEach(it => body.appendChild(it));

      const shouldCollapse = key < currentYM;
      if (shouldCollapse) {
        header.classList.add('collapsed');
        body.classList.add('collapsed');
        body.style.maxHeight = '0px';
      } else {
        body.style.maxHeight = body.scrollHeight + 'px';
      }

      header.addEventListener('click', () => {
        const isCollapsed = header.classList.contains('collapsed');
        if (isCollapsed) {
          header.classList.remove('collapsed');
          body.classList.remove('collapsed');
          body.style.maxHeight = body.scrollHeight + 'px';
        } else {
          header.classList.add('collapsed');
          body.style.maxHeight = body.scrollHeight + 'px';
          requestAnimationFrame(() => {
            body.style.maxHeight = '0px';
            body.classList.add('collapsed');
          });
        }
      });
    });

    const langObs = new MutationObserver(() => {
      const lang = getCurrentLangForTimeline();
      timeline.querySelectorAll('.archive-group-label').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`) || el.getAttribute('data-zh');
      });
      timeline.querySelectorAll('.archive-group-count').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`) || el.getAttribute('data-zh');
      });
    });
    langObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArchiveGroups);
  } else {
    initArchiveGroups();
  }
})();

// ========== 全文搜索 ==========
(function() {
  function initChangelogSearch() {
    const input = document.getElementById('changelogSearch');
    const clearBtn = document.getElementById('changelogSearchClear');
    const statsEl = document.getElementById('changelogSearchStats');
    const countEl = document.getElementById('changelogSearchCount');
    if (!input) return;

    let debounceTimer = null;

    function getSearchableText(item) {
      const lang = getCurrentLangForTimeline();
      const dateText = item.querySelector('.timeline-date')?.textContent || '';
      const h2 = item.querySelector('.timeline-content h2');
      const title = (h2?.getAttribute(`data-${lang}`) || h2?.textContent || '').toLowerCase();
      const lis = item.querySelectorAll('.timeline-content li');
      let liText = '';
      lis.forEach(li => {
        liText += ' ' + (li.getAttribute(`data-${lang}`) || li.textContent || '').toLowerCase();
      });
      return (dateText + ' ' + title + liText).toLowerCase();
    }

    function escapeRegExp(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightText(node, regex) {
      if (node.nodeType === 3) {
        const text = node.textContent;
        if (!regex.test(text)) return;
        const frag = document.createDocumentFragment();
        let lastIdx = 0;
        text.replace(regex, (match, offset) => {
          if (offset > lastIdx) frag.appendChild(document.createTextNode(text.slice(lastIdx, offset)));
          const mark = document.createElement('mark');
          mark.className = 'changelog-highlight';
          mark.textContent = match;
          frag.appendChild(mark);
          lastIdx = offset + match.length;
        });
        if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'MARK') {
        Array.from(node.childNodes).forEach(child => highlightText(child, regex));
      }
    }

    function clearHighlights() {
      document.querySelectorAll('.changelog-highlight').forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      });
    }

    function doSearch() {
      const keyword = input.value.trim();
      clearHighlights();
      const allItems = document.querySelectorAll('.changelog-timeline .timeline-item');
      const allGroups = document.querySelectorAll('.changelog-timeline .archive-group');

      if (!keyword) {
        clearBtn.style.display = 'none';
        statsEl.style.display = 'none';
        allItems.forEach(it => it.classList.remove('search-hidden'));
        allGroups.forEach(g => g.classList.remove('search-hidden'));
        return;
      }

      clearBtn.style.display = '';
      const lowerKw = keyword.toLowerCase();
      const regex = new RegExp(escapeRegExp(keyword), 'gi');
      let matchCount = 0;

      allItems.forEach(item => {
        const text = getSearchableText(item);
        if (text.includes(lowerKw)) {
          item.classList.remove('search-hidden');
          matchCount++;
          const content = item.querySelector('.timeline-content');
          if (content) highlightText(content, regex);
          const dateEl = item.querySelector('.timeline-date');
          if (dateEl) highlightText(dateEl, regex);
          const details = item.querySelector('.timeline-details');
          if (details && details.classList.contains('is-collapsed')) {
            details.classList.remove('is-collapsed');
            details.classList.add('is-expanded');
            if (typeof item._syncTimelineToggleLabel === 'function') item._syncTimelineToggleLabel();
          }
        } else {
          item.classList.add('search-hidden');
        }
      });

      allGroups.forEach(group => {
        const visibleItems = group.querySelectorAll('.timeline-item:not(.search-hidden)');
        if (visibleItems.length === 0) {
          group.classList.add('search-hidden');
        } else {
          group.classList.remove('search-hidden');
          const header = group.querySelector('.archive-group-header');
          const body = group.querySelector('.archive-group-items');
          if (header && header.classList.contains('collapsed')) {
            header.classList.remove('collapsed');
            body.classList.remove('collapsed');
            body.style.maxHeight = body.scrollHeight + 'px';
          }
        }
      });

      const lang = getCurrentLangForTimeline();
      if (lang === 'en') {
        countEl.textContent = `Found ${matchCount} result${matchCount !== 1 ? 's' : ''}`;
      } else {
        countEl.textContent = `找到 ${matchCount} 条匹配结果`;
      }
      statsEl.style.display = matchCount >= 0 ? '' : 'none';
    }

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(doSearch, 250);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      doSearch();
      input.focus();
    });

    const langObs = new MutationObserver(() => {
      const lang = getCurrentLangForTimeline();
      input.placeholder = lang === 'en'
        ? input.getAttribute('data-placeholder-en')
        : input.getAttribute('data-placeholder-zh');
      if (input.value.trim()) doSearch();
    });
    langObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChangelogSearch);
  } else {
    initChangelogSearch();
  }
})();

// ========== Giscus 主题 & 语言同步 ==========
(function() {
  function getGiscusTheme() {
    return document.body.classList.contains('dark-mode') ? 'dark_dimmed' : 'light';
  }

  function getGiscusLang() {
    return getCurrentLangForTimeline() === 'en' ? 'en' : 'zh-CN';
  }

  function sendGiscusMessage(msg) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe) return;
    iframe.contentWindow.postMessage({ giscus: msg }, 'https://giscus.app');
  }

  function syncGiscusTheme() {
    sendGiscusMessage({ setConfig: { theme: getGiscusTheme() } });
  }

  function syncGiscusLang() {
    sendGiscusMessage({ setConfig: { lang: getGiscusLang() } });
  }

  function initGiscusSync() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        setTimeout(syncGiscusTheme, 100);
      });
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          syncGiscusTheme();
          syncGiscusLang();
          break;
        }
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('message', (e) => {
      if (e.origin !== 'https://giscus.app') return;
      if (!(typeof e.data === 'object' && e.data.giscus)) return;
      if (e.data.giscus.discussion) {
        syncGiscusTheme();
        syncGiscusLang();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGiscusSync);
  } else {
    initGiscusSync();
  }
})(); 