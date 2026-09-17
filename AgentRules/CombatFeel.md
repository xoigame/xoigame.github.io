## ĐÁNH CHO SƯỚNG TAY — SÁU VẾ, VÀ VẾ ĐẦU LÀ MỘT LỖI ĐIỀU KHIỂN THẬT (2026-09-04)

Người dùng báo *"điều khiển đánh không sướng tay, muốn xông pha trận mạc"*. Rà ra thì phần
lớn không phải chuyện thẩm mỹ — **đường input của cận chiến sai từ gốc**.

⚠⚠ **KIỂU NGẮM MẶC ĐỊNH LÀ `DragPull`, VÀ NÓ LÀM CẬN CHIẾN HỎNG HAI LẦN:**
· đòn chỉ ra khi **NHẢ** chuột (`EndDrag`) — bấm rồi giữ thì không có gì xảy ra;
· `UpdateDrag` ngắm bằng `origin − pointer`, tức **KÉO NGƯỢC**. Đúng cho cây cung, nhưng cây
  kiếm thì chỉ chuột vào địch lại vung ra hướng ĐỐI DIỆN.
⚠ Mỉa mai: `WeaponBase.AttackOnPress` có sẵn từ lâu và `MeleeWeapon` đã override `=> true`,
nhưng **không một ai gọi nó** — một lời khai suông, đúng họ với `GenreDefinition.Uses()` và
`volleyWaitTime`. Nay nó là CÁI CỬA: `AttackOnPress` thì đi `HandleInstantSwing`, cả ở
`DragPull` lẫn `PointAim`, nên **đổi kiểu ngắm không đổi cảm giác chém**.

| Vế | Ở đâu | Làm gì |
|---|---|---|
| **1. Bấm là chém, GIỮ là chém liên tục** | `StickmanFighterController.HandleInstantSwing` | ngắm THEO ngón (không kéo ngược); nhịp vẫn do cooldown vũ khí quản nên không ai mash nhanh hơn cây vũ khí cho phép |
| **2. ĐỆM PHÍM 0.18 s** | `AttackBufferTime` | bấm sớm hơn lúc hồi xong thì cú bấm KHÔNG bị nuốt, nó chờ tới nhịp rồi tự ra đòn. Không có đệm thì người chơi bấm theo nhịp mắt nhìn và trượt liên tục, đọc ra là *"game ăn mất cú bấm"* |
| **3. TRỢ NGẮM** | `TrySnapAim` (`WeaponBase.AimSnapsToTarget`) | hút hướng chém vào địch trong cung **70°** trước mặt. Tầm chém chỉ hơn nửa đơn vị, sai số ngón tay còn lớn hơn thế — chém trượt vì lệch vài độ thì đọc ra là "điều khiển tồi". CHỈ cận chiến; tầm xa TẮT vì ở đó ngắm chính là phần chơi |
| **4. BƯỚC DỒN NGƯỜI TỚI** | `StickmanLocomotion.ApplyLunge` | ~0.14 đơn vị, CỘNG THÊM vào vận tốc thường (không ghi đè, người chơi vẫn lái được). Chỉ khi trợ ngắm tìm THẬT ra mục tiêu — bước vào không khí là tự đẩy mình xuống hố |
| **5. KHỰNG HÌNH** | `Core/HitStop` | đòn thường 0.035 s, **cú kết liễu 0.085 s**. Thứ làm đòn có SỨC NẶNG, và là thứ dự án thiếu hẳn |
| **6. RUNG CAMERA** | `Core/CameraShake` | mô hình "chấn thương": cộng vào một số 0..1, vẽ bằng **bình phương** nên đòn thường rung nhẹ còn cú kết liễu giật hẳn |

⚠⚠ **HITSTOP CHỈ CHO ĐÒN CÓ NGƯỜI CHƠI DÍNH VÀO.** Một trận có hai chục NPC chém nhau liên
tục; cho mọi cú đánh gọi hitstop thì game khựng liên hồi và người chơi đọc ra là *"máy yếu"*,
không đọc ra *"đòn nặng"*. Hỏi `PlayerCharacter.Current` (so tham chiếu, không `GetComponent`).

⚠⚠ **HITSTOP KHÔNG BAO GIỜ TRANH `Time.timeScale`.** `GameSession` đã là một chủ (dừng giờ ở
màn hình bắt đầu). Chốt: hitstop chỉ khôi phục khi `timeScale` vẫn **đúng bằng con số chính
nó vừa đặt**; ai ghi đè là nó buông tay. Nhờ vậy thêm người ghi thứ ba cũng không vỡ.
⚠ Hẹn giờ bằng **`unscaledTime`** — đang đóng băng thì `Time.time` gần như đứng yên, hẹn bằng
nó là khựng VĨNH VIỄN và không lỗi nào báo.
⚠ `HitStopRunner` phải là FILE RIÊNG trùng tên class (Unity đòi vậy để `AddComponent` tìm
được script), và `OnDestroy` trả `timeScale` về 1 — thoát Play giữa lúc khựng thì Editor giữ
số đó cho lần chạy sau, mọi thứ chạy như phim quay chậm mà không ai hiểu vì sao.

