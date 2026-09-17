## TRÚNG ĐÒN = CHOÁNG NHẸ · CHỦ SOÁI · ĐỊCH ĐÔNG HƠN · HÌNH KHÔNG GIẬT (2026-09-03)

### Phân biệt trúng thật và đỡ được (2026-09-06)

`StickmanController.HealthDamaged` chỉ phát khi nhân vật sống mất máu; BodyAnimator nghe
event này để phát Hurt, không so với máu lần trúng trước (sai sau hồi máu/buff).
`Damaged` giữ hợp đồng cũ cho các bên nghe khác. Khiên/thế thủ xử lý trước hao giáp;
đỡ thành công không mất máu, không Hurt và không đẩy nạn nhân. Đòn 0 damage bỏ qua;
`forceScale <= 0` là nhánh sát thương theo nhịp: không bị khiên chặn, không Hurt/choáng/lùi.
Giữ miễn giật khi cưỡi và luồng ragdoll khi chết, không gắn animation bằng cách kéo part vật lý.

Doctor có check **Động tác trúng đòn có thể phát**: bộ chính (có Idle) phải có clip Hurt hợp lệ,
báo số clip và cách bổ sung; không tự rebuild đè pose Capture.
Tool `Tools > Stickman > Nâng cao > Rig & Kiểm tra > Test đỡ đòn + Hurt + đẩy lùi`
(`StickmanCombatValidation`) chạy trên đối tượng tạm trong preview scene, không lưu/đổi scene
người dùng. Báo cáo `Logs/StickmanCombatValidation.json` gồm event, chọn Hurt, hướng recoil,
đỡ/DOT/0 damage và chọn vũ khí theo cự ly/kho; kèm Doctor toàn dự án.
Đây là test logic/clip selection, **không** phải đo FPS hay xác nhận hình pose trong Play.

Người dùng báo bốn thứ trong một câu: *"đánh nhau không thấy trúng đòn, không có trạng thái
hit, không giật lùi, trúng đòn vẫn đánh lại được ngay; muốn mình là chủ soái một chọi nhiều
như Mount & Blade; địch phải đông hơn; game giật"*. Bốn thứ, bốn chốt:

**1. HIT-STUN (`StickmanController.ApplyHitStun` · `IsHitStunned`).** Trước đó trúng đòn CÓ
lùi (0.12 s × 1.15 u/s ≈ **0.14 đơn vị**, bằng 1/5 người — mắt không thấy) và CÓ clip `Hurt`,
nhưng **không gì khoá đòn**: nạn nhân chém trả ngay trong cùng frame, và nhát đang vung dở
vẫn trúng — "trao đổi đòn" cân bằng tuyệt đối nên đánh trước chẳng có lợi gì. Nay đòn LÀM TỤT
MÁU (đỡ được thì không) → choáng `HitStunBase` 0.32 s × `forceScale^0.4` (trần 0.6) ×
`(1 − _hitStunResistance)`: **không ra đòn** (chặn ở CỬA `StickmanWeaponHolder.Attack`),
**đòn dở bị cắt** (`InterruptAttack` → `WeaponBase.Interrupt`: cận chiến đóng hitbox + dừng
vung, cung/lao tuột lực tích), **lùi** đúng bằng thời gian choáng và TẮT DẦN
(`StickmanLocomotion.ApplyHitRecoil(info, stun)`: lính thường lùi ~0.5 đơn vị, bị tướng đánh
~0.8). Đòn nối tiếp GIA HẠN chứ không cộng dồn (luật một slot của `StickmanStatus`).
⚠ **KHÔNG nhét vào `StickmanStatus.IsIncapacitated`** — cái đó tắt TRỌN cả đầu AI lẫn input;
hit-stun chỉ khoá ĐÒN, AI vẫn nghĩ, người chơi vẫn đổi hướng ngắm. Nhét chung là mỗi nhát chém
làm cả cái đầu tắt 0.3 s.
⚠ `_hitStunResistance` là field MỚI nên prefab/scene đã bake nhận 0 (lính thường) — không phải
dựng lại gì. Kháng choáng chỉ dành cho tướng/boss: cho cả sân kháng là quay về đúng bản cũ.

