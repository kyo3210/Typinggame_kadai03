// 問題文と日本語読み
        let Q1 = [
            {en: "sushi", ja: "すし"},
            {en: "ebihurai", ja: "エビフライ"},
            {en: "reitoupainn", ja: "冷凍パイン"},
            {en: "udonn", ja: "うどん"},
            {en: "kukkie", ja: "クッキー"},
            {en: "takoyaki", ja: "たこやき"},
            {en: "omuraisu", ja: "オムライス"},
            {en: "soba", ja: "そば"},
            {en: "hannba-gu", ja: "ハンバーグ"},
            {en: "chawannmushi", ja: "茶わん蒸し"},
            {en: "kokusairengoujidoukikinn", ja: "国際連合児童基金(ﾕﾆｾﾌ)"},
            {en: "ChikamatsuMonzaemonn", ja: "近松門左衛門※大文字注意"},
            {en: "kamennraida-jiou", ja: "仮面ライダージオウ"},
            {en: "chihayahuru", ja: "ちはやふる"},
            {en: "ritomasushikennshi", ja: "リトマス試験紙"},
            {en: "sekainohatemade-itteQ", ja: "世界の果てまでイッテＱ"},
            {en: "chiikawa-hachiware", ja: "ちいかわハチワレ"},
        ];


        // ★★★ Ver.2: 熟語の配列 (新規) ★★★
    let Q2 = [
        {en: "as well as", ja: "〜と同様に"},
        {en: "according to", ja: "〜によれば"},
        {en: "all of a sudden", ja: "突然に"}, 
        {en: "as soon as possible", ja: "できるだけ早く"},
        {en: "break the ice", ja: "打ち解ける"},
        {en: "by the way", ja: "ところで"}, 
        {en: "carry out", ja: "実行する"}, 
        {en: "come up with", ja: "考え出す"},
        {en: "Do one’s best", ja: "最善を尽くす※大文字あり"},
        {en: "fall in love", ja: "恋に落ちる"}, 
        {en: "figure out", ja: "理解する"}, 
        {en: "get along with", ja: "仲良くやる"},
        {en: "go ahead", ja: "どうぞ"},
        {en: "hang out", ja: "遊ぶ"}, 
        {en: "have a good time", ja: "楽しむ"}, 
        {en: "hold on", ja: "待つ"},
        {en: "keep in touch", ja: "連絡を取り合う"},
        {en: "look forward to", ja: "楽しみにする"}, 
        {en: "make sense", ja: "理にかなっている"}, 
        {en: "make up one’s mind", ja: "決心する"}, 
        {en: "no wonder", ja: "なるほど"}, 
        {en: "on the other hand", ja: "一方で"}, 
        ];

