import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// --- CẤU HÌNH FIREBASE (NHỚ DÁN CỦA BẠN VÀO ĐÂY) ---
const firebaseConfig = {
    apiKey: "DÁN_API_KEY_CỦA_BẠN_VÀO_ĐÂY",
    authDomain: "cau-truong-ruc-lua.firebaseapp.com",
    databaseURL: "https://cau-truong-ruc-lua-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cau-truong-ruc-lua",
    storageBucket: "cau-truong-ruc-lua.appspot.com",
    messagingSenderId: "DÁN_SỐ_CỦA_BẠN_VÀO_ĐÂY",
    appId: "DÁN_APP_ID_CỦA_BẠN_VÀO_ĐÂY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const statNamesVN = {
    tocDo: "Tốc độ", sucBat: "Sức bật", theLuc: "Thể lực", sut: "Sút", 
    reBong: "Rê bóng", chuyen: "Chuyền", danhDau: "Đánh đầu", doatBong: "Đoạt bóng", 
    xoac: "Xoạc", chuyenDai: "Chuyền dài", sutXa: "Sút xa", phatGoc: "Phạt góc",
    batBong: "Bắt bóng", phanXa: "Phản xạ"
};

class Player {
    constructor(id, teamId, name, type, stats) {
        this.id = id;
        this.teamId = teamId; // "home" hoặc "away"
        this.name = name;
        this.type = type; // FW, MF, DF, GK
        this.stats = stats;
        this.awakeningGauge = 0;
    }

    getStat(statKey) {
        let baseStat = this.stats[statKey] || 400;
        if (this.awakeningGauge >= 100) {
            this.awakeningGauge = 0; 
            return { value: Math.round(baseStat * 1.5), isAwakened: true, key: statKey };
        }
        this.awakeningGauge += 25;
        return { value: baseStat, isAwakened: false, key: statKey };
    }
}

// --- BIẾN TOÀN CỤC ---
let teams = { home: [], away: [] };
let matchInterval;
let time = 0;
let homeScore = 0;
let awayScore = 0;

// TRẠNG THÁI AI (State Machine)
let matchState = {
    teamPossession: null, // "home" hoặc "away"
    zone: "Giữa sân",     // "Sân nhà", "Giữa sân", "Vòng cấm"
    ballHolder: null      // Object Player đang cầm bóng
};

// --- KHỞI TẠO DỮ LIỆU ĐỘI HÌNH 8 NGƯỜI ---
async function seedDatabaseIfEmpty() {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "players"));
    
    if (!snapshot.exists()) {
        const dummyPlayers = {
            // TEAM ĐỎ (HOME)
            "h_fw": { teamId: "home", name: "CR7", type: "FW", stats: { tocDo: 624, sucBat: 459, theLuc: 522, sut: 624, reBong: 604, chuyen: 538, danhDau: 468, doatBong: 324, xoac: 298, chuyenDai: 396, sutXa: 558, phatGoc: 302 } },
            "h_mf": { teamId: "home", name: "Modric", type: "MF", stats: { tocDo: 450, sucBat: 400, theLuc: 550, sut: 480, reBong: 550, chuyen: 650, danhDau: 350, doatBong: 500, xoac: 400, chuyenDai: 680, sutXa: 500, phatGoc: 550 } },
            "h_df": { teamId: "home", name: "Chiellini", type: "DF", stats: { tocDo: 400, sucBat: 500, theLuc: 550, sut: 200, reBong: 300, chuyen: 450, danhDau: 580, doatBong: 620, xoac: 650, chuyenDai: 400, sutXa: 150, phatGoc: 100 } },
            "h_gk": { teamId: "home", name: "Donnarumma", type: "GK", stats: { tocDo: 300, sucBat: 600, theLuc: 500, sut: 100, reBong: 150, chuyen: 400, danhDau: 200, doatBong: 100, xoac: 100, chuyenDai: 500, sutXa: 50, phatGoc: 50, batBong: 650, phanXa: 670 } },
            
            // TEAM XANH (AWAY)
            "a_fw": { teamId: "away", name: "Falcao", type: "FW", stats: { tocDo: 486, sucBat: 538, theLuc: 538, sut: 602, reBong: 504, chuyen: 486, danhDau: 538, doatBong: 279, xoac: 225, chuyenDai: 522, sutXa: 504, phatGoc: 333 } },
            "a_mf": { teamId: "away", name: "Kroos", type: "MF", stats: { tocDo: 400, sucBat: 380, theLuc: 520, sut: 490, reBong: 520, chuyen: 680, danhDau: 320, doatBong: 480, xoac: 420, chuyenDai: 700, sutXa: 520, phatGoc: 600 } },
            "a_df": { teamId: "away", name: "Ramos", type: "DF", stats: { tocDo: 450, sucBat: 600, theLuc: 580, sut: 300, reBong: 350, chuyen: 480, danhDau: 650, doatBong: 600, xoac: 620, chuyenDai: 500, sutXa: 200, phatGoc: 150 } },
            "a_gk": { teamId: "away", name: "Buffon", type: "GK", stats: { tocDo: 300, sucBat: 600, theLuc: 500, sut: 100, reBong: 150, chuyen: 400, danhDau: 200, doatBong: 100, xoac: 100, chuyenDai: 500, sutXa: 50, phatGoc: 50, batBong: 680, phanXa: 700 } }
        };
        await set(ref(db, "players"), dummyPlayers);
        return dummyPlayers;
    }
    return snapshot.val();
}