**2. CHỦ SOÁI (`Gameplay/HeroCommander` + `HeroCommanderBootstrap`).** Người chơi dùng CHUNG
prefab + loadout với lính, và HỒI SINH là một thân mới, nên "tướng mạnh hơn" không nằm được
trong prefab lẫn builder. Component tự gắn qua `PlayerCharacter.Changed` (+ `sceneLoaded`) —
44 scene không phải dựng lại. Mọi con số là **chỉ số nhân RUNTIME** trên `StickmanController`
(`DamageDealtScale` · `AttackSpeedScale` · `DamageTakenScale` · `KnockbackScale` ·
`HitStunResistance` · `HeadshotLethality`) + `StickmanStatus.KnockdownResistance` — vũ khí
đọc qua `Damage`/`Cooldown`/`Knockback` nên đổi cây, nhặt cây, đạn bay đều ăn theo, và Balance
Report không lệch (chủ là lính thường, hệ số 1). Máu ×4 · sát thương ×1.6 · nhịp đòn ×1.35 ·
nhận đòn ×0.7 · đẩy ×1.8 · kháng choáng 0.85 · kháng ngã 0.8 · đầu trần ăn 35% máu hiện tại
thay vì xoá sổ. Cận chiến vốn chém xuyên đám đông (`_maxTargetsPerSwing` 0 = vô hạn) nên không
cần cơ chế "cleave" mới.
⚠⚠ **`_baseMaxHealth` PHẢI SERIALIZE.** `PlayerRespawn.BuildTemplate` / `RespawnDirector.
CaptureTemplates` CLONE người chơi đang sống, mà `_maxHealth` là serialized nên bản sao mang
số ĐÃ NHÂN (12) — không nhớ gốc là thân hồi sinh lấy 12 làm gốc rồi nhân tiếp: **mỗi lần
chết mạnh gấp bốn**, không lỗi nào báo. Cùng họ với bẫy "clone người sống" ở mục 4d/4d-bis.
⚠ Tắt cả hệ (bàn thử muốn người chơi = lính thường để so cây): `HeroCommander.Enabled = false`
trước khi nạp scene.

**3. ĐỊCH ĐÔNG HƠN (`GameDifficulty.HeroOutnumber` 1.6 · trần `MaxEnemyCountScale` 3).**
`GameSession.ApplyDifficultyToScene` thấy phe người chơi có tướng (`PlayerTeamHasHero` — hỏi
nhãn `PlayerCharacter` + phe, KHÔNG hỏi component `HeroCommander` vì bootstrap của nó có thể
gắn SAU `Start`) thì nhân thêm vào `enemyCountScale`, cả lính có sẵn lẫn máy sinh quân. Bậc
DỄ vẫn hơi đông hơn mình (0.75 × 1.6), ĐỊA NGỤC gấp ba.
· Vế tướng áp CẢ KHI `_applyTroopCount` tắt (bài dàn trận `Demo_3` cố ý không nhân theo bậc
  khó để so hai đạo quân — nhưng người chơi đứng trong hàng là phép so đã lệch sẵn).
· Mode mà QUÂN SỐ LÀ LUẬT khai `MatchModeBase.TroopCountIsRule => true` để miễn: `LastStanding`
  (mỗi người một phe — nhân "phe 2" là méo luật) · `ChampionDuel` (hai đạo quân đứng xem là
  CẢNH). Thêm mode kiểu đó thì override, đừng đi sửa `GameSession`.

**4. HÌNH GIẬT — `Rigidbody2D.interpolation` (`StickmanController.Awake`).** `Character.prefab`
bake `m_Interpolate: 0`: vật lý 50 Hz, vẽ 60+ Hz, thân nhảy từng nấc theo nhịp vật lý và
camera (SmoothDamp ở `LateUpdate`) bám theo cái thân đang nhảy nấc → cả màn hình rung theo
bước chân. Ép `Interpolate` cho MỌI `StickmanFighterController` lúc `Awake` (không sửa prefab —
44 scene đã bake). Kèm: `StickmanPerformanceBootstrap` (Core) đặt `targetFrameRate` 60 trên
điện thoại (mặc định của Unity là **30**), `Physics2DSettings.useMultithreading = 1`,
`Maximum Allowed Timestep` 0.1 → 0.05 (một frame trễ không kéo theo 5 nhịp vật lý bù dồn —
đó là cái "giật đi" sau mỗi lần khựng).
⚠ Đo trước khi tối ưu thêm: mở **Window > Analysis > Profiler** lúc chơi, xem cột
`PlayerLoop` — `Physics2D.Simulate` · `SpriteSkin` (deform) · `GUI.Repaint` (34 file `OnGUI`
IMGUI) · `GC.Alloc`. Không có số thì mọi "tối ưu" tiếp theo là đoán.

