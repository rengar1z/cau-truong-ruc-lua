class Player {
    constructor(name, position, stats) {
        this.name = name;
        this.position = position;
        
        // Bê nguyên 19 chỉ số chuẩn vào đây
        this.stats = {
            tocDo: stats.tocDo || 10, sucBat: stats.sucBat || 10, theLuc: stats.theLuc || 10,
            sucBen: stats.sucBen || 10, sut: stats.sut || 10, reDat: stats.reDat || 10,
            chuyen: stats.chuyen || 10, danhDau: stats.danhDau || 10, doatBong: stats.doatBong || 10,
            xoacBong: stats.xoacBong || 10, chuyenDai: stats.chuyenDai || 10, sutXa: stats.sutXa || 10,
            phatDen: stats.phatDen || 10, phatGoc: stats.phatGoc || 10, daPhat: stats.daPhat || 10,
            butPhat: stats.butPhat || 10, damBong: stats.damBong || 10, khongChien: stats.khongChien || 10,
            cuuBong: stats.cuuBong || 10
        };
    }
}

// KHUÔN ĐỘI BÓNG
class Team {
    constructor(name, morale, players) {
        this.name = name;
        this.morale = morale; // Tinh thần thi đấu (Morale)
        this.players = players;
        this.score = 0;
    }
}

// ==========================================
// 2. TẠO DATA CẦU THỦ THỰC TẾ
// ==========================================
// Cầu thủ Đội Nhà (Nantes)
const freitas = new Player("Freitas", "T.Vệ P", { chuyen: 538.2, reDat: 604.8, tocDo: 624.9 });
const djordjevic = new Player("Djordjevic", "T.Đạo P", { sut: 624.9, sutXa: 558, danhDau: 468 });

// Cầu thủ Đội Khách (Genk.vn)
const kakadu = new Player("Kakadu", "Tr.Vệ", { xoacBong: 650, doatBong: 610, tocDo: 580 });
const thuMonNPC = new Player("GK NPC", "T.Môn", { cuuBong: 630, sucBat: 600, damBong: 550 });

// Ráp vào 2 đội bóng
const teamHome = new Team("Nantes", 338, { mf: freitas, fw: djordjevic });
const teamAway = new Team("Genk.vn", 498, { df: kakadu, gk: thuMonNPC });

let matchTimer;

