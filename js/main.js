// 初始化IndexedDB
const dbRequest = indexedDB.open("MathLearningDB", 1);
dbRequest.onupgradeneeded = function(event) {
  const db = event.target.result;
  if (!db.objectStoreNames.contains("progress")) {
    db.createObjectStore("progress", { keyPath: "topic" });
  }
};

// 保存学习进度
function trackProgress(topic, score) {
  const dbRequest = indexedDB.open("MathLearningDB");
  dbRequest.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction("progress", "readwrite");
    const store = transaction.objectStore("progress");
    store.put({ 
      topic: topic,
      score: score,
      timestamp: new Date().toISOString()
    });
  };
}

// 加载学习进度
function loadProgress(topic) {
  const dbRequest = indexedDB.open("MathLearningDB");
  return new Promise((resolve) => {
    dbRequest.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction("progress", "readonly");
      const store = transaction.objectStore("progress");
      const request = store.get(topic);
      request.onsuccess = function() {
        resolve(request.result?.score || 0);
      };
    };
  });
}

// 练习题检查函数
function checkAnswer(questionId, userInput) {
  const correctAnswers = {
    1: 5,  // 解方程题答案
    2: 12, // 乘法题答案
    3: 30  // 分数题答案
  };

  if (userInput == correctAnswers[questionId]) {
    document.getElementById(`feedback${questionId}`).textContent = "正确！🎉";
    trackProgress(`question_${questionId}`, 1);
    updateProgressBar();
  } else {
    document.getElementById(`feedback${questionId}`).textContent = "再想想？💡";
  }
}

// 更新进度条
async function updateProgressBar() {
  let total = 0;
  let completed = 0;
  
  for (let i = 1; i <= 3; i++) {
    total += 1;
    completed += await loadProgress(`question_${i}`);
  }

  const progress = Math.round((completed / total) * 100);
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById('progress-bar').textContent = `${progress}% 完成度`;
}

// 重置进度
function resetProgress() {
  const dbRequest = indexedDB.open("MathLearningDB");
  dbRequest.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction("progress", "readwrite");
    const store = transaction.objectStore("progress");
    store.clear();
    updateProgressBar();
  };
}

// 页面加载时初始化
window.onload = async () => {
  updateProgressBar();
  
  // 添加粒子特效
  if (document.getElementById('progress-bar')) {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    function animateParticles() {
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      document.body.appendChild(canvas);
      
      function draw() {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4CAF50';
        
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
          ctx.fill();
          p.y -= p.speed;
          
          if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
          }
        });
        
        requestAnimationFrame(draw);
      }
      
      draw();
    }
    
    animateParticles();
  }
};