# Cách cầm vũ khí — tham khảo game & giải phẫu

> Tra cứu từ Stick War, các game stickman ragdoll, và tài liệu animation combat.
> Áp dụng vào `WeaponHoldPose` trong `StickmanWeaponBuilder`. Cập nhật: 2026-08.
>
> Nhắc lại hệ toạ độ IK tay (local space): **−Y = hướng ngắm (ra trước)**, **+X = lên / ra sau**.

## 0. Góc vũ khí = KHÔNG GIAN NGẮM (pose rework 2026-08)

`WeaponHoldPose.weaponAngle` (và `offHandWeaponAngle`) hiểu theo **boneHead**, KHÔNG phải
local theo bàn tay: **0° = mũi chỉ thẳng mục tiêu · dương = ngóc lên · âm = chúc xuống**.

Vì sao đổi: bàn tay là khúc cuối của chuỗi IK, nó **xoay mỗi khi tay di chuyển** — góc local
cố định nghĩa là vũ khí ngoáy theo tay (giáo đang đâm mà mũi vẽ vòng cung, súng gật gù).
`StickmanProceduralAnimator.ApplyAimSpaceAngle` neo góc vào trục ngắm → giáo giữ nguyên
hướng suốt cú thọc. Hằng bù tay `RightHandBaseAngle = -74°` / `LeftHandBaseAngle` đã bị xoá.

Hệ quả dễ nhớ khi viết pose: `+140..150` = giơ sau đầu lấy đà, `+90` = dựng đứng,
`0` = chỉ thẳng địch, `-45..-55` = vừa chém xuống hết đà.

## 1. Nguyên tắc số 1: ĐỐI TRỌNG CHÉO (contralateral counterbalance)

> "One-handed sword/mace attacks use full shoulder rotation with **contralateral counterbalance**."

Vũ khí **1 tay** (kiếm, lao, búa, bom) thì tay còn lại phải vung **NGƯỢC CHIỀU** tay cầm:

| Pha | Tay cầm vũ khí | Tay kia |
|---|---|---|
| Lấy đà (windup) | kéo RA SAU (+X, |Y| nhỏ) | đưa RA TRƯỚC (−Y lớn) |
| Đánh / buông (strike) | phóng RA TRƯỚC (−Y lớn) | giật VỀ SAU (+X, |Y| nhỏ) |

**Đây là lỗi cũ của dự án:** cả 4 vũ khí 1 tay đều cho tay trái vung *cùng chiều* tay phải
→ trông như búp bê bị đẩy, không có lực xoay vai. Đã sửa trong `StickmanWeaponBuilder`
cho TOÀN BỘ combo (kiếm, đao, đao ngắn) lẫn pose ném (lao, búa, bom, lựu đạn).

Vũ khí **2 tay** (giáo, thương, súng, đao dài, búa cận chiến) KHÔNG áp dụng — tay phụ đã bám
cán qua `_offHandGrip`, pose chỉ cần lo tay sau (ikArmR) + góc vũ khí.

**Song đao/song kiếm**: lưỡi đang chém theo đối trọng với tay kia, còn lưỡi NGHỈ giữ thế thủ
chếch trước ngực (~+35°) — hai tay cùng vung là rối mắt, mất chất song đao.

## 1b. DÁNG ĐỨNG THỦ phải NẰM CÙNG PHÍA với cú vung

> Bốn thế thủ kiếm dài Đức (Liechtenauer) — dùng làm từ vựng chuẩn cho `_idlePose`:
>
> | Thế | Mũi kiếm ở đâu | `weaponAngle` (không gian ngắm) |
> |---|---|---|
> | **Vom Tag** (mái nhà) | vác trên vai / trên đầu, chờ bổ xuống | **+100…+130** |
> | **Ochs** (bò) | tay cao, mũi chĩa vào mặt địch | +20…+40, *tay phải đưa cao* |
> | **Pflug** (lưỡi cày) | chuôi ở hông, mũi chĩa ngang ngực | 0…+15 |
> | **Alber** (kẻ ngốc) | mũi chúc xuống đất | −50…−70 |

**Lỗi đã dính (2026-08):** cả 9 vũ khí vung đều để `_idlePose` ở **+30…+65 với tay buông
thấp sát hông** — lưỡi chìa RA TRƯỚC trong khi bàn tay không đỡ gì. Đó không phải thế nào
trong bốn thế trên: nhìn ra đúng kiểu **cầm ngược vũ khí**. Tệ hơn nữa là `_windupPose`
lại nằm ở **+110…+150** (Vom Tag, lên RA SAU), nên mỗi lần ra đòn lưỡi phải quét ngược
70–105° qua trước mặt rồi mới lấy đà được.

**Luật rút ra (bản 1):** `_idlePose` phải cùng phía với `_windupPose`, và **tay cầm phải nâng
lên gần vai** (`ikArmR` ≈ x 0.45…0.58) chứ không buông thõng — vác vai mà tay ở hông thì lưỡi
nằm vắt ngang người.

### ⚠ SỬA LẠI (bản 2) — chuyển từ Vom Tag sang OCHS

Bảng Vom Tag (+100…+130) ở trên **đã bị thay**. Lý do: vác sau vai làm nhân vật lúc ĐỨNG YÊN
cũng trông như đang lấy đà bổ — với búa cận chiến (dài 0.6 world ≈ 82% chiều cao người) thì
đọc ra đúng dáng **lấy đà NÉM búa**. Với cây cán dài, Vom Tag còn kéo đuôi cán chìa xa ra
trước nên tay phụ (`gripX` âm) với không tới.

