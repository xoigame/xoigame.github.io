# CHẾ ĐỘ HIỆN ĐẠI — CÒN GÌ ĐÁNG THÊM (2026-09-08)

> Trả lời câu của user: *"trong chế độ hiện đại có gì thêm mới, thêm ý tưởng giúp tôi, AI,
> gameplay, animation thêm hết vào"*.
>
> Luật của phần ĐÃ LÀM nằm ở [Perception.md](../AgentRules/Perception.md).
> Nền cũ: [Shooter.md](Shooter.md) · [ModernFront.md](../AgentRules/ModernFront.md) ·
> [Vehicles.md](../AgentRules/Vehicles.md). Tiếp nối [Roadmap-NextWave.md](Roadmap-NextWave.md)
> (bản cho CẢ dự án; file này chỉ nói về thể loại Hiện đại).

---

## 0. ĐO TRƯỚC — hiện đại đang có gì (để không đề xuất trùng)

| Đo | Số | Ghi chú |
|---|---:|---|
| Màn Hiện đại | **9** | `Demo_42..48` · `Demo_55_ModernFront` · `Demo_57_RoyaleModern` |
| Luật thắng riêng | 8 | TDM · đặt bom · con tin · gun game · zombie bùng phát · người cuối · đột chiếm căn cứ · mặt trận ba nước |
| Vũ khí hiện đại | ~23 | súng 20–25 · 51–63 · pháo/bom xe 64–65 · 68–69 |
| Lực lượng / quốc gia | 4 + 3 | Cảnh sát · Quân đội · Cướp · Khủng bố + Bắc Phong · Hồng Sa · Kim Sơn |
| Khí tài | xe (bán tải · thiết giáp · tăng · tải) + máy bay ném bom + trực thăng + lính dù + kiện tiếp tế |
| AI bắn súng | nấp bắn · bắn áp chế · tiến theo cặp · nấp thấp thì nằm · chiếm chỗ cao |

**Ba lỗ hổng đo được bằng `grep` (0 kết quả) trước hôm nay:** không có hệ NGHE · không có bản đồ
nguy hiểm dùng chung · không có cái đầu quyết định ném lựu đạn khói/chớp/lửa.

---

## 1. ĐỢT 1 — ĐÃ LÀM HÔM NAY

Xem [Perception.md](../AgentRules/Perception.md) để biết luật và bẫy. Tóm tắt:

| Thứ | Cái gì đổi trên màn hình |
|---|---|
| **`NoiseField` — cái TAI** | Bị bắn tỉa từ ngoài tầm nhìn giờ CÓ phản ứng: quay đầu, báo động, (tuỳ hồ sơ) đi tra. Ban đêm tai thay mắt. Chạy thì bị nghe, ĐI BỘ thì im — dự án có động từ "rón rén" |
| **`DangerField` — BẢN ĐỒ NGUY HIỂM** | Không còn cảnh cả tiểu đội lần lượt chui vào đúng cái ổ phục kích vừa giết hai đồng đội. Rút lui gặp "vách lửa" thì dừng lại đánh trả thay vì lao vào tuyến súng của nước thứ ba |
| **`AIGrenadeModule`** | Khói để BĂNG QUA bãi trống · chớp trước khi XÔNG VÀO · lửa để ÉP địch rời chỗ nấp. Ba quả, ba câu hỏi khác nhau |
| **Dáng `peek`** | Nhịp ló-ra/thụt-vào cuối cùng cũng NHÌN THẤY ĐƯỢC: khuỵu gối, tì người vào mép bao cát, đầu chúi theo nòng |

---

## 2. AI — bảy thứ còn lại, xếp theo (giá trị ÷ công)

