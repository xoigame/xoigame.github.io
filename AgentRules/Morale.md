## ⚠⚠ SĨ KHÍ — và KỲ BINH, cái nút đầu tiên người chơi bấm được vào nó (2026-09-09)

Hệ sĩ khí có từ lâu và đủ hai chiều, nhưng **người chơi không có cách nào tác động vào nó**:
sĩ khí lên xuống hoàn toàn theo diễn biến trận đánh, không có quyết định nào để ra. Kỳ binh
(`StickmanBannerBearer`) là cái nút đó — mang thêm một người gần như không đánh, đổi lấy việc
cả tuyến quanh nó không vỡ.

### 1. Hệ sĩ khí đang có (`AIProfile` + `StickmanAgent`)

| Số | Nghĩa |
|---|---|
| `moraleBase` 42 · `moralePerTier` 14 | bể sĩ khí; cấp lính (`UnitRank`) càng cao càng dày |
| `moraleRadius` 4 | chỉ thấy cái chết trong bán kính này |
| `moraleLossPerAllyDeath` 19 · `moraleLossWhenHit` 3.5 | hai nguồn bào xuống |
| `moraleRecoverPerSecond` 6 | hồi khi KHÔNG giao tranh |
| `moraleRoutThreshold` 0.08 → vỡ trận · `moraleReturnThreshold` 0.55 → quay lại |
| `CombatReadiness` | sĩ khí thấp thì đánh yếu đi (0.25 → 1.0) |

⚠ `MoraleEnabled` đòi `moraleRadius > 0 && moraleBase > 0` — zombie và quái vô cảm nằm ngoài
hệ này, và **mọi thứ tác động vào sĩ khí phải đi qua `RecoverMorale`/`ShockMorale`** để tự tôn
trọng cửa đó. Đừng ghi thẳng vào biến.

### 2. KỲ BINH — `StickmanBannerBearer` (Assets/Scripts/AI/)

| Số | Mặc định | Vì sao |
|---|---|---|
| `_radius` | 5.5 | đủ ôm MỘT tuyến, không ôm cả trận |
| `_moralePerSecond` | 4.5 | hồi tự nhiên là 6/s nhưng chỉ chạy khi không giao tranh; cái này chạy CẢ trong lúc đánh |
| `_maxPerTeam` | 2 | trần mỗi phe |
| `_deathShock` | 22 | "cờ đổ" — cái GIÁ của buff |

**Bốn luật, mỗi cái chặn một cách làm hỏng:**

1. **CÓ TRẦN.** Không trần thì chia bài ra bao nhiêu kỳ binh cũng thành bấy nhiêu nguồn hồi
   chồng nhau ⇒ cả phe bất tử về tinh thần và hệ sĩ khí biến mất khỏi trận. Người vượt trần
   thành **DỰ BỊ**: vẫn là lính bình thường, chỉ không cầm cờ.
2. **CỜ ĐỔ THÌ SỐC.** Buff miễn phí không phải một quyết định. Kỳ binh chết là đúng những người
   vừa được nó giữ vững bị bào một nhát — nên nó vừa đáng bảo vệ, vừa đáng săn.
3. **DỰ BỊ NHẶT CỜ LÊN.** Không thì một mũi tên may mắn xoá sổ cả cơ chế.
4. **Không có ngoại lệ cho chính nó** — kỳ binh vẫn vỡ trận nếu bị vây.
5. **TRẢ CHỖ KHI BIẾN MẤT MÀ KHÔNG CHẾT** (`OnDisable`). Không phải người cầm cờ nào cũng chết:
   dọn xác cuối đợt, đổi màn, hết ván, `Destroy` — những đường đó KHÔNG bắn `Died`, nên chỗ cầm
   cờ đi theo object mất trong khi trần vẫn tính đủ hai. Phe đó vĩnh viễn hụt một kỳ binh và
   không ai nhặt cờ, không một dòng lỗi nào. ⚠ Không bào sĩ khí ở nhánh này: không ai NHÌN THẤY
   cái gì ngã, mà phạt vô hình là thứ người chơi không đọc ra được.

