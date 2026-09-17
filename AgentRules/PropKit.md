## ⚠⚠ BỘ ĐẠO CỤ SÂN — VÀ ĐIỂM MÙ CỦA ĐƯỜNG ỐNG ART (2026-09-16)

Code: `Assets/Editor/Art/StickmanBuildingArt.Props.cs`. Art ra: `Sprites/Buildings/Props/Field_*`.

### 1. Kho asset lệch hẳn về một phía (đo 2026-09-16)

| Nhóm | Số PNG |
|---|---:|
| Vũ khí | **1 934** |
| Trang bị nền văn minh | **1 293** |
| Công trình + nhà | 712 |
| Môi trường | 86 |
| Thú + thú cưỡi | 62 |
| Hiệu ứng | 27 |
| **Đồ vật trên map** | **7** |

Dự án đã đầu tư ~3 200 tấm cho **người và đồ họ mặc/cầm**, và 7 tấm cho **đồ vật trong sân**.

Mà **thể loại gameplay khác nhau ở ĐỒ VẬT, không khác ở người**: cùng một anh stickman cầm cùng
cây kiếm — thêm cái cổng thì thành công thành, thêm xe hàng thì thành áp tải, thêm vạch giậm thì
thành điền kinh.

Hậu quả đo được: **41 loại đạo cụ đang được vẽ bù bằng hình vuông xám ở 99 chỗ** trong các bộ dựng.

### 2. ⚠⚠ Và đó là một ĐIỂM MÙ của cả đường ống art

Bộ «★ Đặt hàng ART» sinh đơn hàng bằng `Directory.GetFiles(folder)` — **nó chỉ liệt kê art ĐÃ CÓ
trên đĩa**. Một món **chưa từng tồn tại thì không bao giờ xuất hiện trong đơn hàng**.

Cửa duy nhất để món mới lọt vào là `StickmanArtSource.ExpectedArtProof()`, mà hàm đó đọc tên từ
**bảng của bộ sinh art bù** (`ModernPropNames`, `AllSpriteNames`, …).

Một hình vuông gõ thẳng tại chỗ gọi thì **không nằm trong bảng nào** ⇒ vô hình với toàn bộ đường
ống, vĩnh viễn. Không ai đặt hàng nó được, và **không có gì báo**.

> **Luật: đừng thêm `LoadSquare()` nữa.** Thêm MỘT DÒNG vào `FieldPropNames` + một `EnsureOne` thì
> được cả ba thứ cùng lúc: placeholder chạy được ngay · vào đơn hàng ChatGPT · chỗ trống cho art thật.

### 3. Hai mươi tám đạo cụ

| Nhóm | Món | Mở khoá cho |
|---|---|---|
| MỐC & VẠCH | Post · PostTall · Flag · FlagChecker · Line | mọi mode có mục tiêu · đua · điền kinh |
| SÂN THI ĐẤU | Hurdle · Board · HighBar · Podium | điền kinh (Demo_85) |
| BIA & ĐÍCH | Target · Apple · Clay | trường bắn · bắn táo · bắn đĩa |
| CHẶN & CỔNG | Barricade · GateArch · Bumper | thủ tuyến · công thành · phóng người |
| VƯỢT ĐỊA HÌNH | Plank · Raft · Ramp | vượt chướng ngại · thuỷ chiến ven bờ |
| SANDBOX | Dummy · Anvil · Spring | phòng thí nghiệm thân mềm |
| VÒNG & HÀO QUANG | Ring · Glow · Slot | chỗ đứng · vùng chiếm · chốt |
| BẪY (bộ #2) | Spikes · Caltrop · PowderKeg · Net | thủ tuyến · đột nhập · phòng thủ trại |

⚠ Nằm trong `StickmanBuildingArt` (partial) chứ không phải class mới: `Save` ở đó đã lo hậu kỳ
`Refine`, luật **vẽ bù-không-đè** (`CanCodeWrite`), và **pivot đáy giữa** — ba thứ mà một class
riêng sẽ phải chép lại rồi lệch dần.

### 4. ⚠⚠ Hai lỗi chỉ NHÌN TẬN MẮT mới thấy

Luật dự án: *art vẽ bằng code phải nhìn tận mắt trước khi giao*. Không chạy được Unity ở đây nên
vẽ lại bằng mirror Python rồi ghép thành một tấm liền. Hai lỗi lộ ra ngay:

**a) `Disc(..., alpha 0)` KHÔNG XOÁ ĐƯỢC GÌ.** Cổng vòm vẽ cả tấm xà rồi "khoét" bằng một đĩa
trong suốt — `EnvCanvas.Blend` thoát ngay ở dòng đầu khi `c.a <= 0`, nên cái vòm **không bao giờ
tồn tại**. Biên dịch xanh, và trong Unity đó vẫn là một cái xà đặc.

