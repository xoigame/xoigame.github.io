## HỆ TRẠNG THÁI (Assets/Scripts/Combat/Character/StickmanStatus.cs)

Cháy · Độc · Chảy máu · Choáng · Chậm chân · **Ngã sấp**. Trước đó dự án chỉ có SÁT THƯƠNG
THUẦN, nên tên lửa, dầu sôi, bẫy độc, cú tông của voi đều phải quy về một con số — mất hết
khác biệt. Sáu điều cần nhớ:

1. **MÁU VẪN ĐI QUA `TakeDamage`**, không trừ thẳng `_health`. Nhờ vậy giáp/khiên/effect/âm
   thanh chạy y nguyên, và **cháy đến chết vẫn ghi công đúng kẻ châm lửa** (`DamageInfo.source`
   → `StickmanExperience`). `forceScale = 0` để giọt máu cuối không hất văng cái xác.
2. **TỐC ĐỘ ĐI QUA Ô RIÊNG** `StickmanLocomotion.SetStatusSlowdown`. KHÔNG dùng chung với
   `SetSpeedMultiplier` (vật cưỡi) hay `SetEncumbrance` (giáp) — ba chủ ghi chung một biến là
   dính đúng bug cũ: hết dính bùn thì bộ giáp cũng hết nặng.
3. **ĐỠ ĐƯỢC THÌ KHÔNG DÍNH**: `WeaponBase.ApplyHit` và `ProjectileController` đều nhớ máu
   TRƯỚC đòn rồi so lại sau. `TakeDamage` trả void và khiên/nón/giáp/thế thủ có thể nuốt trọn
   đòn — không so máu thì giơ khiên chắn mũi tên lửa xong vẫn bốc hoả.
4. **MỘT SLOT MỖI LOẠI**, dính lại thì GIA HẠN + lấy độ mạnh lớn hơn, KHÔNG cộng dồn. Chồng 6
   mũi tên lửa lên một người là chết tức khắc mà không ai đọc ra vì sao — trạng thái phải ĐỌC
   ĐƯỢC trên màn hình mới đem cân bằng được.
5. **CHẢY MÁU TÍNH THEO QUÃNG ĐƯỜNG**, không theo thời gian: đứng yên thì cầm được, chạy là
   toang. Trạng thái duy nhất mà người chơi CHỌN ĐƯỢC cách chịu.
   ⚠⚠ **VÀ NÓ TỪNG CHƯA XẢY RA LẦN NÀO.** Rà 2026-09-02: cả dự án chỉ có BA nguồn trạng thái —
   đá lửa công thành (`Burn`) · khí độc xác phồng (`Poison`) · quái biến dị (`Knockdown`).
   **Không một thứ gì gây `Bleed`**, nên cái luật đẹp nhất của hệ trạng thái nằm chết y hệt
   `volleyWaitTime`. Nay nguồn đầu tiên là `StickmanDowned.Revive` — người vừa được kéo dậy
   còn RỈ MÁU 8 giây.
   ⚠ Cắm nguồn ở đó chứ KHÔNG cắm vào một cây vũ khí, có chủ ý: khai `_onHitStatus` cho vũ khí
   là làm tăng sát thương THỰC TẾ và bắt buộc đo lại cả bảng (`Weapons > Balance Report`) —
   đó là một quyết định CÂN BẰNG, không phải một bản vá. Còn "vừa được đỡ dậy thì đi phải dè
   chừng" thì không đụng một con số cân bằng nào.
   ⚠⚠ **AI PHẢI BIẾT MÌNH ĐANG CHẢY MÁU.** `StickmanAgent` giữ tham chiếu `_status` từ lâu mà
   chỉ đọc đúng `IsIncapacitated` — không một dòng nào hỏi `Has(Bleed)`. Nghĩa là quyết định
   thú vị nhất của cả hệ chỉ tồn tại cho NGƯỜI CHƠI, còn NPC cứ chạy và tự chảy máu tới chết.
   Nay `UpdateRun` thấy đang chảy máu là hạ xuống ĐI BỘ (không bắt đứng im — đứng im giữa trận
   là chết vì lý do khác), và nhánh RÚT LUI vẫn thắng: chảy máu mà bị dí thì chạy vẫn đúng.
6. **NGÃ SẤP CÓ MIỄN NHIỄM SAU KHI DẬY** (`_knockdownImmunity`). Không có nó thì ba cái búa
   thay nhau quật là nằm dưới đất tới lúc chết — "khoá bằng choáng" là kiểu ức chế tệ nhất.
   ⚠ Vì vậy `Knockdown` KHÔNG đi chung đường `Apply` mà có `TryKnockdown` riêng.

⚠ **Mặc định TẮT HẾT** (`StatusApplication.chance = 0`, mảng `_onHitStatus` rỗng) — mọi cây vũ
khí cũ hành xử y hệt trước và `StickmanWeaponBalance` không lệch một điểm. Khai trạng thái cho
cây nào thì **PHẢI chạy lại Balance Report**: trạng thái LÀM TĂNG sát thương thực tế.

⚠ **MẤT KIỂM SOÁT gom vào MỘT câu hỏi** `IsIncapacitated` (choáng + đang nằm + đang bò dậy),
chặn ở **hai chỗ** — đầu pipeline `StickmanAgent.Update` và tầng đọc input của
`StickmanFighterController`. Để ba cờ rời thì lần sau thêm loại thứ tư là phải sửa cả AI lẫn
input lẫn locomotion, quên một chỗ là người đang nằm vẫn vung được kiếm.

**Đạn mang trạng thái qua `ProjectileLaunch.status`**, khai trên VŨ KHÍ chứ không trên prefab
đạn — cung thường và cung tẩm lửa vẫn dùng chung một `Proj_Arrow`. Nhớ xoá `_statusRuntime`
trong `ResetProjectile`: đạn đi qua pool, quên là mũi tên thường vẫn mang lửa của mũi trước.

