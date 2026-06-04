// 1. KHUÔN CẦU THỦ VỚI 19 CHỈ SỐ
class Player {
    constructor(name, position, stats) {
        this.name = name;
        this.position = position;
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

// 2. KHỞI TẠO DATA CẦU THỦ THỰC TẾ
// Tiền đạo (Lấy đúng số của CR7 trong ảnh)
const cr7 = new Player("CR7", "T.Đạo", {
    tocDo: 624.9, reDat: 604.8, sut: 624.9, butPhat: 558, theLuc: 522
});

// Hậu vệ & Thủ môn đối phương (Tạo số liệu giả lập để test)
const ramos = new Player("S. Ramos", "Tr.Vệ", {
    xoacBong: 580, doatBong: 610, tocDo: 500, theLuc: 500
});

const casillas = new Player("Casillas", "T.Môn", {
    cuuBong: 630, sucBat: 600, damBong: 550
});

// 3. HÀM MÔ PHỎNG TRẬN ĐẤU
function startMatch() {
    const logBox = document.getElementById("match-log");
    logBox.innerHTML = ""; // Xóa log cũ
    
    let htmlLog = `<p class="text-yellow">▶ TRỌNG TÀI THỔI CÒI BẮT ĐẦU TRẬN ĐẤU!</p>`;
    
    // Hàm tạo độ lệch phong độ ngẫu nhiên từ 80% đến 120%
    const getRNG = () => (Math.random() * 0.4 + 0.8);

    // --- PHA 1: TIỀN ĐẠO ĐỐI MẶT HẬU VỆ ---
    htmlLog += `<p>Phút 15: <span class="text-blue">${cr7.name}</span> đang cầm bóng lao về phía khung thành...</p>`;
    
    // Tính toán Tấn công (Tốc độ + Rê dắt + Bứt phát) vs Phòng thủ (Đoạt bóng + Xoạc bóng + Tốc độ)
    let attackPower = (cr7.stats.tocDo + cr7.stats.reDat + cr7.stats.butPhat) * getRNG();
    let defensePower = (ramos.stats.doatBong + ramos.stats.xoacBong + ramos.stats.tocDo) * getRNG();

    if (attackPower > defensePower) {
        htmlLog += `<p>🔥 Bằng kỹ thuật cá nhân, <span class="text-blue">${cr7.name}</span> đã đi bóng qua mặt <span class="text-red">${ramos.name}</span>!</p>`;
        
        // --- PHA 2: ĐỐI MẶT THỦ MÔN ---
        htmlLog += `<p>Phút 16: Không bị ai kèm, <span class="text-blue">${cr7.name}</span> vung chân dứt điểm!</p>`;
        
        // Tính toán Sút (Sút + Thể lực) vs Bắt bóng (Cứu bóng + Sức bật)
        let shotPower = (cr7.stats.sut * 1.5 + cr7.stats.theLuc) * getRNG();
        let savePower = (casillas.stats.cuuBong * 1.5 + casillas.stats.sucBat) * getRNG();

        if (shotPower > savePower) {
            htmlLog += `<p class="text-green">⚽ VÀOOOOO!!! Cú sút quá mạnh khiến <span class="text-red">${casillas.name}</span> bó tay! 1-0 cho đội nhà!</p>`;
        } else {
            htmlLog += `<p>🛡️ KHÔNG VÀO! <span class="text-red">${casillas.name}</span> bay người cứu thua xuất thần! Một pha cản phá khó tin!</p>`;
        }
    } else {
        htmlLog += `<p>❌ Không qua được! <span class="text-red">${ramos.name}</span> đã có một pha xoạc bóng cực kỳ chính xác để đoạt lại quyền kiểm soát.</p>`;
    }

    htmlLog += `<p class="text-yellow">▶ HẾT TÌNH HUỐNG.</p>`;
    
    // Đẩy kết quả ra màn hình
    logBox.innerHTML = htmlLog;
}
