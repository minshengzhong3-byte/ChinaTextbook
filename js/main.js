// 进度追踪系统
function trackProgress(topic, score) {
    const dbRequest = indexedDB.open("LearningDB", 1);
    dbRequest.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("progress")) {
            db.createObjectStore("progress", { keyPath: "topic" });
        }
    };

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("progress", "readwrite");
        const store = transaction.objectStore("progress");
        
        store.put({ 
            topic: topic,
            score: score,
            timestamp: new Date().toISOString()
        });

        updateProgressBar();
    };
}

// 进度条更新
function updateProgressBar() {
    const request = indexedDB.open("LearningDB");
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction("progress", "readonly");
        const store = transaction.objectStore("progress");
        
        let total = 0;
        let count = 0;
        
        store.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                total += cursor.value.score;
                count++;
                cursor.continue();
            } else {
                const progress = count > 0 ? (total / count) * 100 : 0;
                document.getElementById("progress-bar").style.width = progress + "%";
                document.getElementById("progress-bar").textContent = "进度：" + progress.toFixed(1) + "%";
            }
        };
    };
}

// 练习题验证
function checkAnswer(questionId, userInput) {
    let correct = false;
    
    switch(questionId) {
        case '1':
            correct = (userInput == 5);
            break;
        case '2':
            correct = (userInput == 12);
            break;
        case '3':
            correct = (userInput == 7);
            break;
    }
    
    if (correct) {
        document.getElementById('feedback' + questionId).textContent = "正确！🎉";
        document.getElementById('feedback' + questionId).style.color = "green";
        trackProgress("equation_solving", 1);
    } else {
        document.getElementById('feedback' + questionId).textContent = "再想想看💡";
        document.getElementById('feedback' + questionId).style.color = "orange";
    }
}