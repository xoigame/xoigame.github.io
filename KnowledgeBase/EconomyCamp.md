# MODE KINH TẾ DOANH TRẠI — `Demo_20_WarCamp`

> Trọng tài `EconomyRaceMode` · ví `TeamEconomy` · bảng giá `EconomyProfile_DoanhTrai`
> · builder `StickmanWarCampBuilder` · bộ AI `Playbook_WarCamp` · học thuyết `Doctrine_WarCamp`.
>
> **Luật thắng duy nhất: PHÁ NHÀ CHÍNH ĐỊCH.** Không có vế đếm quân, không có đồng hồ.

---

## 1. Vòng chơi

```
mỏ vàng / rừng củi --(nông dân)--> KHO --+--> TUYỂN QUÂN (cận chiến · kỵ binh · tầm xa)
                                         +--> THUÊ NÔNG DÂN
                                         +--> NÂNG NHÀ   (lính mua mới lên tier)
                                         +--> XÂY        (nhà kho · tháp canh · rào chắn · trại lính)
```

Bốn khoản chi đó là TOÀN BỘ trò chơi: cái gì cũng đúng, chỉ khác nhau ở lúc nào thì đúng.
Nông dân KHÔNG đánh trả (`AIBehavior.Work` thấy địch là bỏ chạy) nên câu hỏi thứ năm luôn
treo lơ lửng: **giữ mấy người lính ở nhà** để cái cỗ máy trên còn chạy.

---

## 2. Bốn công trình — mỗi cái nối vào MỘT hệ đã có

| Công trình | Nối vào hệ nào | Tác dụng |
|---|---|---|
| **Nhà kho** | `ResourceNode.RaiseYieldMultiplier` | mỗi chuyến nông dân mang về ×1.4 |
| **Tháp canh** | `GarrisonPost` + `StickmanClimbZone` + sàn một chiều | cung thủ TỰ trèo lên bắn (`AIBehavior.Garrison`) |
| **Rào chắn** | `Fortification` kiểu `Barricade` | chặn làn; quân nhà đi xuyên, địch phải ĐẬP |
| **Trại lính** | `TeamEconomy.PopulationCap` / `.TrainCooldown` | +5 quân số, tuyển nhanh hơn 30% |

⚠ **Điều kiện để thêm loại thứ năm:** nó phải nối được vào một hệ SẴN CÓ. Một công trình đẻ
ra cơ chế mới là một nhánh `if` phải nuôi mãi mãi ở mọi chỗ đọc nó. Thêm loại = 1 giá trị
`CampBuildKind` + 1 dòng giá trong `StickmanWarCampBuilder.EnsureEconomyProfile` + 1 nhánh
trong `CampBuildSite.Raise`.

**Ai xây:** `CampBuildYard.TryOrder` trả tiền rồi đặt một `ResourceNode` kiểu
`ResourceType.Build` — `AIStateWork` vốn đã biết đi tới, vung dụng cụ theo nhịp và cộng công.
Không có một dòng AI nào mới.

⚠⚠ **MỘT CÔNG TRƯỜNG MỘT LÚC** (`CampBuildYard.BlockReason`). Mode này chỉ có 2–4 nông dân;
mở hai móng cùng lúc là cả hai xây dở dang tới hết trận và người chơi không thấy cái nào mọc lên.

⚠⚠ **`GarrisonDirector.EnsureInScene()` là BẮT BUỘC sau khi dựng tháp.** `OnSceneLoaded` của
nó THOÁT SỚM khi sổ `GarrisonPost` còn rỗng — mà scene này không bake sẵn cái tháp nào. Thiếu
dòng đó thì tháp vừa xây đứng trống tới hết trận, và **không lỗi nào báo**: post vẫn hợp lệ,
chỉ là không ai được bảo đi lên đó.

⚠⚠ **DỰNG VÀO OBJECT CON ĐANG TẮT, BẬT SAU CÙNG.** `ConfigureAsStructure` phải chạy TRƯỚC khi
object được bật (`_buildBodyHitboxes` chỉ đọc một lần ở `Awake`). Gắn `Fortification` thẳng
lên cái móng (đang bật, vì `Update` vừa chạy trên nó) là Unity đi dựng hitbox CƠ THỂ cho một
cái rào.

⚠ **`GetComponent ?? AddComponent`**, không `AddComponent` thẳng — bẫy `[RequireComponent]`
chèn một `Fortification` MẶC ĐỊNH (3 máu, chặn tất) nằm chồng lên cái thật.

---

## 3. Tổ canh nhà — `CampHomeGuard`

Vài người lính chuyển sang `AIBehavior.PatrolRoute`, đi tuần giữa doanh trại và mỏ vàng.
Không viết state mới: `AIStatePatrolRoute` đã quét địch theo nhịp và tự nhảy vào đánh.

⚠⚠ **NGƯỜI TRONG TỔ PHẢI KHAI `StickmanAgent.SetKeepsOwnOrders(true)`.**
`CommandNode.ApplyToAgent` ghi đè `SetBehavior` **mỗi nhịp**; không khai cờ thì tổ canh nhà
bị lệnh tuyến kéo ra trận ngay giây sau và **biến mất trong im lặng** — nhìn vào chỉ thấy quân
vẫn đông mà nhà vẫn mất. Đây là ngoại lệ THỨ BA của hàm đó, cùng họ với `Garrison`/`Escalade`,
khác ở chỗ nó là TRẠNG THÁI đổi được lúc chạy chứ không phải một `AIBehavior` cố định.
`MatchModeBase.ApplyOrders` cũng miễn trừ theo cùng cờ đó.

⚠ Cờ này cũng tắt luôn `HoldingLine`: đóng băng một người đang đi tuần là cả tổ đứng chôn chân
mỗi lần tướng hô «giữ tuyến».

**Ai quyết số người:** phe người chơi bấm `−`/`+` trên bảng (`_autoDecide = false`); phe máy tự
chấm (`DecideTarget`): không có nông dân thì 0, quân quá mỏng thì 0, có địch trong sân thì
`số kẻ đột nhập + 1`, còn lại 1 người khi quân ≥ 4. Trần cứng `MaxTarget = 4` — giữ nhà nhiều
quá thì không còn ai đi đánh, mà mode này thắng bằng phá nhà địch.

⚠ Chỉ rút CẬN CHIẾN gần nhà nhất; không đụng tướng (`ScriptedUnit`), quân đồn trú (`Garrison`)
hay người vác thang (`Escalade`) — tất cả đều đang làm việc nhiều pha.

---

## 4. Thẻ lệnh trên đầu — `CampUnitOrderHud`

Bấm thẳng vào một người của phe mình. **Một thẻ = một cú bấm = một quyết định** (bấm là sang
việc kế tiếp trong vòng), không mở thêm bảng con: trên điện thoại, mỗi lớp bảng phải bấm thêm
là một lớp người chơi bỏ không dùng.

* **Nông dân**: `Vàng → Củi → Xây → Tự → Vàng` (bỏ qua `Xây` khi phe chưa đặt móng nào).
* **Lính** (bật bằng ô tick trong bảng kinh tế): `Đánh → Giữ nhà → Theo tôi → Đánh`.

⚠⚠ **KHÔNG làm bằng "chạm vào thân nhân vật".** Cử chỉ chạm nền màn hình ĐÃ CÓ CHỦ — đó là
NGẮM & BẮN. Luật của dự án là *một cử chỉ MỘT CHỦ*. Một nút IMGUI nổi trên đầu nằm ở kênh khác.

⚠⚠ **Mọi thẻ phải `StickmanUI.ClaimPanel`.** Đó là thứ DUY NHẤT nói cho `StickmanTouchControls`
và `DemoCameraFollow` biết chỗ đó đã có chủ. Từ bản này, `StickmanTouchControls.HandlePointer`
hỏi `StickmanUI.PointerOverHud` **trước** nhánh ngắm-bắn — thiếu vế đó thì bấm thẻ vừa đổi việc
cho nông dân VỪA vung một nhát kiếm trời ơi (IMGUI và `Input.touches` là hai kênh không biết nhau).