**(Bản 3 — sửa nốt vế "tay cao"):** luật "tay nâng gần vai" của bản 1 hoá ra là nguồn lỗi
thứ hai. IK target cách vai ~0.7 → cánh tay gập chữ V gắt, chuôi vũ khí treo NGANG MẶT.

> ⚠⚠ **SỬA MỘT CON SỐ SAI Ở ĐÂY (2026-08): SẢI TAY KHÔNG PHẢI 1.9 MÀ LÀ 1.469.**
>
> Bản 3 ghi "SẢI TAY = 1.9, đo từ pose cung duỗi thẳng −1.919". Con số đó đo từ giá trị
> `IKArmL` **lưu sẵn trong prefab** — nhưng chính giá trị ấy đã VƯỢT TẦM VỚI, nó chỉ là chỗ
> ai đó để lại chứ không phải một tư thế với tới được.
>
> Sải tay THẬT = tổng hai khúc xương, đo từ `Character.prefab`:
> `armR → handR` **0.7172** + `handR → effectArmR` **0.7518** = **1.4690**.
>
> Hậu quả: **37/228 IK target của bộ vũ khí bị gõ vượt tầm**, có cái vượt 33%. Target vượt
> tầm thì `LimbSolver2D` duỗi thẳng hết cỡ rồi dừng — tay **cứng đơ, khuỷu không gập**, và
> BÀN TAY (kèm vũ khí) nằm NGẮN HƠN chỗ pose định đặt. Không lỗi nào báo; nhìn ra là "cầm
> sai chỗ" và "tay như que". Đã kéo cả 52 giá trị về ≤ 95% tầm với (giữ nguyên HƯỚNG), và
> chặn ở gốc bằng `StickmanProceduralAnimator.ClampToReach`.
>
> **Bài học chung: đừng đo hằng số rig từ một giá trị đang nằm trong prefab — nó có thể là
> rác. Đo từ CHIỀU DÀI XƯƠNG.** Game tham khảo
(Stick War / Endless War) cầm chuôi ở NGỰC–HÔNG, khuỷu gập vừa.

**Chuẩn mới: tay cầm idle cách vai ~0.9–1.1** (khuỷu gập ~100°), vị trí NGANG NGỰC hơi
thấp: `ikArmR` ≈ (−0.25…−0.35, −0.85…−0.95) — nhớ trục: −X là XUỐNG, −Y là RA TRƯỚC.
Polearm couched thì tay sau ở HÔNG thật: (−0.45…−0.48, −0.4). Góc mũi giữ thế `Ochs`
(+25…+55: mũi chĩa lên-trước vào mặt địch).

| Vũ khí | idle (Ochs) | windup | strike |
|---|---|---|---|
| Kiếm | **35** | 140 | −45 |
| Đao | **38** | 150 | −50 |
| Đao ngắn | **28** | 110 | −35 |
| Đao dài | **45** | 140 | −50 |
| Song đao | **35** (lưỡi phụ −30) | 140 | −45 |
| Song kiếm | **30** (lưỡi phụ −28) | 120 | −40 |
| Búa cận chiến | **55** | 150 | −55 |
| Rìu | **42** | 130 | −40 |
| Chùy | **40** | 120 | −35 |
| Búa ném (idle) | **25** | 125 | −20 |

Vũ khí ĐÂM (giáo, thương, kích, nỏ, súng) giữ nguyên 0° — mũi luôn chỉ thẳng mục tiêu.
Khiên giữ 90° (mặt khiên dựng đứng che thân).

### NẮM TAY PHẢI ÔM ĐÚNG CÁN

Góc đúng vẫn chưa đủ: bàn tay là khúc CUỐI chuỗi IK nên góc của nó do `LimbSolver2D` quyết
(nó lo đưa đầu ngón tới IK target), còn góc vũ khí thì neo vào HƯỚNG NGẮM. Hai nguồn độc lập
→ nắm tay và cán **cắt chéo nhau ở góc bất kỳ**, nhìn ra là vũ khí chỉ ĐẶT CẠNH bàn tay chứ
không được nắm.

`StickmanProceduralAnimator.AlignHandToWeapon()` kéo bàn tay về cùng hướng cán, chạy TRƯỚC
`ApplyAimSpaceAngle` (xoay bàn tay làm đổi ma trận cha của vũ khí). Chỉ xoay KHÚC BÀN TAY nên
cổ tay đứng yên, cánh tay vẫn đúng y như IK giải — không gãy khớp. Vặn tối đa
`_handTwistLimit` (mặc định 40°) để vũ khí dựng đứng không bẻ gãy cổ tay; kẹp bằng
`Mathf.DeltaAngle` cho idempotent.

**Soi bằng gizmo**: chọn vũ khí trong Hierarchy lúc đang Play — chấm **xanh lá** = nắm tay,
chấm **vàng** = gốc sprite vũ khí. Rời nhau = sai `_gripLocalPosition` / gắn nhầm xương;
trùng nhau mà vẫn nhìn lệch = PIVOT trong ảnh đặt sai chỗ (sửa ở `WeaponArtGenerator`).

## 1c. CẦM HAI TAY: tay thuận Ở TRÊN, tay phụ ở pommel

> "Tay thuận nắm **đầu trên của chuôi**; tay còn lại nắm **pommel hoặc ngay trên nó**.
> Đừng để hai tay chồng lên nhau — cách nhau vài phân. **Khoảng cách giữa hai tay chính là
> thứ tạo ra lực**: tay thuận cho sức, tay phụ điều khiển cung vung và hướng mũi."

**Lỗi đã dính (2026-08):** dự án làm NGƯỢC — pivot sprite đặt sát pommel nên tay PHẢI nằm
dưới cùng, rồi `_offHandGrip` DƯƠNG đẩy tay TRÁI lên sát chắn tay. Đúng kiểu cầm lộn.