⚠ **RUNG CAMERA LÀ SỔ ĐĂNG KÝ Ở CORE, KHÔNG PHẢI THAM CHIẾU.** Kẻ XIN rung là vũ khí (Combat),
kẻ THỰC HIỆN là `DemoCameraFollow` (Gameplay) — tham chiếu chỉ đi từ trên xuống. Đúng khuôn
`ContestedZones`/`MovingPlatforms`. Camera phải vẽ bằng **nhiễu Perlin** (random mỗi frame ra
rung hạt tiêu) và **thời gian KHÔNG SCALE** (đúng lúc đáng rung nhất là lúc hitstop đang đóng
băng; dùng `deltaTime` thường là camera đứng im ngay khoảnh khắc đó).
⚠ Dịch rung SAU `SmoothDamp` và **đừng ghi ngược vào `transform.position` làm gốc frame sau** —
`SmoothDamp` đọc chính nó, trộn rung vào là camera đuổi theo cái rung của mình rồi trôi mất.

⚠⚠ **BẬT GIỮ-NÚT-CHÉM-LIÊN-TỤC THÌ PHẢI NÂNG SÀN TỐC ĐỘ LÚC RA ĐÒN.**
`_attackMoveScale` = 0.6 hợp lý khi mỗi cú bấm là một nhát; nhưng nhịp vung (0.39 s) DÀI HƠN
hồi chiêu (0.35 s), nên từ ngày giữ nút là chém liên tục thì người chơi **lúc nào cũng đang
ra đòn** và 0.6 hoá ra "chậm vĩnh viễn" — đúng thứ giết cảm giác xông pha.
`MinAttackMoveScale` = **0.85** là SÀN ĐỌC LÚC CHẠY: số 0.6 đã bake vào `StickmanFighter.prefab`
nên sửa mặc định thì không có gì đổi cả (cùng bẫy `SpeedTuning`/`ImpactTuning`).

⚠ **`CancelDrag` ≠ `EndDrag`.** `EndDrag` KẾT THÚC BẰNG MỘT PHÁT BẮN, nên đổi vũ khí giữa lúc
đang giữ chuột mà gọi nhầm nó là ra một nhát chém trời ơi người chơi không hề bấm.

⚠ **KHÔNG phải dựng lại scene nào** — toàn bộ là code runtime. Ba file mới ở Core
(`HitStop` · `HitStopRunner` · `CameraShake`) tự cài qua `[RuntimeInitializeOnLoadMethod]`.


## ⚠⚠ MÀN HÌNH PHẢI BÁO "SẮP CHẾT", VÀ CẢNH QUAY CHẬM PHẢI KHAI VỚI HITSTOP (2026-09-09)

`Combat/StickmanScreenFx` (viền đỏ · nhịp tim · giật đỏ lúc ăn đòn) · `Map/MatchDirector.Finish`
+ `OnDisable` · `Core/HitStop.RestoreScale`.

**Máu của người chơi trước nay chỉ nằm trong MỘT THANH ở góc màn hình.** Giữa hỗn chiến, mắt ở
giữa màn và tay đang bấm — không ai liếc góc trên trái, nên cái chết đến mà **không có lời báo
nào ở chỗ mắt đang nhìn**. Đây là lỗi đọc-được-hay-không, không phải thẩm mỹ: chết vì không biết
mình sắp chết thì lần nào cũng thấy oan.

Ba lớp, một chỗ vẽ: **viền đỏ** dày dần dưới 45% máu · **nhịp tim** (`Character/Heartbeat`) đập
nhanh dần 1,15 s → 0,52 s · **giật đỏ** một nhịp mỗi lần ăn đòn.

⚠⚠ Vẽ ở `EventType.Repaint` và `GUI.depth = 20`. IMGUI gọi `OnGUI` nhiều lượt mỗi khung; `depth`
nhỏ thì tấm phủ **đè lên chính thanh máu** mà nó đang cảnh báo.

⚠⚠ Nhịp tim và mạch đập đo bằng `unscaledTime`. Pha kết trận chạy chậm 0.35× — đo bằng
`Time.time` là tim đập chậm lại đúng lúc căng nhất, nghe ra là máy lag.

⚠ Bám người chơi qua `PlayerCharacter.Changed`, KHÔNG giữ tham chiếu: hồi sinh là đổi thân, giữ
tham chiếu cũ thì sau lần chết đầu tiên viền đỏ không bao giờ hiện nữa và không lỗi nào báo.

### Cảnh quay chậm cuối trận — một dòng thiếu suốt từ ngày có hitstop