⚠ Kèm theo: `StickmanUI.PointerOverHud` nay chấp nhận sổ của frame TRƯỚC. `ClaimPanel` chỉ chạy
trong `OnGUI`, mà `OnGUI` diễn ra SAU `Update`/`LateUpdate` — so `!= Time.frameCount` là chốt
chặn **không bao giờ đóng**, và không có lỗi nào báo.

⚠ `OnGUI` chạy vài lượt mỗi frame: mọi thứ đắt (`FindObjectsByType`) phải nằm ngoài nó — HUD
chụp danh sách lính theo nhịp 0.5 giây.

---

## 5. Tướng máy tiêu tiền — thứ tự là một quyết định thiết kế

`TeamEconomy.AutoSpend`:

1. **NÂNG NHÀ** khi đủ vàng + củi (giữ một phần tiền trước đó qua `UpgradeReserve`).
2. **THUÊ NÔNG DÂN** tới `aiWorkerTarget`.
3. **XÂY** (`PlannedBuild`) — sau nông dân vì không có thợ thì cái móng nằm đó mãi; trước
   tuyển quân vì nhà kho/trại lính là thứ trả lại chính nó, còn một anh lính mua sớm hơn 20
   giây thì không đổi được gì.
4. **TUYỂN QUÂN** theo tình báo (`ChooseCombatRecruit`).

⚠ **Giữ một khoản dư** (`aiBuildGoldBuffer` = 6 vàng) sau khi trả tiền xây: đặt móng xong mà
hết sạch vàng thì suốt quãng thợ đi xây, phe đó không mua nổi một người lính nào — và ở mode
này quãng đó đủ dài để bị dọn sạch. Xây là một khoản ĐẦU TƯ, không phải một cú tất tay.

**Thứ tự ưu tiên công trình** (`CampBuildYard.SuggestNext`): nhà kho (kinh tế trước) → rào
chắn khi nhà chính đã ăn đòn → tháp canh **chỉ khi phe thật sự có cung thủ** (một cái tháp
không ai leo lên là ném tiền qua cửa sổ) → trại lính khi quân đã kịch trần.

⚠⚠ **CÓ CÔNG TRƯỜNG THÌ PHẢI CÓ THỢ.** `AutoAssignWorkers` khoá cứng worker của phe máy vào
vàng/củi mỗi 0.75 giây, nên nhánh «tự tìm node gần nhất» của `AIStateWork` (vốn nhận cả node
kiểu Build) KHÔNG BAO GIỜ chạy cho họ. Đặt móng xong mà quên vế này thì tướng máy trả tiền rồi
ngồi nhìn. Chừa lại ít nhất MỘT người đào vàng: hết vàng giữa lúc xây là không mua nổi lính
nào để giữ chính cái công trường đó.

⚠⚠ **LỆNH «ĐI XÂY» PHẢI TỰ HẾT HẠN** (`AIStateWork.TickFind`). Công trường là node dùng xong
thì biến mất, khác hẳn mỏ vàng/rừng củi vốn còn mãi. Giữ nguyên lệnh thì đúng khoảnh khắc
khánh thành, người thợ đó đứng chôn chân tới hết trận.

---

## 6. Bảng giá — code là nguồn sự thật

Số nằm ở `StickmanWarCampBuilder.EnsureEconomyProfile` (ghi xuống asset mỗi lần bấm tool).

| | vàng | củi | công | trần |
|---|---|---|---|---|
| Nhà kho | 14 | 10 | 5 | 1 |
| Tháp canh | 18 | 14 | 6 | 2 |
| Rào chắn | 8 | **16** | 4 | 2 |
| Trại lính | 22 | 12 | 6 | 1 |

Cân theo một chuyến đào: mỏ vàng trả 5/chuyến, rừng củi 4/chuyến. Rào chắn rẻ VÀNG nhưng đắt
CỦI — nó là quyết định "đổi cây lấy thời gian", không phải một khoản mua thường.

⚠ `EconomyProfile.BuildCost` rơi về `CampBuildInfo.DefaultCost` khi mảng còn trống. Không có
nhánh đó thì mọi asset đã bake trước bản này cho công trình giá **0** — cả hệ xây dựng thành
miễn phí trong im lặng.

---

## 7. Bẫy hình học đi kèm — GIỎ MÂY SAU LƯNG

`EquipmentStabilizer` với `followBoneLean` (giáp thân + đồ đeo lưng) đặt vị trí bằng
`anchor + lean * offset` trong **toạ độ THẾ GIỚI**, tức offset KHÔNG đi qua phép lật gương
`localScale.x = -1` của nhóm `Sprite`. Thành phần `x` đã được nhân `flip`, nhưng phép XOAY thì
chưa: quay mặt sang trái, thân ngả một đằng còn offset xoay một nẻo.

Đo trên giỏ mây của nông dân (offset ≈ `(∓0.15, +0.28)`, thân ngả ~18° lúc đi): giỏ lẽ ra ở
`x = +0.23` sau lưng thì lại rơi về `x = +0.06` — **trượt vào giữa thân**. Đó là câu *"cái giỏ
sau lưng bị ngược khi đi từ trái sang phải"*, và không có lỗi nào báo. Giáp thân cũng dính,
chỉ là offset của nó nhỏ nên nhìn ra là "giáp hơi lệch".

Chốt: soi gương GÓC cho phần vị trí khi `flip < 0`. Phần `transform.rotation` giữ nguyên — món
đồ nằm trong cùng nhóm bị lật với xương nên phép lật áp cho cả hai như nhau.

---

## 8. Bản sửa 2026-09-05 (đợt hai) — sáu lỗi người dùng báo

| Báo cáo | Gốc thật | Chốt |
|---|---|---|
| "nâng nhà mà lính không có cấp độ" | `UnitRankGear.LateUpdate` ghi `SetGearTier(cấp AI)` MỖI FRAME, xoá số của `TeamEconomy` ngay nhịp sau | `UnitRankGear.PinTier` — người ghim nói lời cuối |
| "lính mua không theo nền văn minh" | CÙNG một dòng: cấp nhà 0 → tier 0 = **cởi sạch nón/giáp** suốt đoạn đầu ván | `RecruitTier = houseLevel + 1` |
| "ngựa không nhảy được" | cưỡi vào là bàn chân đã ở lưng chừng ngựa; cú bật 0.40 của người đi bộ không đọc ra. Và né dọc CẤM quân đang cưỡi | `MountedJumpScale = 1.45`; bỏ chặn `IsMounted` trong `CanEvadeVertically` |
| "để địch đánh hoài, không đánh trả" | luật đổi mục tiêu xét TỪNG CÚ, luôn nhường "đang đánh dở" và "đứa gần hơn" — đập cổng trong lúc bị bắn sau lưng thoả cả hai | `AIProfile.retaliateDamageShare` + `TrackPressure` (trí nhớ về sức ép) |
| "ra lệnh tấn công mà nó không tấn công" | `keepReserve` ghi đè lệnh TAY của người chơi; với 3–5 lính thì "cánh dự bị" là phần lớn quân. Cộng `commandStandoff = 5` biến nửa đội thành sĩ quan đứng sau | học thuyết: `keepReserve = false`, `commandStandoff = 0`; cây PHẲNG `ranks 2 / branching 12` |
| "nó nhảy quá nhiều" | cửa sổ nhảy KHÔNG có cận dưới; nhảy dùng chung nhịp nghỉ với lách ngang; né dọc không hỏi "tôi có đang đánh nhau không" | `JumpEvadeAbove`, `jumpDodgeCooldown` 3s, `meleeNoDodgeReach` |

Kèm: `Playbook_WarCamp` lên `smarts = 2` («Thiện chiến») — quân ít thì mỗi anh lính đứng đơ là
thấy ngay; và HUD in thẳng *"Lính hiện tại: đồ cấp N → sau khi nâng: cấp N+1"* để cái nút nâng
nhà nói được nó bán gì.

---

## 9. Bản sửa 2026-09-05 (đợt ba) — nông dân xây hộ địch · cấp lính chập chờn

### 9.1 "Nông dân đi xây nhà cho team địch"