**Luật:** pivot của sprite vũ khí 2 tay = **CHỖ TAY THUẬN**, đặt ở đầu trên chuôi;
`_offHandGrip` mang giá trị **ÂM** để tay phụ tụt xuống pommel/đuôi cán.

| Vũ khí | pivot (px) | `_offHandGrip` | Hai tay cách nhau | Kiểu |
|---|---|---|---|---|
| Đao dài | 84 / 300 (dưới đĩa chắn) | **−0.64** (pommel) | 0.64 | chuôi ngắn, hai tay gần nhau |
| Búa cận chiến | 110 / 240 | **−0.96** (đuôi cán) | 0.96 | cán dài, hai tay XA nhau |
| Giáo · Thương · Kích | giữ nguyên | +1.1…+1.3 | rất xa | cán rất dài, tay sau ở đuôi |

Hai kiểu khác nhau, đừng nhầm: **chuôi kiếm** thì hai tay sát nhau ở một đầu; **cán dài**
(búa, rìu, giáo) thì tay trên điều khiển đầu vũ khí, tay dưới ở đuôi cán lấy đòn bẩy.

### Bẫy IK: đích của IK là ĐẦU NGÓN, chỗ nắm là NẮM TAY

`ApplyPose` từng đặt thẳng IK target tay trái vào điểm nắm trên cán. Sai: IK kéo `effectArmL`
(**đầu ngón**, 100% chiều dài xương bàn tay) tới đích, còn chỗ nắm là **nắm tay** (73%,
`StickmanRigPaths.HandGripFraction`). Kết quả: cán rơi vào đầu ngón, nắm tay hụt ~0.2
rig-unit — nhìn ra tay không thật sự nắm cán. Đây đúng cái bẫy "gốc xương bàn tay là CỔ TAY"
trong AGENTS.md, nhưng ở phía **IK target** thay vì phía gắn vũ khí.

Đã sửa bằng `StickmanProceduralAnimator.FistToFingertipOffset()` — đo SỐNG vector
nắm-tay → đầu-ngón từ rig mỗi frame (tự đúng theo hướng bàn tay đang xoay và theo scale,
kể cả mirror lúc quay trái), rồi cộng vào đích.

## 2. Bảng dáng cầm theo loại

### Cung (1 tay — tay trái giữ cung)
- Tay giữ cung **duỗi thẳng ra trước**, gần như khoá khuỷu
- Tay kéo dây về **neo ở gò má / hàm** — điểm neo phải CỐ ĐỊNH giữa các lần bắn
- Mũi tên phải bám đúng điểm nốc dây: *"the arrow must track the string nock point precisely"*
- Buông dây phải dứt khoát, tay giữ cung hấp thụ rung
- Stick War (Archidon): trường cung + bao tên đeo vai

Trong dự án: `_idlePose` tay kéo ở y≈−0.9 → `_chargedPose` kéo về y≈−0.34 (sát mặt) ✓

### Giáo (2 tay) — **kiểu Spearton của Stick War**
- Lúc thủ: giáo **kẹp sát người ngang hông (couched)**, KHÔNG giơ cao
  > Spearton: *"the spear will be tucked just to the left of the now front-facing shield"*
- Tay trước đẩy xa trên cán, tay sau về sát hông
- Cú đâm bật ra **từ eo**, không phải từ vai → nhanh, gọn, không quét vào đồng đội
- Đòn đánh: đâm thẳng (thrust), quét ngang, dùng hông + thân xoay vì cán dài

Đã áp dụng (bản rework): idle tay sau **(0.05, −0.35)** = kẹp sát hông, giáo góc 0 nằm ngang;
đâm = tay sau phóng theo đường ngắm tới (−0.2, −1.15), giáo GIỮ góc ~0 suốt cú
thọc nhờ góc neo không gian ngắm. Thương cùng bài, tay sau lùi sát hơn nữa (0.08, −0.3).

**TAY PHẢI là tay CẦM CHÍNH (ở sau, neo vũ khí vào nắm tay), TAY TRÁI là tay ĐỠ** —
tự bám cán qua `_offHandGrip`, không nghe pose. Pivot sprite của cả nhóm polearm đặt tại
NẮM TAY PHẢI ở **~25% chiều dài** (Spear 90/340, Lance 100/420, Halberd 95/380): sau nắm
tay còn ló một khúc đốc cán — cầm sát mép cuối trông như cầm cột cờ, và khi chém cây
quay quanh đúng chỗ tay nắm. Pose ghi trong không gian ngắm nên quay trái/phải tự mirror.

**Bộ đòn polearm chuẩn (giáo/thương/kích dùng chung khung — `StickmanWeaponBuilder`):**

| Nhát | Style | Góc windup → strike | Ghi chú |
|---|---|---|---|
| 1. `dam` | Thrust | ~2° → 0° | nhát chủ lực, bật ra từ eo |
| 2. `chem_len` | Slash | **−50…−55° → +65…+70°** | hất mũi từ thấp lên, tay sau giật về vai |
| 3. `chem_xuong` | Slash | **+75…+80° → −50°** | nhát KẾT, bổ từ trên xuống, damage/hitbox cao nhất |

Góc chém ghi LIÊN TỤC (lerp tuyến tính) để lưỡi quét TRỌN cung qua mặt trước.
Khác nhau giữa 3 cây: giáo chém nhẹ + nhanh nhất (cán gỗ), thương chậm nhất,
kích chém mạnh nhất (có lưỡi rìu — damageScale 1.3/1.5, hitRadiusScale 1.3/1.35).

