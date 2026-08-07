// 1. Cấu trúc dữ liệu Cầu thủ (Dựa trên hình ảnh bạn cung cấp)
class Player {
    constructor(name, type, stats) {
        this.name = name;
        this.type = type; // 'FW' (Tiền đạo), 'MF' (Tiền vệ), 'DF' (Hậu vệ), 'GK' (Thủ môn)
        this.stats = stats;
        this.awakeningGauge = 0; // Thanh kích thích (0 -> 100)
    }

    // Cơ chế thức tỉnh: Trả về chỉ số x1.5 nếu thanh kích thích đầy
    getStat(statName) {
        let baseStat = this.stats[statName];
        if (this.awakeningGauge >= 100) {
            this.awakeningGauge = 0; // Reset sau khi dùng
            return { value: Math.round(baseStat * 1.5), isAwakened: true };
        }
        this.awakeningGauge += 25; // Mỗi lần tham gia sự kiện tăng nộ
        return { value: baseStat, isAwakened: false };
    }
}

// Khởi tạo cầu thủ (Chỉ số mô phỏng từ ảnh Falcao và CR7)
const falcao = new Player("Falcao", "FW", { sut: 602, reDat: 504, tocDo: 486 });
const ronaldo = new Player("CR7", "FW", { sut: 624, reDat: 604, tocDo: 624 });
const chiellini = new Player("Chiellini", "DF", { xoac: 550, doatBong: 520, theLuc: 500 });
const buffon = new Player("Buffon", "GK", { batBong: 600, phanXa: 650 });

// Biến lưu trữ trận đấu
let homeScore = 0;
let awayScore = 0;
let time = 0;

// 2. Logic xử lý tình huống Đụng độ (Encounter Engine)
function triggerRandomEvent() {
    time += 5; // Trôi qua 5 phút
    document.getElementById("match-time").innerText = time + ":00";

    if(time > 90) {
        document.getElementById("commentary-box").innerText = "HẾT GIỜ! TRẬN ĐẤU KẾT THÚC.";
        return;
    }

    // Chọn ngẫu nhiên loại sự kiện
    const eventTypes = ["Cơ Hội Sút Gần", "Cơ Hội Rê Bóng Solo"];
    const currentEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    document.getElementById("event-title").innerText = currentEvent;

    let attacker, defender, atkStatName, defStatName;

    // Thiết lập kèo đấu dựa trên sự kiện
    if (currentEvent === "Cơ Hội Sút Gần") {
        attacker = ronaldo; defStatName = "batBong";
        defender = buffon; atkStatName = "sut";
    } else {
        attacker = falcao; defStatName = "xoac";
        defender = chiellini; atkStatName = "reDat";
    }

    // Lấy chỉ số (Đã bao gồm check Thức Tỉnh)
    let atkPower = attacker.getStat(atkStatName);
    let defPower = defender.getStat(defStatName);

    // Hiển thị UI Cầu thủ
    updateUI("atk", attacker.name, atkPower);
    updateUI("def", defender.name, defPower);

    // 3. Tính toán Tỷ lệ % chiến thắng cho Attacker
    let totalPower = atkPower.value + defPower.value;
    let winProb = Math.round((atkPower.value / totalPower) * 100);
    document.getElementById("win-prob").innerText = winProb + "%";

    // 4. Tung xúc xắc quyết định kết quả
    let roll = Math.floor(Math.random() * 100); // Random từ 0 -> 99
    let logText = "";

    if (roll < winProb) {
        // Attacker Thắng
        if (currentEvent === "Cơ Hội Sút Gần") {
            homeScore++;
            document.getElementById("score-home").innerText = homeScore;
            logText = `VÀOOOOO! ${attacker.name} tung cú sút tuyệt đẹp hạ gục ${defender.name}!`;
        } else {
            logText = `${attacker.name} dùng kỹ thuật loại bỏ ${defender.name} dễ dàng, mở ra khoảng trống!`;
        }
    } else {
        // Defender Thắng
        if (currentEvent === "Cơ Hội Sút Gần") {
            logText = `KHÔNG VÀO! ${defender.name} bay người cản phá xuất thần cú sút của ${attacker.name}.`;
        } else {
            logText = `${defender.name} đã chuồi bóng chính xác, chặn đứng pha đi bóng của ${attacker.name}.`;
        }
    }

    document.getElementById("commentary-box").innerText = logText;
}

// Hàm hỗ trợ cập nhật Giao diện
function updateUI(side, name, powerObj) {
    document.getElementById(`${side}-name`).innerText = name;
    document.getElementById(`${side}-stat`).innerText = powerObj.value;
    document.getElementById(`${side}-awaken`).style.display = powerObj.isAwakened ? "block" : "none";
}