`ResourceNode.FindNearestAvailable` quét trong **60 đơn vị** và **không hỏi node của ai** — mà
hai doanh trại chỉ cách nhau **44**. Nên một nông dân được lệnh «Xây» trong lúc phe mình chưa
đặt móng nào sẽ tìm thấy công trường của ĐỊCH (node kiểu `Build` duy nhất trong tầm), lội qua
nửa bản đồ và xây tháp canh hộ họ. Không lỗi nào báo: hàm đang trả về đúng cái node gần nhất
còn chỗ, chỉ là chưa ai hỏi nó của ai.

Chốt: `ResourceNode._teamId` (**−1 = trung lập**) + `BelongsTo(teamId)`, và
`FindNearestAvailable(..., teamId)`. `AIStateWork.TickFind` truyền phe của chính worker.

⚠⚠ **MẶC ĐỊNH PHẢI LÀ TRUNG LẬP.** 45 scene đã bake không có trường này ⇒ Unity nạp 0 cho int
nếu mặc định là 0 — tức mọi node bỗng thuộc "phe 0" và worker phe 1/2 không làm được gì cả.
Mặc định −1 và `BelongsTo` nhận cả hai chiều âm là điều kiện để luật này không đụng scene cũ.

⚠ Không chỉ công trường: **mỏ vàng và rừng củi của doanh trại cũng có chủ**. Mỏ nhà chứa 4
người; người thứ năm mà thấy mỏ trung lập của địch trong tầm 60 thì sang đó đào rồi vác vàng
về kho nhà mình — cùng một lỗ hổng, chỉ khác cái node.

### 9.2 "Lính mua có lúc không đúng cấp độ"

**Không phải cache pool** — đã kiểm: mode này `Instantiate` lính mới mỗi lần mua, dự án chỉ
pool mũi tên (`ArrowPoolManager`) và hiệu ứng (`TransientVfxPool`), không pool nhân vật.
Cũng **không phải thiếu art**: đo lại 65 asset `Equip_*_Helm`, 15 nền chính đều có
`tierSprites` đủ 6 ô (chỉ ô 0 rỗng, đúng luật "cấp 0 = đầu trần"), 46 asset biến thể không có
mảng thì `SpriteForTier` rơi về `sprite` gốc — vẫn có nón.

Gốc thật là **cấp trang bị có QUÁ NHIỀU CHỦ**, và mỗi chủ đều hợp lệ: `UnitRankGear` (mỗi
LateUpdate), `WeaponTierSetter` (`Start` + mỗi lần đổi vũ khí), `UnitLoadout.ApplyTo`,
`CivilizationDefinition` (đổi nền giữa trận bằng F4), `StickmanExperience` khi lên mốc. Bất kỳ
đường nào chạy SAU lúc sinh cũng để lại một con số khác — nên nó chỉ sai TÙY LÚC, và truy theo
một đường gọi cụ thể là bắt bóng.

Chốt theo đúng khuôn `UnitRankGear.LateUpdate`: **cấp là một BẤT BIẾN, không phải một thao tác
chạy-một-lần.** `TeamEconomy.TickTierAudit` đo trạng thái thật mỗi 2 giây rồi áp lại; phép áp
idempotent (so `tierSetter.Tier` trước khi ghi) nên gần như không tốn gì, và nó tự sửa cả
những đường ghi đè chưa ai nghĩ tới.

---

## 10. Bản sửa 2026-09-05 (đợt bốn) — BẢNG ĐIỀU KHIỂN THẬT + bốn luật đơn vị

### 10.1 Bảng Canvas thay bảng IMGUI

`CampGameUi` (+ `CampUiKit`) dựng một Canvas thật bằng CODE. Bố cục:

* **trên-trái** — vàng · củi · quân/trần · nông dân, kèm dòng *"Nhà cấp N — lính mặc đồ cấp M"*;
* **trái-dưới** — TUYỂN QUÂN (cận chiến · tầm xa · kỵ binh · nông dân) + NÂNG NHÀ + XÂY DỰNG
  (bốn công trình, nút xám thì **in thẳng lý do**: thiếu vàng / hết ô đất / đang xây dở);
* **phải-dưới** — LỆNH TOÀN QUÂN (Tấn công · Giữ tuyến · Về thủ) + «Giữ nhà − N +»;
* **giữa-dưới** — bảng ĐƠN VỊ, chỉ hiện khi đang chọn một người;
* **nút nhỏ nổi trên đầu** từng nông dân/lính của phe mình — bấm để CHỌN.

Builder không gắn `GameModeHud` · `CampUnitOrderHud` · `TeamCommandHud` cho scene này nữa
(`CommandHierarchyHud` F9 vẫn còn — công cụ soi, mặc định ẩn). Lý do và các bẫy đi kèm nằm ở
`Docs/AgentRules/UI.md`; quan trọng nhất là `StickmanUI.RegisterPointerBlocker` — không có nó
thì bấm nút Canvas vẫn kèm một nhát chém.

### 10.2 Bốn luật đơn vị

| Báo cáo | Gốc | Chốt |
|---|---|---|
| "vật cản cản cả quân mình" | quyền đi xuyên cấp theo nhịp `_passScanInterval` = **0.25s**; người chạy 6 đơn vị/giây đi 1.5 đơn vị giữa hai nhịp ⇒ đâm vào rào nhà mình rồi mới được cấp | `fort.SetPassScanInterval(0.05f)` cho rào |
| "tướng địch không theo nền văn hoá" | `ScriptedUnit` đi đường `ApplyTo` (xoá sạch đồ kịch bản) hoặc không được khoác gì | `ScriptedUnit` → `ApplyLookTo` |
| "worker cưỡi ngựa" | `AIMountModule` chặn bằng `IsCombatant`, mà cờ đó đọc `_behavior` — một khoảnh khắc chưa phải worker là đủ để bắt một con ngựa hoang | dismount ngay trong `SetBehavior(Work)` + hỏi thẳng `AIBehavior.Work` |
| "kỵ binh không nhảy" (luật) | né dọc phát động tác `Jump` kiểu *tuck* — ngồi trên yên mà co gối thì đọc ra là lỗi rig | `CanEvadeVertically` loại quân đang cưỡi |

---

## 11. Bản sửa 2026-09-05 (đợt năm) — NÔNG DÂN BIẾT VIỆC + ba luật ngựa

### 11.1 "Worker cứ đào vàng, không đốn củi, không xây" — MỘT gốc, ba triệu chứng

Ba báo cáo cùng lúc (*không đốn củi* · *không đi xây* · *chưa xây mà bảng nói xây dở*) đều ra
từ một chỗ: **nông dân của PHE NGƯỜI CHƠI không có ai chia việc.**

`TeamEconomy.AutoAssignWorkers` nằm trong `if (_autoSpend)` — mà `_autoSpend` chỉ bật cho phe
máy. Nông dân phe xanh để «Tự động» thì rơi vào `AIStateWork` và lấy node **GẦN NHẤT**: mỏ vàng
nằm ngay cạnh kho (x = ±30, kho ở ±27), rừng củi xa hơn (±34), công trường thì đặt ra phía
trước. Nên cả ván chỉ có vàng; cái móng vừa đặt đứng nguyên; và vì móng chưa xong nên bảng xây
dựng báo *"đang xây dở một công trình"* mãi mãi.

Ba vế của bản sửa:

1. **Chia việc chạy cho CẢ HAI PHE.** Lệnh TAY của người chơi vẫn thắng tuyệt đối — thêm cờ
   `WorkerResourceOrder.IsManual`, và bộ chia việc LOẠI những người đó ra khỏi danh sách chứ
   không "ghi đè rồi thôi". ⚠ Cờ này KHÔNG suy ra từ `_task != Automatic`: bộ chia việc cũng
   ghi `MineGold`/`ChopWood` vào đúng trường đó, suy ra kiểu ấy là nó tự khoá chính mình sau
   nhịp đầu tiên.