### Kiếm (1 tay)
- Stick War (Swordwrath): idle có động tác xoay kiếm bằng cổ tay, giơ lên ngắm nghía
- Đánh: xoay vai đầy đủ + đối trọng chéo (xem mục 1)
- Bộ đòn chuẩn: chém ngang, bổ dọc, chém trái tay, chém chéo lên/xuống, đâm, lao tới

### Súng (2 tay)
> *"the off-hand must track a point on the weapon while the dominant hand drives position"* —
> đây là cách chống lỗi **"floating left hand"** (tay trái lơ lửng không bám súng).

- Tay thuận nắm báng và **quyết định vị trí**, tay phụ đỡ dưới nòng và **bám theo**
- Hai tay gần như nằm trên đường ngắm

Trong dự án: `_offHandGrip` đặt ở x = 0.55 trên cán súng ✓

### Lao (2 tay khi CẦM, 1 tay khi NÉM) / Búa ném (1 tay)
- LAO cầm HAI TAY: tay phải cầm chính tại điểm cân bằng (pivot 110/300 ≈ giữa cán),
  tay trái ĐỠ cán phía trước (`_offHandGrip` x = +0.5, `HandGrip.TwoHanded`)
- Lúc ném: tay trái bám cán suốt windup; **buông đúng lúc lao rời tay** —
  `WeaponBase.SetVisualActive(false)` tắt luôn điểm bám, animator thấy grip inactive
  là trả tay trái về pose release (giật về sau làm đối trọng)
- Búa nặng hơn lao → biên độ đối trọng phải LỚN hơn mới ra cảm giác nặng

Đã áp dụng (bản rework): lao nằm GẦN NGANG vai (góc +8..12°, bỏ hẳn kiểu dựng 80° cũ);
lúc buông tay phụ giật về (+X 0.4…0.45);
búa ném biên độ lớn hơn: vặn +120..125° rồi quật xuống −20°.

## 3. Ragdoll / rig — xác nhận từ nguồn ngoài

Những điều dự án đang làm ĐÚNG (khỏi sửa):

- **Bỏ tick Auto Configure Connected Anchor trên mọi HingeJoint2D**
  > *"make sure to have auto configured unchecked for all your hinge joints, otherwise
  > your player's parts will separate when you move your ragdoll"*

  `StickmanRagdollBuilder` đã set `autoConfigureConnectedAnchor = false` và tự tính anchor
  từ vị trí bone ✓

- **Mỗi khúc chi = 1 capsule, hai đầu cùng bán kính**
  > *"Each limb section can be created as a complete capsule shape — toe to ankle, ankle to
  > knee, knee to hip — with the ends of each being the same radius, which provides the
  > proper curve at the elbow and knee"*

  Dự án dùng `CapsuleCollider2D` cho tay/chân/thân, `CircleCollider2D` cho đầu ✓

- **Vũ khí nối vào bàn tay bằng joint / parent** — các game stickman ragdoll đều gắn vũ khí
  vào mesh "hand". Dự án gắn qua `StickmanWeaponHolder` vào `handR`/`handL` ✓

- Cảnh báo chung của thể loại: *"keeping weapons positioned correctly when rotating can be
  challenging"* → đúng cái bẫy đã ghi trong AGENTS.md (gốc xương bàn tay là CỔ TAY, nắm tay
  ở ~73% chiều dài xương).

## 4. Ý tưởng lấy từ Stick War chưa làm (gợi ý sau này)

| Ý | Mô tả |
|---|---|
| Vũ khí phụ | Spearton ném giáo xong rút **kopis** (kiếm cong 1 tay) đánh tiếp — dự án đã có `StickmanWeaponHolder` nhiều vũ khí, chỉ cần cho AI tự đổi khi hết đạn |
| Idle có tính cách | Swordwrath xoay kiếm, chống đẩy 1 tay, giãn vai — thêm `_idleFidgetPoses` bake bằng `StickmanAnimationRecipe` |
| Bao tên trên vai | Archidon đeo bao tên 6 mũi — làm bằng `EquipmentDefinition` slot Back |
| Idle khác Combat | Stick War đổi hẳn dáng cầm khi vào trận (giáo hạ xuống kẹp nách) — dự án có sẵn `_idlePose`/`_chargedPose`, chỉ cần AI set cờ "đang chiến đấu" |

---

## 5. RÚT TỪ 14 BỘ SPRITE THAM CHIẾU (bổ sung 2026-08)

Nguồn: bộ icon stickman thương mại (cận chiến · vũ khí Nhật · võ thuật · phép · súng) +
ảnh chụp game thật (**Stick War**, **Stickman Army**). Đây là mục ĐỌC TRƯỚC khi đặt pose
mới hoặc khi thấy "cầm nhìn sai mà không biết sai chỗ nào".

### 5.1 VŨ KHÍ VUNG THÌ NGHỈ Ở THẾ CHÉO LÊN — chỉ vũ khí ĐÂM/NGẮM mới nằm ngang

Đếm trên toàn bộ tham chiếu: **không cây vung nào để ngang lúc nghỉ.** Kiếm chếch lên trước,
rìu/chuỳ/búa giơ cao, đinh ba chĩa lên, trượng dựng chéo. Ngang là dáng của **giáo · côn ·
súng · nỏ** — những cây ĐÂM hoặc NGẮM.