### ⚠⚠ VÀ BẢN ĐẦU CỦA HIT-STUN VẪN "KHÔNG THẤY GÌ" — BA BẪY NỮA, CẢ BA CÂM LẶNG

Người dùng thử xong báo *"đánh nó vẫn không hít và không bị đẩy ra"*. Code chạy đúng, không
lỗi nào báo. Ba lỗi chồng lên nhau:

| # | Sai ở đâu | Vì sao câm |
|---|---|---|
| 1 | **Hướng đẩy lấy từ VỆT CHÉM** | `ApplyHitRecoil` tin `info.direction`, mà cận chiến thì `MeleeWeapon.ResolveHitDirection` trả **hướng lưỡi đang quét trong frame đó**. Cú CHÉM DỌC có `direction.x ≈ 0` ⇒ chốt `Mathf.Abs(direction.x) < 0.05f` thoát sớm ⇒ **không đẩy gì cả**; còn đoạn cung vung ngược về phía chủ thì `direction.x` ĐỔI DẤU ⇒ nạn nhân bị đẩy **VÀO** kẻ vừa chém mình |
| 2 | **Chỗ trúng đòn là collider NGẪU NHIÊN** | `_overlapBuffer` không hứa thứ tự; bán kính quét 0.25 trên người cao 0.73 thì lần nào cũng trùm nhiều hitbox. Mà trúng **ĐẦU TRẦN** là `TakeDamage` XOÁ SỔ (`amount = máu hiện tại`) ⇒ phần lớn cú chém thành one-shot ăn may, nạn nhân **chết ngay nên không bao giờ kịp thấy choáng / giật / bật lùi**, và `_maxHealth = 3` thành con số vô nghĩa trong cận chiến |
| 3 | **Cháy/độc cũng gây choáng** | `StickmanStatus` trừ máu mỗi **0.5 s** với `forceScale = 0`, mà `ApplyHitStun` quy 0 về 1 ⇒ mỗi nhịp cháy khoá 0.32 s ⇒ **dính lửa là không bao giờ ra đòn được nữa** |

**Ba chốt:**
· **Đẩy RA XA KẺ ĐÁNH, không đi theo lưỡi dao** — game đi ngang thì "bị bật ra" luôn có nghĩa
  đó. Hỏi `info.source` trước → điểm chạm → cuối cùng mới tới `info.direction`.
· `MeleeWeapon.NearestHitboxOf` — chọn hitbox **GẦN MŨI VŨ KHÍ NHẤT** (`ClosestPoint`, đo tới
  BỀ MẶT chứ không tới tâm, để cái đầu bé nằm ngay dưới lưỡi thắng cái thân to có tâm xa hơn).
  "Trúng đầu" quay lại đúng nghĩa: lưỡi thật sự ở ngang tầm đầu. Luật *"đầu trần là điểm yếu
  chí mạng"* KHÔNG đổi một chữ.
· `forceScale <= 0` (quy ước của sát thương theo nhịp) → **không choáng, không đẩy**.

⚠ **`forceScale = 0` LÀ MỘT QUY ƯỚC, KHÔNG PHẢI MỘT SỐ THIẾU.** Thêm bất kỳ hệ nào phản ứng
theo đòn (choáng · đẩy · rung hình · combo) thì phải tự hỏi *"cháy/độc/chảy máu có được kích
cái này không"* — chúng đi CHUNG `TakeDamage` với đòn thật.

**Quãng đẩy đo được** (mô phỏng nhịp 0.02 s, người cao 0.73):

| Tình huống | choáng | đẩy | so với thân người |
|---|---|---|---|
| bản cũ (0.12 s × 1.15 u/s) | 0 | 0.14 | **0.19×** — mắt không thấy |
| lính chém lính (knock 1.2) | 0.34 s | 0.59 | 0.80× |
| TƯỚNG chém lính (1.2 × 1.8) | 0.44 s | 0.92 | 1.26× |
| búa nặng (knock 3.0) | 0.50 s | 1.08 | 1.48× |
| lính chém TƯỚNG (kháng 0.85) | 0.05 s | 0.14 | 0.19× — đúng ý: tướng gần như không nhúc nhích |


---

## ⚠⚠ KỴ SĨ KHÔNG GIẬT, KHÔNG VĂNG (2026-09-05)