2. **Công trường đi TRƯỚC mỏ vàng** cho worker «Tự động» (`AIStateWork.TickFind` hỏi
   `ResourceType.Build` trước). Xếp theo khoảng cách là xếp sai trục: mỏ/rừng là nguồn VÔ HẠN
   (10000 đơn vị), chậm một phút không mất gì; công trường là việc HỮU HẠN và nó KHOÁ mọi móng
   khác cho tới khi xong. Bộ chia việc cũng dồn thợ: tổ ≥ 3 người thì chừa 1 người kiếm tài
   nguyên, tổ 2 người thì cả hai đi xây.
3. **Mốc củi mong muốn không chỉ là củi nâng nhà** (`TeamEconomy.DesiredWoodStock`): lấy số lớn
   nhất giữa "củi nâng nhà lần tới" và "củi của công trình đắt nhất còn xây được" (rào chắn 16).
   Bản trước nâng nhà xong là cả tổ dồn sang vàng và không bao giờ đủ củi xây gì.

⚠ Bảng cũng nói thật hơn: thay *"đang xây dở một công trình"* bằng *"đang xây tháp canh 40%"*,
và khi 0% thì *"chưa có thợ tới — bấm một nông dân → «Đi xây»"*. Con số 0% mới là câu trả lời
thật, và nó chỉ thẳng vào việc phải làm.

### 11.2 Nâng nhà mở thêm suất nông dân

`EconomyProfile.farmerPerHouseLevel` = 1, `farmerCap` hạ từ 4 xuống 3. Cấp 0 → 3 người, cấp 3
→ 6. Nhờ vậy nâng nhà là một NGÃ RẼ thật (đánh mạnh hơn hay kiếm nhanh hơn) chứ không còn là
một khoản chi thuần quân sự.
⚠ `TryUpgrade` gọi lại `EnsureResourceSites()`: suất vừa mở phải có chỗ đứng làm ở mỏ/rừng,
không thì người vừa thuê đứng chơi (`EnsureWorkerCapacity` chỉ NÂNG nên gọi lại vô hại).

### 11.3 Ba luật của con ngựa

| Luật | Chốt ở đâu | Vì sao |
|---|---|---|
| KHÔNG nhảy | `StickmanLocomotion.Jump` — một nút thắt cho cả ba đường gọi (người chơi bấm · `UpdateJumpOverGap` · cú nhảy đệm khi tiếp đất) | ngựa là một tấm hình dưới nhóm `Sprite`, không có bộ động tác riêng ⇒ mọi cú nhảy thành "cả người lẫn ngựa trượt lên trời" |
| KHÔNG giật khi trúng đòn | `StickmanController.ApplyHitStun` → 0 khi `RidingNow` | cú choáng làm con ngựa đứng khựng giữa nước phi |
| KHÔNG văng khi trúng đòn | `StickmanController.ApplyImpulse` bỏ qua khi `RidingNow` (xác thì vẫn hất) | cú giật là `AddForce` vào một PART RAGDOLL, mà ngựa gắn dưới chính rig đó ⇒ nhìn ra "người bị văng khỏi ngựa" |

⚠ Đây là THAY ĐỔI CÂN BẰNG có chủ ý: kỵ binh không thể bị cắt nhịp bằng đòn lắt nhắt. Đổi lại
chúng đắt (18 vàng) và không nhảy, không leo, không đi cầu thang.
⚠ Không dùng `_hitStunResistance` (số của TỪNG nhân vật, tướng/buff đang xài) — đây là luật của
TRẠNG THÁI CƯỠI, hết cưỡi là hết. Và `KnockbackScale` là knockback mình GÂY RA, không phải
mình NHẬN — đừng nhầm hai cái.

---

## 12. Bản 2026-09-06 — NHÀ LÍNH: phải xây mới có quân

Mô hình sản xuất đổi hẳn: **quân mua ở NHÀ LÍNH, không mua ở bảng toàn cục nữa.**

| Công trình | Bán gì | Cấp |
|---|---|---|
| Nhà lính cận chiến (`MeleeHall`) | bộ binh cấp 1..L | L = cấp nhà lính, nâng được khi **nhà chính đã cao hơn** |
| Nhà lính tầm xa (`ArcherHall`) | cung thủ cấp 1..L | như trên |
| Chuồng ngựa (`Stable`) | một con NGỰA HOANG của phe | không có cấp — lính chưa có ngựa tự tới lấy (`AIMountModule`) |

* Giá lính cấp N = giá gốc × (1 + `tierCostStep` × (N−1)) — cấp thấp **vẫn mua được** cho rẻ.
  Cấp là thứ MUA, nên `TickTierAudit` nay ghim lại **cấp của chính người đó** (`WeaponTierSetter.Tier`),
  không còn ghim theo nhà chính. `RecruitTier` chỉ còn là đường cũ cho mode không có nhà lính.
* Nhà lính là `BaseBuilding` có máu: địch phá được, cháy được, sập thì 8 giây sau biến mất và
  **ô đất trống lại** (`CampBuildSite.IsRuined` → `CampBuildYard.CountOf` bỏ qua tàn tích).
* Bấm THẺ trên nóc nhà (Canvas) → bảng mua ở giữa-dưới; thẻ nhà chính mở nút nâng nhà.
* Tướng máy: `SuggestNext` đặt **nhà lính cận chiến TRƯỚC MỌI THỨ** (không có nó là không mua
  được quân), rồi nhà kho → nhà tầm xa → … → chuồng ngựa khi ≥ 4 quân → cột cờ. `AutoSpend`
  nâng nhà lính khi nhà chính đã đi trước và quân đã đủ đông; kỵ binh = bộ binh + mua ngựa.

### Tướng mua ở nhà chính (2026-09-08)
Bảng nhà chính bán **ba binh chủng tướng** (bộ binh · cung · kỵ), mỗi phe MỘT tướng sống, ngã thì
mua lại. Tướng là lính sinh qua ruột chung với trang bị cấp cao nhất, gắn `CampGeneral` (mạnh hơn,
cấp AI 4, cấp theo nhà chính, hào quang vừa hồi sĩ khí vừa buff lì đòn/đánh nhanh, gục chờ cứu,
kiêm tổ trưởng một tổ) và `ScriptedUnit` (không hồi sinh miễn phí, tổ canh nhà không bắt đi tuần).
HUD có dòng máu tướng + nút «TỚI TƯỚNG» + báo động khi gục/ngã; tướng máy tự mua trong `AutoSpend`.

⚠ Tướng gục thì **người cứu là NGƯỜI CHƠI** (đứng cạnh là đỡ dậy) — lính chỉ tự cứu khi
`AIProfile.rescueRadius > 0`, mặc định 0.

Bảng số ở `EconomyProfile.general*`; luật đầy đủ và các bẫy: Docs/AgentRules/Gameplay.md
«TƯỚNG MUA Ở NHÀ CHÍNH».

### Tám việc làm chế độ sâu hơn (2026-09-08, chiều)
Giữa sân nay có **mỏ vàng trung lập** (trữ lượng có hạn) và **điểm tiếp tế** sinh vàng cho phe giữ
được. **Lương thực**: quân ăn lúa, hết lúa thì không tuyển được và kho cạn thu nhập, nên bãi chăn
nuôi mới có việc. **Bảng nâng cấp** ba món mua một lần (lò rèn · nông cụ · quân lương). HUD có
**báo động khi trại bị đánh**, **điểm tập kết** cho quân mới, **lệnh riêng cho tổ của tướng**, và
**bảng tổng kết** cuối trận. Trận có nhịp **ngày đêm**.

Luật đầy đủ, các bẫy, và vế nào cần dựng lại scene: Docs/AgentRules/Gameplay.md
«TÁM VIỆC LÀM CHẾ ĐỘ DOANH TRẠI SÂU HƠN».

### Cung thủ bắn được nhà — và nhà cháy
`IRangedDamageImmune` từ NHÃN thành CÂU TRẢ LỜI (`bool ImmuneToRanged`). `Fortification`
luôn true; `BaseBuilding` có cờ `_rangedImmune` mặc định **TRUE** (40 scene cũ không đổi),
builder Doanh trại đặt false cho nhà chính + mọi nhà lính. Trúng đòn có `ProjectileController`/
`RangedWeapon` ở nguồn ⇒ `_burnUntil` gia hạn, mỗi frame trừ `_burnPerSecond` qua `TakeDamage`
với `forceScale = 0` (⚠ không lọc vế này là lửa tự nuôi lửa), tia lửa bốc từ mái.

