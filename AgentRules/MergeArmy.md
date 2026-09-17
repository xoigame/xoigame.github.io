## ⚠⚠ HỢP NHẤT QUÂN → BẤM ĐÁNH (2026-09-16)

Code: `Assets/Scripts/Gameplay/Merge/`. Màn: `Demo_86_MergeArmy`. Bộ dựng:
`StickmanMergeArmyBuilder`. Tham khảo ngoài: công thức *merge + autobattler* đang đứng đầu bảng
doanh thu casual 2026.

Hai mode merge ANH EM (2026-09-17, bàn KHÔNG dừng giờ): [IdleMerge.md](IdleMerge.md)
— «Trấn giữa hai đầu» (`Demo_91`, idle) và «2048 quân» (`Demo_92`, vuốt trượt). Thang bậc của
chúng là `MergeTierLadder` (8 bậc, một thang), không phải bảng 4 nhà dưới đây.

### 1. ⚠ Roadmap từng TỪ CHỐI «merge» — và câu từ chối đó vẫn đúng

`Roadmap-NextWave.md` §1.6: *"Merge / hyper-casual — không dùng gì của rig · ragdoll · AI. Làm
mới từ đầu còn rẻ hơn."*

Câu đó **đúng với merge thuần** (ghép hai quả táo thành một quả cam) và **sai với bản này**: thứ
được ghép là **lính thật**, và cái bấm CHIẾN mở ra là **trận đánh thật** — cùng rig, cùng ragdoll,
cùng AI, cùng bảng vũ khí. Bàn cờ chỉ là pha CHUẨN BỊ.

> Luật rút ra: một câu từ chối trong roadmap gắn với MỘT BẢN CỤ THỂ của ý tưởng. Trước khi viện
> nó ra, hỏi lại: *"bản đang bàn có đúng là bản đã bị từ chối không?"*

### 2. ⚠⚠ BẬC PHẢI ĐỔI DÁNG

Hai lính bậc 1 nhập thành một lính bậc 2 mà trông y hệt, chỉ to hơn tí, thì người chơi không thấy
mình vừa được gì. Nên mỗi bậc là **một cây vũ khí khác**:

| Nhà | bậc 1 | bậc 2 | bậc 3 | bậc 4 |
|---|---|---|---|---|
| BỘ BINH | đoản đao | kiếm | rìu | song đao |
| TRƯỜNG BINH | giáo | đinh ba | kích | thương |
| HẠNG NẶNG | chuỳ | búa chiến | lưỡi hái | chuỳ xích |
| XẠ THỦ | ná dân binh | cung | nỏ | trường cung |

⚠ **Số lấy từ `WeaponType`, không gõ trần.** Giá trị enum chính là `UnitLoadout.weaponIndex`; gõ
số trần thì lần sau ai đó nối thêm một cây là cả bốn nhà lệch, và không có gì báo.

⚠⚠ **MỘT CÂU SAI ĐÃ SỬA (cùng ngày).** Bản đầu ghi *"nhà xạ thủ chỉ có ba cây trung cổ nên bậc 4
dùng lại cây nỏ"* và viện cớ trường cung thuộc bộ fantasy. **Cả hai vế đều sai**: `Longbow` nằm ở
nhóm "bổ sung sau" trong `WeaponTypes.cs`, TRƯỚC bộ pháp sư, và `Longbow.png` · `Sling.png` ·
`Matchlock.png` đã có trong `Assets/Sprites/Weapons/` từ lâu (`ArtWorklist.md` liệt kê đủ).

> **Bài học: đừng khai một "lỗ hổng asset" khi chưa mở thư mục ra đếm.** Một dòng ⚠ nói sai về
> kho còn tệ hơn không có dòng nào — nó thành lý do để người sau khỏi đi tìm.

⚠ **Bậc ăn vào `UnitStats`, KHÔNG ăn vào `localScale`.** Phóng to nhân vật là phóng to cả collider
và tầm với; rig không được thiết kế cho chuyện đó, và lính bậc 4 sẽ đứng lọt nửa người trong đất
ở map có dốc.

### 3. ⚠⚠ HỆ SỐ BẬC 2.6 — ĐO RA, KHÔNG CHỌN

Trực giác nói "nhân đôi mỗi bậc": hai lính bậc N thành một lính bậc N+1, hoà vốn sức mạnh, lời ra
một ô trống. Mô phỏng 24 lượt × 3 hạng người chơi nói khác:

| Hệ số bậc | nhập hoàn hảo | nhập vừa | gần như không nhập |
|---:|---:|---:|---:|
| 2.0 | 7.2 đợt | 7.0 | **5.8** |
| **2.6** | **7.7 đợt** | 7.5 | **5.0** |
| 3.0 | 7.5 | 7.1 | 4.0 |

Ở 2.0, người chơi **không bao giờ nhập** vẫn tới đợt 5.8 — tức cơ chế mang tên trò chơi gần như
không đáng làm. 2.6 mở khoảng cách thật; 3.0 thì bậc cao mạnh quá và ai không may mắt draft là
hết cứu.

⚠ **GIỚI HẠN CỦA PHÉP ĐO NÀY**: mô phỏng cộng sức mạnh thành MỘT SỐ rồi so hai số. Nó **không** tả
được "số đông vây đánh một lính mạnh", "cung thủ đứng sau bắn tự do", hay tầm với từng cây vũ khí
— những thứ quyết định trận thật. Đây là **điểm bắt đầu đo được**, không phải bản cân bằng cuối:
phải chơi thử trong Unity rồi chỉnh lại.

### 4. Bảng đợt — leo CẢ HAI trục

`count = 3 + đợt`, `topTier = 1 + đợt/5`, thắng 8 đợt là xong chuyến.

⚠ Chỉ tăng quân số thì bàn bậc cao cán phẳng mọi đợt; chỉ tăng bậc thì một lính bậc 4 đơn độc bị
bao vây. Hai trục cùng leo mới giữ được câu hỏi *"nhập lên bậc hay giữ số đông"* — chính là câu hỏi
của kiểu chơi này. Quét 27 bộ số cho thấy leo bậc mỗi **3** đợt thì **không ai qua nổi đợt 4**.

### 5. Ba cái bẫy đã chặn

⚠⚠ **Pha hợp nhất chạy ở `Time.timeScale = 0`** (cùng khuôn `DeployPhaseMode`) — không dừng giờ
thì quân đã thả ra sân đánh nhau trong lúc người chơi còn sắp bàn. **Phải trả lại `timeScale` ở
mọi đường ra, kể cả `OnDestroy`**, nếu không scene sau mở ra đứng hình và không lỗi nào báo.

⚠⚠ **Bàn phải ĐỌC LẠI TỪ SÂN sau mỗi đợt**, không giữ nguyên. Lính chết trong trận mà bàn vẫn đủ
thì người chơi không mất gì khi đánh dở — và cả kiểu chơi rút về "bấm CHIẾN cho tới khi thắng".

⚠ **Chạm lại đúng ô đang chọn = BỎ CHỌN.** Không có vế đó thì chọn nhầm một ô là kẹt, và cách
thoát duy nhất là chọn bừa một ô khác — tức phải phá bàn để sửa một cú chạm.

⚠ Phát lính mới vào ô **TRỐNG**, không đè: đè lên bàn người chơi vừa sắp là lấy mất đúng thứ họ
vừa làm. Hết ô trống thì phát ít hơn — cái bàn chật chính là sức ép của kiểu chơi.