| Nhóm | Dáng nghỉ | Vì sao |
|---|---|---|
| Vung (kiếm · đao · rìu · chuỳ · búa · lưỡi hái) | **chéo LÊN 40–60°** | phải có chỗ LẤY ĐÀ; để ngang là cú vung phải nhấc lên trước, mất một nhịp và trông như vừa tỉnh dậy |
| Đâm (giáo · thương · kích · côn) | **NGANG, ngang ngực** | mũi đã sẵn ở hướng địch, đâm là đẩy tới |
| Ngắm (cung · nỏ · súng · trượng) | **NGANG theo hướng ngắm** | trục nòng = trục ngắm |

⚠ Đây là luật theo **`WeaponClass`**, không phải theo từng cây — thêm cây mới thì chọn đúng
lớp là dáng nghỉ tự đúng, khỏi gõ lại.

### 5.2 KHOẢNG CÁCH HAI TAY TRÊN CÁN = DẤU HIỆU NHẬN DẠNG LOẠI VŨ KHÍ

Chỗ này sai thì cây vũ khí **đọc thành loại khác**, dù hình vẽ đúng. Đo trên tham chiếu,
tính theo % chiều dài cán từ ĐUÔI:

| Vũ khí | Tay sau | Tay trước | Cách nhau |
|---|---|---|---|
| Kiếm/đao 2 tay | 0% (pommel) | 12% | **sát nhau** |
| Súng trường | 5% (báng) | 45% (ốp lót) | ~40% |
| Giáo / thương | 5% (đuôi cán) | 40% | ~35% |
| Kích / naginata | 10% | 45% | ~35% |
| **Côn / bo** | **28%** | **62%** | **~34%, ĐỐI XỨNG QUA TÂM** |

Côn là cây duy nhất hai tay đặt **đối xứng qua tâm** — đó chính là thứ làm nó đọc ra "côn"
chứ không đọc ra "giáo không có mũi". Đặt tay côn theo kiểu giáo là hỏng cả cây.

### 5.3 DÁNG ĐỨNG TẤN — chân MỞ RỘNG, không đứng chụm

Trên **cả 14 tấm**, không nhân vật cầm vũ khí nào đứng chân chụm: chân trước co, chân sau
duỗi ra sau, thân hạ thấp. Kể cả tay không (bộ võ thuật) cũng vậy.

Dự án hiện có dáng tấn nhưng **chỉ cho lính GÁC** (`AIProfile.sentryStance`). Tham chiếu cho
thấy đó là dáng của **mọi kẻ đang cầm vũ khí trong tầm địch**, không riêng người đứng canh.

⚠ Đừng nhét vào `Idle` chung: lính đang đi tuần lúc chưa thấy ai thì vẫn nên đứng thường —
mở tấn suốt trận là mất hẳn tương phản giữa "đang thư giãn" và "đã vào thế".

### 5.4 CÚ VUNG LÀ CẢ NGƯỜI, KHÔNG PHẢI CẢ CÁNH TAY

Mỗi chuỗi đánh trong tham chiếu đều có ĐỦ BA vế ở khung KẾT:
1. **Cung vung 150–180°** — từ sau-trên xuống trước-dưới, không phải một nhát chém ngắn
2. **Thân ngả tới** theo cú vung
3. **Chân sau duỗi/nhấc lên** — trọng tâm dồn hết ra trước

Thiếu vế 2 và 3 thì cú đánh không có SỨC NẶNG, dù cung vung có đủ 180°. Đây là lý do
`StickmanActionClip.legWeightWhileMoving` để 0.15–0.2 cho `AttackBody` chứ không để 0: phải
còn lại chút dáng tấn.

### 5.5 TAY KHÔNG CẦM VŨ KHÍ KHÔNG BAO GIỜ BUÔNG THÕNG

Xác nhận và mở rộng §1. Trên tham chiếu, tay rảnh luôn làm MỘT trong ba việc:
- **giơ ra sau lấy thăng bằng** (kiếm một tay, kiếm thuật rapier — rõ nhất)
- **giơ trước che mặt** (dao găm, quyền anh)
- **nắm vào cán** (mọi vũ khí hai tay)

Không có tư thế thứ tư. Tay buông thõng = nhân vật đang KHÔNG chiến đấu.

### 5.6 SILHOUETTE PHẢI ĐỌC ĐƯỢC — bài học từ game thật

Ảnh chụp **Stick War** / **Stickman Army**: thân nhân vật là khối ĐEN ĐẶC, nên vũ khí chỉ đọc
được khi nó **nằm NGOÀI khối thân**. Vì vậy trong game thật:
- cây kiếm luôn chìa hẳn ra ngoài, không bao giờ nằm vắt ngang trước ngực
- cái khiên là **mảng phẳng to**, đọc ra ngay ở cỡ 40 px
- súng vẽ **to quá cỡ thật** (khẩu minigun dài gần bằng nửa người)

⚠ Suy ra một luật kiểm tra rẻ: **thu hình xuống 40 px rồi nhìn.** Còn đọc ra là cầm cây gì
thì pose đạt; thành một cục đen thì phải kéo vũ khí ra xa thân hơn, KHÔNG phải vẽ lại art.

### 5.7 ĐẦU CÚI THEO ĐƯỜNG NGẮM

Bộ súng: đầu nghiêng xuống áp vào báng khi ngắm — không phải nhìn thẳng trước mặt.
Dự án có `WeaponHoldPose.headAngleOffset` cho việc này; cây ngắm qua đường ngắm (súng · nỏ ·
cung) nên khai giá trị âm nhẹ, cây vung để 0.

### 5.7b ĐÃ ÁP LUẬT NÀY MỘT LẦN — kết quả rà soát 42 cây (2026-08)

Rà toàn bộ dáng nghỉ, đối chiếu với PHÍA LẤY ĐÀ của cú vung chính (§1b + §5.1). Hai cây sai
thật, đều là `HeavyMelee` nghỉ ở phía NGƯỢC với chỗ lấy đà:

| Cây | Lấy đà | Nghỉ (cũ → mới) | Vấn đề |
|---|---|---|---|
| Kiếm rune | +110° | −12° → **+40°** | phải đi 122° mới bắt đầu chém |
| Lưỡi hái | +120° | −18° → **+38°** | phải đi 138° |
| *(Đao dài — đối chứng)* | +140° | +45° | chỉ đi 95°, cùng phía ✓ |

⚠ **VUỐT QUỶ SUÝT BỊ SỬA OAN.** Nó nghỉ ở +18°, thấp hơn ngưỡng "chéo lên 40–60°" của §5.1 nên
lọt vào danh sách nghi. Nhưng nhìn vào dữ liệu vung thì cú chính của nó lấy đà ở **+30°** —
nghỉ 18° là SÁT BÊN, đúng chất vũ khí nhanh. Bài học: **§5.1 là hệ quả, §1b mới là luật gốc**
(nghỉ cùng phía lấy đà). Cây vung chậm lấy đà cao nên nghỉ cao; cây vung nhanh lấy đà thấp nên
nghỉ thấp. Áp §5.1 một cách máy móc mà không mở dữ liệu vung ra xem là sửa hỏng vũ khí nhanh.

### 5.8 Bảng tra nhanh khi đặt pose mới

Hỏi đúng năm câu, theo thứ tự:

1. Cây này **VUNG hay ĐÂM hay NGẮM**? → quyết định dáng nghỉ (§5.1)
2. Mấy tay? Nếu hai → tra khoảng cách hai tay ở §5.2, **đừng ước lượng**
3. Tay rảnh làm gì? → một trong ba việc ở §5.5, không có lựa chọn thứ tư
4. Khung KẾT của cú vung có đủ **cung lớn + thân ngả + chân sau duỗi** chưa? (§5.4)
5. Thu xuống 40 px còn đọc ra cây gì không? (§5.6)

### 5.9 GÓC VŨ KHÍ SO VỚI BÀN TAY — cổ tay bẻ được bao nhiêu

Vị trí đúng chưa đủ: còn phải hỏi **cán vũ khí có thẳng hàng với nắm tay không**.

`weaponAngle` neo vào KHÔNG GIAN NGẮM (`boneHead`), còn hướng bàn tay do IK giải ra — hai thứ
độc lập. `StickmanProceduralAnimator.AlignHandToWeapon` xoay bàn tay về phía cán, nhưng **kẹp
ở `_handTwistLimit`**. Vượt ngưỡng thì phần thừa không xoay được → cán cắt ngang nắm tay, đọc
ra "vũ khí trôi khỏi tay" chứ không ra "đang nắm".

**Công thức đo** (cùng không gian `boneHead`):
```
hướng bàn tay  = góc của vector khuỷu → đầu tay   (IK giải)
hướng vũ khí   = weaponAngle − 90°
cần bẻ cổ tay  = |wrap(hướng vũ khí − hướng bàn tay)|
```

**Kết quả đo 102 pose có hình vũ khí (2026-08):**

| Cần bẻ | Số pose | |
|---|---|---|
| ≤ 30° | 64 | thoải mái |
| 30–45° | 11 | |
| 45–75° | **25** | phần lớn là `_strikePose` cận chiến |
| > 75° | 2 | lao lấy đà 120° · khiên 78° |

⚠ **Ngưỡng cũ 40° CHẶT HƠN CỔ TAY THẬT** (người gập/duỗi được 70–80°). Nó kẹp mất 25 pose ở
dải 45–65° — mà phần lớn là **khung CHẠM ĐÒN**, tức khung người chơi nhìn nhiều nhất. Nâng lên
**65°** thì số pose bị kẹp rớt từ 28/102 (27%) xuống 6/102 (6%).

⚠ **Sáu pose còn bị kẹp là ĐÚNG, không phải lỗi.** Lao lấy đà: ảnh tham chiếu cho thấy cán lao
nằm NGANG trong khi cẳng tay chếch ra sau — góc lớn là có thật, và kẹp mới là hành vi phải có
(không thì gãy cổ tay). Khiên cũng vậy: mặt khiên vuông góc với cẳng tay là cách cầm khiên.

⚠⚠ **`_handTwistLimit` là `[SerializeField]` — đổi mặc định trong code KHÔNG ĐỦ.**
`StickmanFighter.prefab` đã bake sẵn `40`, mà field ĐÃ CÓ trong YAML thì Unity nạp giá trị đã
lưu. Phải sửa cả prefab **và** cho builder GHI số đó (`StickmanWeaponBuilder.HandTwistLimit`)
để lần sau không drift nữa. Đây đúng cái bẫy "scene/prefab đã bake không tự sửa theo code".

### 5.10 CỠ VŨ KHÍ ĐO BẰNG % CHIỀU CAO NGƯỜI — đừng để khổ canvas quyết định

Sprite mỗi cây một khổ (112 px tới 420 px) mà `PixelsPerUnit` thì chung 100 — nên **cây nào vẽ
trên canvas rộng hơn là tự động DÀI HƠN trong tay**, không liên quan gì tới việc nó đáng dài
bao nhiêu. Đó là lý do bộ vũ khí lệch cỡ mà không ai thấy sai ở đâu trong code.

Đo trước khi sửa (chiều cao nhân vật = **2.848 rig unit** = 0.712 world ÷ rig 0.25):

| Cây | Đang là | Nên là |
|---|---|---|
| Đao dài | **105%** chiều cao người | 72% |
| Búa ném | **74%** | 36% |
| Chuỳ xích | **70%** | 50% |
| Kiếm | **67%** | 52% |
| Đao | **63%** | 50% |
| Cung dài | **140%** | 105% |