### Sập nhà
`BaseBuilding.OnDeath`: bụi + `EffectEvent.Explosion` + lún 0.55 đơn vị trong 1.2 giây, rồi
`Destroy` sau `_ruinDespawnSeconds` (0 = nằm mãi — **nhà chính phải nằm đó**, trọng tài đọc `IsDie`).

### Bốn luật đơn vị chốt cùng ngày
* **Nông dân không cưỡi ngựa — lỗ cuối cùng**: `RiderlessHorse.TryPickUpRider` trao ngựa cho
  BẤT KỲ `StickmanFighterController` trong tầm, không qua `AIMountModule`. Nay hỏi
  `IUnitBrain.IsCombatant` (mới thêm vào Core) trước khi trao.
* **Nhà chính tự đúc 0.25 vàng/giây** khi còn đứng — lưới an toàn khi mất sạch nông dân, bằng
  1/9 một nông dân; không phải nguồn thu thứ hai.
* **Lính và nông dân KHÔNG hồi sinh** (`RespawnDirector` bỏ `AIBehavior.Work` khỏi roster,
  lính mua thì vốn không nằm trong roster). Chỉ người chơi và tướng địch (`ScriptedUnit.Respawns`).
* **Cột cờ hồi sĩ khí**: `CampBuildYard.ApplyFlagMorale` mỗi 2 giây gọi `StickmanAgent.RecoverMorale`
  cho quân nhà trong `flagMoraleRadius` (ngoài việc nới trần giữ nhà mà session khác đã làm).

---

## 13. Bản 2026-09-06 (chiều) — TRẠM QUÂN Y + DỜI NHÀ

### 13.1 Trạm quân y (`CampBuildKind.Infirmary`)

Lều vải + chữ thập đỏ. Quân nhà đứng trong bán kính thì máu lên dần. Cấp 1..3
(`infirmaryMaxLevel`), mỗi cấp cộng bán kính và tốc độ hồi:

| Cấp | Bán kính | Hồi |
|---|---|---|
| 1 | 3.2 | 0.55 máu/giây |
| 2 | 4.3 | 0.85 |
| 3 | 5.4 | 1.15 |

⚠⚠ **BA CÁI VAN CHỐNG BẤT TỬ** — thiếu một cái là cả trận đứng lì trong vòng tròn:

1. **Khoá khi đang ăn đòn** (`_combatLockout` 2.5s): vừa trúng đòn thì KHÔNG hồi. Đây là van
   quan trọng nhất — không có nó thì hai tuyến đứng chém nhau ngay giữa trạm và bên có trạm
   không bao giờ chết; cái trạm thành một khiên vô hình chứ không phải chỗ để RÚT VỀ.
2. **Trần cấp tuyệt đối** (`infirmaryMaxLevel`), NGOÀI luật "không vượt cấp nhà chính".
   Bán kính lẫn tốc độ đều cộng theo cấp — không có trần thì một trận dài biến nó thành vùng
   bất tử phủ nửa bản đồ.
3. `StickmanController.Heal` tự kẹp ở máu tối đa.

⚠ **Đặt ở tầng COMBAT, không phải Gameplay.** `HealingPost` dùng đúng khuôn `AmmoCache` (một
CHỖ có phe + bán kính + sổ tĩnh), và nhờ ở tầng 1 nên module AI (tầng 2) tra thẳng được —
không phải đẻ thêm một interface bắc cầu ở Core.

⚠ **Hai cuốn sổ trong `HealingPost` phải được DỌN** (`PruneLedgers`): khoá là
`StickmanController` mà lính thì chết liên tục — một trận dài để lại hàng trăm khoá trỏ vào
object đã huỷ, vừa phình bộ nhớ vừa dính bẫy fake-null (Dictionary so bằng `object`, không đi
qua phép `==` của Unity). Cùng khuôn `_stale` của `AmmoCache`.

### 13.2 AI biết về trạm — `AIHealPostModule` (`AIModuleKind.HealPost`)

Máu tụt dưới `healPostSeekPercent` (0.35) → bỏ trận, chạy về trạm gần nhất trong
`healPostSeekRange` (26); đứng đó tới khi máu đạt `healPostLeavePercent` (0.9) → ra đánh tiếp.

⚠⚠ **HAI NGƯỠNG PHẢI KHÁC NHAU** (0.35 vs 0.9). Dùng chung một ngưỡng là lính vừa đủ máu đã
chạy ra, ăn một nhát lại chạy vào — cái trạm thành một cái cửa xoay. Đây là vòng trễ
(hysteresis), cùng họ với `moraleRoutThreshold` / `moraleReturnThreshold`.

⚠ **`TripCommit` 8 giây**: thiếu cam kết là đúng vòng lặp §5c — chạy về nửa đường thì hết bị
dí, hết bị dí thì quay lại đánh, quay lại đánh thì lại thấy sắp chết. Lính giật qua giật lại
giữa sân.

⚠ Module nằm trong `AIModuleLibrary.DefaultKinds`, và **tự tắt ở dòng đầu** khi
`HealingPost.All` rỗng — map không có trạm chỉ trả một phép so sánh mỗi frame. Để ngoài bộ mặc
định thì phải nhớ khai ở từng playbook, quên một chỗ là cả phe đứng chết dí ngoài trận trong
khi cái trạm vừa xây không ai dùng.

### 13.3 Dời nhà + cấm xây đè

`CampBuildYard.SpotBlockReason(x, ignore)` là **một chỗ trả lời cho CẢ đặt móng lẫn dời nhà**:
* ra ngoài `MoveRadius` (15) tính từ nhà chính → "ra ngoài đất trại";
* gần nhà chính hơn `MinSpacing` → "sát nhà chính quá";
* cách công trình khác dưới `MinSpacing` (= `_slotSpacing` 2.6) → "đè lên …".

⚠ Hai bản kê luật riêng cho hai việc thì sớm muộn "đặt được mà dời tới đó lại không được" —
người chơi đọc ra là bảng hên xui.

⚠⚠ **`NextSlotX` nay ĐI TÌM CHỖ TRỐNG THẬT, không tin vào chỉ số.** Đếm số nhà rồi nhân khoảng
cách chỉ đúng khi không ai bị phá và không ai được dời — mà nay có cả hai. Một cái nhà bị phá
làm mọi cái sau tụt chỉ số, và ô đó có thể đã bị dời nhà khác vào ⇒ hai công trình mọc chồng
lên nhau, không lỗi nào báo.

**Nhà chính không dời được** — nó là mốc của cả đất trại (bảng của nó ẩn hẳn hàng ◀ ▶). Nút mũi
tên luôn in LÝ DO khi không dời được; nút bấm mà nhà đứng im không kèm chữ thì người chơi tưởng
hỏng trong khi luật đang làm đúng việc.

---

## 14. Bản 2026-09-06 (tối) — CÂN BẰNG ĐO ĐƯỢC + UI KHÔNG ĐÈ CẦN ẢO

### 14.1 ⚠⚠ Bảng UI đè lên cần ảo và cụm nút đánh

Trên ĐIỆN THOẠI, hai góc dưới **không phải của HUD**:

* góc trái-dưới là **vùng cần ảo** — `StickmanTouchControls.InStickZone` nhận cả `x < 45%` màn
  hình **và** `y < 70%`, tức gần trọn nửa dưới bên trái;
* góc phải-dưới là **cụm nút ĐÁNH** (nút đánh + ba vòng nút quanh nó).

Bảng «NHÀ CHÍNH» và «LỆNH TOÀN QUÂN» đặt đúng hai chỗ đó ⇒ ngón cái không tìm được cần, với
tới nút mua thì chạm trúng bảng. Cú bấm KHÔNG lọt xuống thành nhát chém (`PointerOverUi` đã
chặn) — nhưng cái cần bị **che**, và người chơi không đi lại được.

Chốt (`CampGameUi.ApplyLayout`): trên cảm ứng dồn mọi bảng về **cột PHẢI-TRÊN** (x > 45% nên
ngoài vùng cần, y trên cụm nút), **mở từng cái một** qua thanh nút «Nhà & Xây» / «Lệnh», và mặc
định ĐÓNG để sân trống. Desktop giữ nguyên hai góc dưới — ở đó không có cần ảo nào.