`MatchDirector._endSlowMotion = 0.35` đã có sẵn và **bật mặc định**, nhưng nó chỉ ghi
`Time.timeScale`. `HitStop` thì trả `timeScale` về `RestoreScale` (mặc định **1**) sau mỗi cú
khựng ⇒ chỉ cần MỘT đòn ăn vào trong pha kết (mà pha kết thì luôn có: chính đòn cuối cùng vừa hạ
ai đó) là **cảnh quay chậm nhảy về tốc độ thường ngay khung sau**, im lặng. Đúng cái bẫy đã ghi
sẵn trong chú thích của `HitStop.RestoreScale` mà chỗ này chưa nối vào.

⚠⚠ **Và phải TRẢ LẠI 1 ở `OnDisable`.** `RestoreScale` là biến TĨNH: bỏ quên ở 0.35 thì ván sau
chạy tốc độ thường cho tới cú đòn đầu tiên, rồi hitstop "khôi phục" cả trận về 0.35 — game chạy
chậm vĩnh viễn, không lỗi nào báo, và triệu chứng (máy chậm dần) chỉ tay về phía hoàn toàn khác.

---

## ⚠⚠ THỂ LỰC — `StickmanStamina` (2026-09-16)

Code: `Assets/Scripts/Combat/Character/StickmanStamina.cs` · trừ ở
`StickmanFighterController.AttackNow` · ô tốc độ riêng `StickmanLocomotion.SetFatigue` · vế AI
`AIProfile.pressExhaustedBonus`. Đo: `python Docs/Tools/sim_stamina.py`.

Dự án đã có `MeleeWeapon._guardStamina` (độ bền **thế thủ**) nhưng không có thể lực **tấn
công**: vung búa 3.5 kg một trăm nhát cũng nhẹ như vung dao găm 0.4 kg. Cân nặng mới chỉ đổi
TỐC ĐỘ, tức nó làm cây búa *chậm*, chứ không làm cây búa *nặng*.

**Số đo** (`sim_stamina.py`): dao găm **18.0 nhát** tới kiệt · búa chiến **7.5 nhát** ⇒ chênh
**2.40×**. Dưới ~2× thì cân nặng không tạo ra lựa chọn nào; trên ~4× thì vũ khí nặng thành
không dùng được. Hồi từ kiệt lên hết kiệt: **1.6 s ngừng đánh** (+ 0.9 s trễ) — đó chính là
cửa sổ mà `pressExhaustedBonus` nhắm vào.

⚠⚠ **KIỆT SỨC KHÔNG CHẶN ĐÒN ĐÁNH.** Cấm đánh khi hết sức là biến một người thành bù nhìn đứng
chịu trận — người chơi đọc ra là *"game bị đơ"*, không phải *"tôi đuối"*. Hết sức thì đánh chậm
và đi chậm, vẫn đánh được. Cùng triết lý `FormationDiscipline`: **PHẠT chứ không CẤM**.

⚠⚠ **SÚNG KHÔNG TỐN SỨC** — lỗi thiết kế bắt được ngay trong đợt viết, bằng chính phép đo.
`AttackNow` là điểm nút CHUNG của mọi loại vũ khí, nên công thức `base + kg × hệ số` tính cả
cho súng: **trung liên 7.5 kg bắn 10 viên/giây thì kiệt sức sau 0.43 giây**. Bóp cò không phải
gắng sức. `CostsStamina` chỉ tính `Melee` + `Throwable`; phép đã có **mana**, súng đã có **băng
đạn** — đừng chồng hai cái bể lên một hành động.
⚠ Cung/nỏ (kéo dây thật sự là gắng sức) CHƯA tính: giá của nó phải nằm trên chính cây cung, vì
cùng `Ranged` mà cung với súng trường là hai việc khác hẳn nhau.

⚠ **Ô TỐC ĐỘ RIÊNG** (`SetFatigue`), không ghi chung với vật cưỡi / giáp / trạng thái — nguồn
thứ mười ghi chung một biến là dính lại bug *"mặc giáp xong con ngựa hết nhanh"*.

⚠ **Có Schmitt trigger, và ép trong CODE**: `MinExhaustGap` 0.1 giữa ngưỡng vào và ngưỡng ra.
Hai ngưỡng bằng nhau cho **39 lần bật/tắt trên 40 nhịp** thay vì 1, mà mỗi lần là đổi tốc độ đi
lại + đổi mục tiêu của mọi AI xung quanh. Sai lầm chặn được bằng một dòng thì **không đáng viết
một phép đo** — phép đo chỉ dành cho thứ code không tự bảo vệ được.

⚠ `_capacity = 0` là TẮT và là **mặc định**: mọi nhân vật đang có giữ nguyên hành vi cho tới
khi ai đó khai số. Và `pressExhaustedBonus = 0` cũng vậy — thiếu vế AI thì bể sức chỉ là một
khoản phạt lên chính mình, không ai biết lợi dụng, và cả cơ chế không tạo ra quyết định nào.