Nguồn sự thật nay là bảng **`StickmanWeaponBuilder.WeaponHeightRatio(WeaponType)`** — khai
theo **tỉ lệ đời thực rút gọn** (đao 0.52 ≈ 0.9 m trên người 1.75 m; giáo 1.15; thương kỵ 1.30).
`ApplyWeaponFit` quy tỉ lệ đó thành `_gripLocalScale`, đo từ CHÍNH tấm sprite đang gắn.

Áp ở **`SaveVariant`** — nút thắt mà mọi cây đều đi qua, đọc ngược `WeaponType` từ component
vừa cấu hình. Rải vào 42 hàm `Build<Tên>` thì cây thứ 43 chắc chắn quên.

⚠ **Đo bằng `max(width, height)`, không phải width**: cung vẽ DỌC (Longbow 100×400), lấy width
là ra một cây cung dài 1 px. Đã suýt dính lúc rà soát.

⚠⚠ **ĐỔI BẢNG NÀY LÀ ĐỔI TẦM VỚI** — `_gripLocalScale` co cả object `Tip`, mà `EffectiveRange`
đo từ Tip. **PHẢI chạy lại `Weapons > Balance Report`** sau khi sửa. Đánh đổi có chủ ý: thà cân
bằng lại một lần còn hơn giữ một cây kiếm dài bằng cả người.

⚠ `_hitRadius` là số float trên component nên **KHÔNG co theo** — cây nào thu nhỏ nhiều
(búa ném 0.49×) thì bán kính trúng đang rộng hơn hình. Chỉnh tay nếu thấy "chém hụt mà vẫn dính".

### 5.11 TAY PHỤ PHẢI NẮM CÁN, KHÔNG NẮM LƯỠI

`SetupOffHand(gripX)` tính TỪ PIVOT theo đơn vị sprite (1.0 = 100 px). Dương = về phía mũi,
âm = lùi về pommel.

**Luật theo loại**, khớp §1c (tay thuận TRÊN, tay phụ ở pommel):

| Loại | gripX | Tay phụ rơi vào |
|---|---|---|
| Kiếm/đao hai tay | **ÂM** (−0.16 … −0.96) | pommel, 6–7% chiều dài |
| Cán dài (giáo · kích · thương · lưỡi hái) | dương 0.5–1.3 | trên cán, 53–60% |
| Súng · nỏ | dương + **gripY âm** | ốp lót dưới nòng |

⚠ **ĐÃ DÍNH — kiếm rune**: để `gripX: 0.75` thì tay phụ rơi vào **px 121/240**, mà art vẽ chuôi
px 24–68, chắn tay 66–80, **LƯỠI TỪ px 80**. Tay phụ nắm thẳng vào lưỡi kiếm, hụt 41 px qua
khỏi chắn tay. Không lỗi nào báo — chỉ nhìn ra "cầm không đúng cán". Nay `−0.16`.

⚠ **Kiểm bằng phép tính, đừng bằng mắt**: `điểm nắm px = pivotX × W + gripX × 100`, so với
vùng CÁN mà hàm vẽ trong `WeaponArtGenerator` khai ra. Cả 20 cây hai tay đều kiểm được trong
vài giây bằng cách này.

### 5.12 TAY PHỤ VỚI KHÔNG TỚI CÁN → TRƯỢT DỌC CÁN, ĐỪNG KÉO VỀ VAI

`StickmanProceduralAnimator.ClampAlongHaft`.

Chốt `ClampToReach` (mục 5, sải tay 1.469) giữ đúng HƯỚNG nhìn từ vai — hợp lý cho một tư thế
TỰ DO. Nhưng tay phụ thì **đang nắm vào một cái CÁN**: kéo về phía vai là kéo bàn tay **RỜI
KHỎI CÁN**, để lại đúng cái ảnh *"tay lơ lửng cạnh cây giáo"*.

Cán là một ĐOẠN THẲNG từ chỗ tay chính nắm (gốc vũ khí) ra tới điểm nắm tay phụ. Với không tới
thì **trượt lùi dọc đoạn đó** về phía tay chính cho tới khi vừa tầm — bàn tay vẫn nằm TRÊN CÁN,
chỉ là nắm gần vào hơn. Đó đúng là cách người thật làm khi cán quá xa.

Toán: tìm `t` lớn nhất trong [0,1] sao cho `|A + t·(B−A) − S| ≤ r` (A = gốc vũ khí, B = điểm
nắm, S = vai) — phương trình bậc hai, lấy nghiệm dương lớn nhất.

⚠ Đây là lỗi **do chính chốt `ClampToReach` sinh ra** ở lần sửa trước: chốt đúng cho tay tự do
nhưng sai cho tay bám cán. Bài học: **một chốt chặn "an toàn" áp cho mọi trường hợp thì có
trường hợp nó làm hỏng** — hỏi thêm một câu *"tay này đang nắm vào cái gì không"*.

### 5.13 CỠ VŨ KHÍ — bản 2: GAME cần ĐỌC ĐƯỢC, không cần đúng giải phẫu

Bản 1 của mục 5.10 lấy **tỉ lệ đời thực** (kiếm 0.52 × chiều cao người ≈ 0.9 m trên người
1.75 m). Chạy ra thì user báo *"vẫn hơi nhỏ quá, ngoài ra có vũ khí quá bự"* — và đúng.

Lý do: thân stickman là **khối đen mảnh**, không có vai không có cơ. Một cây kiếm đúng tỉ lệ
giải phẫu đứng cạnh hai cái tay que thì đọc ra "cái que thứ ba". Game tham chiếu (Stick War)
vẽ vũ khí **to hơn thực tế** chính vì lý do đó — đúng luật §5.6 (*thu xuống 40 px còn đọc được
không*).