⚠ Nút «PC/ĐT» đổi `StickmanUI.IsTouch` **giữa trận**, nên bố cục phải tự soi lại theo nhịp chứ
không chỉ đặt một lần ở `Start`.

### 14.2 Giá theo cấp lính — nâng nhà lính từng là NỘI DUNG CHẾT

Đo từ `WeaponTierTable`: power 1.0 / 1.25 / 1.55 cho cấp 1/2/3, mà `damageScale = power^0.6`
⇒ sát thương thực chỉ **×1.00 / ×1.14 / ×1.30**. Trang bị **không** cộng giáp theo cấp
(`EquipmentDefinition.armor` là MỘT số; các mảng theo cấp chỉ đổi hình).

`tierCostStep` cũ 0.6 ⇒ cấp 3 đắt **2.2×** để đổi lấy **1.30×** sức mạnh: hai anh cấp 1 luôn
thắng một anh cấp 3 ⇒ **không ai có lý do nâng nhà lính**. Nay 0.25 ⇒ cấp 2 đắt 1.25×, cấp 3
đắt 1.5×, sát với giá trị thật; tiền nâng nhà mới là phần khiến "ít mà tinh" có đánh đổi thật.

### 14.3 Ba lỗ khác của vòng kinh tế

| Lỗ | Đo được | Chốt |
|---|---|---|
| AI nâng nhà chính khi **chưa có anh lính nào** | 20 vàng + 8 củi đủ xây nhà lính (10 + 12); nhịp đào ~1.1 vàng/giây/người ⇒ chậm anh lính đầu tiên gần 20 giây | `AutoSpend` chặn nâng nhà chính khi chưa có `MeleeHall` |
| Mốc củi nhắm vào **thứ đắt nhất danh mục** (Hàng rào 20) thay vì thứ sắp xây (Nhà lính 12) | rừng củi xa hơn mỏ (34 vs 30) ⇒ mỗi chuyến 7.8s so với 4.6s; thừa 8 củi ≈ gần một phút công của cả tổ | `DesiredWoodStock` nhắm `SuggestNext` + nhà lính |
| Kho rỗng lúc mở màn | nhà lính chỉ đặt được ở giây ~24 | vốn mở màn 6 vàng + 8 củi ⇒ ~10 giây |

**Thưởng giết 2 vàng** — ⚠ đảo lại quyết định cũ ("không thưởng giết"). Lý do: từ ngày quân
phải MUA ở nhà lính và nông dân KHÔNG hồi sinh, đánh nhau thuần tuý là một khoản **lỗ** — thủ
chặt rồi đua kinh tế luôn tốt hơn, và cả hai phe cùng nghĩ vậy thì trận không bao giờ xảy ra.
Giữ NHỎ (2 vàng ≈ 2 giây đào) để nó là phần thưởng, không thành nguồn thu thay cho mỏ.

---

## 15. Bản 2026-09-06 (khuya) — BẢNG LÀ MODAL · KỴ BINH LẮP RÁP

### 15.1 Mở bảng thao tác = cất điều khiển

Cách cũ (dồn bảng lên cột phải-trên để né cần ảo) đã BỎ. Nay bảng nằm ở góc dưới cho ngón cái
dễ với, và **trong lúc bảng mở thì cần ảo + cụm nút được CẤT ĐI**
(`StickmanUI.RegisterControlSuppressor` ← `CampGameUi.IsCommandPanelOpen`). Đóng bảng là điều
khiển hiện lại và bấm được ngay.

Trên cảm ứng bảng «Nhà chính» và «Lệnh» mặc định ĐÓNG, mở bằng thanh nút ở góc phải-trên — lúc
không thao tác thì sân trống trơn. Luật đầy đủ + vì sao `PointerOverHud` không đủ: xem
`Docs/AgentRules/UI.md`.

### 15.2 Không bán kỵ binh — kỵ binh được LẮP RÁP

`TeamEconomy.TryTrainCavalry` trả false khi `_requireHalls`, và `CanTrainCavalry` cũng false.
Muốn có kỵ binh thì: mua **bộ binh** ở nhà lính + mua **ngựa** ở chuồng → anh bộ binh nào rảnh
tự tới bắt (`AIMountModule`, có sẵn từ lâu). Người chơi cũng lên được con ngựa đó bằng phím Q.

⚠ Chặn ở `TryTrainCavalry` chứ không chỉ ở bảng UI: `AutoSpend` của tướng máy và mọi đường gọi
cũ đều đi qua hàm đó.
⚠ `ChooseCombatRecruit` vẫn được chấm điểm "muốn kỵ binh" **khi phe đã có chuồng** — `AutoSpend`
dịch mong muốn đó thành *mua một con ngựa*. Không có chuồng thì điểm bị đặt về âm vô cực, không
thì tướng máy cứ đòi một thứ không mua được.

**Con ngựa nhờ vậy là một TÀI SẢN THẬT**: chủ ngã thì ngựa còn đó cho người khác, thay vì biến
mất cùng "một đơn vị kỵ binh".

---

## 16. Phải bấm lại tool

`★ Bảng điều khiển` → **Doanh trại (hậu cần chiến tranh)** (dựng lại scene + ghi lại bảng giá)
và **Bộ AI theo gameplay** (`Playbook_WarCamp` nay khai `guardRangeScale = 2.2`).

Cả hai đã VÀNG trên bảng: `StickmanWarCampBuilder.cs` và `StickmanPlaybookBuilder.cs` là file
nguồn của chính hai job đó, và cả hai mới hơn file kết quả.

---

## 17. BẢN BẮN SÚNG — `Demo_48_ModernCamp` «ĐỘT CHIẾM CĂN CỨ» (2026-09-07)

> User: *"sửa chế độ tấn công doanh trại của nhau bên hiện đại, gameplay giống kinh tế doanh
> trại bên trung cổ nhưng phù hợp cho bắn súng"*.
> Builder `StickmanModernCampBuilder` · bảng giá `EconomyProfile_CanCuHienDai` ·
> trọng tài `EconomyRaceMode` (skin `_shooterSkin`) · bộ AI `Playbook_Shooter`.

**KHÔNG có hệ kinh tế thứ hai.** Vòng chơi là ĐÚNG bộ của Demo_20 — `TeamEconomy` ·
`CampBuildYard`/`CampBuildSite` · `CampHomeGuard` · `CampGameUi` · `EconomyRaceMode` ·
`Doctrine_WarCamp`. Khác đúng bốn chỗ:

| Vế | Demo_20 (trung cổ) | Demo_48 (bắn súng) | Vì sao |
|---|---|---|---|
| Nguồn tiền | nông dân đào vàng/củi | **thợ hậu cần + ĐIỂM TIẾP TẾ giữa sân** (`SupplyPointIncome` trên một `CapturePoint`, 1.2 vàng/giây) | Bê nguyên vòng cũ sang thì cả nguồn tiền của màn nằm ở nơi KHÔNG có tiếng súng ⇒ không ai có lý do ra giữa sân. Điểm tiếp tế đặt tiền vào chỗ phải cầm súng đứng giữ |
| Ba tuyến quân | khiên · cận chiến · cung | **phá cửa (súng săn) · xung kích (tiểu liên) · xạ thủ (súng trường)** — `Loadout_Mod_*` của hệ map | Một nguồn cho cả hệ map lẫn màn này |
| Bộ AI | `Playbook_WarCamp` | **`Playbook_Shooter`** | Lính mua ra phải biết nấp · bắn áp chế · tiến theo cặp (Shooter.md). ⚠ Học thuyết của TƯỚNG vẫn là `Doctrine_WarCamp`: playbook phát TÍNH CÁCH theo vai, học thuyết là nhịp CÔNG/THỦ của cây chỉ huy — hai thứ khác nhau |
| Địa hình | bãi đất trống | bốn tuyến vật che mỗi bên + sàn cao có `GarrisonPost` + container, lấy từ `StickmanShooterModeBuilder` | Một nguồn, một bộ cỡ vật che |