> Muốn có lỗ thì phải **vẽ hình CÓ LỖ SẴN**: dựng xà theo từng cột dọc, mỗi cột bắt đầu từ mép
> trên của đường vòm tại đúng x đó. (`Clear` có xoá thật nhưng chỉ nhận hình **chữ nhật** — không
> tả được một cái vòm.)

**b) Đĩa bay 46×18 màu xám = một vệt mờ.** Đĩa bay là vật NHỎ NHẤT trong game mà lại phải bắt được
bằng mắt **khi đang bay**. Nay 70×30 với vành cam — một màu không có ở đâu trên nền trời.

### 5. ⚠⚠ BỘ #2 — VÀ BA LẦN KHAI NHẦM MỘT "LỖ HỔNG ASSET"

Bộ #2 định là **MÁY & BẪY** — máy bắn đá · nỏ liên châu · tháp canh · chậu lửa · bốn cái bẫy,
với lý do *"dự án không có art cho một cỗ máy đứng yên bắn ra thứ gì đó"*. **Sai.**

| Lần | Khai thiếu | Sự thật | Ai bắt |
|---|---|---|---|
| 1 | "nhà xạ thủ chỉ có ba cây bắn trung cổ" | `Longbow` · `Sling` · `Matchlock` đã có art từ lâu | đọc lại `ArtWorklist.md` |
| 2 | "không có art cho cỗ máy đứng yên" | `Siege_Catapult` · `Siege_Ballista` · `Siege_FixedBallista` · `Siege_Cannon` · `Siege_Ram` · `Siege_Tower` | **trình biên dịch** (trùng tên hàm `GenerateCatapult`) |
| 3 | `Field_Brazier` | `Sprites/Environment/Brazier.png` | **phép đo mới**, ngay lượt chạy đầu tiên |

Ba lần đều bắt đầu bằng một câu ⚠ tự tin về kho mà **không mở thư mục ra đếm**. Sau lần thứ hai
tôi viết thêm một dòng ⚠ nữa — và nó không chặn được lần thứ ba.

> **Luật nào cần NHỚ mới đúng thì sớm muộn cũng sai. Biến nó thành PHÉP ĐO.**
> Doctor › «Đạo cụ mới có trùng art đã có không» — so tên trong `FieldPropNames` với **mọi PNG
> trong `Assets/Sprites`**, bỏ tiền tố nhóm (`Siege_` · `Prop_` · `Field_` · `Env_`).

⚠ So bằng **TÊN**, không bằng đường dẫn: `Siege_Catapult.png` nằm ở `Buildings/Default` còn đạo cụ
mới sẽ nằm ở `Buildings/Props` — đối chiếu đường dẫn thì hai cái không bao giờ gặp nhau.

**Bộ #2 còn lại đúng bốn cái đếm ra là thiếu thật:** hàng cọc nhọn · chông bốn cạnh · thùng
thuốc nổ · lưới. (Tổng bộ đạo cụ: **28 món**.)

### 6. ⚠⚠ Ba lỗi nữa chỉ NHÌN TẬN MẮT mới thấy (bộ #2)