async function initGame() {
    try {
        const rawData = await seedDatabaseIfEmpty();
        for (const key in rawData) {
            let p = rawData[key];
            let newPlayer = new Player(key, p.teamId, p.name, p.type, p.stats);
            teams[p.teamId].push(newPlayer);
        }
        document.getElementById("btn-start").innerText = "BẮT ĐẦU TRẬN ĐẤU";
        document.getElementById("btn-start").disabled = false;
        document.getElementById("btn-start").addEventListener("click", startMatch);
    } catch (error) {
        console.error(error);
        document.getElementById("commentary-box").innerText = "Lỗi kết nối máy chủ!";
    }
}

function startMatch() {
    document.getElementById("btn-start").style.display = "none";
    document.getElementById("commentary-box").innerText = "Trọng tài nổi hồi còi khai cuộc!";
    
    // Khởi tạo quả bóng đầu tiên thuộc về đội nhà
    matchState.teamPossession = "home";
    matchState.zone = "Giữa sân";
    
    matchInterval = setInterval(processAILogic, 2500); // 2.5 giây 1 lượt để kịp đọc
}

// ==========================================
// THUẬT TOÁN AI DỰA TRÊN CẤU TRÚC BẠN GỬI
// ==========================================
function processAILogic() {
    time += 2; 
    if (time > 90) return endMatch();
    document.getElementById("match-time").innerText = time + ":00";

    // Bước 1: Đội nào có bóng?
    let atkTeamId = matchState.teamPossession;
    let defTeamId = atkTeamId === "home" ? "away" : "home";
    
    // Bước 2: Cầu thủ nào đang giữ bóng?
    if (!matchState.ballHolder) {
        // Nếu vừa giao bóng hoặc đổi quyền, bóng mặc định vào chân Tiền vệ
        matchState.ballHolder = teams[atkTeamId].find(p => p.type === "MF");
    }
    let attacker = matchState.ballHolder;

    // Bước 3: Đang ở khu vực nào?
    let currentZone = matchState.zone;
    document.getElementById("possession-info").innerText = atkTeamId === "home" ? "Đỏ đang cầm bóng" : "Xanh đang cầm bóng";
    document.getElementById("zone-info").innerText = currentZone;

    // Bước 4: AI chọn hành động (Dựa vào khu vực)
    let actionName, atkStatKey, defStatKey;
    let defender;

    // Bước 5: Đối đầu
    if (currentZone === "Sân nhà") {
        actionName = "Phát bóng dài";
        atkStatKey = "chuyenDai";
        defStatKey = "danhDau"; // Tiền đạo đối phương cắt bóng
        defender = teams[defTeamId].find(p => p.type === "FW") || teams[defTeamId][0];
    } 
    else if (currentZone === "Giữa sân") {
        let isDribble = Math.random() > 0.5;
        if (isDribble) {
            actionName = "Cầm bóng đột phá";
            atkStatKey = "reBong";
            defStatKey = "doatBong";
            defender = teams[defTeamId].find(p => p.type === "MF") || teams[defTeamId][0];
        } else {
            actionName = "Chuyền phối hợp";
            atkStatKey = "chuyen";
            defStatKey = "xoac";
            defender = teams[defTeamId].find(p => p.type === "MF") || teams[defTeamId][0];
        }
    } 
    else { // Khu vực "Vòng cấm" (Tấn công)
        actionName = "Dứt điểm!";
        atkStatKey = "sut";
        defStatKey = "phanXa"; // Thủ môn cản phá
        defender = teams[defTeamId].find(p => p.type === "GK") || teams[defTeamId][0];
    }

    document.getElementById("event-title").innerText = `${actionName}`;

    let atkPower = attacker.getStat(atkStatKey);
    let defPower = defender.getStat(defStatKey);

    updateUI("atk", attacker.name, atkPower);
    updateUI("def", defender.name, defPower);

    let totalPower = atkPower.value + defPower.value;
    let winProb = Math.round((atkPower.value / totalPower) * 100);
    document.querySelector(".win-chance p").innerText = actionName;
    document.getElementById("win-prob").innerText = winProb + "%";

    // Bước 6: Kết quả
    let roll = Math.floor(Math.random() * 100);
    let isSuccess = roll < winProb;
    let logText = "";

    // Bước 7: Chuyển sang sự kiện tiếp theo (Thay đổi State Machine)
    if (isSuccess) {
        if (currentZone === "Sân nhà") {
            logText = `${attacker.name} tung đường chuyền vượt tuyến xuất sắc lên phía trên!`;
            matchState.zone = "Giữa sân";
            matchState.ballHolder = teams[atkTeamId].find(p => p.type === "MF");
        } 
        else if (currentZone === "Giữa sân") {
            logText = `${attacker.name} xử lý tốt! Bóng đã được đưa áp sát vòng cấm địa.`;
            matchState.zone = "Vòng cấm";
            matchState.ballHolder = teams[atkTeamId].find(p => p.type === "FW");
        } 
        else { // Sút thành công
            if (atkTeamId === "home") homeScore++; else awayScore++;
            document.getElementById(`score-${atkTeamId}`).innerText = atkTeamId === "home" ? homeScore : awayScore;
            logText = `VÀOOOOO!!! ${attacker.name} tung cú sút không thể cản phá!`;
            
            // Giao bóng lại ở giữa sân
            matchState.teamPossession = defTeamId;
            matchState.zone = "Giữa sân";
            matchState.ballHolder = null; 
        }
    } else { // Thất bại (Mất bóng)
        if (currentZone === "Vòng cấm") {
            logText = `KHÔNG VÀO! ${defender.name} đã cứu thua xuất sắc cho đội nhà.`;
        } else {
            logText = `Mất bóng rồi! ${defender.name} đã phán đoán và can thiệp kịp thời.`;
        }
        
        // Đảo chiều quyền kiểm soát bóng
        matchState.teamPossession = defTeamId;
        matchState.ballHolder = defender;
        
        // Đảo góc nhìn khu vực sân
        if (currentZone === "Vòng cấm") matchState.zone = "Sân nhà";
        else if (currentZone === "Sân nhà") matchState.zone = "Vòng cấm";
        // Giữa sân giữ nguyên
    }

    document.getElementById("commentary-box").innerText = logText;
}

function updateUI(side, name, powerObj) {
    document.getElementById(`${side}-name`).innerText = name;
    const statNameVN = statNamesVN[powerObj.key] || powerObj.key;
    document.getElementById(`${side}-stat-desc`).innerHTML = `${statNameVN}: <span id="${side}-stat">${powerObj.value}</span>`;
    document.getElementById(`${side}-awaken`).style.display = powerObj.isAwakened ? "block" : "none";
}

function endMatch() {
    clearInterval(matchInterval);
    document.getElementById("match-time").innerText = "90:00";
    document.getElementById("event-title").innerText = "HẾT GIỜ!";
    document.getElementById("commentary-box").innerText = `Trận đấu kết thúc!`;
}

window.onload = () => { initGame(); };
