import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// --- CẤU HÌNH FIREBASE (NHỚ DÁN LẠI CONFIG CỦA BẠN VÀO ĐÂY) ---
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
        this.teamId = teamId; 
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

let matchState = {
    teamPossession: null,
    zone: "Giữa sân",
    ballHolder: null
};

// --- HÀM HỖ TRỢ: CHỌN NGẪU NHIÊN 1 CẦU THỦ THEO VỊ TRÍ ---
// (Dùng để giải quyết việc có 4 Tiền vệ, 4 Hậu vệ thì ai sẽ là người chạm bóng)
function getRandomPlayer(teamId, type) {
    let filtered = teams[teamId].filter(p => p.type === type);
    if (filtered.length === 0) return teams[teamId][0]; // Lỗi dự phòng
    return filtered[Math.floor(Math.random() * filtered.length)];
}

// --- TẠO 22 CẦU THỦ (SƠ ĐỒ 4-4-2 CHO 2 ĐỘI) ---
async function seedDatabaseIfEmpty() {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "players"));
    
    if (!snapshot.exists()) {
        const dummyPlayers = {
            // ================= TEAM ĐỎ (HOME) =================
            "h_gk1": { teamId: "home", name: "Donnarumma", type: "GK", stats: { batBong: 680, phanXa: 700, sucBat: 600, chuyenDai: 500 } },
            "h_df1": { teamId: "home", name: "Theo", type: "DF", stats: { tocDo: 650, xoac: 580, doatBong: 550, theLuc: 600 } },
            "h_df2": { teamId: "home", name: "Chiellini", type: "DF", stats: { xoac: 650, doatBong: 620, danhDau: 580, theLuc: 550 } },
            "h_df3": { teamId: "home", name: "Bonucci", type: "DF", stats: { xoac: 630, doatBong: 600, chuyenDai: 580, danhDau: 550 } },
            "h_df4": { teamId: "home", name: "Di Lorenzo", type: "DF", stats: { tocDo: 580, xoac: 560, doatBong: 540, theLuc: 580 } },
            "h_mf1": { teamId: "home", name: "Modric", type: "MF", stats: { chuyen: 680, reBong: 600, chuyenDai: 650, doatBong: 450 } },
            "h_mf2": { teamId: "home", name: "Barella", type: "MF", stats: { theLuc: 650, chuyen: 620, xoac: 550, doatBong: 580 } },
            "h_mf3": { teamId: "home", name: "Verratti", type: "MF", stats: { chuyen: 660, reBong: 620, xoac: 520, theLuc: 580 } },
            "h_mf4": { teamId: "home", name: "Chiesa", type: "MF", stats: { tocDo: 650, reBong: 630, sut: 550, chuyen: 500 } },
            "h_fw1": { teamId: "home", name: "CR7", type: "FW", stats: { sut: 650, tocDo: 600, danhDau: 620, sucBat: 630 } },
            "h_fw2": { teamId: "home", name: "Immobile", type: "FW", stats: { sut: 620, tocDo: 550, reBong: 500, theLuc: 550 } },

            // ================= TEAM XANH (AWAY) =================
            "a_gk1": { teamId: "away", name: "Buffon", type: "GK", stats: { batBong: 690, phanXa: 680, sucBat: 580, chuyenDai: 520 } },
            "a_df1": { teamId: "away", name: "Carlos", type: "DF", stats: { tocDo: 680, sutXa: 650, xoac: 550, doatBong: 530 } },
            "a_df2": { teamId: "away", name: "Ramos", type: "DF", stats: { xoac: 640, doatBong: 630, danhDau: 650, theLuc: 600 } },
            "a_df3": { teamId: "away", name: "Vidic", type: "DF", stats: { xoac: 620, doatBong: 650, danhDau: 680, theLuc: 580 } },
            "a_df4": { teamId: "away", name: "Cafu", type: "DF", stats: { tocDo: 630, theLuc: 650, xoac: 560, chuyen: 550 } },
            "a_mf1": { teamId: "away", name: "Kroos", type: "MF", stats: { chuyen: 700, chuyenDai: 680, sutXa: 600, theLuc: 500 } },
            "a_mf2": { teamId: "away", name: "Kante", type: "MF", stats: { theLuc: 700, doatBong: 680, xoac: 650, chuyen: 550 } },
            "a_mf3": { teamId: "away", name: "De Bruyne", type: "MF", stats: { chuyen: 690, sutXa: 630, reBong: 600, chuyenDai: 650 } },
            "a_mf4": { teamId: "away", name: "Giggs", type: "MF", stats: { tocDo: 660, reBong: 650, chuyen: 580, theLuc: 550 } },
            "a_fw1": { teamId: "away", name: "Falcao", type: "FW", stats: { sut: 630, danhDau: 650, sucBat: 600, tocDo: 550 } },
            "a_fw2": { teamId: "away", name: "Rooney", type: "FW", stats: { sut: 610, theLuc: 650, sutXa: 600, reBong: 550 } }
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
    
    matchState.teamPossession = "home";
    matchState.zone = "Giữa sân";
    
    matchInterval = setInterval(processAILogic, 2500); 
}

// ==========================================
// THUẬT TOÁN AI DÀNH CHO 11 vs 11
// ==========================================
function processAILogic() {
    time += 2; 
    if (time > 90) return endMatch();
    document.getElementById("match-time").innerText = time + ":00";

    let atkTeamId = matchState.teamPossession;
    let defTeamId = atkTeamId === "home" ? "away" : "home";
    
    // Chọn ngẫu nhiên cầu thủ cầm bóng dựa vào khu vực
    if (!matchState.ballHolder) {
        if(matchState.zone === "Sân nhà") matchState.ballHolder = getRandomPlayer(atkTeamId, "DF");
        else if(matchState.zone === "Giữa sân") matchState.ballHolder = getRandomPlayer(atkTeamId, "MF");
        else matchState.ballHolder = getRandomPlayer(atkTeamId, "FW");
    }
    let attacker = matchState.ballHolder;
    let currentZone = matchState.zone;
    
    document.getElementById("possession-info").innerText = atkTeamId === "home" ? "Đỏ đang cầm bóng" : "Xanh đang cầm bóng";
    document.getElementById("zone-info").innerText = currentZone;

    let actionName, atkStatKey, defStatKey, defender;

    // --- KỊCH BẢN THEO KHU VỰC DÀNH CHO 11 NGƯỜI ---
    if (currentZone === "Sân nhà") {
        actionName = "Phát bóng dài";
        atkStatKey = "chuyenDai";
        defStatKey = "danhDau"; 
        // 1 Tiền đạo của đối phương sẽ lao vào cắt bóng
        defender = getRandomPlayer(defTeamId, "FW");
    } 
    else if (currentZone === "Giữa sân") {
        let isDribble = Math.random() > 0.5;
        if (isDribble) {
            actionName = "Cầm bóng đột phá";
            atkStatKey = "reBong";
            defStatKey = "doatBong";
        } else {
            actionName = "Chuyền phối hợp";
            atkStatKey = "chuyen";
            defStatKey = "xoac";
        }
        // 1 Tiền vệ của đối phương sẽ lao vào phòng ngự
        defender = getRandomPlayer(defTeamId, "MF");
    } 
    else { // Vòng cấm
        let isHeader = Math.random() > 0.6; // Đôi khi là tạt cánh đánh đầu
        if (isHeader) {
            actionName = "Không chiến!";
            atkStatKey = "danhDau";
            defStatKey = "sucBat";
            // Trung vệ đối thủ lao ra đánh đầu phá bóng
            defender = getRandomPlayer(defTeamId, "DF"); 
        } else {
            actionName = "Dứt điểm!";
            atkStatKey = "sut";
            defStatKey = "phanXa";
            // Đối mặt Thủ môn
            defender = getRandomPlayer(defTeamId, "GK"); 
        }
    }

    document.getElementById("event-title").innerText = `${actionName}`;

    let atkPower = attacker.getStat(atkStatKey);
    let defPower = defender.getStat(defStatKey);

    updateUI("atk", attacker.name, atkPower);
    updateUI("def", defender.name, defPower);

    let totalPower = atkPower.value + defPower.value;
    // Đảm bảo không bị chia cho 0 nếu chỉ số trống
    let winProb = totalPower > 0 ? Math.round((atkPower.value / totalPower) * 100) : 50;
    
    document.querySelector(".win-chance p").innerText = actionName;
    document.getElementById("win-prob").innerText = winProb + "%";

    let roll = Math.floor(Math.random() * 100);
    let isSuccess = roll < winProb;
    let logText = "";

    // --- CẬP NHẬT TRẠNG THÁI ---
    if (isSuccess) {
        if (currentZone === "Sân nhà") {
            logText = `${attacker.name} chuyền dài chính xác lên phía trên.`;
            matchState.zone = "Giữa sân";
            matchState.ballHolder = getRandomPlayer(atkTeamId, "MF"); // 1 Tiền vệ nhận bóng
        } 
        else if (currentZone === "Giữa sân") {
            logText = `${attacker.name} xử lý tốt! Bóng đã được đưa áp sát vòng cấm địa.`;
            matchState.zone = "Vòng cấm";
            matchState.ballHolder = getRandomPlayer(atkTeamId, "FW"); // 1 Tiền đạo nhận bóng
        } 
        else { // Sút/Đánh đầu thành công
            if (atkTeamId === "home") homeScore++; else awayScore++;
            document.getElementById(`score-${atkTeamId}`).innerText = atkTeamId === "home" ? homeScore : awayScore;
            
            if (atkStatKey === "danhDau") logText = `VÀOOOOO!!! Cú đánh đầu dũng mãnh của ${attacker.name}!`;
            else logText = `VÀOOOOO!!! ${attacker.name} tung cú sút hạ gục ${defender.name}!`;
            
            // Giao bóng lại
            matchState.teamPossession = defTeamId;
            matchState.zone = "Giữa sân";
            matchState.ballHolder = null; 
        }
    } else { // Thất bại
        if (currentZone === "Vòng cấm") {
            if (defender.type === "GK") logText = `KHÔNG VÀO! ${defender.name} đã cứu thua xuất sắc!`;
            else logText = `${defender.name} đã phá bóng giải nguy thành công.`;
        } else {
            logText = `Mất bóng rồi! ${defender.name} đã tranh chấp thành công.`;
        }
        
        matchState.teamPossession = defTeamId;
        matchState.ballHolder = defender;
        
        if (currentZone === "Vòng cấm") matchState.zone = "Sân nhà";
        else if (currentZone === "Sân nhà") matchState.zone = "Vòng cấm";
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