## ⚠⚠ HUY HIỆU TRẠNG THÁI — BA LOẠI CHẠY SÁU NGÀY MÀ KHÔNG CÓ MỘT PIXEL NÀO (2026-09-16)

Code: `Assets/Scripts/Combat/Character/StatusBadge.cs`. Art vẽ bù:
`Assets/Editor/Effects/StickmanStatusIconArt.cs` → `Assets/Resources/Status/`.

### 1. Phép đo

Sổ trạng thái có sáu loại từ 2026-09-10. Phần NGƯỜI CHƠI NHÌN THẤY, đo ngày 2026-09-16:

| Trạng thái | Trước hôm nay |
|---|---|
| Cháy · Độc | một chấm màu bay lên MỖI NHỊP TRỪ MÁU |
| Chảy máu | một chấm đỏ, ~15% số nhịp |
| **Choáng · Chậm chân · Ngã sấp** | **KHÔNG GÌ CẢ** |

Ba loại cuối là đúng ba loại **không trừ máu** — tức chúng không có nhịp nào để mà nháy một cái
chấm. `Assets/Sprites` + `Assets/Resources` không có một tấm nào tên chứa
`poison`/`stun`/`bleed`/`slow`/`status`.

> Người chơi bị chậm 40% và thứ duy nhất đọc được là *"hôm nay mình rê kém"*. **Một trạng thái
> không nhìn thấy được thì với người chơi nó không tồn tại** — chỉ còn là một con số đang âm
> thầm sửa kết quả, và không đem cân bằng được.

⚠ Chấm bay lên **không thay được** huy hiệu và ngược lại: chấm nói *"vừa mất một ít máu"* (một
NHỊP), huy hiệu nói *"đang dính"* (một QUÃNG). Giữ cả hai.

### 2. Bốn cái bẫy đã chặn ở `StatusBadge`

⚠⚠ **DÍNH HAI THỨ THÌ PHẢI THẤY CẢ HAI.** Chỉ hiện cái "nặng nhất" thì cháy che mất chậm chân
và người chơi chữa nhầm bệnh. Nhiều trạng thái ⇒ huy hiệu **XOAY VÒNG** 0.9 s, **không** xếp
hàng ngang: trận 24 v 24 mà mỗi cái đầu đội một dãy biểu tượng là màn hình thành rừng.

⚠⚠ **KHÔNG ĐƯỢC LẬT THEO NGƯỜI.** Nhân vật quay trái bằng `localScale.x = -1`; là con của gốc
thì huy hiệu lật theo, và đồng hồ cát / hình người-nằm soi gương trông như hai tấm art khác.
`LateUpdate` ép lại dấu của scale — và phải là `LateUpdate`, vì cú lật chạy ở `Update`.

⚠ **SORTING LAYER, KHÔNG PHẢI CHỈ ORDER.** Thân stickman là khối đen đặc ở layer `character`;
để huy hiệu ở `Default` thì nó chìm sau thân, order bao nhiêu cũng vô ích.

⚠ **GẮN LƯỜI.** `EnsureBadge` gọi từ **cả hai** cửa gắn trạng thái (`Apply` **và**
`TryKnockdown` — `TryKnockdown` đi đường riêng, nối một chỗ là ngã sấp không bao giờ hiện huy
hiệu). Không gắn ở `Awake`: 24 v 24 mà ai cũng đeo sẵn một `SpriteRenderer` tắt là 48 renderer
chết trong danh sách vẽ suốt ván, đổi lại 0 pixel.

### 3. Art: BÓNG NGOÀI trước, màu là lớp thứ hai

Sáu tấm mà chỉ khác màu thì với người mù màu chúng là MỘT.

| Trạng thái | Bóng ngoài | Không được trùng với |
|---|---|---|
| Cháy | ngọn lửa, hai lưỡi phụ LỆCH nhau | đối xứng ⇒ đọc ra giọt nước úp ngược |
| Độc | CHÙM BA BỌT | ⚠ không dùng giọt |
| Chảy máu | MỘT giọt | ⚠ không dùng bọt |
| Choáng | ba sao bốn cánh RỜI nhau | nối chúng lại ⇒ ra một cái vương miện |
| Chậm chân | đồng hồ cát có EO THẮT + viền | tô đặc hai bầu ⇒ ra một hình thoi |
| Ngã sấp | người NẰM trên vạch đất, nét 4/2 px | nét dày ⇒ ra cục trắng, rồi ra con sao biển |

Bốn dòng "không được trùng với" ở trên đều là **bản vẽ hỏng có thật**, bắt được bằng cách dựng
bản mô phỏng Python rồi RENDER RA XEM trước khi port sang C#.

⚠ Tấm **NGÃ SẤP là tấm yếu nhất** — ở cỡ 22 px nó thành một vệt trắng. Nó đứng đầu đơn hàng
ChatGPT (mẻ `status`).

### 4. Đường ống

`StickmanArtSource.ExpectedArtProof()` là **cửa duy nhất**: bộ đặt hàng art liệt kê art ĐÃ CÓ
trên đĩa, nên một món chưa từng tồn tại chỉ vào được đơn hàng qua hàm đó. Đây đúng bài học của
41 đạo cụ sân cùng ngày — và cũng là lý do sáu tấm này vô hình suốt sáu ngày.

Nút: `Tools > Stickman > Nâng cao > Art > Vẽ bù 6 huy hiệu trạng thái`, hoặc chạy chung qua
`FillMissingArt`. `Save` đi qua `StickmanArtSource.CanCodeWrite` nên tấm nào ChatGPT vẽ lại thì
tool **không đụng tới**.