| # | Ý tưởng | AI phải học gì MỚI | Dùng lại được gì | Công |
|---|---|---|---|---|
| 2.1 | **Tổ ba người có VAI** (điểm · hoả lực · ném) | ai được đi, ai đè đầu, ai ném — quyết theo TỔ chứ không theo người | `boundingHoldTime` (đã có vé đi), `CoverTactics` sổ xí phần | ★★ |
| 2.2 | **Bắn tỉa: bắn xong ĐỔI Ổ** | "tôi vừa gây ra tiếng, chỗ này lộ rồi" — đọc chính `NoiseField` mình vừa ghi | `AIProfile_RinhRap`, `CoverTactics.Find` | ★ |
| 2.3 | **Y TÁ KÉO thương binh ra khỏi lằn đạn** | kéo về ô `DangerField` THẤP rồi mới cứu | `AIRescueModule`, `StickmanDowned`, `DangerField.SaferSide` | ★★ |
| 2.4 | **Kỷ luật băng đạn của tổ** | "đừng cùng nạp một lúc" — một người giữ cò khi hai người kia nạp | `RangedWeapon.MagazineLow`, sổ xí phần kiểu `_moveTokens` | ★ |
| 2.5 | **Tổ RPG chọn mục tiêu theo GIÁ TRỊ** | xe tăng > thiết giáp > cụm bộ binh > công trình; và ĐỪNG bắn vào cái đã có người khác khoá | `ThreatBoard` (khuôn sổ), `VehicleSpecs` | ★★ |
| 2.6 | **Nhớ chỗ vừa thấy địch** (`TeamBlackboard`) | mất dấu thì tìm ở chỗ NHỚ, không quên ngay | `RaiseAlert`, `AISpotterModule` | ★★ |
| 2.7 | **Rút theo tuyến, không rút theo người** | cả tổ lùi về CÙNG một mốc rồi lập tuyến mới | `CommandNode.ComputeLineAnchor`, `DangerField` | ★★★ |

**Đề xuất làm trước: 2.3 và 2.2** — cả hai đọc thẳng hai hệ vừa dựng nên gần như không có code
hạ tầng mới, mà cái nhìn thấy được thì rất rõ.

---

## 3. GAMEPLAY — chín thứ, xếp theo (giá trị ÷ công)

| # | Kiểu chơi / cơ chế | Vì sao hợp bộ khung này | Dùng lại được gì | Công |
|---|---|---|---|---|
| 3.1 | **ĐÊM ĐỘT KÍCH** (một màn mới) | Đây là màn DUY NHẤT khai thác hết cái tai vừa dựng: mắt tụt còn 0.65, tiếng thành giác quan chính, đi bộ = lẻn, chạy = lộ | `DayNightCycle`, `WorldLighting`, `NoiseField`, `StickmanStealth`, `AIWatchModule` | ★★ |
| 3.2 | **SÚNG GIẢM THANH** (2–3 cây) | Hệ đã sẵn sàng: `_noiseRadius = 0` là khai báo giảm thanh. Đổi lại: sát thương/tầm thấp hơn | dây chuyền `WeaponIntake` | ★ |
| 3.3 | **MÌN · CLAYMORE · BẪY DÂY** | Thứ duy nhất trong game bắn súng "đánh khi mình không có mặt". Hợp map vòng và màn thủ trại | `AreaHazard`, `CampBuildKind.Trap` (đã có ô!) | ★★ |
| 3.4 | **GỌI PHÁO / GỌI KHÔNG KÍCH** (đánh dấu điểm, chờ, đạn rơi) | Cho người chơi một động từ TẦM CHIẾN DỊCH, và cho AI một lý do để tản ra | `AirSupportDirector`, `Mortar` (62), `ModePrompt` | ★★ |
| 3.5 | **UAV TRINH SÁT** (lộ địch một vùng, bắn rơi được) | Trả lời câu "làm sao biết địch ở đâu" mà không phá luật tầm nhìn | `Aircraft`, `AntiAirGun` (69), `AISpotterModule` | ★★ |
| 3.6 | **CHIẾN HÀO** (một màn kiểu WW1/WW2) | Địa hình LÕM là thứ bộ `TerrainGround` làm được mà chưa màn nào dùng: hào, dây thép gai, ụ súng máy, còi xung phong | `TerrainGround`, `FortKit`, `GarrisonPost`, `Lmg` | ★★★ |
| 3.7 | **ĐÁNH TRONG NHÀ** (dọn từng phòng) | `StructureKit` V13 đã cho vào trong nhà nhiều tầng — nhưng chưa luật chơi nào hỏi tới | `StructureKit`, `LaneNav`, `Flashbang` | ★★★ |
| 3.8 | **BĂNG BÓ / CHẢY MÁU** | Có `Bleed` trong `StatusEffectType` mà chưa có cách CẦM máu — thiếu vế thứ hai thì trạng thái chỉ là một đồng hồ đếm ngược | `StickmanStatus`, `StickmanDowned` | ★ |
| 3.9 | **ÁP LỰC ĐẠN DƯỢC THẬT** (đạn là tài nguyên của trận, không chỉ của khẩu súng) | Biến `AmmoCache` từ đồ trang trí thành một điểm phải giữ | `AmmoCache`, `AIResupplyModule`, `SupplyPointIncome` | ★★ |

**Đề xuất làm trước: 3.1 + 3.2** (một màn + hai cây súng) — chúng biến hai hệ vừa dựng từ "chạy
ngầm" thành "chơi được", và đó là phép kiểm THẬT cho cái tai.