Bản 2 **nén hai đầu về giữa**: nâng cây NGẮN, hạ cây DÀI.

| | Bản 1 | Bản 2 |
|---|---|---|
| Đao ngắn | 32% | **38%** |
| Kiếm | 52% | **60%** |
| Đao dài | 72% | **80%** |
| Khiên | 42% | **50%** |
| Giáo · đinh ba · lưỡi hái | 115% | **105%** |
| Kích | 120% | **108%** |
| Thương kỵ | 130% | **118%** |

Dải chung co từ `[14% … 130%]` xuống `[16% … 118%]` — bớt chênh lệch, cây ngắn đọc rõ hơn.

⚠ **Bài học: tỉ lệ đời thực là ĐIỂM XUẤT PHÁT, không phải đích.** Chốt số cuối phải NHÌN trên
nguyên con nhân vật ở cỡ thật — cùng lời cảnh báo đã ghi cho cỡ nón/giáp.

### 5.14 TAY PHỤ CỦA VŨ KHÍ MỘT TAY: HẠ VỀ HÔNG, đừng chĩa ra trước

Bản cũ để `ikArmL = (0.05, −0.7)` cho mọi cây một tay — tức tay phụ chĩa **ra trước**, cùng
hướng với tay cầm `(−0.3, −0.95)`. Hai cánh tay gần chồng lên nhau, đọc ra **một khối xám** cạnh
cây vũ khí. Chuẩn mới: **`(−0.50, −0.12)`** — hạ về hông, khuỷu gập.

⚠ **VÌ SAO KHÔNG "ĐƯA RA SAU LẤY THĂNG BẰNG" như §5.5 nói.** Trên rig này **vai nằm NGAY CỔ**
(`armR` local `(−0.068, 0)` so với `boneHead`) và thân stickman **không có bề ngang** — nên đưa
tay ra sau không thành "ra sau lưng" mà thành **vòng qua sau ĐẦU**. Đã dựng thử 4 phương án và
nhìn: cả hai bản "ra sau" (`(−0.10, +0.40)` và `(0.30, +0.35)`) đều cắt ngang khối đầu.

**Trên rig không có bề ngang thì tách hai tay theo CHIỀU DỌC, không theo chiều trước-sau.**
Tay cầm chếch lên-trước, tay phụ hạ xuống hông — silhouette mở, hai tay đọc rõ.

Áp cho: kiếm · đao · đao ngắn · rìu · chuỳ · toàn bộ đồ dân binh (`_idlePose` + `_chargedPose`).
KHÔNG áp cho vũ khí hai tay (tay phụ bám cán qua `_offHandGrip`) và song đao (hai tay hai lưỡi).

### 5.15 ĐỐI TRỌNG CHÉO — đã rà, KHÔNG có lỗi

Rà 25 nhát đánh của 6 cây một tay bằng cách so dấu chuyển động theo trục ra-trước của hai tay:
**mọi nhát đều ngược chiều** ✓. Hai ca "cùng chiều" là `DualSabers/song_bo` và
`DualSwords/song_dam` — song đao đánh cả hai lưỡi cùng lúc, cùng chiều là ĐÚNG.

### 5.16 KHÚC CÁN BỎ TRỐNG — đo được, và phần lớn là ĐÚNG

Đo khoảng cách từ **tay cao nhất** tới chỗ **đầu vũ khí bắt đầu**, tính theo % chiều dài:

| Cây | Bỏ trống | Đánh giá |
|---|---|---|
| Thương kỵ · Lao | 28% | đúng — cán trước tay là TẦM VỚI của cây đâm |
| Búa chiến | 26% | **đúng** — búa tạ thật cầm cách đầu búa 22–33% cán |
| Kích | 22% | đúng |
| Giáo | 20% | đúng |

⚠ **Đừng "sửa" mấy con số này cho nhỏ lại.** Với cây ĐÂM, khúc cán trước tay CHÍNH LÀ tầm với;
kéo tay lên sát mũi là mất tầm và cây vũ khí hết ra dáng. Với búa tạ, 26% khớp đúng cách cầm
thật. Đây là mục để **thôi không nghi ngờ nữa**, không phải mục để đi chỉnh.

## Nguồn

- Stick War Wiki — Battle Animations: https://stick-war.fandom.com/wiki/Battle_Animations
- Characters in Stick War (TV Tropes): https://tvtropes.org/pmwiki/pmwiki.php/Characters/StickWar
- Stick War Legacy characters & roles: https://stickwaarlegacy.com/stick-war-legacy-characters-skins-their-role/
- MoCap Online — Weapon Animation Systems (Guns, Bows, Staffs): https://mocaponline.com/blogs/mocap-news/weapon-animation-systems-guide
- MoCap Online — Combat Animation for Games (Sword, Melee, Firearm): https://mocaponline.com/blogs/mocap-news/combat-animation-game-dev-guide
- Unity 2D Ragdoll Character Tutorial: https://generalistprogrammer.com/unity/unity-2d-ragdoll-character-tutorial/
- Unity Discussions — 2D active ragdoll holding object: https://discussions.unity.com/t/2d-active-ragdoll-holding-object/251440
- Polycount — Stick Figure Modeling (capsule per limb): https://polycount.com/discussion/35380/help-stick-figure-modeling
- Weapons and Ragdolls (thể loại tham khảo): https://www.crazygames.com/game/weapons-and-ragdolls
- PoseMy.Art — Bow references: https://posemy.art/bow-references/
