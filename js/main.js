/**
 * 宝石之名 - 通用功能模块
 * 包含导航栏初始化、动画效果等通用功能
 */

// ============================================
// 页面加载完成后初始化
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMobileMenu();
    addPageAnimations();
});

// ============================================
// 导航栏功能
// ============================================
function initNavigation() {
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // 高亮当前页面链接
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ============================================
// 移动端菜单
// ============================================
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
        
        // 点击链接后关闭菜单
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}

// ============================================
// 页面动画
// ============================================
function addPageAnimations() {
    // 添加淡入动画到主要内容区域
    const sections = document.querySelectorAll('main section');
    sections.forEach((section, index) => {
        section.style.animationDelay = `${index * 0.1}s`;
        section.classList.add('fade-in-section');
    });
}

// ============================================
// localStorage 封装
// ============================================
const Storage = {
    // 存储答案
    saveAnswers: function(answers) {
        try {
            localStorage.setItem('gemQuiz_answers', JSON.stringify(answers));
        } catch (e) {
            console.warn('无法保存到localStorage:', e);
        }
    },
    
    // 获取答案
    getAnswers: function() {
        try {
            const data = localStorage.getItem('gemQuiz_answers');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.warn('无法从localStorage读取:', e);
            return {};
        }
    },
    
    // 清除答案
    clearAnswers: function() {
        try {
            localStorage.removeItem('gemQuiz_answers');
        } catch (e) {
            console.warn('无法清除localStorage:', e);
        }
    },
    
    // 清除所有测试数据
    clearAllData: function() {
        try {
            localStorage.removeItem('gemQuiz_answers');
            localStorage.removeItem('gemQuiz_result');
        } catch (e) {
            console.warn('无法清除localStorage:', e);
        }
    }
};

// ============================================
// 工具函数
// ============================================

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * 平滑滚动到元素
 * @param {string} elementSelector - 元素选择器
 * @param {number} offset - 偏移量
 */
function smoothScrollTo(elementSelector, offset = 80) {
    const element = document.querySelector(elementSelector);
    if (element) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    }
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success/error/warning/info)
 */
function showToast(message, type = 'info') {
    // 移除已存在的toast
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
    
    // 添加样式
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 8px;
        background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(99, 102, 241, 0.9)'};
        color: white;
        font-size: 14px;
        z-index: 10000;
        animation: fadeInDown 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // 自动消失
    setTimeout(() => {
        toast.style.animation = 'fadeOutUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 显示加载动画
 */
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = '<div class="loading-spinner"></div>';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    document.body.appendChild(loader);
}

/**
 * 隐藏加载动画
 */
function hideLoading() {
    const loader = document.querySelector('.loading-overlay');
    if (loader) {
        loader.remove();
    }
}

// ============================================
// 页面过渡动画
// ============================================
function goToPage(url) {
    document.body.style.opacity = '0';
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// ============================================
// 导出公共API
// ============================================
window.GemQuiz = {
    Storage: Storage,
    getUrlParam: getUrlParam,
    smoothScrollTo: smoothScrollTo,
    showToast: showToast,
    showLoading: showLoading,
    hideLoading: hideLoading,
    goToPage: goToPage
};