---

## 4. ANIMATION / CẢM GIÁC — chín thứ

Luật chung của mục này: **ưu tiên thêm STYLE cho `StickmanActionType` có sẵn**, đừng đẻ loại mới
(xem `StickmanBodyAnimator.QiStyle` và [Perception.md](../AgentRules/Perception.md) §6).

| # | Dáng / hiệu ứng | Là gì về mặt kỹ thuật | Công |
|---|---|---|---|
| 4.1 | **KÉO đồng đội** | `Carry` + style `drag` (đi giật lùi, hai tay sau lưng) — đi kèm 2.3 | ★★ |
| 4.2 | **TRÈO QUA vật che** (vault) | style của `Jump` (`tuck` đã gần đúng) + một tia dò vật che | ★★ |
| 4.3 | **NẠP ĐẠN đúng họ súng** | `ReloadStyle` đã có 3 kiểu; thiếu DÁNG THÂN đi kèm (quỳ gối nạp trung liên, giật quy lát) | ★★ |
| 4.4 | **GIẬT NGƯỜI THEO HƯỚNG ĐẠN** | style của `Hurt` chọn theo `DamageInfo.direction` — hiện chỉ có một kiểu | ★ |
| 4.5 | **VỎ ĐẠN VĂNG + KHÓI NÒNG** | particle, cùng đường `EffectManager` | ★ |
| 4.6 | **CHẠY KHOM** (tactical dash) | style của bước chạy khi đang trong tầm bắn — hạ vai, ôm súng vào ngực | ★★ |
| 4.7 | **NGƯỚC SÚNG BẮN MÁY BAY** | dáng đã có ở giá súng xe (`antiAir`); người thì chưa | ★ |
| 4.8 | **ĐỨNG DẬY SAU KHI NẰM** — dáng chuyển | `GetUp` đã có, nhưng nhánh nằm-bắn → đứng chưa dùng nó | ★ |
| 4.9 | **RUNG MÀN + BỤI khi pháo nổ gần** | `CameraShake` + `EffectManager`, gắn vào `Explosion.Detonate` | ★ |

**Đề xuất làm trước: 4.4 + 4.5 + 4.9** — ba thứ rẻ nhất mà đổi CẢM GIÁC bắn súng nhiều nhất.

---

## 5. THỨ TỰ ĐỀ XUẤT

| Đợt | Gồm | Vì sao theo thứ tự này |
|---|---|---|
| ~~1~~ | ~~Tai · bản đồ nguy hiểm · lựu đạn có ý đồ · dáng ló ra bắn~~ | **xong 2026-09-08** |
| 2 | 3.1 màn ĐÊM ĐỘT KÍCH + 3.2 súng giảm thanh + 2.2 bắn xong đổi ổ | biến đợt 1 thành thứ CHƠI ĐƯỢC và kiểm được |
| 3 | 2.3 kéo thương binh + 4.1 dáng kéo + 3.8 băng bó | một mạch: cứu thương từ AI → animation → luật |
| 4 | 4.4 + 4.5 + 4.9 cảm giác bắn | rẻ, đổi cảm giác nhiều nhất |
| 5 | 3.3 mìn + 3.4 gọi pháo + 3.5 UAV | ba động từ tầm chiến dịch |
| 6 | 3.6 chiến hào hoặc 3.7 đánh trong nhà | hai màn LỚN, chọn một |

---

## 6. KHÔNG NÊN LÀM (để khỏi phải đo lại)

| Ý tưởng | Vì sao không |
|---|---|
| Ngắm bắn thật (ADS có tâm ngắm, thu tầm nhìn) | Game CẢNH BÊN, camera không nhìn theo mắt nhân vật — cả cơ chế mất chỗ đứng |
| Hệ hồi máu tự nhiên kiểu CoD | Dự án cố ý KHÔNG có hồi máu tự nhiên; thêm vào là giết hệ thầy thuốc + trạm quân y + gục-chờ-cứu cùng lúc |
| Cây kỹ năng / lên cấp trong trận | Đã có `ZombieSquadUpgrades` và `CampTech`; thêm hệ thứ ba là ba nguồn sự thật cho cùng một câu hỏi |
| Bản đồ ảnh hưởng HAI CHIỀU | Xem [Perception.md](../AgentRules/Perception.md) §3 — giá phải trả là thật, cái lợi chưa ai đo được |
| Hệ báo động thứ hai cho tiếng động | `RaiseAlert` + `suspicionTime` đã là hệ đó; nối vào, đừng viết bản mới |
