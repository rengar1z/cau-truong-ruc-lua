class Player {
    constructor(name, position, stats) {
        this.name = name;
        this.position = position;
        this.stats = stats;
    }
}

const teamHome = {
    name: "Nantes", score: 0,
    mf: new Player("Freitas", "T.Vệ", { chuyen: 538, reDat: 604, tocDo: 624 }),
    fw: new Player("Djordjevic", "T.Đạo", { sut: 624, sutXa: 558, tocDo: 500 })
};

const teamAway = {
    name: "Genk.vn", score: 0,
    df: new Player("Kakadu", "Tr.Vệ", { xoacBong: 650, doatBong: 610, tocDo: 580 }),
    gk: new Player("GK NPC", "T.Môn", { cuuBong: 630, sucBat: 600, damBong: 550 })
};

// Hàm tạo khoảng trễ để chờ animation CSS chạy
const delay = ms => new Promise(res => setTimeout(res, ms));

async function startMatch() {
    const btnPlay = document.querySelector(".btn-play");
    btnPlay.disabled = true;

    const atkDot = document.getElementById("ui-atk");
    const defDot = document.getElementById("ui-def");
    const gkDot = document.getElementById("ui-gk");
    const ball = document.getElementById("ball");
    const popup = document.getElementById("ui-action-popup");
    const logBox = document.getElementById("match-log");

    logBox.innerHTML = "";
    teamHome.score = 0;
    teamAway.score = 0;
    document.getElementById("ui-home-score").innerText = 0;
    document.getElementById("ui-away-score").innerText = 0;

    // Gán tên hiển thị
    document.getElementById("name-atk").innerText = teamHome.mf.name;
    document.getElementById("name-def").innerText = teamAway.df.name;
    document.getElementById("name-gk").innerText = teamAway.gk.name;

    // Chạy giả lập 3 tình huống tấn công
    for (let minute = 15; minute <= 85; minute += 30) {
        document.getElementById("ui-time").innerText = `${minute}:00`;
        popup.style.visibility = "hidden";

        // =====================================
        // SETUP VỊ TRÍ BAN ĐẦU
        // =====================================
        atkDot.style.transition = "none";
        defDot.style.transition = "none";
        gkDot.style.transition = "none";
        ball.style.transition = "none";

        // Attacker ở sân nhà, Defender ở giữa sân, GK ở cầu môn phải
        atkDot.style.left = "20%"; atkDot.style.top = "70%";
        defDot.style.left = "60%"; defDot.style.top = "50%";
        gkDot.style.left = "95%"; gkDot.style.top = "50%";
        ball.style.left = "22%"; ball.style.top = "72%";

        await delay(100); // Đợi DOM cập nhật

        // Bật lại animation
        atkDot.style.transition = "all 1.5s linear";
        defDot.style.transition = "all 1.5s linear";
        ball.style.transition = "all 1.5s linear";

        logBox.innerHTML += `<p>⏱ Phút ${minute}: ${teamHome.mf.name} dẫn bóng lên...</p>`;
        logBox.scrollTop = logBox.scrollHeight;

        // =====================================
        // ACTION 1: TRANH CHẤP GIỮA SÂN
        // =====================================
        // Cả 2 cùng chạy đến tọa độ va chạm ở giữa sân
        atkDot.style.left = "45%"; atkDot.style.top = "50%";
        defDot.style.left = "50%"; defDot.style.top = "50%";
        ball.style.left = "48%"; ball.style.top = "52%";
        
        await delay(1500); // Chờ 2 cầu thủ chạy đến nơi

        let atkStat = teamHome.mf.stats.reDat + teamHome.mf.stats.tocDo;
        let defStat = teamAway.df.stats.xoacBong + teamAway.df.stats.doatBong;
        let winChance = Math.floor((atkStat / (atkStat + defStat)) * 100); 

        popup.innerHTML = `
            <div class="player-col"><strong>${teamHome.mf.name}</strong>Rê dắt + Tốc độ</div>
            <div class="action-center">
                <div class="action-title">Đối Mặt</div>
                <div class="action-percent">${winChance}%</div>
            </div>
            <div class="player-col"><strong>${teamAway.df.name}</strong>Xoạc + Đoạt bóng</div>
        `;
        popup.style.visibility = "visible";
        
        await delay(2000); // Dừng hình 2 giây để đọc Popup
        popup.style.visibility = "hidden";

        let roll = Math.floor(Math.random() * 100) + 1;
        
        if (roll <= winChance) {
            // THẮNG: Attacker chạy tiếp, Defender rớt lại
            logBox.innerHTML += `<p style="color:#3498db">🔥 Lừa qua người thành công! Cơ hội dứt điểm!</p>`;
            document.getElementById("name-atk").innerText = teamHome.fw.name; // Đổi người cầm bóng thành Tiền Đạo
            
            atkDot.style.left = "75%"; atkDot.style.top = "50%";
            ball.style.left = "78%"; ball.style.top = "50%";
            defDot.style.left = "45%"; // Hậu vệ lỡ đà

            await delay(1500); // Chờ Tiền đạo chạy tới sát vòng cấm

            // =====================================
            // ACTION 2: DỨT ĐIỂM
            // =====================================
            let shotStat = teamHome.fw.stats.sut + teamHome.fw.stats.sutXa;
            let saveStat = teamAway.gk.stats.cuuBong + teamAway.gk.stats.sucBat;
            let goalChance = Math.floor((shotStat / (shotStat + saveStat)) * 100);

            popup.innerHTML = `
                <div class="player-col"><strong>${teamHome.fw.name}</strong>Sút xa</div>
                <div class="action-center">
                    <div class="action-title">Dứt Điểm</div>
                    <div class="action-percent">${goalChance}%</div>
                </div>
                <div class="player-col"><strong>${teamAway.gk.name}</strong>Cứu bóng</div>
            `;
            popup.style.visibility = "visible";
            
            await delay(2000);
            popup.style.visibility = "hidden";

            let shotRoll = Math.floor(Math.random() * 100) + 1;
            
            ball.style.transition = "all 0.5s ease-out"; // Bóng bay nhanh
            gkDot.style.transition = "all 0.5s ease-out"; // Thủ môn đổ người

            if (shotRoll <= goalChance) {
                // VÀO: Bóng bay thẳng lưới, GK bay sai hướng
                ball.style.left = "100%"; ball.style.top = "50%";
                gkDot.style.top = "60%"; 
                teamHome.score++;
                document.getElementById("ui-home-score").innerText = teamHome.score;
                logBox.innerHTML += `<p class="text-green">⚽ VÀOOOOO!!!</p>`;
            } else {
                // TRƯỢT: GK bắt gọn bóng
                ball.style.left = "93%"; ball.style.top = "50%";
                gkDot.style.left = "93%"; gkDot.style.top = "50%";
                logBox.innerHTML += `<p>🛡️ Thủ môn cản phá xuất thần!</p>`;
            }
            
        } else {
            // THUA: Defender cướp bóng
            logBox.innerHTML += `<p style="color:#e74c3c">❌ Bị xoạc mất bóng!</p>`;
            ball.style.left = "48%"; ball.style.top = "50%"; // Bóng nằm trong chân Defender
            atkDot.style.left = "42%"; // Attacker dội ngược lại
        }
        
        logBox.scrollTop = logBox.scrollHeight;
        await delay(2000); // Dừng một chút trước khi sang pha bóng tiếp theo
    }

    document.getElementById("ui-time").innerText = "90:00";
    btnPlay.disabled = false;
    btnPlay.innerText = "ĐÁ LẠI TỪ ĐẦU";
}