**Chậu lửa**: hai chân vẽ từ mặt đất toả LÊN hai bên miệng chậu ⇒ chúng gặp nhau tại **một điểm
sát đất**, và cả tấm đọc ra là một cái phễu úp ngược. Kiềng ba chân đọc ra được là nhờ khoảng
**CÁCH** giữa hai chỗ chạm đất. (Trở thành vô nghĩa khi bỏ chậu lửa — nhưng bài học thì giữ.)

**Nỏ liên châu**: cánh nỏ, hai sợi dây và cái máng cùng một sắc xám nhạt và chồng lên nhau
trong 20 px ⇒ mắt gộp cả cụm thành **một hình tam giác đặc**.

**Chông**: vẽ bằng ba nét ngang/dọc rời ⇒ cái tâm biến mất, và thứ còn lại là một chữ "I".
Chông nhận ra được nhờ đúng một thứ: **các gai toả ra từ MỘT TÂM**.

### 7. MỘT CỬA ĐẶT ĐẠO CỤ — `StickmanSceneUtils.PlaceProp`

Mọi bộ dựng đặt đạo cụ qua đúng một hàm. Trước đó mỗi chỗ tự `LoadSquare()` + một màu +
`localScale` bóp méo, và cách đó sai ba thứ cùng lúc:

1. không tấm nào vào được đơn hàng art (mục 2);
2. mỗi chỗ tự chọn một cỡ ⇒ cùng một thứ ra mười kích thước;
3. `localScale` méo làm **art THẬT thả vào sau cũng méo theo**.

⚠⚠ **PIVOT ĐÁY GIỮA ĐỔI CÁCH ĐẶT.** Tấm đạo cụ neo ở đáy, còn hình vuông neo ở GIỮA — nên mọi
chỗ cũ đều cộng thêm nửa chiều cao (`y + 0.35f`). Giữ phép cộng đó sau khi đổi sprite thì đạo cụ
**lơ lửng trên không**, và không có gì báo.

⚠ **Hỏng MỀM khi chưa sinh art**: `PlaceProp` trả về một cọc xám thay vì ném lỗi. Một
`NullReferenceException` giữa lượt dựng 90 scene đắt hơn nhiều so với một cái cọc xấu.

### 8. ⚠⚠ KHI NÀO GIỮ LẠI HÌNH VUÔNG

Không phải hình vuông nào cũng là nợ. **Giữ hình vuông ở chỗ KÍCH THƯỚC LÀ LUẬT CHƠI**, thay
nó ở chỗ hình chỉ là trang trí.

| Chỗ | Quyết định | Vì sao |
|---|---|---|
| Cột mốc · rào · vạch · cổng · chốt · vật cản | **thay** | thuần trang trí, cỡ cố định |
| Gò nảy (có collider) | **thay** | collider tự bám theo sprite, cỡ không đổi |
| Bệ phóng / bệ xếp | **GIỮ** | bề rộng là **tham số** (bệ hẹp 4 đơn vị *chính là* độ khó của `Demo_82`) |
| Tấm nền tối của sandbox | **GIỮ** | một mảng màu phẳng, không phải một đồ vật |

Kết quả: **5 bộ dựng mới còn đúng 2 hình vuông**, cả hai đều có lý do ghi tại chỗ.

### 9. Còn bốn bộ nữa (chưa làm)

| Bộ | Mở ra | Công |
|---|---|---|
| **Xe & thú kéo** (chỉ có 3 prefab xe trong cả dự án) | đua xe thật · áp tải · thương buôn | ★★☆ |
| **Hiệu ứng trạng thái** (27 tấm cho cả game) | ARPG · fantasy · võ lâm · mọi mutator nhìn thấy được | ★☆☆ |
| **Thú** (62 tấm) | đi săn · chăn nuôi · kỵ binh | ★★☆ |
| **Nền nhiều lớp** (86 tấm, không parallax) | mọi màn NHÌN khác nhau | ★★★ |