**Số cân bằng:** hòm tiếp tế 5/chuyến · bãi vật tư 4/chuyến (giống Demo_20 để hai màn so được
với nhau) · điểm tiếp tế 1.2/giây ≈ **nửa một thợ**: đáng tranh, không thay được hậu cứ.
Ba tuyến súng 12 / 9 / 13 vàng — đắt hơn bộ trung cổ vì ở đây **không có "lính rẻ để chắn đòn"**,
ai cũng làm ra sát thương ngay từ giây đầu.

⚠⚠ **SỞ CHỈ HUY PHẢI HỨNG ĐƯỢC ĐẠN** (`SetSiegeRules(rangedImmune: false, …)`). Mặc định của
`BaseBuilding` là MIỄN sát thương tầm xa — ở một màn mà cả sân chỉ có súng, đó là luật chết:
nhà không bao giờ mất máu và trận không có hồi kết. Không lỗi nào báo.
⚠⚠ **KHÔNG CÓ KỴ BINH**: bộ mount của dự án toàn thú (ngựa · lạc đà · voi), chưa có xe. Chốt
bằng `cavalryCost`/`horseCost` = 9999 + `fallbackCavalryMount = null` + `defaultCavalryShare = 0`.
Nút «Chuồng ngựa» trong bảng xây VẪN HIỆN vì `CampGameUi.BuildKinds` là mảng TĨNH dùng chung
cho mọi màn kinh tế — xây được nhưng không mua nổi con nào. Muốn ẩn hẳn thì phải lọc danh sách
theo `EconomyProfile`, tức SỬA `CampGameUi`.
⚠ Cùng lý do đó, bảng vẫn gọi tiền là «Vàng» và vật tư là «Củi» (chuỗi gõ cứng trong
`CampGameUi`). Ngoài sân hai nguồn được đặt đúng tên hiện đại: «Hòm tiếp tế» · «Bãi vật tư».
⚠ `CapturePoint` của điểm tiếp tế để `scorePerSecond = 0`: nó vốn cộng ĐIỂM cho
`CaptureScoreMode`, mà màn này thắng bằng PHÁ SỞ CHỈ HUY — hai thang điểm cùng chạy thì người
chơi không biết mình đang thắng theo cái nào.
⚠⚠ **PHẢI CÓ `ZoneGarrisonDuty` CHO CẢ HAI PHE**, không thì điểm tiếp tế là nguồn tiền của
RIÊNG người chơi: cây chỉ huy lấy *"vùng tranh chấp CHƯA thuộc về mình"* làm cột mốc tiến quân
(`CommandNode.ComputeLineAnchor`), nên đúng giây chiếm xong là cả cánh quân bỏ đi — người chơi
quay lại lấy mà không gặp ai. Tổ giữ điểm để `perZone = 1` vì quân ở đây được MUA từng người.
⚠ `SupplyPointIncome` trả tiền THEO NHỊP 1 giây, không cộng mỗi frame: `ResourceDepot.Stored`
bắn sự kiện (tiếng "keng" + HUD vẽ lại) nên cộng 60 lần/giây là một cái đồng hồ chạy loạn.

### 17b. Ba việc thêm (2026-09-07, đợt hai)

User: *"AI cũng điều phối chiếm điểm sinh ra tiền · có vật cản là AI núp ở đó, súng bắn vào sẽ
bắn trúng vật cản · map chỉ có 1 tầng ground, xây thêm 2 tầng top và bottom để AI di chuyển các
hướng tấn công"*.

**(1) `SupplyPointCommand` — tướng máy đi giành tiền.** `CommandNode.ComputeLineAnchor` đã lấy
*"vùng tranh chấp chưa thuộc về mình"* làm mốc tuyến — nhưng CHỈ khi thế trận là `Attack`, mà
thế trận ấy học thuyết chấm theo tương quan LỰC, **không biết gì về tiền**. Lớp mới nối hai vế:
mất điểm tiền ⇒ bấm `TeamCommander.CommandAttack()`; giữ được ⇒ `CommandAuto()` trả quyền cho
học thuyết (và `ZoneGarrisonDuty` để lại người trực). Không đẻ state/behavior mới — đúng cái nút
người chơi cũng bấm.
⚠ **Giữ nhà trước, giành tiền sau**: có địch trong `_homeThreatRadius` (12) quanh sở chỉ huy thì
trả quyền ngay — đổi cái ví lấy cái nhà là thua, vì luật thắng là PHÁ NHÀ.
⚠ **Quân mỏng thì thôi** (`_minSquad` 2): lính ở đây mua từng người, hai người đầu kéo ra giữa
sân là mất cả hai lẫn thợ ở nhà.
⚠ Chỉ gắn cho phe MÁY, và chỉ `CommandAuto()` khi CHÍNH NÓ đã giành lái (`_driving`) — không thì
mỗi nhịp quét lại xoá lệnh tay của người chơi.

**(2) Hàng rào nay CHẶN ĐẠN.** `CampBuildSite.RaisePalisade` khai `FortKind.Wall`, mà
`Fortification.BlocksProjectiles` chỉ đúng với **`Barricade`** — nên hàng rào chặn được CHÂN
nhưng không chặn ĐẠN, và `RangedCombatStrategy.FindCover` (chỉ nhận vật che chặn đạn) **không
bao giờ coi nó là chỗ nấp**. Người chơi bỏ tiền xây một vành đai, đứng sau nó, vẫn ăn đủ cả
băng. Nay khai `Barricade`. Bảng kê ai chặn đạn: pre-placed cover của map bắn súng (bao cát ·
thùng · jersey · xe) ✓ · Rào chắn ✓ · **Hàng rào ✓ (mới)** · thềm/container/cầu vượt ✗ (chúng là
SÀN, không phải vật che) · nhà/tường/cổng ✗ (đạn bay xuyên, `IRangedDamageImmune`).

**(3) Map ba tầng ở vùng giữa.** MẶT ĐẤT (chui dưới cầu, có điểm tiếp tế) · **ĐƯỜNG TRÊN**
(cầu vượt −11…+11 cao 2.85, cầu thang thật hai đầu, mỗi phe một `GarrisonPost` trên nửa cầu của
mình) · **HAI MÁI** (cao thêm 1.65, cầu thang quay vào giữa). `LaneNav` là static tự cài lúc nạp
scene và dựng đồ thị từ collider CÓ THẬT, nên AI thấy đường lên xuống mà không builder nào phải
khai gì.
⚠⚠ **Thân thềm KHÔNG có collider** (`StickmanFortBuilder.CreateTerrace` chỉ dựng mặt sàn một
chiều + lan can trang trí) — đó chính là thứ cho phép xếp tầng và đi ngang bên dưới. Thêm
collider thân là bịt luôn tầng dưới.
⚠⚠ **KHÔNG đào hầm dưới mặt đất bake sẵn.** Bản ba tầng của HỆ MAP (`MapDefinition.threeLevels`)
đào được vì nó dựng cả mặt đất theo lô; scene bake lấy đất từ `StickmanSceneUtils.CreateGround`
— MỘT khối liền, lại có dải cỏ + trang trí ăn theo cả bề ngang. Cắt nó ra đổi lấy đúng một thứ
đã có sẵn (một tuyến đi thấp hơn) là không đáng.
⚠⚠ **BÁN KÍNH VÙNG CHIẾM PHẢI NHỎ HƠN CAO ĐỘ CẦU.** `CapturePoint.ContainsPoint` là hình TRÒN
2D: bán kính 3 dưới một cây cầu cao 2.85 nghĩa là người đứng TRÊN cầu vẫn chiếm được điểm dưới
chân mình. Đã hạ về 2.4.
⚠ **Chỗ đứng bắn chỉ đặt ở TẦNG GIỮA.** `GarrisonPost` dẫn quân tới CHÂN thang rồi lên — MỘT
chặng. Đặt post ở tầng ba là bắt leo hai chặng mà `AIStateGarrison` chỉ biết một: nó đứng ở chân
thang tầng hai tới hết trận, không lỗi nào báo.

