// 追光 - 数据结构与示例数据

// 示例用户数据
const demoUser = {
    nickname: '姜宏锋',
    avatar: '👤',
    location: '舟山',
    annualGoal: '活到 92 岁，苗条 3kg',
    currentWeight: 78.75,
    targetWeight: 75.75,
    totalDonation: 500
};

// 示例打卡项目（从 PRD 中的实际案例提取）
const demoGoals = [
    {
        id: 1,
        name: '金刚功',
        cycle: 'month',
        monthlyTarget: 21,
        yearlyTarget: 250,
        currentMonth: 19,
        currentYear: 62,
        donation: 1000,
        unit: '次',
        completed: false,
        todayCount: 0
    },
    {
        id: 2,
        name: '慢跑 45 分钟',
        cycle: 'month',
        monthlyTarget: 21,
        yearlyTarget: 250,
        currentMonth: 18,
        currentYear: 61,
        donation: 1000,
        unit: '次',
        completed: false,
        todayCount: 0
    },
    {
        id: 3,
        name: '过午不食',
        cycle: 'month',
        monthlyTarget: 7,
        yearlyTarget: 90,
        currentMonth: 6,
        currentYear: 23,
        donation: 1000,
        unit: '天',
        completed: false,
        todayCount: 0
    },
    {
        id: 4,
        name: '晚 11 点前入睡',
        cycle: 'month',
        monthlyTarget: 15,
        yearlyTarget: 180,
        currentMonth: 12,
        currentYear: 44,
        donation: 1000,
        unit: '天',
        completed: false,
        todayCount: 0
    },
    {
        id: 5,
        name: '丰盛日记',
        cycle: 'month',
        monthlyTarget: 21,
        yearlyTarget: 250,
        currentMonth: 18,
        currentYear: 59,
        donation: 1000,
        unit: '篇',
        completed: false,
        todayCount: 0
    },
    {
        id: 6,
        name: '每月读书 3 本',
        cycle: 'month',
        monthlyTarget: 3,
        yearlyTarget: 36,
        currentMonth: 2,
        currentYear: 8,
        donation: 1000,
        unit: '本',
        completed: false,
        todayCount: 0
    }
];

// 示例群友数据（用于排行榜）
const demoMembers = [
    { name: '姜宏锋', progress: 67, rank: 3 },
    { name: '王沛', progress: 100, rank: 1 },
    { name: '李林', progress: 100, rank: 1 },
    { name: '张三', progress: 80, rank: 4 },
    { name: '李四', progress: 50, rank: 5 }
];

// 打卡文案模板库
const cardTemplates = {
    sprint: {
        text: '还差{count}次达标！@{name} 你比我快，等等我！',
        condition: (progress) => progress >= 50 && progress < 100
    },
    proud: {
        text: '本月第{count}个达标项目！🎉 群内排名第{rank}',
        condition: (progress) => progress === 100
    },
    help: {
        text: '今天状态不好，求监督@{name}',
        condition: (progress) => progress < 30
    },
    persist: {
        text: '出差第{days}天，坚持打卡不中断💪',
        condition: (progress) => progress >= 30 && progress < 50
    },
    celebrate: {
        text: '🎉 连续打卡第{days}天！里程碑达成！',
        condition: (streak) => streak >= 7
    }
};

// 工具函数
const Utils = {
    // 获取当前日期
    getTodayDate: function() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        return `${month}月${day}日`;
    },
    
    // 获取星期
    getWeekday: function() {
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[new Date().getDay()];
    },
    
    // 计算进度百分比
    calculateProgress: function(current, target) {
        return Math.min(100, Math.round((current / target) * 100));
    },
    
    // 生成智能文案
    generateCardText: function(progress, rank, streak, completedCount) {
        if (progress === 100) {
            return cardTemplates.proud.text.replace('{count}', completedCount).replace('{rank}', rank);
        } else if (progress >= 80) {
            return `就差${Math.round((100 - progress) / 20)}次！本月就能达标，求监督🙌`;
        } else if (progress >= 50) {
            return '进度过半！继续加油💪';
        } else if (progress >= 30) {
            return cardTemplates.persist.text.replace('{days}', Math.floor(Math.random() * 5) + 1);
        } else {
            return '月初刚开始，来得及！冲！🔥';
        }
    },
    
    // 保存到 localStorage
    saveData: function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    // 从 localStorage 读取
    loadData: function(key, defaultValue) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    },
    
    // 格式化数字
    formatNumber: function(num) {
        return num.toLocaleString();
    }
};

// 初始化示例数据
function initDemoData() {
    if (!localStorage.getItem('zhuiGuang_user')) {
        Utils.saveData('zhuiGuang_user', demoUser);
    }
    if (!localStorage.getItem('zhuiGuang_goals')) {
        Utils.saveData('zhuiGuang_goals', demoGoals);
    }
    if (!localStorage.getItem('zhuiGuang_streak')) {
        Utils.saveData('zhuiGuang_streak', 15);
    }
}

// 导出到全局
window.demoUser = demoUser;
window.demoGoals = demoGoals;
window.demoMembers = demoMembers;
window.Utils = Utils;
window.initDemoData = initDemoData;

console.log('✅ 追光数据模块已加载');
