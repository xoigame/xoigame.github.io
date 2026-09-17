# Chuyển kiểu chơi sang sân 3/4 — đo, phân loại, và ba công thức

> Cập nhật 2026-09-13. Đo bằng script trên chính cây mã, không phải trí nhớ.

---

## 1. Con số thật

| Đo được | Số |
|---|---|
| Lớp trọng tài (`MatchModeBase` và con cháu) | **36** |
| Gắn được lên **mọi** map, **cả hai** kiểu nhìn (qua `MapModeBinder`) | **13** (11 cũ + Dàn trận + Doanh trại) |
| Chỉ được `AddComponent` bởi **builder SCENE** ⇒ chưa bao giờ chạy ở 3/4 | **22** |
| `MissionType` đã có map sân 3/4 | **28/28** (ít nhất 5 map mỗi loại) |

**Kết luận quan trọng: thiếu mode ở sân 3/4 KHÔNG phải vì thiếu map.** Map 3/4 đã đủ cho cả 28
nhiệm vụ. Thứ thiếu là **chỗ nối**: mode nằm trong scene dựng tay thì nó chỉ tồn tại ở đúng
scene đó, đúng kiểu nhìn đó — dù luật thắng của nó chẳng liên quan gì tới kiểu nhìn.

---

## 2. Ba công thức chuyển

### A. Trọng tài SẠCH — chỉ cần luật thắng

Mode không đòi một món đồ đạc nào ngoài *hai phe + người chơi* ⇒ thêm một giá trị
`ModeKind` + một `case` trong `MapModeBinder`. Xong: nó chạy trên **mọi** map và **cả hai** kiểu
nhìn, không thêm scene nào.

Ví dụ đã làm: **`BattlefieldMode`** (`ModeKind.Battlefield`) — dàn trận → xung phong → vỡ trận.

### B. Mode cần ĐỒ ĐẠC mà map đã dựng sẵn — nối lại, đừng dựng lại

Mode đòi kho, nhà chính, cửa viện binh, điểm chiếm… Nếu **nhiệm vụ tương ứng đã dựng những thứ
đó** thì chỉ cần một lớp "lắp ráp" đi tìm chúng lúc chạy rồi nối vào.

⚠ Rào cản hay gặp: các thành phần chỉ có `EditorSetup` bọc `#if UNITY_EDITOR` — phải nâng lên
thành `Setup` runtime (và `EditorSetup` gọi lại nó, giữ một nguồn sự thật).

Ví dụ đã làm: **`MapWarCampSetup`** (`ModeKind.WarCamp`) — map `WarEconomy` đã có trại · kho ·
mỏ · nông dân; lớp này nối thêm **ví** (`TeamEconomy`) + **ban xây dựng** (`CampBuildYard`) +
**bảng điều khiển** (`CampGameUi`). Không đẻ hệ kinh tế thứ hai.

### C. Mode có TẦNG RIÊNG — phải port cả tầng đó

Chiến dịch theo lượt, bản đồ thế giới, giải đấu nhiều vòng. Trận đánh của chúng nạp một scene
bake; muốn đánh ở sân 3/4 thì cái scene ấy phải dựng bằng `MapAssembler` từ một `MapDefinition`
khai `plane = Ground`, rồi thả quân của tầng chiến lược vào.

Chưa làm. Ứng viên: `ThreeKingdomsCampaignMap` → `CampaignBattleContext` → `CampaignBattleMode`.

---

## 3. Bảng 22 mode còn khoá trong scene

Cột «đòi gì» đo từ các ô `[SerializeField]` tham chiếu scene của chính lớp đó.

| Mode | Công thức | Đòi gì trong scene |
|---|---|---|
| `AppleShotMode` | A | (không) |
| `ArcheryTrialMode` | A | (không) |
| `HostageRescueMode` | B | con tin (map phải dựng) |
| `HuntMode` | A | (không — thú hoang do map rải) |
| `RanchMode` | B | chuồng trại |
| `TowerHoldMode` | A | (không) |
| `WuxiaMode` | A | (không) |
| `ThreeKingdomsCampMode` | B/C | trại ba nước + cổng vòng |
| `BombDefusalMode` | B | `BombSite[]` |
| `ChampionDuel` | B | hai võ sĩ + đài |
| `EscortMissionMode` | B | `StickmanAgent` được hộ tống |
| `PrisonerRescue` | B | lồng tù binh |
| `SiegeCamp` | B | mục tiêu công thành |
| `SurviveNightsMode` | B | `DayNightCycle` |
| `TimeSlipDefenseMode` | B | `AmmoCache` |
| `TugOfWarLine` | B | vạch kéo co |
| `VillageRaid` | B | cửa viện binh · `Fortification` · kho |
| `WuxiaTournamentMode` | B | danh sách võ sĩ |
| `ZombieLastManMode` | B | `ZombieDirector` |
| `ZombieOutbreakMode` | B | `ZombieWaveDirector` |
| `ZombieWaveMode` | B | `ZombieSquadUpgrades` |
| `ModernFrontMode` | B | ba học thuyết |
| `FantasyInvasionMode` | B | cổng dịch chuyển |
| `NavalBattle` | C | mặt nước (sân 3/4 chưa có) |

---

## 4. Đã xong (2026-09-13)

| Mode | Vào chơi bằng gì |
|---|---|
| **Dàn trận** (`ModeKind.Battlefield`) | 8 map mẫu 24 quân/phe — «Maps > 9. Build DÀN TRẬN». Pha dàn trận 25 s, nút **XUNG PHONG**, thắng bằng diệt sạch **hoặc** vỡ trận. Chạy ở **cả hai** kiểu nhìn. |
| **Doanh trại** (`ModeKind.WarCamp`) | 4 map 3/4 — «Maps > 8. Build SÂN MẶT ĐẤT». Đào vàng → **xây nhà** → **mua lính** → dàn đội hình. Ô đất trải theo chiều sâu, không nằm một hàng. |

Phép đo đi kèm (bảng khám): «Dàn trận — map có mode mà không có trận» và «Doanh trại trên map —
có mode mà không tiêu được tiền».