**Phải bấm lại tool:** `★ Bảng điều khiển` → *Hiện đại — ĐỘT CHIẾM CĂN CỨ* (hoặc job **Demo_48**
ở dây chuyền nhóm 3). Cần `Loadout_Mod_*` có sẵn — nếu thiếu, builder **kêu `LogError`** và rơi
về bộ trung cổ (chứ không im lặng cho cả màn bắn súng ra trận bằng giáo mác).

---

## 18. BẢN HAI ĐẢO — `Demo_49_IslandWar` (2026-09-07)

Bộ máy doanh trại nay chạy **thứ ba** một map: đất liền (`Demo_20`), căn cứ hiện đại
(`Demo_48`), và **hai hòn đảo cách nhau một vùng biển**. Toàn bộ vòng chơi ở đây giữ nguyên —
nông dân, mỏ vàng, rừng củi, cây công trình, nhà lính có cấp, tổ canh nhà, `CampGameUi` —
cộng thêm ĐÚNG MỘT loại công trình. Chi tiết bên thuỷ chiến:
`Docs/KnowledgeBase/NavalWarfare.md` §10c và `Docs/AgentRules/Naval.md` §14.

### 18.1 `CampBuildKind.Harbor` — công trình đầu tiên nối SANG MODULE KHÁC

Mười hai loại trước đó đều chỉ nói chuyện với phần đất dưới chân: nhà kho đổi một hệ số sản
lượng, tháp canh cho cung thủ chỗ đứng, hàng rào chặn đường. Bến cảng thì mở ra cả một mặt
trận — nhưng thuyền nằm ở module **Naval (5)**, mà `CampBuildSite` ở **Gameplay (4)**.

Nên bến chia làm hai nửa, và cái ranh giới đó là phần đáng đọc:

- **Gameplay dựng cái nhà**: `BaseBuilding` có cấp (máu ×1.8 nhà lính — mất bến là mất cả mặt
  trận) + **CẦU TÀU** chồm ra mặt nước. Mặt cầu là đất ĐẶC (`solid: true`) đặt ĐÚNG cao độ
  mặt đảo; hụt một chút là người đi ra rơi xuống biển chứ không phải đứng lại.
  ⚠ `ruinDespawnSeconds: 0` (khác nhà lính): xác bến phải NẰM LẠI, dọn ngay lúc sập là mọi
  người đang trên cầu rơi xuống nước.
- **Gameplay KỂ LẠI**: `CampBuildSite.Raised` — một sự kiện tĩnh nói *"phe N vừa xây xong loại
  K ở đây"*. File đó không biết `IslandHarbor` tồn tại và không được biết.
- **Naval NGHE và lắp phần còn lại** (`IslandWarCommand.OnBuildingRaised`).
- **HUD HỎI**: `CampHarborShop` là sổ đăng ký để `CampGameUi` biết bấm vào bến thì bán gì, mà
  không phải biết "thuyền" là cái gì.

⚠ Map trên bộ vẫn xây bến được — chỉ là không có ai nghe, và nó thành một cái nhà đẹp có cầu
tàu. Không cần một nhánh `if (map có biển)` nào trong HUD.

### 18.2 Ô đất CỐ ĐỊNH — ngoại lệ đầu tiên của luật đặt móng

Bến buộc phải nằm đúng mép nước, vì mép cầu là chỗ mạn thuyền gối vào. Để nó xếp theo dãy ô
đất tiền tuyến như mọi loại khác thì một cái tháp canh xây trước sẽ đẩy nó lùi vào giữa đảo —
cầu tàu nằm trọn trên cạn, chiếc đò cập vào chỗ không có cầu, **quân đứng ở mép nước không
chịu lên thuyền**.

`CampBuildYard._harborX` (đo sẵn lúc dựng map) + hai ngoại lệ đi kèm:
`SpotBlockReason(…, ignoreRadius: true)` — mép nước hầu như không nằm trong bán kính đất trại
đo từ nhà chính, mà nới bán kính cho cả trại thì nhà kho mọc xuống biển; và **`TryMoveSite`
từ chối dời bến** — dời một nấc là mép cầu rời khỏi mặt nước.

`CampBuildYard._navalMap` là cờ thứ hai của cùng một map: nó đẩy `Harbor` lên ngay sau nhà
lính trong `SuggestNext`. Thiếu cờ này thì tướng máy chơi rất giỏi ván kinh tế của chính nó
rồi **hoà tới hết giờ**.
⚠ Là DỮ LIỆU của map chứ không phải phép dò lúc chạy: câu hỏi thật (*"không có bến thì phe này
có sang được đảo địch không"*) chỉ module Naval trả lời được, mà Gameplay nằm DƯỚI Naval.
Người dựng map biết câu trả lời từ lúc đặt hai hòn đảo.

### 18.3 Hai lỗ đã vá cùng đợt

**TRẠM QUÂN Y KHÔNG XÂY ĐƯỢC TỪ 2026-09-06.** `CampBuildKind.Infirmary` có enum, có bảng giá,
có `RaiseInfirmary` viết đầy đủ, có cả bảng nâng cấp trong HUD — chỉ là **không nằm trong
`CampGameUi.BuildKinds`**, nên không có đường nào chọn tới. Đúng cái bẫy mà chú thích ngay
trên mảng đó đã cảnh báo sau khi ba nhà lính dính lần thứ nhất, và nó vẫn dính lần thứ hai.
Bài học giữ lại: **thêm loại công trình là sửa SÁU chỗ**, và chỗ dễ sót nhất là mảng liệt kê
của HUD — vì sót nó thì mọi thứ khác vẫn "đúng".

**BẾN CẢNG SUÝT BÁN BỘ BINH.** `CampProductionBuilding.OfferedTiers` trả `Level` cho mọi loại
khai `IsProduction()`. Chuồng ngựa đã có ngoại lệ; bến cảng phải thêm ngoại lệ thứ hai, không
thì `TryRecruit` chạy trót lọt và người chơi mua được lính ở bến.

**VÀ BẾN KHÔNG ĐƯỢC PHÓNG TO KHI NÂNG CẤP.** `TryUpgrade` có đường dự phòng
`localScale *= 1.06f` khi không vẽ lại được bằng art thật — mà thân bến mang theo CẦU TÀU.
6 % là mép cầu dịch mấy tấc, trong khi `IslandHarbor` đã chốt toạ độ mép cầu từ lúc lắp: chiếc
đò vẫn cập vào chỗ cũ, nay hụt mất một quãng. Cấp bến vốn đã đọc ra được ở **số thuyền nuôi
được**, không cần to thêm mấy phần trăm để nhìn thấy.

### 18.4 Bảng giá RIÊNG

`EconomyProfile_HaiDao` (không sửa đè lên `EconomyProfile_DoanhTrai` — hai map dùng chung một
asset thì chỉnh cân bằng cho map này là lặng lẽ đổi map kia). Ba chỗ khác bản trên bộ, cả ba
vì cùng một lý do: **một chuyến đò tốn thời gian và có thể chìm giữa đường**.

| Số | Đảo | Đất liền | Vì sao |
|---|---|---|---|
| vốn mở màn | 12 vàng + 14 củi | 6 + 8 | phải xây nhà lính RỒI bến (đắt nhất bảng) mới có trận đánh đầu tiên |
| thu nhập nền | 0.4/giây | 0.25/giây | mất một chuyến đò đầy là mất 5–9 người CÙNG LÚC |
| trần quân số | 14 | 20 | quân phải qua được cầu tàu mới ra trận; 20 người thì phần lớn chỉ đứng chờ |
| bến cảng | 34 vàng + 30 củi, 8 công | — | cửa DUY NHẤT sang đảo địch; rẻ ngang nhà kho thì ván chơi hết ngã rẽ |

⚠ **Chuồng ngựa vẫn xây được nhưng không nằm trong kế hoạch của tướng máy**: con ngựa là một
`StickmanMount` rời, nó không lên được chiếc đò — tiền đổ vào đó là tiền không bao giờ sang
tới đảo bên kia.

**Phải bấm lại tool:** `★ Bảng điều khiển` → *Thuỷ chiến*, hoặc menu `Naval > 6. Chiến tranh
hai đảo (Demo_49)`.