// ==========================================
// 3. LOGIC TRẬN ĐẤU & GIAO DIỆN
// ==========================================
function startMatch() {
    const btnPlay = document.querySelector(".btn-play");
    btnPlay.disabled = true;
    
    // Đẩy thông tin cơ bản lên UI HTML
    document.getElementById("ui-home-name").innerText = teamHome.name;
    document.getElementById("ui-away-name").innerText = teamAway.name;
    document.getElementById("ui-home-morale").innerText = `Tinh thần thi đấu: ${teamHome.morale}`;
    document.getElementById("ui-away-morale").innerText = `Tinh thần thi đấu: ${teamAway.morale}`;
    
    const logBox = document.getElementById("match-log");
    const popupBox = document.getElementById("ui-action-popup");
    
    teamHome.score = 0;
    teamAway.score = 0;
    let inGameMinute = 0;
    let inGameSecond = 0;

    logBox.innerHTML = "";
    popupBox.style.visibility = "visible"; // Hiện popup màu xanh lên

    // VÒNG LẶP THỜI GIAN THỰC
    matchTimer = setInterval(() => {
        // Cộng thời gian ngẫu nhiên (mỗi giây trôi qua 2-5 phút trong game)
        inGameMinute += Math.floor(Math.random() * 4) + 2;
        inGameSecond = Math.floor(Math.random() * 60);
        
        // Hết giờ
        if (inGameMinute >= 90) {
            clearInterval(matchTimer);
            document.getElementById("ui-time").innerText = "90:00";
            popupBox.innerHTML = `<div style="width:100%; text-align:center; font-size: 20px; font-weight:bold;">HẾT GIỜ!</div>`;
            btnPlay.disabled = false;
            return;
        }

        // Cập nhật đồng hồ và tỷ số
        document.getElementById("ui-time").innerText = `${inGameMinute < 10 ? '0'+inGameMinute : inGameMinute}:${inGameSecond < 10 ? '0'+inGameSecond : inGameSecond}`;
        document.getElementById("ui-home-score").innerText = teamHome.score;
        document.getElementById("ui-away-score").innerText = teamAway.score;

        // ----------------------------------------------------
        // MÔ PHỎNG PHA BÓNG DỰA TRÊN FULL 19 CHỈ SỐ
        // ----------------------------------------------------
        let attacker = teamHome.players.mf; // Tiền vệ cầm bóng
        let defender = teamAway.players.df; // Trung vệ cản phá
        
        // GỘP CHỈ SỐ TẤN CÔNG: Rê dắt + Tốc độ
        let atkStat = attacker.stats.reDat + attacker.stats.tocDo;
        // GỘP CHỈ SỐ PHÒNG THỦ: Xoạc bóng + Đoạt bóng
        let defStat = defender.stats.xoacBong + defender.stats.doatBong;

        // Tính Tỷ lệ % chiến thắng
        let totalPower = atkStat + defStat;
        let winChance = Math.floor((atkStat / totalPower) * 100); 
        
        // Đổ dữ liệu ra Popup Xanh lá y hệt ảnh
        popupBox.innerHTML = `
            <div class="player-col">
                <strong>${attacker.name}</strong>
                Vị trí: ${attacker.position}<br>
                Rê dắt: ${attacker.stats.reDat.toFixed(1)}<br>
                Tốc độ: ${attacker.stats.tocDo.toFixed(1)}
            </div>
            <div class="action-center">
                <div class="action-title">Cơ Hội Qua Người</div>
                <div class="action-desc">Tỷ lệ thành công</div>
                <div class="action-percent">${winChance}%</div>
            </div>
            <div class="player-col">
                <strong>${defender.name}</strong>
                Vị trí: ${defender.position}<br>
                Xoạc bóng: ${defender.stats.xoacBong.toFixed(1)}<br>
                Đoạt bóng: ${defender.stats.doatBong.toFixed(1)}
            </div>
        `;

        // Đổ xúc xắc (Roll từ 1-100) để quyết định kết quả
        let roll = Math.floor(Math.random() * 100) + 1;
        let isSuccess = roll <= winChance;

        let turnLog = `<p><strong>⏱ ${inGameMinute}':</strong> `;
        
        if (isSuccess) {
            turnLog += `<span class="text-blue">${attacker.name}</span> dùng Tốc độ và Rê dắt vượt mặt ${defender.name} thành công (Tỷ lệ: ${winChance}%, Đổ xúc xắc ra số: ${roll})!`;
            
            // Nếu qua người thành công, tự động có cơ hội sút đối mặt Thủ môn
            let striker = teamHome.players.fw;
            let gk = teamAway.players.gk;
            
            let shotStat = striker.stats.sut + striker.stats.sutXa;
            let saveStat = gk.stats.cuuBong + gk.stats.sucBat;
            let goalChance = Math.floor((shotStat / (shotStat + saveStat)) * 100);
            
            let shotRoll = Math.floor(Math.random() * 100) + 1;
            if(shotRoll <= goalChance) {
                turnLog += `<br>🔥 <span class="text-green">VÀOOOO!!!</span> ${striker.name} vung chân sút cháy lưới ${gk.name} (Tỷ lệ sút vào: ${goalChance}%)!`;
                teamHome.score++;
            } else {
                turnLog += `<br>🛡️ Không vào! ${gk.name} đã bay người xuất thần cản phá cú sút của ${striker.name}.`;
            }

        } else {
            turnLog += `<span class="text-red">${defender.name}</span> đã đọc tình huống xuất sắc, tung cú xoạc bóng chặn đứng đợt tấn công (Tỷ lệ bị qua người chỉ là: ${winChance}%, Đổ xúc xắc ra số: ${roll}).`;
        }
        turnLog += `</p>`;

        // In bình luận và tự động cuộn
        logBox.innerHTML += turnLog;
        logBox.scrollTop = logBox.scrollHeight;

    }, 2000); // Mỗi 2 giây cập nhật 1 tình huống
}