let currentQArray = Q1; // 実行中の問題配列を保持
        let Q_No = 0; 
        let Q_i = 0; 
        let Q_l; 
        
        const GAME_DURATION = 60; 
        let timeLeft = GAME_DURATION; 
        let timerId = null; 
        let isGameActive = false; 
        let totalCorrectChars = 0; 

        const HISTORY_KEY = 'typingGameScoreHistory'; 
        let scoreHistory = []; 
        let highScore = 0;
        
        let correctSound; 

        // --- 関数定義 ---

        function loadScoreHistory() {
            const data = localStorage.getItem(HISTORY_KEY);
            if (data) {
                try {
                    scoreHistory = JSON.parse(data);
                } catch (e) {
                    console.error("Failed to parse score history from localStorage", e);
                    scoreHistory = [];
                }
            } else {
                scoreHistory = [];
            }
            highScore = scoreHistory.length > 0 ? Math.max(...scoreHistory) : 0;
        }

        function saveScoreHistory(newScore) {
            scoreHistory.push(newScore);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(scoreHistory));
            
            if (newScore > highScore) {
                highScore = newScore;
            }
        }

        function deleteScoreHistory() {
            if (confirm("過去のスコア履歴をすべて削除してもよろしいですか？")) {
                localStorage.removeItem(HISTORY_KEY);
                scoreHistory = [];
                highScore = 0;
                displayHighScore();
                alert("スコア履歴を削除しました。");
            }
        }
        
        /**
         * 最高スコアと履歴一覧を画面に表示する
         */
        function displayHighScore() {
            const highScoreEl = document.getElementById("high-score");
            const scoreListEl = document.getElementById("score-list");
            const historyCountEl = document.getElementById("history-count");
            
            if (!highScoreEl || !scoreListEl || !historyCountEl) return;

            highScoreEl.innerHTML = `ハイスコア : ${highScore} 文字`;
            historyCountEl.textContent = scoreHistory.length;

            scoreListEl.innerHTML = '';
            
            scoreHistory
                .slice()
                .reverse()
                .forEach((score, index) => {
                const li = document.createElement('li');
                const playNumber = scoreHistory.length - index; 
                
                li.innerHTML = `
                    <span>#${playNumber}: </span>
                    <span>${score} 文字</span>
                `;
                scoreListEl.appendChild(li);
            });
        }
        
        /**
         * アコーディオンの開閉を制御する
         */
        function toggleAccordion() {
            const content = document.getElementById('history-accordion-content');
            const icon = document.getElementById('accordion-icon');
            
            const isOpen = content.classList.toggle('open');
            
            icon.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
        }

        function setQuestion() {
            const questionEl = document.getElementById("question-text");
            const translationEl = document.getElementById("translation-text");

            if (!questionEl || !translationEl) return;

            if (Q_No >= currentQArray.length) {
                Q_No = 0; 
            }

            const currentQ = currentQArray[Q_No];
            Q_l = currentQ.en.length;
            Q_i = 0;

            questionEl.innerHTML = currentQ.en;
            translationEl.innerHTML = `（${currentQ.ja}）`;
        }
        
        function updateTimer() {
            const timerEl = document.getElementById("current-timer");
            if (!timerEl) return;

            if (timeLeft <= 0) {
                endGame();
                return;
            }

            timeLeft--;
            timerEl.innerHTML = `残り: ${timeLeft} 秒`;
        }

        /**
         * ゲーム開始処理 (引数で問題配列を渡す)
         */
        function startGame(questionSet) {
            if (isGameActive) return;

            currentQArray = questionSet; 

            isGameActive = true;
            totalCorrectChars = 0; 
            timeLeft = GAME_DURATION; 
            
            document.getElementById("current-timer").innerHTML = `残り: ${timeLeft} 秒`;
            document.getElementById("current-score").innerHTML = `スコア: ${totalCorrectChars} 文字`;

            Q_No = Math.floor(Math.random() * currentQArray.length); 
            setQuestion(); 

            timerId = setInterval(updateTimer, 1000); 

            window.addEventListener("keydown", push_Keydown);
            
            // ゲーム開始時はスタートボタンを非表示にする (画面から削除)
            document.getElementById("question-text").classList.remove('initial-message');
            document.getElementById("translation-text").classList.remove('initial-message');
        }

        function endGame() {
            isGameActive = false;
            clearInterval(timerId);
            window.removeEventListener("keydown", push_Keydown);

            const questionEl = document.getElementById("question-text");
            const translationEl = document.getElementById("translation-text");
            const scoreEl = document.getElementById("current-score");

            saveScoreHistory(totalCorrectChars);
            
            if (questionEl && translationEl) {
                questionEl.innerHTML = `ゲーム終了！`;
                translationEl.innerHTML = `60秒間で「 ${totalCorrectChars} 文字」正解しました！`;
                
                displayHighScore();
                scoreEl.innerHTML = `今回スコア: ${totalCorrectChars} 文字`;
            }

        //     if (questionEl) {
        //         // 再びスタートボタンを表示
        //         questionEl.innerHTML = `
        //             <button id="start-button-v1-again" class="start-button">Ver.1: フルーツで再スタート</button>
        //             <br>
        //             <button id="start-button-v2-again" class="start-button">Ver.2: 熟語で再スタート</button>`;
                    
        //         // 再スタートボタンにイベントリスナーを再設定
        //         document.getElementById("start-button-v1-again").addEventListener("click", () => startGame(Q1));
        //         document.getElementById("start-button-v2-again").addEventListener("click", () => startGame(Q2));
        //     }
        }

        function push_Keydown(event) {
            if (!isGameActive) return; 

            const questionEl = document.getElementById("question-text");
            if (!questionEl) return;

            let keyCode = event.key;
            let currentWord = currentQArray[Q_No].en;

            if (currentWord.charAt(Q_i) === keyCode) {
                
                if (correctSound) {
                    correctSound.currentTime = 0; 
                    correctSound.play().catch(e => console.log("音声再生はユーザー操作後に有効になります。")); 
                }
                
                Q_i++; 
                totalCorrectChars++; 
                document.getElementById("current-score").innerHTML = `文字数: ${totalCorrectChars} 文字`;
                
                const remaining = currentWord.substring(Q_i);
                const typed = currentWord.substring(0, Q_i);
                // CSSクラス .typed-char を適用
                questionEl.innerHTML = `<span class="typed-char">${typed}</span>${remaining}`;
                
                if (Q_l - Q_i === 0) { 
                    Q_No++; 
                    setQuestion(); 
                }
            }
        }
        
        /**
    * 10秒に一度、飛行機のアニメーションをトリガーする
         */
        function startPlaneAnimationLoop() {
            const planeEl = document.getElementById('flying-plane');
            if (!planeEl) return;
            

            // 15秒ごとにアニメーションを開始
            setInterval(() => {
                // 既存のアニメーションをリセット
                planeEl.style.animation = 'none'; 
                
                // 再描画を強制するための小技 (setTimeoutやrequestAnimationFrameでも可)
                planeEl.offsetHeight; 
                
                // 新しいアニメーションを設定 (7秒かけて画面を横切る)
                planeEl.style.animation = 'flyAcross 7s linear forwards'; 
                
            }, 10000); // 10000ミリ秒 = 15秒
        }


        // --- 初期実行 ---
        window.onload = function() {
            // スコア履歴の読み込み、最高スコアと履歴一覧を表示する
            loadScoreHistory();
            displayHighScore();
            
            correctSound = document.getElementById('correct-se');

            // ★ スタートボタンのイベントリスナーを個別に設定 ★
            const startButtonV1 = document.getElementById("start-button-v1");
            if (startButtonV1) {
                startButtonV1.addEventListener("click", () => startGame(Q1)); 
            }
            
            const startButtonV2 = document.getElementById("start-button-v2");
            if (startButtonV2) {
                startButtonV2.addEventListener("click", () => startGame(Q2)); 
            }

            // 履歴削除ボタンにイベントリスナーを設定
            const deleteButton = document.getElementById("delete-scores-button");
            if (deleteButton) {
                deleteButton.addEventListener("click", function() {
                    deleteScoreHistory();
                    displayHighScore(); // 削除後、リストを更新
                });
            }
            
            // アコーディオンヘッダーにイベントリスナーを設定
            const accordionHeader = document.getElementById("history-accordion-header");
            if (accordionHeader) {
                accordionHeader.addEventListener("click", toggleAccordion);
            }

            // 飛行機アニメーションの開始
            startPlaneAnimationLoop(); 
        };