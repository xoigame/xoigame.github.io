# Ngoại hình nhân vật — đọc 7 ảnh tham chiếu ra số (2026-09-09)

> Luật: [Docs/AgentRules/CharacterLook.md](../AgentRules/CharacterLook.md). Skill:
> `.claude/skills/stickman-look/`. Xem trước: `look_preview.py` (ghép nguyên con theo rig thật).

## 1. Bảy ảnh nói gì

| Ảnh | Game | Điều đọc được |
|---|---|---|
| Chọn nhân vật | Stick Warriors | thân **màu da**, võ phục cam/xanh, tóc gai VÀNG to bằng nửa đầu; tay chân **dày ~0.3 đường kính đầu**, đầu tròn ~1/4 chiều cao; **không mặt** |
| Stickman Warrior | itch | que BEIGE mảnh, khớp tròn, băng quấn tay; nón + khiên là thứ nhận diện |
| Ghép quân | (merge) | que **màu + VIỀN ĐEN**, nón rơm, tóc, áo màu; tay chân dày |
| Super Stickman | Dragon Warriors | thân ĐEN + bộ đồ màu (vàng/đỏ) + biểu tượng ngực; hiệu ứng phát sáng |
| Đấu | Stick Warriors | tóc bạc gai, gi cam, quần xanh; đối thủ đỏ-xanh có hoa văn — phân biệt bằng **KHỐI MÀU LỚN** |
| Congratulations | Stick Warriors | 16 nhân vật: mọi nét nhận diện nằm ở **tóc + màu áo/quần + phụ kiện** (đuôi khỉ · áo choàng · kính · khăn) |
| Duel | Stick Fight | que ĐỎ / XANH một màu ĐẶC, không viền, tay chân dày, nón to (kabuto / mũ trụ) |

Kết luận thiết kế: nhận diện ở cỡ 40 px đến từ **(1) bóng tóc, (2) hai khối màu áo/quần,
(3) một phụ kiện thò ra ngoài bóng (đuôi, áo choàng, khăn)**. Chi tiết mặt gần như không đọc
được ở cỡ đó — nên mặt là trục phụ, xác suất thấp.

## 2. Số đo rút ra (đơn vị: đường kính đầu D = 0.26 world)

| Đại lượng | Tham chiếu | Dự án |
|---|---|---|
| Bề dày tay chân | 0.28–0.35 D (SW) · 0.15 D (SW-itch) · 0.35 D (Stick Fight) | `limbThickness` 0.06 / 0.075 / 0.085 / 0.10–0.12 (orc, golem); que gốc 0.0525 = 0.2 D |
| Cỡ đầu | 1.0–1.2 D | `headScale` 1.0 / 1.08 / 1.15 (chibi) |
| Tóc thò ra ngoài sọ | 0.3–0.8 D | canvas 128 px cho đầu 64 px → tối đa thò 32 px = 1 D |
| Bề ngang áo | 0.6–0.75 D | 40–44 px trên thân 72 px (≈ 0.65 D) |
| Áo choàng | dài qua hông, flare 0.5 D | `Back_Cape` 44 px sau lưng |
| Đuôi | 1.2–1.5 D | 96 px canvas đuôi ≈ 0.47 world = 1.8 D (hơi dài, cố ý cho đọc được) |

## 3. Sáu trục đa dạng (và trục nào rẻ nhất)

| Trục | Số lựa chọn | Chi phí thêm một lựa chọn |
|---|---|---|
| Màu thân / quần / ống tay | ∞ (bảng màu) | 0 — thêm một mã hex vào `Specs` |
| Độ dày | 4 | 0 — thêm số |
| Tóc | 13 kiểu × 9 màu | một hàm vẽ ~5 dòng |
| Áo | 12 | một hàm vẽ ~5 dòng |
| Sau lưng | 7 | như trên |
| Đuôi · băng · mặt · dáng đầu | 4 · 8 · 8 · 5 | như trên |

Tích các trục ≈ 10⁶ tổ hợp trong một thời kỳ; nhìn trên sân là "mỗi người một kiểu".

## 4. Bốn thời kỳ khác nhau ở đâu (bảng `StickmanLookBuilder.Specs`)

| | Trung cổ | Hiện đại | Fantasy | Võ lâm |
|---|---|---|---|---|
| Thân màu | 35 % (da) | 45 % (da + đỏ/xanh đặc) | 75 % (da · xanh orc · đỏ quỷ · xương · tím) | 30 % (da) |
| Dày | 0/0/.06/.075 | 0/.065/.075/.085 | .06/.075/.085/.10 | 0/.055/.065 |
| Tóc đặc trưng | bím · búi · dài | vuốt keo · mohawk · afro | gai Saiyan · lửa · bờm | búi · đuôi ngựa · bím |
| Áo | tunic · giáp tấm · vảy | chống đạn · ghi-lê · jacket | gi · robe · khố · băng | hanfu · robe |
| Băng đầu | khăn · hood · vương miện | mũ lưỡi trai · bandana · ăng-ten | sừng · hào quang · vương miện | khăn · hood |
| Đuôi | — | — | 25 % (khỉ · thằn lằn · chùm · mũi tên) | — |

### 4a. Thang bậc Fantasy trên cùng chủng

Không nhân bản prefab theo bậc: `FantasyRaceLoadout.Rank` giữ cấp thật (`Levy` · `Regular` ·
`Elite`), còn `FantasyRigPaint` đắp art xám `Rank_{cấp}.png` lên `body_1` của mọi biped. Nhờ vậy
Orc/Elf/Dwarf vẫn có đầu, màu và dáng riêng nhưng nhìn lướt qua vẫn phân biệt được dân binh,
chính quy và tinh nhuệ. Ba tấm ở `Resources/Fantasy/Races/Rank/` cùng khổ 96×128 / PPU 100;
runtime nhuộm nâu · lam · vàng thay vì vẽ màu cố định. Full-body creature không nhận lớp này để
không làm hỏng hình học centaur/naga/rồng.

## 5. Preset (cùng số với `look_preview.py PRESETS` và hồ sơ `Pf(...)`)

Saiyan · Villain · Knight · Viking · Archer · Peasant · King · Soldier · Robber · Militia ·
Police · Terrorist · Orc · Elf · Demon · Skeleton · Dwarf · Mage · Wisp · Golem · Shaolin ·
Wudang · Emei · Beggar + 30 chủng Fantasy (dáng + áo — 5 hồ sơ nhạt được đo lại 2026-09-09, xem luật "Áo phải TỐI hơn thân").

## 6. Prompt ChatGPT (art đẹp thay bản code)

Xem `WeaponArt-ChatGPT-Prompt.md` mục 12. Ràng buộc riêng của bộ này: **vẽ TRẮNG + xám + viền
tối** (không vẽ màu thật), đúng khổ canvas và mốc ở luật mục 3, nhìn ngang +X, tên file y hệt.