`StickmanController.RidingNow` → `ApplyHitStun` trả 0 và `ApplyImpulse` thoát sớm (xác thì vẫn
hất như thường — lúc đó đã ngã khỏi ngựa).

Lý do là HÌNH HỌC chứ không phải cân bằng: cú giật khi trúng đòn làm bằng `AddForce` vào một
PART RAGDOLL của rig, còn con ngựa là một tấm hình gắn dưới nhóm `Sprite` của **chính rig đó**.
Nên mỗi mũi tên trúng kỵ sĩ là một cái chân/cái đầu bị hất đi trong khi thân vẫn dính yên —
nhìn ra *"người bị văng khỏi ngựa"* chứ không ra *"trúng đòn"*. Cú choáng thì làm con ngựa
đứng khựng giữa nước phi, sai một kiểu khác.

⚠ **ĐÂY LÀ THAY ĐỔI CÂN BẰNG CÓ CHỦ Ý**: kỵ binh không thể bị cắt nhịp bằng đòn lắt nhắt. Đổi
lại chúng đắt và không nhảy · không leo · không đi cầu thang.

⚠ **KHÔNG dùng `_hitStunResistance`** — đó là số của TỪNG nhân vật (tướng, buff đang xài); đây
là luật của TRẠNG THÁI CƯỠI, hết cưỡi là hết.
⚠ **`KnockbackScale` là knockback mình GÂY RA** (nó nhân vào `WeaponBase.Knockback` của vũ khí
đang cầm), KHÔNG phải cái mình NHẬN. Sửa nhầm chỗ đó là kỵ binh đánh nhẹ đi mà vẫn văng.

---

## ⚠⚠ ĐÒN TỪ SAU LƯNG PHẢI TRÔNG KHÁC ĐÒN VÀO MẶT (2026-09-16)

Code: `StickmanBodyAnimator.IsHitFromBehind` + hằng `BackHitStyle` · dáng `lurch` trong
`StickmanActionSetBuilder.VarietyFight.cs`. Đo: Doctor › «Dáng TRÚNG ĐÒN TỪ SAU LƯNG».

`DamageInfo.direction` **đã có người GHI từ lâu** — lực ragdoll đọc nó — nhưng ở tầng animation
thì **không ai ĐỌC**: `OnDamaged` chọn dáng bằng đúng hai thứ, **% máu** và **`forceScale`**.
Nên một nhát đâm sau gáy trông y hệt một cú đấm thẳng mặt. Nhìn vào code vẫn thấy "đã có hướng
đòn" — đây đúng hình dạng *một field có người ghi mà không ai đọc*.

Nay thứ tự chọn dáng là: **sắp gục** (`kneel`) → **đòn từ sau lưng** (`lurch`) → **đòn nặng**
(`stagger`) → bốc ngẫu nhiên. Bị đâm lén đáng đọc ra hơn là cú đó nặng bao nhiêu, nhưng vẫn
thua tin "sắp chết".

**Hình học**: `direction` là hướng lực ĐẨY nạn nhân đi. Đẩy **cùng chiều mặt đang quay** ⇒ kẻ
đánh đứng sau lưng. ⚠ KHÔNG so vị trí hai người: kẻ tấn công có thể đã chết hoặc biến mất trong
lúc mũi tên còn bay, còn `direction` thì đi theo chính cú đánh.

⚠ Dưới `BackHitMinPush` (0.35) trên trục X thì **không kết luận** — đá tảng rơi, nổ dưới chân,
chết đuối đều cho `direction` gần như thẳng đứng, và đoán bừa ở đó là dáng nhảy lung tung.

⚠⚠ `lurch` khai **`weight: 0f`** — chỉ gọi đích danh. Đây là style `Hurt` ĐẦU TIÊN được chọn
bằng HÌNH HỌC chứ không bốc ngẫu nhiên; để `weight > 0` là thỉnh thoảng một cú đấm thẳng mặt
cũng cho ra dáng bị đâm sau gáy, và **tín hiệu vừa thêm mất sạch nghĩa**. Cùng luật với bảy
dáng `win_*`.

⚠ Dáng chưa có trong bộ đã bake thì `StickmanActionSet.Pick` **lặng lẽ** rơi về một dáng ngẫu
nhiên — nhân vật VẪN giật, nên không ai ngờ cả tín hiệu chưa bao giờ chạy. Đó là lý do phải có
phép đo riêng; sửa bằng «Dựng bộ ĐỘNG TÁC».