⚠ Quyết định cầm cờ ở `Start`, **không** ở `Awake`: `TeamMember.TeamId` do bộ chia phe đặt sau
khi `Instantiate`, hỏi sớm là cả phe đếm nhầm về đội 0 (cùng bài học `DressExistingUnits`).

### 3. Lá cờ nhìn thấy được

⚠⚠ `UnitInsignia` **đã bỏ hẳn cờ lệnh** ngày 2026-09-04 vì cờ bám lưng bị SOI GƯƠNG khi nhân
vật quay trái, và cờ có chữ thì lật ra là đọc được ngay. Cờ của kỳ binh dựng lại được vì **hai
điều kiện khác hẳn**:

- lá cờ **TRƠN** (art `CommandInsigniaSet.banner`, thang xám, không chữ) — lật vô hại;
- nó là **CON CỨNG của xương thân**, xoay −90° đúng khuôn `StickmanLook.OnTorsoBone`, đi theo
  xương như que gốc thay vì tự đặt lại theo hệ thế giới mỗi frame ([CharacterLook](CharacterLook.md) mục 8).

Cờ mang **màu phe** (`TeamMember.ColorOf`) và **ở lại trên xác** (`StickmanCorpseGear.KeepOn`) —
cờ biến mất ngay lúc người ngã thì không ai thấy "cờ đổ", mà cờ đổ chính là tín hiệu của cú sốc.
Chưa chạy tool phù hiệu thì không có cờ nhưng buff vẫn chạy (hỏng mềm; Doctor có dòng vàng).

### 4. Bốn điểm nối (Doctor › «KỲ BINH nối thiếu chỗ»)

| # | Điểm | Thiếu thì |
|---|---|---|
| 1 | `UnitLoadout.ApplyTo` gắn `StickmanBannerBearer` | cơ chế viết xong KHÔNG AI GẮN |
| 2 | `StickmanCivilizationBuilder` khai `banner: true` (hàm `BannerUnit`, mục 3b) | không nền nào phát kỳ binh ⇒ chưa từng ra trận (bẫy Pollaxe) |
| 3 | `CommandInsigniaSet` có art | có buff mà không thấy cờ |
| 4 | component gọi `RecoverMorale` + `ShockMorale` | mất buff, hoặc mất cái giá |
| 5 | `OnDisable` trả chỗ cầm cờ | trần RÒ — phe hụt kỳ binh vĩnh viễn, im lặng |

⚠ **Kỳ binh thêm ở MỘT chỗ cho MỌI nền** (`BannerUnit(spec)` nối vào cuối roster), không gõ vào
19 bảng `units` — quân đội nào cũng có người cầm cờ, và nền thứ 20 sau này tự có.
⚠ Vai **CẬN CHIẾN**, không phải `Support`: không nền nào phát vai Support, mà `LoadoutFor` chỉ
lùi Support→Melee chứ không có chiều ngược lại — đặt vào Support là kỳ binh không bao giờ ra sân.
⚠ Tỉ lệ "1–2 người mỗi phe" đến từ **chia bài không lặp** (mỗi loadout rút một lần trên ~10 loại
cận chiến) **cộng** trần ở component. Không đặt tỉ lệ trong roster: mọi đường sinh quân (doanh
trại, máy sinh đợt, hồi sinh) đều đi qua component nên không chỗ nào phải nhớ.

### 5. Muốn thêm một nguồn sĩ khí khác

Đi đúng khuôn này: một `MonoBehaviour` có **tầm · nhịp · trần · cái giá**, gọi `RecoverMorale`
hoặc `ShockMorale`, và một dòng trong Doctor canh điểm nối. Ví dụ đã có: `FantasyBansheeWail`
(bào sĩ khí địch — chiều ngược lại của kỳ binh).
