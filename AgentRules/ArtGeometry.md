## Năm cái bẫy hình học (đã sửa, đừng làm lại)

1. **Gốc xương bàn tay là CỔ TAY, không phải nắm tay.** Nắm tay ở ~73% chiều dài xương
   (x ≈ 0.55). Gắn vũ khí/khiên vào (0,0,0) là nó lơ lửng cách bàn tay ~18% chiều cao
   nhân vật. Đo bằng `StickmanRigPaths.GripPointOnHand()`, chỉnh bằng nút
   **"Bắt vị trí cầm"** trong Inspector vũ khí — đừng gõ số.
2. **Xương đầu/bàn tay xoay theo hướng ngắm và IK.** Nón/giáp/khiên làm con thường sẽ bị
   cuốn theo (nón văng sang bên cạnh đầu). `EquipmentDefinition.keepUpright` + component
   `EquipmentStabilizer` ghim lại mỗi `LateUpdate`; khi bật, `localPosition` là offset
   **theo hướng nhân vật** (x = trước mặt, y = lên trời, world units). Offset tính từ
   **ĐIỂM BÁM trên xương**, không phải gốc xương: slot Head = TÂM ĐẦU (đo từ part
   `headRagdoll` — gốc xương đầu là CỔ, neo ở cổ là đầu xoay theo hướng ngắm còn nón
   đứng yên), Shield = NẮM TAY, còn lại = gốc xương. Vạch xanh/đỏ trên đầu lính
   trong scene demo là THANH MÁU (`DemoTeamFlag`), không phải trang bị.

2a-tint. **MÀU PHE TRÊN NGƯỜI = ĐÚNG MỘT CÁNH TAY** (`StickmanTeamTint`) — tay đang CẦM VŨ
   KHÍ. Thân · đầu · tay còn lại · cả hai chân đều ĐEN: chất stickman của cả dự án là người
   ĐEN, màu chỉ để đọc ra phe chứ không phủ kín người (bản cũ nhuộm cả hai bắp tay lẫn hai bắp
   đùi → ra hình nộm bốn que màu).
   ⚠ **NHUỘM ĐEN chứ không phải BỎ QUA** — art rig vẽ tay chân màu ĐỎ, thôi-không-tô là ra đỏ.
   ⚠ **Hỏi `StickmanWeaponHolder.WeaponOnFarHand`, đừng gõ cứng `armR`**: giơ khiên là khiên
   chiếm TAY GẦN và vũ khí lùi sang TAY XA (luật MỘT KHIÊN, mục 5b) — gõ cứng thì tay cầm kiếm
   đen thui còn tay cầm khiên lại sáng màu. Rig lật gương bằng `localScale.x` nên "quay phải
   thì tay phải chủ đạo, quay trái thì tay trái" tự đúng, không phải xử lý gì thêm.
   ⚠ **`CivilizationDefinition.WearEquipment` phải chốt `HasSlot` cho CẢ KHIÊN**, không chỉ
   nón/giáp. Thiếu đúng vế đó thì hàm "chỉ THAY đồ đang mặc" lại PHÁT THÊM khiên cho bất kỳ ai
   cầm vũ khí một tay: vừa cộng lén điểm giáp + sức nặng (đổi cân bằng), vừa đẩy vũ khí sang
   tay xa — nhìn ra đúng câu *"tay cầm vũ khí của nhân vật mình khác với AI"*, vì NPC đi đường
   `ApplyTo` (`wearEquipment: false`) nên không dính.

2a. **MÀU PHE CHỈ CÓ MỘT NGUỒN: `TeamMember.ColorOf`** (1 = XANH người chơi · 2 = ĐỎ địch ·
   3 = XANH BỆNH zombie · còn lại xám). Thanh máu trên đầu (`DemoTeamFlag` — tên cũ, giữ vì
   549 object đã bake trong scene tham chiếu đúng script đó) **ĐỌC THẲNG `TeamMember` mỗi
   frame**, không nhận màu qua tham số lúc sinh.
   ⚠ Ba cái bẫy đã dính, đừng làm lại:
   · **Chốt màu lúc spawn là màu NÓI DỐI** — phe đổi được lúc chạy (`ZombieDirector.Rise`,
     `CommandStructure.Attach`, `WarCamp` đẻ lính), chốt một lần là mang màu phe CŨ cả trận.
   · **`Attach` gặp object đã có thì đừng thoát tay trắng** — bản cũ `return` luôn nên object
     dựng sẵn trong scene giữ mãi màu bake lúc đầu.
   · **`CivilizationTeamAssigner` từng tô thanh máu theo `bannerColor`** — 14 nền có 4 sắc
     nâu/vàng + 3 sắc đỏ, nên hai phe ra hai vệt đỏ-cam không phân biệt nổi và phe người chơi
     có thể ra màu nâu. Đã GỠ HẲN đường code, không chỉ đổi giá trị mặc định: 13 scene đã bake
     lưu sẵn `_recolorFlags: 1`, mà **field serialized giữ giá trị đã lưu** — đổi default
     trong code không cứu được scene cũ. Đây là bẫy chung của mọi lần "sửa bug bằng đổi mặc định".
   ⚠ `DemoTeamFlag` còn được cắm lên **VƯƠNG MIỆN** chủ tướng (chỉ để tự ẩn khi chết) — nó
   phân biệt bằng TÊN OBJECT (`TeamFlag`), không bằng field bool mới: scene đã bake không có
   field mới trong YAML nên nhận giá trị mặc định, mà mặc định nào cũng sai cho một trong hai bên.
2b. **CHO ĐỒ VỪA NGƯỜI THÌ ĐO PHẦN VẼ ĐƯỢC, ĐỪNG ĐO CẢ KHUNG ẢNH.**
   `sprite.bounds` là **cả tấm ảnh kể cả viền trong suốt**. Art thật (người vẽ, hay AI vẽ)
   chừa viền rất khác nhau — chính bộ nón của dự án chừa từ **12% tới 42%**. Cho khung ảnh
   vừa 1.35 lần cái đầu thì cái nón VẼ THẬT ra `0.79×`–`1.19×`: nón Viking và Thập tự **NHỎ
   HƠN CÁI ĐẦU** (đã dính 1 lần).
   Dùng `StickmanRigMetrics.FitOpaqueWidth/FitOpaqueHeight` (đọc thẳng file PNG tìm khung
   bao phần không trong suốt — không bật `isReadable` để khỏi reimport cả bộ art), kèm
   `OpaqueCenterOffset` bù chuyện **tâm phần vẽ không trùng pivot** (lệch 1–5%, không bù thì
   nón đội lệch một bên).
   ⚠ **Bộ có NHIỀU sprite thì mỗi cái một hệ số** (`StickmanAppearanceSet.helmetScales[]` /
   `helmetOffsets[]`): một hệ số chung chỉ vừa đúng **tấm đầu tiên**, mấy tấm sau lại ra nón
   bé hơn đầu. Bốn chỗ đã sửa: nón overlay + nón thật của văn minh · bộ nón dùng chung
   (`StickmanAppearanceTools`) · nón archetype (`StickmanDemoBuilder`).
   Tỉ lệ chuẩn nay là **1.40 × đường kính đầu đo ở VÀNH NÓN** — xem mục 2c ngay dưới.
   (Số 1.45 cũ là đo KHUNG BAO; hai phép đo khác nhau nên đừng bê số qua lại.)
2c-0. **ĐIỂM NEO NẰM Ở PIVOT CỦA TỪNG TẤM ART — `Appearance > 4. Chấm pivot nón + giáp`.**
   `StickmanAnchorPivots` tính điểm neo một lần rồi GHI THẲNG vào pivot của sprite: nón →
   TÂM ĐẦU, giáp → TÂM PHẦN VẼ. Sau đó `HelmetOffsetOnHead` / `OpaqueCenterOffset` tự trả
   về ~0, nên không phải sửa dòng code đặt đồ nào.
   · **Vì sao phải là pivot chứ không phải số tính lúc chạy tool:** tấm nào lệch chuẩn thì mở
     Sprite Editor kéo pivot là xong MỘT tấm; để trong công thức thì sửa một tấm là 14 tấm
     kia lệch theo. Đây đúng câu `AGENTS.md` vẫn nói: *pivot là chỗ NGƯỜI VẼ đánh dấu*.
   · **Vì sao nó chữa được ca "con đúng con không":** 6 tấm nón dùng CHUNG giữa bộ văn minh
     (`Helm_Europe`) và bộ overlay (`Helm_Knight`) — hai hệ tự tính điểm neo riêng nên cùng
     một tấm hình lên đầu hai chỗ khác nhau. Pivot nằm trên SPRITE nên cả hai hệ đọc chung.
   · Tool tự chạy trong `BuildSet` và `BuildAssets`, và **bỏ qua tấm đã đúng pivot** (không
     reimport) nên gọi lại vô hại.
   ⚠ Chạy lại là GHI ĐÈ pivot đã kéo tay.

2c. **ĐẶT NÓN THÌ ĐO VÀNH NÓN, ĐỪNG ĐO KHUNG BAO VÀ ĐỪNG TIN PIVOT.**
   Điểm duy nhất trên tấm art nói được "cái đầu chui vào ĐÂY" là **HÀNG NGANG RỘNG NHẤT** —
   chỗ nón ôm quanh sọ (`StickmanRigMetrics.TryMeasureBrim`, bỏ qua 30% dưới để khỏi ăn phải
   tấm che gáy). Cỡ lấy theo bề rộng hàng đó (`FitBrimWidth`), vị trí đặt sao cho hàng đó nằm
   cao hơn tâm đầu `HelmetBrimLift` × bán kính đầu (`HelmetOffsetOnHead`).
   ⚠⚠ **`HelmetBrimLift` = 0.20 — LẦN SỬA THỨ BA: 0.6 → 0.15 → 0 → 0.20.**
   Bản 0 sinh ra để chữa "hở gáy" và chữa được thật, nhưng đổi lại thì **nón trùm kín cả cái
   mặt**: đo trên 45 tấm art hiện có, ở `lift 0` chỉ còn **35.6%** phần tư TRƯỚC-DƯỚI của khối
   đầu (chỗ mắt đọc ra là "cái mặt") nhìn thấy được. Trên stickman thì đầu ĐEN và phần lớn nón
   cũng sẫm, nên 35% ấy đọc ra thành một cục đen liền — đúng câu *"không phải nón trùm đầu thì
   phải thấy được mặt"*.
   ⚠ Lập luận cũ (*"số dương nào cũng làm hở gáy"*) ĐÚNG VỀ HÌNH HỌC nhưng **đo sai chỗ**: nó
   đếm diện tích đầu lòi ra TRÊN TOÀN KHỐI, gộp cả phần lòi ra ở phía MẶT — mà phần đó chính
   là thứ đang cần lòi ra. Đo riêng theo GÓC PHẦN TƯ thì 0.20 thắng ở CẢ HAI mặt:

   | lift | mặt nhìn thấy | gáy (sau-trên) bị hở |
   |---|---|---|
   | 0.00 | 35.6% | 0.8% |
   | **0.20** | **48.7%** | **0.6%** ← đáy của cả dải |
   | 0.30 | 52.9% | 1.6% |
   | 0.40 | 54.4% | 3.3% |

   Nâng nón lên một chút CHE GÁY TỐT HƠN chứ không tệ đi (đỉnh vòm vươn qua chỏm sọ); chỉ quá
   0.3 thì mép sau mới nhấc khỏi gáy. Bài học giữ nguyên và còn đúng hơn: **chốt số phải ĐO
   ĐƯỢC** — nhưng phải đo ĐÚNG ĐẠI LƯỢNG, và ở đây là hai đại lượng chứ không một.

   ⚠⚠ **PHÉP ĐO VÀNH CÓ LƯỚI BẮT — `StickmanRigMetrics.ScanBrim` (thay cho vòng quét cũ).**
   Quét bỏ 30% dưới đúng cho 18/21 tấm; nón nào **trống trơn dưới vành** thì chính cái vành
   rơi vào vùng bị bỏ qua và phép đo kẹp vào mép cửa sổ ⇒ nón to hơn ~12% và tụt xuống trùm
   cả mặt. Dấu hiệu: hàng đo được TRÙNG ĐÚNG đường cắt. Nay gặp vậy thì **quét lại toàn bộ**.
   Bản cũ chữa bằng cách bắt art phải VẼ THÊM vạt khăn — đúng với art của mình, nhưng art nhận
   từ ngoài về thì không ép được, nên phép đo phải tự chịu được. Đã dính `Helm_Arab` ·
   `Helm_China` · `Helm_Pirate` · `Helm_Viking` (trước đó là Ấn Độ + Ottoman).

   ⚠⚠ **DƯỚI VÀNH, PHÍA +X LÀ MẶT — CẤM VẼ VẬT LIỆU Ở ĐÓ.** `Skirt` (diềm gáy) từng chạy đều
   hai bên quanh trục, nên nửa của nó nằm đúng trước mặt: `Helm_Byzantine` còn **0.2%** mặt
   nhìn thấy được, Persia 0.8%, Rus 1.4%, Mongol 3.3%, Europe 5.3%, và **cả 15 tấm `_Guard`
   đều 0.0%**. Không hằng số nào cứu được (nâng thì hở gáy, hạ thì kín mặt) — vật liệu đơn
   giản là không được vẽ ở đó. Nay `Skirt` cắt mép phải ở `Cx − FaceClear`, đúng khuôn
   `SideTail`. Nón CỐ Ý trùm kín mặt (mũ trụ Thập tự) tự vẽ khối kín, không đi qua `Skirt`.

   ⚠⚠ **VÒM PHẢI NGỒI TRÊN VÀNH, ĐỪNG THÒ XUỐNG DƯỚI** (`CivilizationHelmetArt.DomeOnRim`).
   Đây là nửa CÒN LẠI của lỗi trùm mặt, và khó thấy hơn nửa diềm gáy. `Dome(c, Cx, DomeCy −
   18f, rx, ry)` đặt tâm vòm ở 134, nên với `ry = 54` đáy vòm tụt xuống **y = 80** — tức
   **38 px DƯỚI vành**. Vòm là mảng ĐẶC lớn nhất tấm art nên một mình nó bịt kín khuôn mặt dù
   diềm gáy đã chừa chỗ. Nón thật cũng vậy: vòm ôm SỌ rồi dừng ở vành, xuống nữa là việc của
   che má — mà che má nằm hai BÊN, không ở trước mũi.
   Đo sau khi sửa cả hai nửa: **mặt nhìn thấy 0.0% → 59–68%** ở bộ `_Guard`, trung bình bộ nón
   phụ **71.0% mặt hiện, 0.0% gáy hở**.
   ⚠ Kèm theo: `Nasal` cũ vẽ ở `Cx+40…Cx+62` = ĐÚNG MÉP NGOÀI vòm (rx thường 60–62) nên ra một
   thanh sáng LƠ LỬNG cạnh cái nón, không ra sống mũi. Kéo vào `Cx+22…Cx+38` và cho ăn vào đai.

   ⚠ **NĂM NỀN CÒN VẼ Ở KHỔ NHÁP 96×72 ĐÃ ĐƯỢC VẼ LẠI Ở 256** — `CivilizationHelmetArt.Europe`
   · `.Viking` · `.Japan` · `.China` · `.Arab`; `CivilizationArtGenerator.Helm*` nay chỉ còn là
   một dòng chuyển tiếp. Chênh cỡ trong bộ MAIN từ **2.49×** xuống **~1.37×**.

   ⚠ **CHÊNH CỠ 2.49 LẦN LÀ CHÊNH THẾ HỆ ART, KHÔNG PHẢI CHÊNH HẰNG SỐ.** Fit xong, chiều cao
   nón chạy từ **0.77** (`Helm_Arab`) tới **1.92** (`Helm_Ottoman`) lần đường kính đầu — và
   ranh giới rơi gần đúng vào ranh giới hai thế hệ: 5 tấm còn là **bản nháp 96×72**
   (Arab · China · Europe · Japan · Viking) đều dẹp, bộ 256×256 đều cao. Chữa bằng cách VẼ LẠI
   5 tấm đó, đừng đi thêm trần chiều cao — kẹp chiều cao là làm vành hẹp hơn đầu, tức đổi lỗi
   này lấy lỗi "nón bé hơn đầu" đã sửa một lần rồi.
   Soi bằng `Tools > Stickman > Nâng cao > Civilizations > 6. Soi bộ nón 15 nền`.
   ⚠ **KHUNG BAO SAI** vì nó gồm cả **đuôi khăn · chùm lông · tấm che gáy** — thứ cố tình thò
   ra NGOÀI cái đầu. Cho khung bao rộng đúng 1.45 × đầu thì vòm nón co lại bé hơn đầu.
   ⚠ **PIVOT CŨNG SAI** — và đây là chỗ tài liệu này từng ghi ngược. Tin pivot thì đúng với 9
   tấm nón CODE-GEN (cùng khổ 96×72, cùng pivot 0.25 do chính tool đặt), nhưng 6 tấm ART THẬT
   (Arab · China · Crusader · Europe · Japan · Viking, mỗi tấm một khổ: 203×256, 242×256,
   256×203, 256×210, 256×206, 256×232) thì **LƠ LỬNG HẲN PHÍA TRÊN ĐẦU**, cái đầu đen hở
   nguyên ra bên dưới. Không lỗi nào báo. Đo lại bằng hình: neo theo vành nón thì cả 15 đội
   đúng chỗ, không phải sửa tay tấm nào.
   ⚠ Cùng công thức này áp cho **CẢ HAI** hệ nón — nón THẬT (`EquipmentDefinition`) và nón
   OVERLAY (`StickmanAppearanceSet.helmetScales/helmetOffsets`). Lệch nhau là cùng một tấm
   hình đội hai chỗ khác nhau tuỳ lính được phát nón loại nào.
   ⚠ **CỠ ĐỒ ĐO THEO CÁI ĐẦU, VÀ PHẢI NHÌN TRÊN NGUYÊN CON NGƯỜI.** Thân stickman rộng 0.05
   còn đầu 0.25 — **đầu rộng gấp 5 lần thân**, nên một khối giáp "vừa phải" trên giấy đứng
   cạnh hai cái tay que lại đọc ra cái thùng. Hai hằng số, cùng nằm ở `StickmanRigMetrics`
   để nón thật · nón overlay · giáp của cả hai builder dùng CHUNG:
   · `HelmetHeadRatio` = **1.40** × đường kính đầu, đo ở VÀNH NÓN.
     ⚠ Số cũ 1.45 là đo KHUNG BAO — hai phép đo khác nhau, đừng bê số qua lại. Đường đi của
     số này: 1.45 (khung bao) → 1.15 (vành, **nón bé hơn đầu**) → 1.30 (vừa sọ nhưng hở gáy)
     → **1.40**, chốt bằng diện tích đầu lòi ra: 24% → 14.7%, và 12 nón CÓ vẽ phần che gáy
     thì 11.6% → **3.4%** (9 trong số đó về 0%).
     ⚠ Trong 1.40 có bù **3.8%** cho một lỗi đo: `Measure()` lấy `headRadius` từ
     `CircleCollider2D` của `headRagdoll` (0.125) trong khi ĐẦU VẼ RA là 104 px @ PPU 100 ×
     boneScale 0.25 = **0.130**. Đúng bài học "đừng đo hằng số rig từ giá trị nằm sẵn trong
     prefab" — muốn sạch thì sửa `Measure()`, nhưng làm vậy là đổi số cho MỌI thứ đo theo đầu.
     ⚠ Ba nón hở gáy VÌ ART, hằng số không cứu được — phải VẼ LẠI: `Helm_DaiViet` (66%) ·
     `Helm_Egypt` (62%) · `Helm_Pirate` (52%). Art của chúng không có vật liệu nào ở vùng gáy.
   · Giáp: **SCALE HAI TRỤC** (`StickmanRigMetrics.ArmorScale` trả `Vector2`) — cao
     `ArmorTorsoCoverage` (0.92 × chiều cao thân), rộng `ArmorHeadRatio` (**0.72** × đường
     kính đầu), phần chênh nhau NÉN vào bề ngang, chặn ở `ArmorMaxSquash` (0.65).
     ⚠ Đây là chỗ DUY NHẤT trong dự án cố ý scale không đều, và có lý do hình học: art giáp
     vẽ tỉ lệ 0.80 (dáng cái thùng, hợp với người có vai) còn thân stickman là 0.125. Thu nhỏ
     ĐỀU cho giáp hẹp lại thì nó NGẮN LẠI THEO — quay về đúng lỗi "giáp ngắn hơn body". Hai
     yêu cầu không cùng thoả được bằng một hệ số. Nón/khiên thì KHÔNG nén: vòm nón méo là
     nhìn ra ngay.
   ⚠ Chốt số bằng cách **render nguyên con stickman ĐỦ TAY CHÂN ở nhiều mức rồi nhìn**. Mock
   chỉ có thân + đầu thì mọi thứ trông nhỏ hơn thực tế — đã dính đúng một lần.
   ⚠ **Fit theo chiều cao thì TỈ LỆ tấm art quyết định bề rộng** — art vẽ sai tỉ lệ thì phải
   VẼ LẠI chứ đừng chữa công thức. `Armor_Japan` từng là art thật vẽ NGHIÊNG 3/4, phần vẽ
   được 98×252 (0.39) trong khi bộ code-gen là 57×71 (0.80): cùng công thức ra một dải giáp
   hẹp bằng NỬA cái đầu. Đã bỏ, vẽ lại bằng `CivilizationArtGenerator.ArmorJapan`.

2c-decies. ⚠⚠ **VÒNG NEO BỊ NÓN CHE = CẢ BỘ LỆCH CÙNG MỘT HƯỚNG, VÀ PHÉP KIỂM SO TRUNG VỊ MÙ TỊT** (2026-09-02, từ báo cáo *"nón to nhỏ không đều, cái sai pivot cái đúng"*).

`intake_fid` khớp vòng tròn trên CỤM HỒNG CÒN THẤY ĐƯỢC. Hoạ sĩ gần như luôn vẽ nón TRÙM LÊN
vòng, phần hồng sót lại là cung DƯỚI-PHẢI ⇒ tâm khớp trôi xuống dưới-phải ⇒ khi game đặt đầu
thật vào neo, **cả 75 cái nón trượt lên trên-trái, đầu đen thò ra dưới-phải**. Vì lệch ĐỒNG
LOẠT nên ba phép kiểm so với TRUNG VỊ của chính quần thể báo "58 tấm lành" — phép đo tự chấm
điểm mình. Cách duy nhất lộ ra: **render nón lên cái đầu chuẩn bằng ĐÚNG phép ghép của game
rồi NHÌN cả bộ** (một lần nữa đúng bài `canvas.py`).

Chữa bằng `refit_helm_anchors.py` — bỏ hẳn số đo từ cụm hồng, suy neo từ CHÍNH cái nón bằng
hình học đã chuẩn hoá của dự án: vành (hàng rộng nhất, bỏ 30% dưới) = **1.40 × đầu**
(`HelmetHeadRatio`), vành nằm trên tâm đầu **0.20 bán kính** (`HelmetBrimLift`), tâm ngang =
tâm hàng vành. Một phép cho cả nón hở lẫn nón kín.
⚠ Bản thử đầu dùng điều kiện "gáy kín + MẶT PHẢI HỞ" — với MŨ TRỤ KÍN (cấp 5) điều kiện hở
mặt **đẩy cái đầu ra ngoài nón** (mũ kín thì che mặt là chủ ý). Đừng dựng lại kiểu chấm đó.
⚠ 6 tấm cấp 5 có chỏm lông/quai giáp lệch bên kéo "hàng rộng nhất" ra khỏi lòng nón — chỉnh
TAY qua bảng `TWEAKS` trong script (đã cân bằng mắt, script tái tạo đúng 75/75 khi chạy lại).
⚠ File neo chỉ là SỐ ĐO — phải bấm **«★ 15 nền văn minh — art theo CẤP + asset»** để bake vào
`EquipmentDefinition` thì game mới đổi.

2c-nonagies. ⚠⚠⚠ **ĐÃ GỠ "TRẦN VÒM" (`DomeCapRatio`) — ĐỪNG DỰNG LẠI.** (2026-09-02)

Đây là **lần thứ TƯ** của cùng một bài học ở mục 2c/2c-bis: lấy một đại lượng KHÔNG PHẢI chỗ
cái đầu chui vào rồi ép nó về cỡ chuẩn. Lần này là **bề rộng VÀNH**.

**Chuyện gì xảy ra:** người dùng báo *"nón bự bằng nhân vật"*. Chữa bằng cách kẹp bề rộng vành
lại `DomeCapRatio` = 1.55 lần đường kính đầu. Chữa đúng triệu chứng, và đẻ ra một lỗi nặng
hơn hẳn — câm lặng hoàn toàn:

| Đo được | Số |
|---|---|
| tỉ lệ vành/đầu mà art vẽ | **1.27 → 2.89**, trung vị **1.67** |
| trần đã đặt | **1.55** — NẰM DƯỚI TRUNG VỊ |
| số tấm bị trần cắt | **34/45** |
| đường kính đầu-trong-art sau khi cắt | tụt từ 0.250 xuống tận **0.134** (`Helm_China`) |

Kẹp bề rộng vành = **thu nhỏ CẢ TẤM ART**, nên cái đầu VẼ TRONG ART co lại theo và hoá
**nhỏ hơn cái đầu THẬT**. Trên màn hình: **khối đầu đen thò hẳn ra ngoài nón**. Người dùng đọc
ra thành *"vẫn còn sai pivot"* — nhưng pivot ĐÚNG TUYỆT ĐỐI: đo lại cả 45 tấm thì neo đầu rơi
đúng tâm đầu tới **0.0000**. Sai nằm ở **CỠ**, không ở **CHỖ ĐẶT** — và hai thứ đó nhìn ra
giống hệt nhau.

⚠ **KHÔNG CÓ CON SỐ TRẦN NÀO ĐÚNG — *KHI KẸP QUANH TÂM*.** Bước cắt của `intake_fid` KHOÉT
phần nón nằm sau đầu theo ĐÚNG vòng tròn đầu chuẩn, nên lỗ chừa cho đầu BẰNG ĐÚNG cái đầu —
không có lề; thu nhỏ quanh TÂM là đầu thò ra cả TRÊN đỉnh lẫn sau gáy.
⚠⚠ **ĐÃ THỬ "TRẦN CỠ NEO ĐỈNH" VÀ NÓ CŨNG SAI (2026-09-03).** Lập luận nghe rất chắc: neo
đỉnh thì vòm đứng yên trên chỏm sọ, phần co ăn vào vạt rủ, và lỗ khoét luôn nằm trong đĩa đầu
(`s² + (1−s)² ≤ 1`). Vế cuối ĐÚNG nhưng **trả lời sai câu hỏi**: nó chỉ chứng minh không hở
KHE TRONG SUỐT, không hề nói gì về việc đầu có lọt trong VẬT LIỆU nón hay không. Thu nhỏ nón
= khai cái đầu TO HƠN hốc nón đã vẽ ⇒ đầu lòi ra hai bên và sau gáy. Đo A/B trên nguyên con
stickman: China không nhỏ đi được chút nào (vốn đã dưới trần), India c5 chỉ 121%→109% mà đầu
đã thò ra. Vế "kẹp quanh tâm là chết" vẫn đúng, và **kẹp neo đỉnh cũng chết** — chỉ chết chậm
hơn một nhịp.

⚠ **AI ĐÚNG GIỮA "VÀNH" VÀ "ĐẦU": cái ĐẦU.** Nó là DẤU CHUẨN ta phát ra và hoạ sĩ vẽ quanh nó;
bề rộng vành là LỰA CHỌN của hoạ sĩ. Vẽ vòm 2.89 lần cái đầu ta đưa nghĩa là **tấm art đó
sai**, và chỗ sửa là **VẼ LẠI TẤM ART**, không phải bóp nó lúc chạy.

Nay `StickmanRigMetrics.BrimWarnRatio` (2.0) chỉ là **ngưỡng để SOI**, không kẹp gì cả:
`Civilizations > 6` in cột **VÀNH/ĐẦU** và réo tên tấm nào vượt — đó là danh sách đơn đặt vẽ lại.

⚠ **CÁCH TỰ BẮT LẦN SAU** (phép đo đã tìm ra lỗi này trong một bước): với mọi tấm nón, tính
**đường kính đầu-trong-art quy ra world** = `d(headanchor.json)/ppu × localScale × boneScale`.
Số đó phải **BẰNG NHAU Ở MỌI TẤM** và bằng đúng đường kính đầu thật. Lệch nhau = có ai đó đang
kẹp cỡ.

2c-bis. **BA LẦN ĐẶT NÓN, HAI LẦN ĐẦU SAI THEO CÙNG MỘT KIỂU** — giữ lại vì lần sau đụng
   vào rất dễ quay về một trong hai:
   · **Ép TÂM PHẦN VẼ trùng TÂM ĐẦU** (bù cả hai chiều): nón có DIỀM CỔ / khăn rủ (Ả Rập ·
     Trung Hoa · Viking · Nhật) bị kéo tụt xuống, vòm nón ngang trán còn cái diềm phủ quá
     cằm — cả cái đầu đen biến mất sau tấm hình; nón có CHÙM LÔNG dựng đứng thì bị đẩy lên.
   · **Tin PIVOT cho chiều dọc**: đúng với 9 tấm code-gen (cùng khổ, pivot do chính tool đặt),
     nhưng 6 tấm art thật thì nón lơ lửng hẳn phía trên đầu.
   Điểm chung của cả hai: **lấy một điểm KHÔNG PHẢI chỗ cái đầu chui vào** rồi ép nó vào tâm
   đầu. Vành nón thì luôn đúng, bất kể người vẽ chừa viền bao nhiêu hay vẽ thêm đuôi khăn.
   ⚠ Cách kiểm rẻ nhất, và là cách đã tìm ra cả hai lỗi: **render cả 15 nền đội lên một cái
   đầu đúng số đo rồi NHÌN**. Đọc code thì hai bản sai kia đều xuôi tai.

2c-quater. ⚠⚠ **NÓN KHÔNG CÓ GÌ DƯỚI VÀNH THÌ PHÉP ĐO KẸP VÀO MÉP CỬA SỔ — VÀ NÓN TRÙM KÍN MẶT.**
   `TryMeasureBrim` bỏ qua **30% DƯỚI** phần vẽ rồi mới tìm hàng rộng nhất (để khỏi ăn phải
   tấm che gáy). Nón nào trống trơn dưới vành thì **chính cái vành rơi vào vùng bị bỏ qua**:
   phép đo kẹp vào đúng đường cắt và trả về một hàng nằm lưng chừng thân nón ⇒ nón sinh ra
   **TO hơn ~12%** và **TỤT xuống nửa bán kính đầu**, tức chỗ rộng nhất của nó hạ xuống ngang
   gò má và rộng gấp **1.4 lần cả cái đầu**. Không lỗi nào báo.
   Đã dính **Ấn Độ + Ottoman** — hai hàm duy nhất của bộ 256 không gọi `Skirt()`. Chữa bằng
   `CivilizationHelmetArt.SideTail` (vạt khăn rủ về SAU, −X).
   · **Dấu hiệu nhận ra:** hàng đo được TRÙNG ĐÚNG đường cắt 30%. Soi cả bộ thì 18/21 tấm đo
     đúng, chỉ ba tấm kẹp — `Helm_Pirate` đang sát ngưỡng (lệch 7 px), sẽ vỡ nếu vòm cao thêm.
   · **PIVOT KHÔNG PHẢI THỦ PHẠM** dù nhìn rất giống: `.meta` của hai tấm đó khớp trong 0.5 px
     với số `StickmanAnchorPivots.StampHelmet` tính ra — nó là bản sao TRUNG THÀNH của phép đo
     sai. Chạy lại `Appearance > 4` chỉ ghi lại đúng con số sai đó.
   · **ĐỪNG sửa ngưỡng 30%** — 18 tấm kia đang sống nhờ nó.
   · Ba ràng buộc khi vẽ vạt: bắt đầu DƯỚI mép ngoài của `Band` (dính vào Band là hàng đó
     rộng hơn vành và CƯỚP MẤT vành) · mọi hàng HẸP HƠN vành · lệch hẳn về SAU và thuôn dần
     (đối xứng hai bên = quy ước hình chính diện; rời hẳn khối = đọc ra "tấm ván").

2c-quinquies. ⚠⚠ **BỘ NÓN 256 TỪNG KHÔNG THỂ VẼ LẠI ĐƯỢC — sửa code xong bấm tool vẫn ra bộ CŨ.**
   `CivilizationHelmetArt.Save` quên truyền **`polish: false`**, mà `WeaponArtGenerator.Polish`
   NỚI CANVAS thêm `OutlinePad × 2` = 4 px ⇒ 9 tấm nón ra đĩa khổ **260×260** thay vì 256.
   Mà `CivilizationArtGenerator.GeneratedSizes` nhận diện art code-gen **BẰNG KHỔ ẢNH** →
   không nhận ra chúng → nút *Dọn art code-gen lỗi thời* bỏ qua, còn `GenerateMissing` thì cố
   ý bỏ qua file đã có. **Cả hai đường vào PNG đều bị bịt, không lỗi nào báo.**
   Đã sửa: `Save` truyền `polish: false`, và `GeneratedSizes` giữ thêm khổ **260×260** để mấy
   tấm lỡ sinh còn dọn được. Thêm khổ canvas mới thì phải nối vào bảng đó — đúng như chú thích
   ngay tại chỗ đã dặn.
   ⚠ Kèm theo: mục *Dọn art văn minh vẽ bằng code đã lỗi thời* trước đây **không khai `proof`**
   nên bảng điều khiển không vẽ nổi một cái chấm cho nó. Nay khai `proof` = một tấm nón có
   thật + `extraSource: CivilizationHelmetArt.cs` (bộ 256 nằm ở file KHÁC với delegate).

2c-sexies. ⚠⚠ **CHÉP `.meta` LÀ CHÉP LUÔN PIVOT CỦA TẤM ART CŨ.**

   Nhận art mới từ ngoài thì phải có `.meta` (GUID + PPU + filter). Cách nhanh nhất là chép
   `.meta` của một tấm CÙNG LOẠI đang có rồi đổi GUID — nhưng làm vậy là **bê nguyên
   `spritePivot` của tấm cũ sang tấm mới**, mà hai tấm vẽ khác nhau thì vành nón nằm chỗ
   khác nhau. Đo được khi thay 15 nón: lệch tới **0.25** (= 64 px trên canvas 256, gần **HAI
   LẦN đường kính đầu**) ở Ả Rập — trong game là cái nón **trôi hẳn khỏi đầu**, và đó là
   thứ người chơi thấy đầu tiên.
   ⚠ **"Để Unity chấm pivot" KHÔNG CỨU ĐƯỢC** — đúng về nguyên tắc (một chỗ khai một thứ)
   nhưng SAI về THỨ TỰ: giữa lúc thả art vào folder và lúc ai đó bấm tool, art đã nằm
   trên đĩa với pivot SAI. Nay `intake_gear.py` tự gọi `stamp_pivots.py` — bản sao trung
   thành của `StickmanAnchorPivots.StampHelmet` (pivot = tâm VÀNH NÓN, y đo từ ĐÁY ảnh).
   Không đẻ ra nguồn sự thật thứ hai vì `StickmanAnchorPivots.Write` có chốt *"đã đúng thì
   thôi"*, nên bấm tool sau vẫn vô hại.

2c-septies. ⚠⚠ **BĂM BYTE KHÔNG TRẢ LỜI ĐƯỢC "ART CÓ DÙNG LẠI CỦA NHAU KHÔNG" — PHẢI BĂM
   ĐƯỜNG BAO.** Đã kết luận SAI đúng một lần vì chuyện này: rà bằng `md5` nội dung file rồi báo
   *"nón · giáp · khiên của 15 nền không tấm nào trùng, chỉ vũ khí mới trùng"*. Băm byte chỉ
   bắt được **BẢN SAO Y HỆT**; hai tấm tô khác màu trên CÙNG MỘT hình thì ra hai mã khác nhau
   và lọt lưới hoàn toàn.
   Đo lại bằng **alpha chuẩn hoá về 48×48**: **15 bộ giáp chỉ có 7 đường bao · 13 cái khiên chỉ
   có 7 · 81 tấm vũ khí chỉ có 68**. Và con số đó còn LẠC QUAN hơn sự thật — render ra nhìn thì
   **cả 15 bộ giáp là MỘT khối bình hoa** (cùng chỏm vai, cùng eo thắt, cùng váy loe), khác
   nhau chỉ ở hoa văn tô bên trong, mà ở ~60 px hoa văn biến mất sạch.
   ⚠ Đây đúng là bài học đã ghi ở mục 2c-ter cho bộ NÓN, lặp lại nguyên xi ở GIÁP và KHIÊN —
   nón thì đã sửa (45/45 đường bao khác nhau), hai bộ kia thì chưa ai soi tới.
   ⚠ Soi bằng `Tools > Stickman > Nâng cao > Civilizations > 7. Soi TRÙNG ĐƯỜNG BAO cả bộ art`
   (`StickmanCivilizationArtAudit.RunSilhouetteAudit`) — nó gom theo LOẠI (giáp với giáp,
   `Weapon_Lance` với `Weapon_Lance`) vì so cái khiên với cây giáo thì vô nghĩa, và **bỏ qua bộ
   `TierN`** (bản đổi màu của chính tấm gốc nên trùng đường bao là ĐÚNG).
   Đơn đặt vẽ lại: `Docs/KnowledgeBase/WeaponArt-ChatGPT-Prompt.md` mục **4b · 5b · 4c · 4d**.

2c-octies. ⚠⚠ **ĐƯỜNG XOÁ CŨNG PHẢI HỎI NHÃN, KHÔNG CHỈ ĐƯỜNG GHI.**
   `StickmanArtSource.CanCodeWrite` chặn code GHI ĐÈ art của người — nhưng
   `CivilizationArtGenerator.DeleteWeaponSkinTiers` **quét sạch thư mục `<nền>/TierN/` không
   hỏi nhãn**. Đúng khi bộ theo cấp còn 100% do code sinh (chỉ là đổi bảng màu trên tấm gốc);
   nhưng ngay khi có MỘT tấm cấp vẽ tay đặt vào đó — cấp 5 chạm trổ khác hẳn cấp 1 — thì lần
   chạy tool kế tiếp XOÁ MẤT NÓ, **không lỗi nào báo**: nhìn vào chỉ thấy cấp cao lại trơn như
   cấp thấp. Nay chỉ xoá tấm mang nhãn `stickman:codegen`.
   ⚠ Luật chung: **thêm một đường XOÁ/DỌN nào cũng phải đi qua `IsCodeGenerated`** — chặn mỗi
   đường ghi là chặn nửa vời.

2c-nonies. ⚠⚠ **HAI PHÉP ĐO KHÁC NHAU TRÊN CÙNG MỘT MÓN ĐỒ = SAI TRONG IM LẶNG.**
   (Rà 2026-09-02, từ báo cáo *"nón bị sai pivot"* — và pivot KHÔNG sai một chút nào.)

   `FitBrimWidth` / `HelmetOffsetOnHead` có **HAI ĐƯỜNG**: có file neo `<tấm>.png.headanchor.json`
   thì đo theo CÁI ĐẦU vẽ trong art; không có thì rơi về `ScanBrim` (hàng ngang rộng nhất).
   Hai đường cho hai kết quả khác hẳn nhau — và đó là chỗ nứt.

   Sidecar neo chỉ nằm cạnh tấm GỐC, **không đi theo art vào `<nền>/TierN/`**. Nên:
   · bản gốc đo bằng NEO ĐẦU → `localScale`/`localPosition` đúng;
   · bản cấp rơi về `ScanBrim` → ra số khác;
   · `BakeTierTransforms` thấy "lệch thật" nên BAKE `tierScales`/`tierOffsets` đè lên;
   · mà `SpriteForTier(1)` **LUÔN** trả bản `Tier1/` (mục 2e-0k) ⇒ **số neo-đầu đúng đắn KHÔNG
     BAO GIỜ được dùng tới trong game.**

   Đo được trên **45/45** cái nón: `tierOffsets[0].y = 0` — mất trắng phần bù *pivot → tâm đầu*,
   mà pivot rải từ **12 px tới 191 px** trên canvas 256; và `tierScales[0]` lệch tới **hơn hai
   lần** (`Arab_Cap` 1.78 → 0.92). Trên màn hình: **nón lơ lửng trên đầu và sai cỡ**.
   ⚠ Người dùng đọc ra là *"sai pivot"*, và đó là một chẩn đoán rất dễ tin — nhưng pivot, neo
   đầu, công thức đặt nón, và cả 45 asset đều khớp nhau **tuyệt đối**. Thứ sai là **món đồ hiển
   thị ra không phải món đồ được đo**.

   Ba việc đã làm:
   1. `TryLoadHeadAnchor` **mượn neo của bản gốc** cho art nằm trong `TierN/` (thứ tự ưu tiên:
      neo của chính nó → neo bản gốc → `ScanBrim`). Tấm cấp nào thật sự là một cái nón KHÁC
      thì cứ đặt file neo riêng cạnh nó.
   2. **LƯỚI BẮT** trong lambda đo nón: bản gốc có neo mà bản cấp không có thì **dùng lại số
      của bản gốc + réo Console** — thà mọi cấp chung một cỡ còn hơn bốn cấp lơ lửng câm lặng.
   3. Giáp/khiên đã đo lại: **0/15 và 0/13** asset có mảng theo cấp, tức chúng chưa bao giờ
      dính — vì phép đo của chúng không đổi phương pháp giữa bản gốc và bản cấp.

   ⚠ **LUẬT CHUNG, đắt hơn bản vá này:** hàm đo nào có NHÁNH DỰ PHÒNG thì hai nhánh phải cho
   kết quả **so sánh được với nhau**, hoặc bên gọi phải biết mình vừa nhận kết quả của nhánh
   nào. Đem số của nhánh A so với số của nhánh B rồi kết luận "lệch" là kiểu lỗi không bao giờ
   tự lộ ra: mọi hàm đều trả lời đúng câu nó được hỏi.
   ⚠ **CÁCH SOI:** render cả bộ lên một cái đầu 0.25 world bằng ĐÚNG công thức game dùng
   (`localScale`/`localPosition`, và nhớ ưu tiên `tierScales[0]`/`tierOffsets[0]` nếu có) rồi
   NHÌN. Đọc code thì cả hai bản đều xuôi tai.

2c-undecies. ⚠⚠⚠ **NEO ĐẦU CỦA BỘ NÓN: ĐỪNG TÍNH LẠI `d`. NĂM PHÉP TỰ ĐỘNG, NĂM LẦN SAI.**
   (chốt 2026-09-03, sau hai ngày đi vòng)

   | Phép | Ý tưởng | Hỏng thế nào |
   |---|---|---|
   | `DomeCapRatio` | kẹp bề rộng vành về 1.55 × đầu | cắt 34/45 tấm ⇒ đầu đen thò ra ngoài nón |
   | `refit_helm_anchors.py` | tính lại `d` từ VÀNH (rộng nhất ÷ 1.40) | kabuto có cánh chuồn, khăn hải tặc buộc túm ⇒ `d` phình ⇒ nón tí xíu + hở gáy. Đo đối đầu: neo gốc hở gáy **7/75**, phép vành **9/75** |
   | quét lưới (dx, dy, k) | tối ưu 4 chỉ tiêu trên cả 75 tấm | bảng ra 75 dòng với `k` tới 0.65 = **phóng to nón 1.5 lần** ⇒ *"nón bự lên bất thường"* |
   | trần chiều cao + NEO ĐỈNH | ép cao/đầu ≤ 2.1 | thu nhỏ nón = khai đầu to hơn hốc nón ⇒ đầu lòi hai bên + sau gáy |
   | thay `d` của tấm dự phòng bằng TRUNG VỊ tỉ lệ | cho 40 tấm "đoán" khớp quần thể đo thật | **sai CẢ HAI CHIỀU**: nhóm 1.96–2.30 bị ép lên ⇒ nón phóng to; nhóm 3.20–3.30 bị ép xuống ⇒ đầu thò ra. Render kiểm: cả sáu tấm người dùng gửi đều TỆ HƠN bản gốc |

   ⚠⚠ **VÌ SAO KHÔNG PHÉP NÀO THẮNG — một câu, và nó là LUẬT:** `intake_fid` KHOÉT nửa dưới
   vòng chuẩn ngay trong PNG, nên vật liệu nón chạy SÁT vành đầu — **không có lề**. Cái đầu
   thật là 0.25 world, cố định. Nên tỉ lệ "nón / đầu" **KHÔNG CÒN BẬC TỰ DO NÀO**: bóp nhỏ bao
   nhiêu thì đầu thò ra bấy nhiêu, phóng to bao nhiêu thì hở một khe trong suốt bấy nhiêu.
   Thứ DUY NHẤT được phép chỉnh là **CHỖ ĐẶT** (`dx`, `dy` trong `patch_helm_anchors.TWEAKS`),
   và giữ `|dx|,|dy| ≤ 0.15` để đầu không ra khỏi hốc đã khoét.

   ⚠⚠ **40/90 TẤM CÓ `d` LÀ HẰNG SỐ DỰ PHÒNG — biết mà ĐỪNG "chữa".** Hoạ sĩ vẽ nón trùm kín
   vòng chuẩn (đúng ý đồ với mũ trụ), `intake_fid` không khớp được vòng nào nên rơi về `exp_d`
   = một phần cố định của chiều cao art. Dấu vết không thể nhầm: `art_h / d` ra **đúng bằng
   nhau tới 3 chữ số** ở nhiều nền dù chiều cao art khác nhau (205, 227, 243 px) —
   `3.304` ở 6 nền · `3.198` ở 10 nền · `2.82` · `3.056` · `2.296` · `2.124` · `1.96`.
   Bảy hằng số, mỗi lần chạy sheet một hằng số.
   · Bằng chứng phụ: 50 tấm ĐO THẬT có `brim/d` trung vị **đúng 1.40** = `HelmetHeadRatio`;
     40 tấm dự phòng tán loạn 1.26–1.47. Hai quần thể tách hẳn nhau.
   · ⚠ **Hằng số dự phòng tuy là đoán nhưng nó đoán THEO TỪNG SHEET**, tức theo đúng bộ art
     hoạ sĩ vừa vẽ. Thay bằng một con số chung cho cả bộ là áp đặt một giả định CÒN TO HƠN —
     đã đo và bỏ (dòng cuối bảng trên). Muốn sửa thật thì **cắt lại sheet đó bằng khuôn đầu
     to hơn** (`head_template_big_*`), đúng thứ `intake_fid` tự réo.

   **BỐN CHỈ TIÊU chấm một cái nón** (`patch_helm_anchors.py --check`) — và chúng chỉ là
   CHUÔNG BÁO LỖI THÔ, ngưỡng cố ý để lỏng:

   | Chỉ tiêu | Đo ở đâu | Bắt lỗi gì |
   |---|---|---|
   | `mat-ho` | TRONG đĩa đầu (rr 0.75 · 0.95) | nón trùm kín mặt |
   | `gay-HO` | **NGOÀI** rìa (rr 1.06 · 1.18) | nón lệch về trước |
   | `dinh-ho` | **NGOÀI** rìa, chỏm trên | nón nằm HỜ trên đỉnh |
   | `cao/dau` | — | > 3.1 = art vẽ quá cao, **đơn đặt vẽ lại** |

   ⚠⚠ **ĐO ĐÚNG BÊN CỦA RÌA ĐẦU.** Trong game mọi điểm BÊN TRONG đĩa đầu đều bị đầu ĐEN che —
   kể cả lỗ khoét. Chấm "hở gáy/hở đỉnh" bằng mẫu TRONG đĩa là đếm nhầm lỗ khoét thành lỗi
   (đã réo oan 49 tấm). Hở THẬT chỉ xảy ra ngoài rìa.

   ⚠⚠ **THỨ QUYẾT ĐỊNH LÀ RENDER NGUYÊN CON STICKMAN, KHÔNG PHẢI BẢNG SỐ.** Soi trên mỗi cái
   đầu trần là mock nói dối (bẫy đã ghi ở 2c, và đã dính lại). Dùng `figure.py` / `zoom.py`
   (vẽ vòng đỏ = chỗ đầu thật) trong scratchpad. **Mốc chỉnh tay: vành nón phải cắt ngang cái
   đầu ở khoảng 1/3 TRÊN** — che chỏm sọ và thái dương, chừa khuôn mặt. Vành cắt ngang GIỮA
   đầu thì đọc ra "nón đặt hờ trên đỉnh".

   ⚠ **BẤT BIẾN**: `patch_helm_anchors.py` đọc neo gốc từ **git HEAD**, không đọc file trên
   đĩa. Chạy hai lần ra một kết quả; đọc file hiện tại rồi cộng `dx` là lần thứ hai cộng tiếp
   và nón trôi thêm một đoạn, câm lặng.

   ⚠ **VIỀN HỒNG CÒN SÓT** (`clean_magenta.py`): `is_mag` chỉ bắt màu BÃO HOÀ, viền anti-alias
   nằm lại thành sợi tím/hồng dọc mép trong nón — đo được 64/75 tấm. Ở cỡ thật nó đọc ra một
   đường sáng lạ quanh đầu.

   ⚠ **ĐỪNG TRÁM ĐEN LỖ KHOÉT** (`fill_helm_bites.py` — đã xoá): vết trám ra khối vuông thô
   lòi ngoài nón, và trên nền render sáng nó hoà vào đầu đen nên phép kiểm bằng mắt tự nói
   dối. Lỗ khoét là ĐÚNG THIẾT KẾ — đầu đen che nó trong game.

2c-quaterdecies. ⚠⚠⚠ **NEO NÓN HIỆU CHUẨN TỪ MỘT TẤM MẪU NGƯỜI DÙNG DUYỆT** (chốt
   2026-09-03, thay cách làm ở 2c-terdecies ngay dưới).

   Sáu vòng liên tiếp tôi tự đặt hằng số (trần vòm · độ trùm · tâm vành · cân bằng trái/phải ·
   trung vị lệch) và cả sáu đều bị bác — vì **đổi một hằng số chung là 90 tấm dịch theo**:
   chữa tấm đang bị chê thì làm hỏng tấm đang đúng. User chốt: *"nên sửa từng cái"*, rồi sau
   khi duyệt một tấm thì *"căn cứ vào mà sửa hết cho tất cả"*.

   **Cách làm đúng, ba bước:**
   1. chỉnh MỘT tấm cho tới khi user nói ĐÚNG (ở đây: `Helm_Crusader` cấp 1);
   2. **đo ngược** ba quan hệ hình học từ tấm đó — vòm/đầu, vành trên tâm đầu, lệch tâm ngang
      so với tâm vành;
   3. áp ba quan hệ ấy cho cả bộ (`fit_helm_holes.calibrated()`), rồi render kiểm.

   Số hiện tại: `MODEL_BRIM` 1.25 · `MODEL_LIFT` 0.179 · `MODEL_DX` 0.332 ·
   `MODEL_HEIGHT_MAX` 2.30. Công thức tái tạo tấm mẫu tới từng pixel — đó là phép tự kiểm.

   ⚠⚠ **CHIỀU CAO MỚI LÀ THỨ NGƯỜI DÙNG ĐỌC RA THÀNH "SAI PIVOT".** Đo được: 72/90 tấm cao
   hơn **75% chiều cao NGƯỜI**, nhiều tấm 110–118%. Nón to gần bằng cả người thì lệch một
   chút cũng đập vào mắt, nên chỉnh vị trí bao nhiêu vòng cũng vô ích. Trần 2.30 lần đường
   kính đầu (= 79% người) cắt đúng nhóm đó.

   ⚠ Công cụ chấm cũng biết nói dối: `headshot.py` crop sát quanh đầu nên **cắt mất vạt rủ** —
   nhìn ra "ôm đều" trong khi cả khối trùm xuống lệch. Chấm trên khung THẤY CẢ NGƯỜI.

   ⚠ Lệch tấm nào thì thêm một dòng vào `MANUAL` (dx, dy[, thu]) — **đừng vặn bốn số trên**.

2c-terdecies. ⚠⚠⚠ **NEO ĐẦU ĐO TỪ *LỖ KHOÉT*, KHÔNG TỪ VÒNG HỒNG — `fit_helm_holes.py`**
   (chốt 2026-09-03 sau khi bốn vòng chỉnh tay đều bị user bác: *"rất nhiều nón bị sai pivot"*).

   **Gốc rễ, đo được:** `intake_fid` lấy tâm đầu bằng cách khớp vòng tròn vào **cụm hồng còn
   thấy được**. Hoạ sĩ gần như luôn vẽ nón trùm lên vòng chuẩn, phần hồng sót lại là cung
   **dưới-phải** ⇒ tâm khớp trôi xuống-phải ⇒ trong game nón **trôi lên-trái**, đầu đen thò
   ra dưới-phải. Đo trên 24 tấm: lệch **+0.14 → +0.49** đường kính đầu, trung vị **+0.22**.
   Đó là toàn bộ chuyện *"sai pivot"*, và nó có ở **mọi nền**, không riêng Trung Hoa.

   **Phép đo đúng:** `intake_fid` KHOÉT nửa dưới vòng đầu ngay trong PNG — nên **cái lỗ đó
   CHÍNH LÀ cái đầu**, dấu vết vật lý, không phải suy diễn. Khớp vòng tròn (Kasa) vào biên lỗ
   là lấy lại đúng tâm.

   ⚠ **CHỈ LẤY *TÂM NGANG* CỦA LỖ, KHÔNG LẤY ĐƯỜNG KÍNH.** Nửa dưới của lỗ bị chính viền dưới
   nón cắt bớt (ta chỉ thấy phần lỗ nằm trong khối vật liệu) nên vòng khớp ra NHỎ hơn thật —
   lấy `d` của nó là nón phồng lên **84% chiều cao người**. Trục ngang thì miễn nhiễm: lỗ bị
   cắt ĐỐI XỨNG qua trục dọc.

   **BA CHỈ TIÊU của một cái nón đúng** (user chốt) — tách bạch, đừng trộn vào một phép đo:

   | Chỉ tiêu | Lấy từ đâu | Chốt |
   |---|---|---|
   | **không sai pivot** | tâm ngang LỖ KHOÉT | `cx` ← vòng khớp; `cy` giữ neo cũ |
   | **không quá bự / quá nhỏ** | LUẬT CỠ | vòm (hàng rộng nhất) ∈ **[1.25 … 1.45]** lần đường kính đầu — mẫu chuẩn là `Helm_China` cấp 5, tấm user chỉ đích danh là ĐÚNG. Trong dải thì GIỮ NGUYÊN cỡ hoạ sĩ vẽ: **tuỳ nón mà pivot và cỡ khác nhau**, đừng ép cả bộ về một số |
   | **ôm đầu** | `grade()` | gáy + đỉnh đo **NGOÀI** rìa đĩa đầu phải có vật liệu che |

   ⚠ **TRỘN "TÂM" VỚI "CỠ" LÀ CHỖ HỎNG BỐN LẦN LIÊN TIẾP.** Mỗi lần chỉnh một biến để chữa
   một triệu chứng thì đẻ ra triệu chứng khác: chỉnh cỡ mà giữ độ trùm → hở gáy (44 tấm);
   neo theo **tâm hàng vành** → sai, vì art vẽ nghiêng nên vành chìa ra phía mặt; kẹp chiều
   cao → nón chóp bị bóp; quét lưới → nón phồng 1.5 lần.

   ⚠ **BẤT BIẾN:** cửa sổ quét lỗ đọc neo từ **git `BASE` (hash ghim)**, không đọc file trên
   đĩa — đọc đĩa thì lần chạy thứ hai quét bằng kết quả lần thứ nhất và hai lần ra hai kết
   quả (đã đo: hash đổi). Kiểm bằng cách chạy hai lần rồi băm cả thư mục neo.

   ⚠ **`patch_helm_anchors.py` NAY CÓ BẢNG RỖNG và đó là trạng thái ĐÚNG** — nó chỉ còn để
   chỉnh tay từng tấm SAU khi đã đo. Thêm dòng vào bảng đó thì phải dời `BASE` sang commit
   chứa kết quả `fit_helm_holes`, không thì patch ghi đè neo đã đo bằng neo gốc của
   `intake_fid`, mất sạch. Script tự thoát khi bảng rỗng.

   ⚠⚠ **ĐIỂM XUẤT PHÁT LÀ `BASE + PLACEMENT`, KHÔNG PHẢI `BASE` TRẦN.** Commit 1f61e90 chỉ
   chứa bảng sửa chỗ đặt trong SCRIPT, chưa áp vào file neo; bản đầu của `fit_helm_holes`
   đọc `BASE` trần cho 37 tấm không có lỗ → cả nhóm quay về trạng thái thô của `intake_fid`,
   Persia c4 lơ lửng trên đầu, user chụp ảnh. Bảng `PLACEMENT` nay nhúng thẳng trong script
   và là nguồn cho **trục dọc + cỡ xuất phát** của MỌI tấm; lỗ khoét chỉ cho trục ngang.

   ⚠ Tấm KHÔNG có lỗ để đo (nón kín mặt, hoặc `intake_fid` không tìm thấy vòng hồng nên
   `skip_carve`) → tâm ngang = **tâm dải vật liệu ngang hàng đầu** (`vl`) — đúng khi mặt nạ và
   diềm gáy cân nhau; nhóm mặt nạ lệch / kabuto có cánh chuồn (9 tấm) thì `vl` sai và phải
   vào bảng `MANUAL` trong chính script, chọn bằng render. Không đo được cả hai → trung vị
   +0.22 (`tv`).

2c-duodecies. ⚠⚠ **ĐỢT SỬA CỠ 2026-09-03 — THU NHỎ TỪNG TẤM *ĐƯỢC*, và nó KHÔNG phải phép
   tự động thứ sáu** (user: *"nón quá bự so với đầu"* + *"nón nhỏ hơn đầu, sai pivot"*).
   ⚠ **PHẦN NÀY GIỮ LÀM SỬ — bảng `TWEAKS` nó nói tới đã bị thay bằng `fit_helm_holes.py`
   (mục 2c-terdecies ngay trên). Đừng dựng lại cách chỉnh tay hàng loạt đó.**
   Bảng `TWEAKS` hiện tại của `patch_helm_anchors.py` là kết quả: 88/90 tấm một dòng riêng,
   mỗi dòng chốt bằng render nguyên con stickman (khác hẳn 5 phép chết ở 2c-undecies — chúng
   là MỘT LUẬT áp cả bộ, không ai nhìn từng tấm). Bốn sự thật mới, trả giá xong mới biết:
   · **THU NHỎ (v < 1) hợp lệ CẢ trên tấm có lỗ khoét** — thu nhỏ nón là cái đầu-trong-art TO
     LÊN, lỗ khoét cũ nằm gọn TRONG đĩa đầu đen nên không hở gì. Vế bị cấm chỉ là PHÓNG TO
     tấm khoét (lỗ to hơn đầu → hở khe trong suốt). Chốt trong script đã sửa đúng một chiều.
   · **Thu thì phải NEO LẠI THEO VÀNH** (vành trên tâm đầu 0.20 bán kính): thu quanh tâm cũ
     là vòm tụt xuống dưới chỏm sọ — đó chính là chỗ chết của phép "trần chiều cao" cũ.
   · **KHĂN VẢI KHÔNG neo theo vành** — vạt khăn kéo tâm hàng-rộng-nhất lệch (đúng bẫy
     2c-quater), và đồ vải ôm sát đầu thì không có lề để thu: nhóm kerchief/nón lá/coif giữ
     cỡ gốc, chỉ NUDGE TƯƠNG ĐỐI (nón trôi lên-trái hệ thống, đầu thò dưới-phải).
   · ⚠⚠ **`BASE` của patch PHẢI GHIM COMMIT CỐ ĐỊNH, không phải HEAD**: đợt sửa-chỗ-đặt chạy
     xong được commit ⇒ HEAD chứa neo ĐÃ tweak ⇒ đọc HEAD rồi áp bảng là cộng chồng HAI LẦN,
     câm lặng. Nhận sheet mới về thì đổi `BASE` sang commit đó và xoá dòng TWEAKS của tấm mới.
   Chuẩn đã chốt (user chỉ tấm mẫu **China c5**): **VÒM nón — hàng ngang rộng nhất — = 1.40 ×
   đường kính đầu, không tấm nào quá 1.45**; chiều cao và đuôi rủ để art tự quyết. Chuẩn thử
   đầu tiên "cao ~2.05 đầu" bị user bác (*"vẫn quá to"*) — vòm rộng mới là thứ mắt đọc ra CỠ,
   không phải chiều cao. Đồ vải ôm đầu giữ cỡ gốc.
   Còn đúng MỘT đơn đặt vẽ lại: `Helm_Egypt` gốc (nemes 3.2 đầu — vải rủ, không bóp được).
   Sửa xong neo phải bấm **«★ 15 nền văn minh — art theo CẤP + asset»** để bake (file
   `.headanchor.json` nằm trong tầm quét `NewestInFolder` nên bảng điều khiển tự VÀNG).

2c-ter. **HAI NỀN KHÁC NHAU PHẢI KHÁC Ở *MÀU TRỘI* VÀ *BÓNG NGOÀI*, KHÔNG PHẢI Ở CHI TIẾT.**
   Nón vẽ trên canvas 256 px nhưng lên đầu chỉ còn **~44 px** (đầu 34 px × `HelmetHeadRatio`).
   Ở cỡ đó, hoa văn · đinh tán · sắc độ · vân vải **biến mất sạch**; còn lại đúng hai thứ:
   khối màu lớn nhất, và đường bao.
   ⚠ Đã dính: **Đông La Mã** và **Mông Cổ** đều là "vòm thép xám + một cái đai", khác nhau ở
   chất liệu đai và mấy búi lông — đứng cạnh nhau ở cỡ thật thì **không phân biệt nổi**, dù
   mở file 256 px ra xem thì rõ ràng là hai cái nón khác nhau. Nay Đông La Mã là **vàng**
   (sống vàng dọc đỉnh + đai vàng dày + diềm dài) còn Mông Cổ là **nâu** (vành lông là mảng
   lớn nhất) và đổi vòm tròn thành **hình NÓN**.
   ⚠ Vành lông đừng vẽ rộng quá: thử 88 px thì bóng ngoài ra cái **ĐĨA BAY**, không ra cái mũ.
   ⚠ **VÒM PHẢI CAO ~96 px TRÊN VÀNH** (canvas 256). Khăn hải tặc từng vẽ bằng một hình bầu
   dục rồi CẮT PHẲNG đáy nên chỉ còn **52 px** — bằng nửa mọi nón khác — và thu nhỏ ra một
   **viên thuốc đỏ dẹp** nằm hờ trên đầu, cả khối sọ đen hở nguyên ra dưới. Dùng chung helper
   `Dome` với mấy nón sắt là hết: cùng chiều cao thì cùng đọc ra "đội trên đầu".
   ⚠ **MỌI NÓN PHẢI CÓ GÌ ĐÓ DƯỚI VÀNH** (diềm gáy / khăn rủ), không phải để cho đẹp:
   `TryMeasureBrim` **bỏ qua 30% DƯỚI** của tấm art để khỏi ăn phải tấm che gáy. Nón nào
   trống trơn dưới vành thì chính CÁI VÀNH rơi vào vùng bị bỏ qua, tool đo nhầm sang thân nón
   ⇒ sai cỡ, sai chỗ, **không lỗi nào báo**. Và vành phải dựng bằng `Band` (chạy trong khoảng
   y đã cho) chứ ĐỪNG dựng bằng `Ellipse` — bầu dục có hàng rộng nhất ở GIỮA nên nửa dưới
   trùm xuống mặt, đúng lỗi khăn Ottoman.
   ⚠ **CÁCH SOI — render CẢ BỘ lên một cái đầu 34 px rồi NHÌN MỘT LƯỢT.** Soi từng tấm một
   thì tấm nào cũng "ổn"; chỉ khi xếp cạnh nhau mới thấy cái nào trùng cái nào. Đây là phép
   đã tìm ra cả ba lỗi trên. Script:
   `.claude/skills/stickman-assets/scripts/canvas.py` + vòng đo vành (`TryMeasureBrim`).

2d. **ĐỪNG TRỎ VÀO BỘ ART BẰNG CHỈ SỐ — TRỎ BẰNG TÊN.**
   `StickmanArchetype.helmetIndex/decoIndex` là con số trỏ vào mảng `AppearanceSet.helmets`,
   mà mảng đó là KẾT QUẢ QUÉT FOLDER xếp theo tên file. Thay art (đúng quy trình dự án khuyên:
   thả PNG vào folder rồi bấm `Appearance > 2`) là cả bảng xê dịch và mọi chỉ số gõ cứng trỏ
   sang nón của người khác. Đã dính: bộ nón đổi từ `Cap/Great/Norman/Roman/Viking/Winged` sang
   `Conical/Great/Kabuto/Knight/Turban/Viking`, thế là **lính khiên đội nón samurai, lính cận
   chiến quấn khăn xếp, chủ tướng đội mũ hiệp sĩ** — không lỗi nào báo, mỗi archetype vẫn có
   một cái nón, chỉ là nón sai. Đây là họ hàng của luật "SpriteSkin bind theo CHỈ SỐ".
   Nay `StickmanArchetypeBuilder.Helm("Knight")` / `.Face("Frown")` tra theo TÊN và réo trong
   log khi tên không còn.
2e-0. ⚠⚠ **MỘT CỬA GHI CHO ART VĂN MINH — `CivilizationArtGenerator.SaveCivArt`.**
   `CivilizationHelmetArt.Save` từng gọi THẲNG `WeaponArtGenerator.Save`, tức **bỏ qua hoàn
   toàn chốt `_overwrite`** — cái chốt duy nhất giữ cho `GenerateMissing` "chỉ bù file THIẾU".
   Hai thứ hỏng cùng lúc, và cái thứ nhất nặng hơn nhiều:
   · **ĂN MẤT ART THẬT**: thả PNG vẽ tay vào `Sprites/Civilizations/<Nền>/Helm_<Nền>.png` xong
     thì lần dựng scene sau là bị vẽ đè — trong khi tài liệu hứa "art thật không bao giờ bị
     đụng". Đúng quy trình thay art mà dự án khuyên dùng lại là đường mất art.
   · **GIẾT DÂY CHUYỀN DỰNG**: luôn ghi đè nên nó đâm vào file Unity đang MEMORY-MAP →
     `System.IO.IOException: Win32 IO returned 1224` (`ERROR_USER_MAPPED_FILE`).
   Lỗi nằm im lâu vì chỉ 10/15 nền đi đường đó; cho cả 15 đi qua là nó bung ngay.

2e-0f. ⚠⚠ **CHỐT AN TOÀN CÓ THỂ AN TOÀN TỚI MỨC KHÔNG LÀM ĐƯỢC VIỆC GÌ.**
   `StickmanArtSource.CanCodeWrite` đặt mặc định *"tấm chưa mang nhãn = art của NGƯỜI = không
   đè"*. Đúng về ý định, nhưng lúc mới bật hệ nhãn thì **1122/1259 tấm chưa có nhãn** ⇒ mọi
   generator bỏ qua sạch ⇒ tool **chạy xong, báo thành công, không đổi một byte nào** ⇒ 6 mục
   VÀNG trên bảng điều khiển ở lại vàng vĩnh viễn. Người dùng bấm mãi, không lỗi nào báo.
   Ba việc phải làm khi thêm một chốt kiểu này:
   · **DI TRÚ DỮ LIỆU NGAY LÚC BẬT** — đã gắn nhãn cho 299 tấm art gốc trong 7 thư mục
     generator. Bật chốt mà không di trú là bật một cái khoá rồi vứt chìa.
   · **KHAI NGOẠI LỆ THÀNH LUẬT, đừng để nó rơi vào mặc định an toàn** — `<nền>/TierN/` là 100%
     art của code (đổi bảng màu trên tấm gốc), nên `CanCodeWrite` cho ghi đè thẳng. Không khai
     thì 234 tấm có `.meta` CỤT (chưa import xong) sẽ mãi mãi bị coi là art của người.
   · **BỎ QUA THÌ PHẢI NÓI RA** — `StickmanArtSource.ReportSkipped`, gọi từ
     `StickmanBuildPipeline` sau MỖI việc (một chỗ, không bắt từng generator nhớ). Bỏ qua là
     chuyện bình thường; im lặng mới là lỗi.
   ⚠ Dấu hiệu nhận ra từ xa: **một mục vàng bấm xong vẫn vàng**. Mục vàng đo bằng "file nguồn
   .cs mới hơn file kết quả", nên nó chỉ xanh khi tool THẬT SỰ ghi lại file kết quả. Vàng dai
   dẳng = tool đang không ghi gì, không phải tool chạy sai.

2e-0k. ⚠⚠ **NGOẠI LỆ `TierN` ĐÃ BỊ CODE ĐÁNH MẤT — VÀ NÓ VÔ HIỆU HOÁ CẢ QUY TRÌNH ĐẶT ART.**
   Mục 2e-0f ngay trên khai rõ *"`<nền>/TierN/` là 100% art của code, nên `CanCodeWrite` cho ghi
   đè thẳng"*. Nhưng `CanCodeWrite` sau đó rút gọn còn đúng `!File.Exists(path)` — **ngoại lệ
   biến mất**, và từ đó **file `TierN` đã tồn tại thì không đường nào ghi lại được**.
   Hỏng cả dây, hỏng trong im lặng:
   · `EquipmentDefinition.SpriteForTier(1)` trả `tierSprites[0]` = **`<nền>/Tier1/`**, KHÔNG
     phải tấm gốc. Lính trong trận đeo đồ theo CẤP nên thứ hiện ra LUÔN là bản `TierN`;
   · thay art gốc bằng tấm đặt vẽ rồi bấm `Civilizations > 5` thì generator **bỏ qua sạch** vì
     file đã có ⇒ `TierN` giữ nguyên art code cũ ⇒ **nhìn vào game thấy y hệt lúc chưa thay**,
     không một dòng lỗi nào báo.
   ⚠ Triệu chứng đọc ra rất giống "Unity chưa reimport", và đã tốn một vòng chẩn đoán vì vậy.
   **Cách phân biệt trong 5 giây: xem DẤU THỜI GIAN của `<nền>/TierN/*.png`.** Bấm tool xong mà
   ngày vẫn cũ = tool không ghi được, không phải Unity chưa nạp.
   Nay `StickmanArtSource.IsTierArt` trả lại ngoại lệ đó, vẫn chừa tấm mang nhãn `stickman:hand`.

2e-0l. ⚠⚠ **THAY ART TẠI CHỖ THÌ `.meta` CŨ Ở LẠI — KÈM THEO NHÃN `stickman:codegen`.**
   Thả tấm art đặt vẽ đè lên `Helm_China.png` thì `.meta` cũ (và GUID trong đó — điều này ĐÚNG,
   phải giữ) nằm nguyên, nghĩa là dự án vẫn tin tấm art mới là **do code vẽ**. Hai thứ hỏng:
   · `CivilizationArtGenerator.TryDeriveTierFromBaseArt` **từ chối lấy art code-gen làm gốc** →
     bấm sinh cấp là nó VẼ LẠI bằng code, art đặt vẽ không bao giờ lên tới `TierN`;
   · `CleanStaleArt` nhận diện art code-gen bằng NHÃN + KHỔ ẢNH — mà art đặt vẽ theo chuẩn dự án
     cũng đúng 256×256, nên có ngày bị dọn đi thật.
   Chốt: mọi đường NHẬN art phải đóng nhãn `stickman:hand` lên `.meta`, cho cả file mới tạo lẫn
   **file cũ được giữ lại** — chính vế thứ hai mới là chỗ đã dính.
   (`.claude/skills/stickman-assets/scripts/intake_gear.py` → `mark_hand`.)

2e-0m. ⚠ **BỐN SCRIPT INTAKE TỪNG TRỎ VÀO `E:\XoiGame\AssetStickMan`** — đường dẫn không còn tồn
   tại, nên cả bốn chết lặng: chạy xong báo "không thấy file nào" chứ không báo sai đường dẫn.
   Nay `ROOT` suy từ `__file__`, đổi chỗ dự án hay chép sang máy khác đều không hỏng nữa.

2e-0j. ⚠⚠ **SINH ART PHẢI BẤT BIẾN: KHÔNG GHI LẠI THỨ KHÔNG ĐỔI.**
   Phép đo quyết định: `Assets/Sprites/Weapons/Square.png` **MỞ GHI ĐƯỢC từ tiến trình khác
   ngay lúc Unity đang chạy** ⇒ không có ai khoá file. `Win32 IO 1224`
   (`ERROR_USER_MAPPED_FILE`) nghĩa là **chính Unity đang MAP tấm ảnh vào bộ nhớ**, và Windows
   từ chối GHI ĐÈ (không từ chối mở). `ReleaseCachedFileHandles` không nhả được mapping đó, và
   `DeleteAsset` cũng không, vì asset đang được tham chiếu.
   Nhưng phần lớn những lần "ghi lại" ấy là **ghi đúng cái đang có**: generator chạy lại cùng
   một hàm vẽ với cùng đầu vào thì ra cùng một dãy byte. `StickmanArtSource.WritePng` nay SO
   BYTE trước; giống thì chỉ **chạm lại dấu thời gian** (thao tác METADATA, không đụng vùng nhớ
   đã map nên không bao giờ hỏng), và bên gọi **bỏ luôn `ImportAsset`** — không có gì để import
   thì cũng không có `.meta` nào phải ghi, tức cắt luôn cả lỗi báo ở `AssetDatabase.Refresh()`.
   ⚠ Vẫn gọi `ConfigureImporter`: nó chỉ ghi `.meta` khi cài đặt THẬT SỰ đổi, nên không mất vế
   "sửa bảng số (VD `HelmetBrimLift`) xong bấm lại nút là thấy".
   ⚠ Đây là cách nghĩ đúng hơn về bản chất, không chỉ là bản vá: **sinh art nên là thao tác BẤT
   BIẾN** — chạy mười lần ra một kết quả, và từ lần thứ hai gần như không tốn gì.
   ⚠ BÀI HỌC CHẨN ĐOÁN (lượt thứ SÁU của cùng một triệu chứng): năm lượt trước đều xoay quanh
   *"gọi ít lại"* (gộp reimport · bỏ `OnGUI` · giữ thư mục · gom mẻ · đổi API). Cái mở được nút
   thắt là một PHÉP ĐO đơn giản — *"tiến trình khác có ghi được file này không"* — vì nó loại
   trừ được cả một họ giả thuyết trong một bước.

2e-0k3. ⚠⚠ **TOOL CHỈ-LẤP-CHỖ-TRỐNG KHÔNG ĐƯỢC HỎI "CẦN CHẠY LẠI KHÔNG".**
   Anh em với mục ngay dưới, nhưng chữa bằng cách KHÁC — và phải phân biệt hai ca:

   | Loại tool | Chạy lại có chạm file kết quả không | Cách đo |
   |---|---|---|
   | GHI ĐÈ (sinh art theo cấp · dọn art lỗi thời) | CÓ — `WritePng` ghi hoặc chạm mtime | đo stale bình thường |
   | **CHỈ LẤP CHỖ TRỐNG** (`★ Vẽ bù art còn thiếu`) | **KHÔNG** — `CanCodeWrite` trả false cho mọi tấm ĐÃ CÓ | **`skipStaleCheck: true`** |

   Tool loại hai không có quyền cập nhật art đã có (art của người dùng là bất khả xâm phạm —
   LUẬT NGUỒN ASSET), nên chạy nó xong **không file nào đổi dấu thời gian**. Hỏi nó "cần chạy
   lại không" thì mục **vàng vĩnh viễn, bấm bao nhiêu lần cũng vậy** — và cái vàng đó còn VÔ
   NGHĨA: nó giục người dùng làm một việc BẤT KHẢ THI. Loại này chỉ có hai trạng thái đáng
   nói: ĐỎ (còn thiếu tấm nào đó) và XANH (đủ). Muốn vẽ lại art code cũ thì đó là việc của nút
   *Dọn art code-gen lỗi thời* — nút ĐÓ mới thật sự ghi đè, và nó vẫn được hỏi stale như thường.

   ⚠ **PHÉP TỰ KIỂM khi thêm tool mới:** tự hỏi *"bấm nó LẦN THỨ HAI thì có file nào đổi dấu
   thời gian không?"*. Không → `skipStaleCheck: true`.

2e-0k5. ⚠ **NÚT «CHẠY» PHẢI LUÔN NẰM TRONG TẦM BẤM.** Hàng việc vẽ bằng
   `Label(Width(190))` + `FlexibleSpace` + nút: cửa sổ hẹp (hoặc rộng quá màn hình) thì cái
   nhãn CỨNG đẩy nút ra ngoài vùng vẽ — nút vẫn ở đó nhưng **bấm không tới**, và người dùng
   đọc ra "tool này hỏng". Dùng `MaxWidth` cho mọi nhãn phụ nằm cùng hàng với một cái nút.

   ⚠⚠ **VÀ LUẬT ĐÓ CÒN SÓT ĐÚNG HÀNG QUAN TRỌNG NHẤT** (dính 2026-09-04, người dùng báo
   *"không thể bấm tools, mở được bảng điều khiển"*). Bản vá cũ chỉ chữa `DrawReadinessRow`
   (nhãn PHỤ), còn `DrawToolRow` — hàng của TỪNG TOOL, thứ chiếm gần hết bảng — vẫn viết
   `Label(tool.Title, EditorStyles.boldLabel)` **không MinWidth**. `boldLabel` không xuống
   dòng nên bề rộng TỐI THIỂU của nó bằng cả dòng chữ, mà tiêu đề dài nhất là 52 ký tự
   (~338 px) trong khi cột nội dung ở `minSize` 560 (trừ 148 px cột tab + thanh cuộn) chỉ còn
   ~390: cộng chấm 16 + nhãn «ghi đè» 44 + nút 56 là **TRÀN**, nút «Chạy» nằm ngoài vùng vẽ.
   Cùng bệnh ở `DrawUnregistered` (đường dẫn menu là chuỗi dài nhất bảng) và
   `DrawBuildGroupRow`. **Luật đầy đủ: MỌI nhãn nằm cùng hàng với một cái nút phải co được —
   nhãn phụ dùng `MaxWidth`, nhãn TIÊU ĐỀ dùng `MinWidth`.**

   ⚠ Kèm theo: trong lúc dây chuyền ĐANG CHẠY thì mọi nút «Chạy» bị khoá CÓ CHỦ Ý
   (`EditorGUI.DisabledScope(StickmanBuildPipeline.IsRunning)`) — đó không phải lỗi.
   ⚠⚠ **NHƯNG LỜI GIẢI THÍCH PHẢI HIỆN Ở MỌI TAB.** Bản cũ vẽ dòng cảnh báo + nút «Dừng hàng
   đợi» trong `DrawStartTab` **mà thôi**, nên ai đang đứng ở tab Vũ khí / Nhân vật / AI chỉ
   thấy một bảng toàn nút XÁM: không một dòng nào nói vì sao, không đường nào thoát. Đây đúng
   cái bẫy mà huy hiệu `⚠ N việc chưa chạy` đã phải chữa một lần (*"việc còn nợ mà chỉ nằm
   trong tab Bắt đầu thì người đang làm dở việc khác không bao giờ nhìn thấy"*) — lặp lại
   nguyên xi cho TRẠNG THÁI KHOÁ. Nay `DrawRunningBanner()` gọi từ `OnGUI`, ngay sau
   `DrawToolbar()` và **TRƯỚC vùng cuộn** (`GUIUtility.ExitGUI()` trong đó mà nằm giữa một
   khối layout đang mở là Unity nhả một tràng lỗi `EndHorizontal` không khớp).
   ⚠ Vế "kẹt thật" có tồn tại, không phải chỉ là hiểu nhầm: `Tick` thoát sớm khi
   `EditorApplication.isUpdating`, nên lúc Unity treo ở khâu nhập asset thì thanh tiến trình
   (chỗ chứa nút Huỷ) KHÔNG BAO GIỜ được vẽ — `Cancel()` từ bảng là đường ra duy nhất.

   ⚠⚠ **THANH TIẾN TRÌNH SỐNG LÂU HƠN HÀNG ĐỢI, VÀ MỘT THANH BỎ QUÊN THÌ NUỐT MỌI CÚ BẤM CỦA
   CẢ EDITOR.** `_running` là `static` nên nạp lại domain (sửa script · vào Play · đổi
   platform) là hàng đợi biến mất — nhưng `DisplayCancelableProgressBar` đã vẽ ra rồi thì
   `Finish`/`Cancel` không còn cơ hội gọi `ClearProgressBar`. Unity nhìn như treo: cửa sổ vẫn
   vẽ, bấm gì cũng không ăn. Chốt: `StickmanBuildPipeline.ClearStaleProgressBar`
   (`[InitializeOnLoadMethod]`) dọn ngay lúc nạp domain — không còn hàng đợi thì cũng không
   còn thanh nào là thật.

2e-0k2. ⚠⚠ **"KHÔNG GHI LẠI THỨ KHÔNG ĐỔI" MÀ QUÊN CHẠM DẤU THỜI GIAN = MỤC VÀNG KHÔNG BAO
   GIỜ TẮT ĐƯỢC.** Mục 2e-0j ngay trên khai đúng cách làm (*"giống thì chỉ chạm lại dấu thời
   gian"*), nhưng code sau đó **bỏ mất vế chạm** — giữ nguyên cả nội dung lẫn mtime. Mà
   `StickmanReadiness.IsStale` đo bằng **SO mtime**: bất kỳ file kết quả nào cũ hơn file `.cs`
   nguồn là VÀNG. Chuỗi khép kín và im lặng hoàn toàn:

   | Bước | Chuyện gì xảy ra |
   |---|---|
   | 1 | ai đó sửa `WeaponArtGenerator.cs` — **kể cả một dòng chú thích** → mục chuyển VÀNG |
   | 2 | bấm «Chạy» → generator vẽ lại đúng dãy byte cũ → `WritePng` thoát sớm, không đụng gì tới file |
   | 3 | mtime PNG giữ nguyên ⇒ vẫn cũ hơn `.cs` ⇒ **vẫn vàng** |

   Bấm mười lần cũng vậy, không một dòng log nào nói vì sao — đúng cái vòng im lặng mà Bảng
   điều khiển sinh ra để chữa. Nay `StickmanArtSource.TouchQuietly` dời mtime lên hiện tại
   ngay trong nhánh `unchanged`.
   ⚠ An toàn vì là thao tác METADATA: không đụng vùng nhớ Unity đang MAP tấm ảnh vào, nên
   không dính `Win32 1224` như một lượt ghi đè nội dung. Vế "không gây bão reimport" vẫn
   còn nguyên: bên gọi vẫn bỏ `ImportAsset` khi `unchanged`, `ConfigureImporter` chỉ ghi
   `.meta` khi cài đặt THẬT SỰ đổi.
   ⚠ **LUẬT CHUNG:** tool nào được `StickmanReadiness` đo bằng mtime thì mỗi lần chạy
   **PHẢI ĐỂ LẠI DẤU TRÊN ĐĨA**, kể cả khi kết quả trùng khít bản cũ. Không để lại dấu thì
   "đã chạy" và "chưa chạy" nhìn giống hệt nhau — và bảng điều khiển nói dối theo hướng
   tồi nhất: bắt người dùng bấm một nút không bao giờ xong.

2e-0i. ⚠⚠ **`SaveAndReimport` LÀ SAI API KHI CẤU HÌNH IMPORTER HÀNG LOẠT — DÙNG
   `AssetDatabase.WriteImportSettingsIfDirty`.**
   `SaveAndReimport()` = ghi `.meta` **+ import ĐỒNG BỘ NGAY**. Gọi vài trăm lần liên tiếp thì
   các lượt import giẫm lên nhau và Unity ném `Cannot open file '....png.meta' for write` —
   rải rác, không tất định, ở **cả thư mục gốc lẫn `TierN`**.
   ⚠ Đã ĐO để loại trừ: file **không** read-only (`-rw-r--r--`, attribute `A`), và mtime cho
   thấy Unity ghi được ở lượt sau → là **đụng độ**, không phải quyền, không phải file bị khoá.
   `WriteImportSettingsIfDirty` chỉ GHI `.meta` rồi đánh dấu cần import lại; **một
   `AssetDatabase.Refresh()` ở cuối generator** import gộp tất cả trong một lượt.
   ⚠ `Refresh()` là BẮT BUỘC — thiếu nó thì pivot/PPU/nhãn nguồn art chưa vào hiệu lực và tấm
   art nhìn ra sai cỡ/sai chỗ mà không lỗi nào báo.
   ⚠ KHÁC HẲN `StartAssetEditing` (đã thử và bỏ ở 2e-0h): batch hoãn **cả `DeleteAsset`** nên
   phá mất bước tự cứu của `WritePng`; cái này chỉ hoãn đúng bước IMPORT.

2e-0g. ⚠⚠ **MỘT CỬA GHI PNG CHO CẢ DỰ ÁN — `StickmanArtSource.WritePng`.**
   `Win32 IO 1224` (`ERROR_USER_MAPPED_FILE`) và `Cannot open file '...' for write` là **cùng
   một bệnh**: Unity map file texture vào bộ nhớ, ghi đè một PNG đang được nạp làm `Sprite` là
   hỏng, và **không tất định**. Ba bước tự cứu, rẻ → đắt: ghi thẳng → `ReleaseCachedFileHandles`
   → `AssetDatabase.DeleteAsset` (Unity tự nhả mapping, `File.Delete` thì không) → hết thì
   **cảnh báo rồi đi tiếp**.
   ⚠ Có **BA** generator tự ghi PNG (`WeaponArtGenerator` · `StickmanEnvironmentArt` ·
   `StickmanBuildingArt`). Lúc chỉ cái đầu có lớp chịu lỗi thì `Sky_Night.png` của bối cảnh
   vẫn ném thẳng và **giết cả dây chuyền**. Thêm generator mới → dùng `WritePng`, đừng gọi
   `File.WriteAllBytes`.
   ⚠⚠ **BƯỚC `DeleteAsset` PHẢI GIỮ `.meta` LẠI** (16/09/2026). `DeleteAsset` xoá cả `.meta`
   ⇒ **GUID mới** ⇒ mọi tham chiếu tới tấm đó chết trong im lặng; đo được:
   `FantasyRaceParts_v3.png` được `Genre_Fantasy_CrystalGrove.unity` trỏ tới **240 lần**. Nay
   `WritePng` sao lưu `.meta` (và PNG cũ) trước khi xoá, ghi `.meta` trở lại ngay sau khi ghi
   được nội dung mới rồi `ImportAsset` — GUID và toàn bộ sprite rect/pivot giữ nguyên; ghi
   trượt cả ba bước thì trả PNG cũ về chỗ cũ.
   ⚠ **Đo được bằng Doctor**: nhóm *«Tool ghi file trong Assets/ mà KHÔNG qua chốt chịu lỗi
   ghi»* (`StickmanDoctor.ArtSource.cs`) đếm mọi `File.WriteAllBytes` còn sót trong
   `Assets/Editor/`, trừ bảng miễn trừ `RawWriteExempt` (chính cái chốt · tool ghi ra ngoài
   `Assets/`). Bằng chứng nó cần tồn tại: `FantasyRaceArtBuilder` là generator thứ tư, viết
   sau khi luật này đã có, vẫn `File.WriteAllBytes` thẳng — và ngày 16/09/2026 nó ném
   `Win32 1224` trên `FantasyRaceParts_v3.png`, **dừng cả dây chuyền** tại việc «Xử lý đầu
   Fantasy 9 chủng».

2e-0h. ⚠⚠ **ĐỪNG DÙNG `StartAssetEditing` TRONG DỰ ÁN NÀY — ĐÃ GỠ HẾT.**
   Hai mặt trái, và mặt thứ hai mới là mặt nặng:
   · **Phá cơ chế tự cứu**: trong batch, `AssetDatabase.DeleteAsset` bị HOÃN, nên bước nhả
     mapping của `StickmanArtSource.WritePng` không nhả được gì; mọi lỗi dồn về
     `StopAssetEditing` và báo với **một tên file ngẫu nhiên**, khó lần hơn hẳn bản không gom.
   · ⚠⚠ **Depth của `StartAssetEditing` là trạng thái NATIVE, sống tới khi ĐÓNG EDITOR.** Một
     lần ngoại lệ thoát ra giữa Start và Stop là AssetDatabase kẹt ở chế độ "đang sửa asset"
     cho CẢ PHIÊN, và từ đó **mọi lượt ghi `.meta` đều hỏng** — kể cả sau khi đã sửa code, vì
     code mới không gỡ được trạng thái cũ. **Cách duy nhất thoát là khởi động lại Unity.**
   ⚠ DẤU HIỆU NHẬN RA: lỗi `Cannot open file '....meta' for write` mà **file đo được là GHI
   ĐƯỢC từ tiến trình khác** (thử `open(path,"wb")` rồi ghi lại đúng nội dung cũ). Ghi được từ
   ngoài + Unity từ chối = trạng thái NỘI BỘ của Unity, không phải khoá file → **restart
   Editor**, đừng sửa code thêm.
   Ghi từng tấm chậm hơn nhưng **mỗi tấm tự cứu được mình**, và `WriteImportSettingsIfDirty`
   vốn đã không import đồng bộ nên batch cũng chẳng còn để làm gì.


2e-0e. ⚠⚠ **ĐỪNG XOÁ THƯ MỤC RỒI TẠO LẠI VÀ GHI VÀO NGAY — GỐC THẬT CỦA
   `Cannot open file '...png.meta' for write`.**
   Bằng chứng chỉ đúng một hướng, và nó nằm ngay trong thông báo lỗi: **mọi lần lỗi đều ở thư
   mục `TierN`, chưa lần nào ở thư mục gốc** — `Arab/Tier2` · `Arab/Tier5` · `India/Tier3` ·
   `Rus/Tier1`. Thư mục gốc không bao giờ bị xoá/tạo lại nên không bao giờ hỏng.
   `DeleteWeaponSkinTiers` gọi `AssetDatabase.DeleteAsset(folder)` xoá **cả thư mục**, rồi
   trong CÙNG một mẻ dựng `GenerateGearTiers` tạo lại đúng thư mục đó và ghi PNG vào ngay.
   AssetDatabase còn đang giữ trạng thái "vừa xoá" nên không ghi nổi `.meta` cho file bên trong.
   Chữa: **xoá FILE, giữ THƯ MỤC.** Ngữ nghĩa không đổi — `EnsureWeaponSkinTiers` vốn dò bằng
   "thư mục này còn sprite nào không".
   ⚠ Nửa thứ hai cùng bệnh: `AssetDatabase.CreateFolder` gọi BÊN TRONG `StartAssetEditing` bị
   HOÃN tới lúc flush, nên file ghi vào một thư mục AssetDatabase chưa biết. Dựng sẵn mọi thư
   mục **trước** khi mở mẻ.
   ⚠⚠ **BÀI HỌC CHẨN ĐOÁN, đắt hơn bản vá:** tôi đã đổ lỗi hai lần cho SỐ LƯỢNG reimport
   (gộp 3 lần `SaveAndReimport` còn 1, rồi gom mẻ) — cả hai đều là cải tiến thật nhưng **không
   chữa được lỗi**, chỉ DỜI chỗ nó báo (`ConfigureImporter` → `StopAssetEditing`). Manh mối
   quyết định nằm ngay trong đường dẫn của thông báo lỗi ngay từ đầu: *chỉ `TierN` mới hỏng*.
   **Hỏi "cái hỏng khác cái không hỏng ở chỗ nào" trước khi tối ưu.**

2e-0d. ⚠⚠ **KHÔNG SINH ART TRONG `OnGUI` — BẢNG ĐIỀU KHIỂN PHẢI XẾP VÀO DÂY CHUYỀN.**
   Triệu chứng: bấm «Chạy» hoặc «Chạy lại hết N việc này» trên `★ Bảng điều khiển` thì việc
   **không hoàn thành**, kèm `Cannot open file '...png.meta' for write`. Stack chỉ thẳng thủ
   phạm: `StickmanToolCenter.OnGUI` → `DrawStale` → `RunAllStale` → generator.
   `StickmanToolCenter.Invoke` và `StickmanReadiness.RunBatch` gọi `tool.Run()` **ngay tại
   chỗ**, tức chạy trọn một generator BÊN TRONG một sự kiện GUI. Mà mấy tool đó không hề nhỏ:
   *"Sinh skin vũ khí theo CẤP cho 15 nền"* ≈ **750 tấm PNG**, và nút chạy-hàng-loạt nối năm
   generator như vậy trong CÙNG một sự kiện — hơn hai nghìn `SaveAndReimport` đồng bộ, không
   có một biên frame nào để Unity hoàn tất lượt import trước.
   ⚠ Dự án ĐÃ có lời giải và đã ghi ngay ở mục dây chuyền dựng (*"ĐỪNG CHẠY TRONG MỘT FRAME"*),
   nhưng bảng điều khiển đi đường riêng: **Job** thì qua `StickmanBuildPipeline`, còn **Tool**
   thì gọi thẳng. Nửa vời, và nửa bị bỏ lại đúng là nửa nặng hơn.
   Nay cả hai đều xếp vào `StickmanBuildPipeline` (nhóm −1 = "việc lẻ bấm tay"). Sửa ở
   `Invoke` vì đó là NÚT THẮT — cả ba chỗ bấm trên bảng đều đi qua nó.
   ⚠ Vế thứ hai, cho việc NẶNG NẰM GỌN TRONG MỘT JOB: bọc vòng sinh art theo CẤP bằng
   `AssetDatabase.StartAssetEditing/StopAssetEditing`. An toàn ở ĐÚNG chỗ đó vì đường theo cấp
   không dùng giá trị trả về của `Save`; và `StickmanArtSource.CanCodeWrite` phải hỏi
   `File.Exists` chứ KHÔNG hỏi `LoadAssetAtPath` — trong batch hàm kia trả null cho file có
   thật, tức chốt chống-ghi-đè lặng lẽ mở toang.

2e-0c. ⚠⚠ **MỖI TẤM ART CHỈ ĐƯỢC TỐN MỘT LẦN `SaveAndReimport`.**
   Triệu chứng: `Failed to write meta file` · `Cannot open file '...png.meta' for write` giữa
   lúc dây chuyền đang chạy — nhìn như file bị khoá bởi chương trình khác, thật ra là **Unity
   không kịp nhả `.meta` của lượt import trước**.
   Đường ghi từng tốn **BA** lần cho MỖI tấm: `ConfigureImporter` (cỡ + pivot) → chấm pivot
   theo điểm neo → đóng nhãn nguồn art. Nhân với ~1200 tấm (kể cả bản theo cấp) là hơn ba
   nghìn lần import ĐỒNG BỘ nối đuôi nhau trong một mẻ dựng.
   Ba cách chữa, làm cả ba:
   · **BIẾT PIVOT TỪ TRƯỚC** — `StickmanAnchorPivots.TryAnchorPivot` đo điểm neo trên CHÍNH
     CANVAS vừa vẽ (chưa cần import), nên pivot + cài đặt + nhãn gộp vào một lần import.
   · **BỎ BẢN THEO CẤP khỏi `StampAll`** — `<nền>/TierN/` chỉ đổi bảng màu, hình y hệt bản gốc
     ⇒ pivot y hệt. Chấm lại ~960 tấm là tính lại một kết quả đã biết, và chính nó gây lỗi
     (đã dính ở `Arab/Tier2` và `Arab/Tier5`).
   · **GOM MẺ + BÁO MỀM** — vòng nào buộc phải chấm nhiều tấm thì bọc
     `AssetDatabase.StartAssetEditing/StopAssetEditing`, và một `.meta` ghi hỏng thì **cảnh báo
     rồi đi tiếp**, đừng ném ra ngoài (`StickmanBuildPipeline.Tick` bắt exception là dừng cả
     dây chuyền — mất 30 việc vì một tấm art).
   ⚠ Bọc batch CHỈ an toàn cho vòng **đụng importer**; bước SINH ART thì vẫn cấm, vì trong
   batch `LoadAssetAtPath` trả null (xem luật đã có ở mục dây chuyền dựng).
   ⚠⚠ **VÀ ĐỪNG ĐỌC LẠI TẤM VỪA GHI QUA IMPORTER — ĐỌC BYTES TRÊN ĐĨA.** (16/09/2026,
   `FantasyRaceArtBuilder`) Đây là chỗ một `.meta` ghi hỏng thôi cảnh báo và thành **ném lỗi
   giết cả dây chuyền**: builder `File.WriteAllBytes` tấm atlas → `isReadable = true` →
   `SaveAndReimport` → `GetPixels32` để đo bounds. Unity còn giữ file mình vừa ghi nên lượt
   `.meta` ấy trượt ⇒ `isReadable` KHÔNG vào ⇒ `GetPixels32` ném
   `texture data is either not readable, corrupted or does not exist`. Đo được: PNG ghi
   **11:56:34**, meta hỏng **11:56:35**, file **không** read-only — đụng độ, không phải quyền.
   Ba lần `SaveAndReimport` cho MỖI atlas (bật readable → cắt → tắt readable) là bản vi phạm
   chính mục này. Chữa: `File.ReadAllBytes` + `LoadImage` (bản đọc được, huỷ sau khi dùng), và
   bounds đo trên **chính mảng pixel vừa ghi ra file** — không cần đọc lại gì cả.
   ⚠ Hai cái lợi kèm theo, và cái thứ hai mới là lỗi thật sự nguy hiểm: bytes trên đĩa cho
   ĐÚNG độ phân giải gốc (không bị `maxTextureSize` hạ), còn lượt `isReadable = false;
   SaveAndReimport()` ở CUỐI dùng lại đối tượng importer **cũ từ trước bước cắt** nên ghi đè
   cài đặt bằng dữ liệu cũ — đo được `maxTextureSize` trong `.meta` nằm ở **2048** trong khi
   code đặt 4096 và `FantasyRaceParts_v3.png` thật là **2276 × 4096**, tức atlas đang bị hạ
   nét trong im lặng.

2e-0b. ⚠⚠ **CHẤM PIVOT NGAY LÚC GHI FILE, ĐỪNG ĐỂ DÀNH CHO BƯỚC SAU.**
   Art ghi ở `CivilizationArtGenerator.Save` (pivot mặc định = giữa ảnh) còn pivot chấm ở
   `StickmanCivilizationBuilder.BuildAssets` → `StampAll`, tức **SAU** bước sinh art. Giữa hai
   chỗ đó có một cái nổ (dây chuyền chết trong `EnsureAll`) là để lại **art mới với pivot chưa
   chấm** — đo được **24/45 cái nón còn `0.5, 0.5`** trong khi 21 tấm kia đã chấm. Không lỗi
   nào báo; nhìn vào chỉ thấy vài cái nón lệch khỏi đầu và tưởng công thức đặt nón sai.
   Nay `Save` gọi `StickmanAnchorPivots.StampOne` ngay sau khi ghi — file ra đĩa là pivot đã
   đúng, không còn khoảng hở nào để nổ vào. `StampAll` vẫn giữ cho art người dùng THẢ TAY vào
   folder (đường đó không đi qua `Save`).
   ⚠ Soi bằng `Civilizations > 6` — nó báo cột *CHƯA CHẤM PIVOT*. Phân biệt bằng
   `spriteAlignment == Custom`, KHÔNG bằng `sprite.pivot` (giá trị mặc định cũng là tâm, nên
   đọc `sprite.pivot` thì "đã chấm vào tâm" và "chưa chấm bao giờ" giống hệt nhau).

2e-1. ⚠⚠ **BIẾN TĨNH `_tierFolder` PHẢI RESET TRONG `finally`.**
   `GenerateGearTiers`/`GenerateWeaponSkinTiers` đặt `_tierFolder = "TierN"` rồi trả về null ở
   cuối. Nổ giữa vòng lặp thì nó **nằm lại tới hết phiên Editor**, và từ đó MỌI lần sinh art
   bản GỐC ghi nhầm vào `<nền>/TierN/`. Không lỗi nào báo cho tới lúc đụng một file bị khoá —
   triệu chứng đọc ra là *"dây chuyền chết ở `Viking/Tier1/Helm_Viking.png`"* trong khi hàm
   đang chạy (`GenerateMissing`) lẽ ra KHÔNG BAO GIỜ chạm tới thư mục Tier nào.

2e-2. ⚠ **`Win32 IO 1224` KHÔNG PHẢI LỖI CỦA NGƯỜI VIẾT GENERATOR** — Unity map thẳng file
   texture vào bộ nhớ, nên ghi đè một PNG vừa được nạp làm `Sprite` có thể hỏng, và **không
   tất định**: cùng một lệnh bấm, lần này qua lần sau chết. `WeaponArtGenerator.WriteBytes` nay
   ghi → hỏng thì `AssetDatabase.DeleteAsset` (Unity tự nhả mapping, `File.Delete` thì không)
   → ghi lại → vẫn hỏng thì **cảnh báo rồi ĐI TIẾP**. Bỏ qua một tấm art còn hơn để một file
   bị khoá giết cả 30 việc của mẻ dựng.

2e-3. ⚠ **NÚT "DỌN ART LỖI THỜI" PHẢI DỌN CẢ BỘ `TierN`.** Dọn bản gốc mà giữ bộ cấp là hai
   thế hệ art lại đứng cạnh nhau, lần này lẫn ngay trong một cây. `CleanStaleArtSilent` đã làm
   đúng, còn `RegenerateStaleArt` (nút bấm tay) thì sót — bắt người dùng nhớ bấm thêm mục 4+5,
   đúng thứ LUẬT VÀNG cấm. Nay cả hai cùng `DeleteWeaponSkinTiers()` + `EnsureWeaponSkinTiers()`.

2e. **ART SINH BẰNG CODE KHÔNG TỰ CẬP NHẬT THEO CODE.** `GenerateMissing` cố ý bỏ qua file đã
   có (để không đè mất art thật) — nhưng vế đó cũng có nghĩa là sửa luật vẽ xong thì mấy tấm
   sinh từ trước NẰM LẠI MÃI, và dự án tồn tại hai thế hệ art song song (người chơi nhìn ra
   ngay: nền này nón vẽ đàng hoàng, nền kia còn là mấy tấm ván xếp chồng).
   Nút `Civilizations > 0. Dọn art code-gen lỗi thời` xoá rồi vẽ lại, chấm bằng **ĐỦ CẢ HAI**:
   KHỔ ẢNH đúng khổ generator (96×72 nón · 60×80 giáp · 76×92 khiên — art thật không tấm nào
   trùng) **VÀ** cũ hơn `CivilizationArtGenerator.cs`. Thêm khổ canvas mới trong generator thì
   phải nối vào `GeneratedSizes`, không thì art khổ đó không bao giờ được dọn.
2f. **LUẬT VẼ GIÁP — BIÊN DẠNG NGƯỜI, KHÔNG PHẢI CÁI HỘP.** Cùng luật 1 của bộ nón, chỉ là
   trước đây chưa ai áp xuống giáp: helper `Torso` đúng nghĩa đen là `Rect(5,5,54,74)`, và
   `Fauld` + mọi thắt lưng đều là `Rect` chạy hết bề ngang. Mỗi nền vẽ hoa văn rất công phu
   lên trên, nhưng thứ mắt đọc TRƯỚC TIÊN là SILHOUETTE — mà silhouette là cái hộp có sọc.
   13/14 nền dính (chỉ `Armor_Japan` là art thật nên thoát).
   Nay `TorsoProfile` cho biên dạng **NGỰC NỞ → EO TÓP → VÁY GIÁP LOE**, và:
   · `BandOnTorso` — dải ngang bám sườn giáp, `inset` giữ cho luôn HẸP HƠN thân ở hàng đó;
   · `Fauld` — mỗi phiến CONG theo thân, mép dưới thu vào dần nên đọc ra "tấm này đè tấm kia";
   · `SaveArmor` — CẮT sạch phần lọt ra ngoài khối rồi mới ghi. Nhờ bước này mà 14 nền **không
     phải sửa dòng nào** cho mấy cái thắt lưng vẽ bằng `Rect` chạy hết bề ngang.
   ⚠ **Cắt xong PHẢI KẺ LẠI VIỀN SƯỜN.** Dải chạy hết bề ngang phủ luôn hai cột viền; cắt chỉ
   bỏ phần ngoài khối chứ không trả lại viền → viền thủng đúng chỗ cái đai, và một khối liền
   có viền bị thủng thì mắt lại đọc ra "mấy mảnh rời" — về đúng chỗ xuất phát.
   ⚠ Kẻ lại viền phải giữ **MỘT SILHOUETTE LIỀN**: không tạo chỏm vai/miếng vai nhô ra,
   không kẻ đường chia thân thành các tấm rời.
2f-tay. ⚠⚠ **GIÁP LÀ THÂN ÁO/TUNIC LIỀN, KHÔNG VẼ CẦU VAI · TAY ÁO · LỖ NÁCH** (chốt
   2026-09-11). Giáp là một tấm thân kín nhìn ngang +X: không cầu vai rời, không ống tay/tay
   áo, không bao tay/cổ tay/bàn tay, không lỗ nách/armhole opening và không khoảng khoét.
   Mép vai là đường dốc liền vào thân; cổ áo, eo/đai và tà áo cong được phép để vẫn đọc ra
   áo/tunic tham khảo trung cổ, không biến thành hình hộp. Cánh tay thật là hai que ĐEN RỜI do
   `armR`/`armL` + IK điều khiển — vẽ tay chết trên sprite thân sẽ đứng yên khi tay vung và
   mắt đọc thành hai bộ tay.
   Prompt đặt ChatGPT phải nói rõ *"solid torso-only tunic, strict side view facing +X, no
   shoulder pads, no sleeves, no armholes or armpit openings, no gauntlets, no wrists, no
   hands"*; code vẽ bù cũng không thêm helper cho vai/tay rời.
2f-hop. **BIÊN DẠNG GIÁP: CÓ DÁNG ÁO, KHÔNG PHẢI CÁI HỘP** (chốt 2026-09-11, thay cách
   diễn đạt cũ). Khối liền phải có ngực hơi cong, vai dốc, cổ áo nhỏ, eo/đai và tà áo cong
   kiểu tunic trung cổ; nhận diện nền nằm ở màu/chất liệu/chi tiết phủ lên. Không khoét lỗ để
   mô phỏng nách, không tách cầu vai/tay áo. `SaveArmor` vẫn cắt phần thừa và kẻ lại viền,
   nhưng mục tiêu là **một silhouette áo liền, viền liên tục**, không phải một hộp có sọc.

3b. **GẮN RENDERER LÚC CHẠY THÌ PHẢI ÉP CẢ `sortingLayerID`, không chỉ `sortingOrder`.**
   Renderer so **LAYER TRƯỚC**, order sau. Rig nằm layer `character`, còn object tạo lúc chạy
   rơi vào `Default` → nón order 8 vẫn CHÌM SAU cái đầu order 6; và hai layer chồng nhau thì
   Unity xếp tiếp theo KHOẢNG CÁCH CAMERA nên thứ tự **đảo qua đảo lại tuỳ frame**
   ("nón lúc trên lúc dưới"). Dùng `StickmanSorting.RigSortingLayer(component)`.
   Đã dính ở `StickmanAppearance.ApplyLayer` (mặt + nón overlay) — `StickmanEquipment` thì
   không dính vì đã ép sẵn. Bậc đầu: đầu 6 · **tóc/râu overlay 7** · **nón 8** (cả overlay lẫn
   trang bị, để cùng bậc vì không bao giờ đội hai nón cùng lúc).

2g-sort. ⚠⚠ **MỖI NHÂN VẬT PHẢI LÀ MỘT KHỐI VẼ RIÊNG** (`StickmanSortingGroup` →
   `UnityEngine.Rendering.SortingGroup`, `StickmanController.Awake` tự gắn cho mọi
   `StickmanFighterController`).
   Bảng bậc `StickmanSorting` (bàn tay xa 3 … khiên 11) là bậc **TOÀN CỤC** trong một sorting
   layer, mà MỌI nhân vật dùng chung đúng bảng đó. Nên hai người chồng lên nhau là **các bộ
   phận ĐAN XEN**: khiên của người A (11) vẽ đè lên đầu · tay · vũ khí của người B dù B đứng
   trước, còn thân A và thân B cùng bậc 5 thì Unity xếp theo khoảng cách camera → **đảo qua
   đảo lại tuỳ frame**. Đọc ra thành *"đi ngang qua nhau là lẫn lộn bộ phận"* và *"order tay /
   vũ khí / khiên sai, xoay trái xoay phải là thấy"* — nhìn tưởng lỗi của bảng bậc, thật ra
   là **thiếu ranh giới giữa hai người**.
   `SortingGroup` sinh ra đúng cho việc này: bậc 3..11 vẫn quyết định thứ tự BÊN TRONG một
   người, còn giữa hai người thì so bằng bậc của cái KHỐI. Không phải sửa con số nào.
   ⚠ **Gắn ở ROOT, KHÔNG phải ở nhóm `Sprite`**: lúc chết part `*Ragdoll` bị dời sang nhóm
   `Ragdoll` (anh em với `Sprite`) — gắn ở `Sprite` là cái xác văng khỏi khối và lại đan xen.
   ⚠ Thứ tự giữa các NPC là **tuỳ ý nhưng ỔN ĐỊNH** (đếm tăng dần lúc spawn), KHÔNG xếp theo
   toạ độ: game đi ngang một làn, xếp theo X là hai người đi qua nhau sẽ ĐẢO bậc và nháy một
   cái rất lộ. Người chơi luôn trên cùng, xác chìm xuống dưới mọi người sống.
   ⚠ **Công trình KHÔNG gắn** — nhà/tường chỉ một renderer, gom khối chỉ tổ tranh chấp với người.

2h-sort. ⚠ **CÁI GÌ TRÙNG BẬC VỚI ĐẦU (6) THÌ PHẢI NHÍCH `BehindZNudge`.** Bậc 6 có tới ba
   chủ: `Head` · `FarWeapon` · `BodyGear`. (Khiên TRANG BỊ từng là chủ thứ tư và đã nhích z vì
   vậy; nay nó lên bậc 11 nên hết hoà bậc — phép nhích đã bỏ, giữ lại là đẩy chính cái đáng
   che nhất ra xa camera.) Còn **vũ khí chuyển sang TAY XA lúc giơ khiên** thì vẫn bậc 6, ngang với đầu,
   nên lúc che mặt lúc không tuỳ frame, và có chồng lên nhau hay không lại phụ thuộc HƯỚNG
   ĐANG QUAY. Nay `StickmanWeaponHolder.AttachToHand` nhích z khi đẩy vũ khí sang tay xa.

2i-world. ⚠⚠ **BẬC VẼ CỦA THẾ GIỚI CŨNG PHẢI CÓ MỘT CHỦ — `StickmanWorldSorting`**
   (mặt đất · cây cối · nhà cửa · công sự · thuyền · vật thể rời). Anh em với `StickmanSorting`:
   cái kia lo thứ tự vẽ BÊN TRONG một nhân vật, cái này lo thứ tự vẽ giữa MỌI THỨ KHÔNG PHẢI
   NHÂN VẬT. Trước đó nó là **80 con số gõ tay rải khắp 18 file** (dải −12…−3).

   **BA SORTING LAYER, vẽ đúng thứ tự này** (thứ tự trong `TagManager.asset` CHÍNH LÀ thứ tự vẽ):

   > `Default` (thế giới) → `character` (nhân vật) → `foreground` (thứ CHE nhân vật)

   ⚠⚠ **HỆ QUẢ MÀ KHÔNG CON SỐ NÀO THOÁT ĐƯỢC: mọi thứ trong thế giới nằm ở `Default` nên
   KHÔNG CÓ BẬC NÀO đưa được nó ra TRƯỚC một nhân vật.** Đây là gốc của *"lồng giam phải
   nằm trước nhân vật"*: song sắt để order −7 nên **tù binh vẽ ĐÈ LÊN song sắt**, nhìn ra là
   đứng CẠNH cái lồng chứ không phải bị nhốt trong đó. Chú thích ngay tại chỗ còn khẳng định
   ngược lại (*"người vẫn hiện rõ qua khe"*) — **không lỗi nào báo**, mọi renderer đều đang làm
   đúng phần việc của nó. Layer `foreground` (tên cũ `ground`, không một renderer nào dùng) nay
   là chỗ dành cho đúng loại thứ đó.

   ⚠ **`Occluder` dùng TIẾT KIỆM.** Mỗi món ở đó là một mảng che mất trận đánh phía sau — chỉ đưa
   vào khi việc CHE CHÍNH LÀ thông tin (*"người này đang bị nhốt"*), chứ không phải cho đẹp. Và
   song sắt phải THƯA (4 song, rộng 0.1) — che kín thì mất luôn thứ đang cần thấy.

   ⚠⚠ **HIỆU ỨNG CHIẾN ĐẤU CŨNG DÍNH ĐÚNG BỆNH ĐÓ.** Cả 8 prefab `Fx_*` bake layer `Default`,
   nên **vệt chém · máu · chớp nòng · vụ nổ đều chìm sau thân stickman** (khối ĐEN ĐẶC): chém
   trúng mà không thấy vệt chém. Bậc 11…14 GIỮA CHÚNG VỚI NHAU vẫn đúng nên đọc code không thấy
   gì sai. Nay chúng nằm layer `character` ở bậc `Effect` (25000 > `PlayerOrder` 20000 — đòn của
   chính mình mà bị chính mình che thì vô nghĩa), **giữ nguyên khoảng cách bậc giữa các effect**.
   Cùng họ: lá cờ cướp cờ đã ở đúng layer nhưng để order 30, mà từ ngày có `StickmanSortingGroup`
   thì mỗi nhân vật là một KHỐI bậc 0…999 (người chơi 20000) ⇒ cờ chìm sau phần lớn NPC.

   ⚠ **ÉP CẢ LÚC CHẠY, không chỉ sửa builder** — scene/prefab ĐÃ BAKE giữ layer cũ trong file, nên
   sửa mỗi builder là màn cũ vẫn sai tới khi có người nhớ dựng lại. Hai chốt tự lành, đúng khuôn
   `PlayerRespawnBootstrap` / `StickmanStairsBootstrap`: `PrisonerCage.PushBarsInFront` và
   `EffectInstance.PushInFrontOfCharacters` (cả hai ĐỀU BẤT BIẾN — đã đúng layer thì bỏ qua).

   ⚠ **LỒNG VỠ RỒI THÌ TRẢ SONG SẮT VỀ SAU NGƯỜI**: không còn ai bên trong để mà che, mà mảnh
   lồng gãy nằm chắn trước mặt người đang đánh nhau là thứ khó chịu.

   ⚠ **CÁCH BẬC THƯA (10 đơn vị) LÀ CÓ CHỦ Ý.** Bảng cũ nhồi 9 loại vào dải −12…−4 nên hết chỗ
   chèn, và đã TRÙNG BẬC thật (dải cỏ = mặt nước = deco = −9; nhà = nấc thang = vật che = −5).
   Trùng bậc thì Unity xếp theo KHOẢNG CÁCH CAMERA ⇒ đảo qua đảo lại tuỳ frame. Nó còn đảo
   NGƯỢC vài chỗ: rừng nền (−12) nằm DƯỚI mặt đất (−10), và thanh máu thân thuyền (−4) nằm dưới
   mặt biển bán trong suốt (−3) nên bị nhuộm xanh.

   ⚠⚠ **THẾ GIỚI PHẢI CÓ MỘT LỚP TRƯỚC NHÂN VẬT, KHÔNG THÌ MAP LÀ MỘT TẤM PHÔNG** (2026-09-07,
   user: *"order layer render khi tạo map bị sai, cái cây phải ở trước, order lan can cũng sai"*).
   Trước lần này, TOÀN BỘ thứ do map sinh ra nằm ở layer `Default` — nghĩa là **không con số nào
   đưa được nó ra trước một nhân vật**. Cây mọc đúng chỗ người đứng thì người dán đè lên cây;
   người đi trên cầu thì tay vịn chìm sau lưng. Không lỗi nào báo: mỗi renderer đều đang xếp
   đúng thứ tự với các renderer CÙNG LAYER.

   Hai bậc mới trên layer `foreground`:

   | Bậc | Dùng cho | Cỡ giới hạn |
   |---|---|---|
   | `FrontScenery` (−20) | cây · bụi · đá TIỀN CẢNH | chỉ một PHẦN NHỎ (`MapScenery.FrontSceneryChance` = 0.22), phóng to 1.3× |
   | `FrontRail` (−10) | tay vịn cầu, lan can lối đi | cao ≤ 0.7 — che thân, ĐẦU VẪN LỘ |

   ⚠ `NearProp` (−14) **KHÔNG** phải lớp trước: nó ở `Default`, chỉ "gần" so với các thứ trang
   trí khác. Đây là cái tên đã lừa được chính người viết ra nó.
   ⚠ Đừng dựng rồi mới nhớ gọi `ApplyForeground` — `MapSpawn.Block`/`SpawnDeco` nay có cờ
   `front`, vì "quên gọi" là món đồ lặng lẽ chìm sau lính và art vẫn đúng từng pixel.
   ⚠ Bóng nền (`StructurePlan.silhouette`, sân trong toà thành) **không bao giờ** ra lớp trước:
   layer thắng mọi `orderOffset`, nên một cái nhà "ở sân trong" sẽ vẽ đè lên trận đánh ngoài cổng.

   ⚠⚠ **SỬA SỐ TRONG BẢNG ĐÓ LÀ PHẢI DỰNG LẠI SCENE.** `sortingOrder`/`sortingLayerID` được BAKE
   vào từng `SpriteRenderer` trong file `.unity`; Unity nạp GIÁ TRỊ ĐÃ LƯU chứ không nạp hằng số
   trong code. Vì vậy `StickmanWorldSorting.cs` nằm trong `StickmanBuildPipeline.SceneSharedSources`
   — sửa nó là **cả 45 scene chuyển VÀNG** trên ★ Bảng điều khiển. Đừng gỡ nó khỏi danh sách đó.

2j-audit. ⚠⚠ **RÀ LẠI TOÀN BỘ BẬC VẼ + CHỖ ĐẶT HÌNH (2026-09-10).** User báo: *"khi tạo hình
   thì order layer tất cả phải đúng thứ tự phù hợp, vị trí trục Y phải ở trên mặt đất phù hợp,
   không bay lơ lửng trên trời"*. Đo trên **96 scene / 11 104 renderer** (đọc thẳng YAML, không
   mở Unity) và trên toàn bộ code dựng hình. Bốn thứ hỏng, cả bốn đều **im lặng**:

   · **Phép đo chỉ soi NỬA dự án.** `StickmanDoctor` chỉ quét `Assets/Scripts/` — mà scene được
     BAKE bởi builder trong `Assets/Editor/`, tức số gõ tay ở đó đi thẳng vào file `.unity` và
     sống ở đó mãi. `Scripts/` có 6 chỗ; `Editor/` có **32**. Quét nửa dự án rồi báo XANH thì
     tệ hơn không quét: nó nói dối.
   · **Phép đo chỉ bắt MỘT dạng viết.** Regex cũ chỉ khớp `renderer.sortingOrder = -9;`. Hai
     dạng còn lại — `sortingOrder: -6` (tham số gọi tên) và `order: -9` (tham số của mọi xưởng
     đồ: `MapSpawn.Block`, `SpawnDeco`, `StickmanAILabBuilder.Prop`) — lọt hết. Nay bắt cả ba.
   · **Bảng thiếu HAI DÃY BẬC nên luật soát map réo 1 933 thứ ĐÚNG.** Nền trời xếp `Sky+0…+7`
     và hậu cảnh xếp `FarScenery + k×5`; không khai thì luật 16 kể tất cả là "bậc ngoài bảng"
     (534 + 1 399 renderer trên 89 scene). Một danh sách 1 933 dòng thì không ai clear nổi, và
     mấy chỗ SAI thật nằm lẫn trong đó. Nay khai bằng `SkyStack` · `BackdropStep` ·
     `BackdropLayers`, và `MapBuildRules.WorldSortingValues()` kể riêng hai dãy.
   · **Mặt đất ở −2, không phải 0.** `StickmanZombieBuilder.BuildForest` đặt gốc cây ở
     `height * 0.5f` — đúng công thức "tâm khối vuông ở nửa chiều cao" nhưng ĐO TỪ 0, nên cả
     cánh rừng của màn áp tải treo lơ lửng đúng **2 đơn vị** trên không. Khối vẫn vẽ, vẫn đúng
     tỉ lệ, chỉ có chân không chạm đất — không lỗi nào báo.

   **Số thô đã dọn (đều là dải BẢNG CŨ −12…−4, còn sót từ trước lần tách bảng):**

   | chỗ | cũ | nay | nhìn ra là gì |
   |---|---|---|---|
   | `MapCastle` bậc cầu thang `Bac_*` | −8 | `Stairs` (−24) | thang vẽ ĐÈ lên tường thành · bục · lan can |
   | `MapCastle` vòm cổng `Vom` | −7 | `StructureTrim + 1` | vòm nổi lên trước cả sân |
   | `MapScenery` lều trại | −9 | `BackProp` | lều che mất thành và cầu thang |
   | `StickmanFortBuilder` khung cổng · đai sắt (5 chỗ) | −7 | `StructureTrim + 1` | đai sắt trôi ra trước mọi công trình |
   | `TeamEconomy` thân cây gỗ | −5 (tán −6) | `BackProp` (tán `+1`) | **thân vẽ đè lên lá của chính nó** |
   | `StickmanRangedModeBuilder` thân tháp · thang | −2 · −1 | `Structure` · `Ladder` | tháp nổi trước toàn bộ map |
   | `StickmanBridgeBuilder` đáy vực · bệ · vòng chiếm | −12 · −9 · −5 | `Ground` · `Structure` · `GroundMark` | |
   | `StickmanBridgeBuilder` lan can cầu | −6, layer `Default` | `FrontRail` + layer `foreground` | lính đứng TRÊN cầu thay vì sau tấm ván |
   | Tam Quốc + Mặt trận hiện đại (30 chỗ) | −9…−5 | `FarScenery`…`Building + 1` | cả một dải làng còn ở bảng cũ |
   | `StickmanArcheryBuilder` vòng hồng tâm | 4 | `StuckProjectile` (12) | **vòng chìm sau thân đen ⇒ luật tính điểm VÔ HÌNH** |
   | `StickmanArcheryBuilder` quả táo | 5 | `StuckProjectile` | hoà bậc với THÂN ⇒ đảo thứ tự tuỳ frame |
   | `StickmanAILabBuilder.Prop` **mặc định** | −4 | `Prop` (−6) | **62/70 lời gọi ăn đúng số này** |

   ⚠ Dấu hiệu bám NGƯỜI (thanh máu 20 · vương miện 21 · dấu nổi 30 · bảng nhỏ 40/41 · vệt dưới
   chân −1 · quầng sáng −10) nay có tên trong `StickmanSorting` (`OverHeadBar`, `OverHeadMark`,
   `OverHeadIcon`, `OverHeadPanel`, `UnderFoot`, `BehindBodyGlow`…). Chúng nằm TRONG
   `SortingGroup` của nhân vật nên đua với bảng BỘ PHẬN (3…12), **không** đua với bảng thế giới —
   số 20 ở đây và bậc `OverlayMark` (24 000) của thanh máu CÔNG TRÌNH không so được với nhau.
   ⚠ Thanh máu công trình dùng lại đúng `OverlayMark` / `OverlayMark + 1` mà
   `MapAssembler.CreateHealthBar` đã chốt ngày 09·09 — hai đường dựng (hệ map và builder scene)
   phải trả **một** câu, không đẻ thêm hằng thứ hai cho cùng một việc.

   ⚠⚠ **`StickmanAILabBuilder.cs` nay nằm trong `SceneSharedSources`.** Nó vẽ hình cho **10
   builder khác nhau** và mang cả bậc mặc định; `StickmanReadiness` suy nguồn từ builder GỌI nó
   nên trước đây sửa xong không scene nào chuyển vàng — đúng cái bẫy đã ghi cho `StickmanFortBuilder`.

2k-anchor. ⚠⚠ **ĐẶT HÌNH THÌ PHẢI CỘNG MỐC MẶT ĐẤT — `y = height * 0.5f` LÀ BẪY.**
   Mặt đất của dự án ở **−2** (`MapScenery.GroundTop` = `StickmanSceneUtils.DefaultGroundTop`).
   Mọi công thức đặt hình đo từ 0 đều ra một cụm treo lơ lửng đúng 2 đơn vị, và **không có lỗi
   nào báo**. Phép đo mới trong `StickmanDoctor.MapArt` («Đặt hình phải lấy MỐC MẶT ĐẤT») quét
   `.position = new Vector3(x, y, …)` trong mọi file có nhắc tới mặt đất, và réo khi biểu thức
   `y` **suy từ KÍCH THƯỚC** (`height`/`size`/`rise`/`thick`/`radius`/`depth`) mà **không có một
   mốc nào** (`Ground`/`Surface`/`bottom`/`base`/`floor`/`deck`/`…Y`/tham số `y`).
   · Đo ngày 2026-09-10: sau khi sửa cánh rừng → **0 chỗ**. Ngưỡng ấy là ngưỡng phải giữ.
   · Vật CỐ Ý bay (chim · mây · đèn treo) vẫn đi qua được: viết `groundTop + 4f` thay vì `4f` —
     vừa đọc ra ý định vừa không phải khai ngoại lệ.
   · Map có ĐỒI LƯỢN thì mốc là `layout.SurfaceY(x)`, không phải `layout.groundTop` (số kia chỉ
     còn là MỐC 0 của hồ sơ độ cao — xem `MapScenery.Layout.TerrainY`).

3. **Sorting order lấy theo bộ phận, không phải số cố định** — bảng chuẩn ở
   `StickmanSorting` (đo từ `Character.prefab`: bàn tay xa 3 · cẳng xa 4 · thân 5 ·
   đầu + vũ khí tay xa 6 · bàn chân gần + nón 7 · cẳng gần 8 · vũ khí tay gần 9 ·
   **BÀN TAY GẦN 10 — nắm tay vẽ đè lên cán vũ khí** · **KHIÊN CẦM TAY 11 — trên cùng,
   che kín cả nắm tay, kiểu Stick War**).
   **Renderer so SORTING LAYER trước, order sau** — rig nằm layer `character` (vẽ SAU
   Default), nên đồ gắn lúc runtime phải kéo về cùng layer bằng
   `StickmanSorting.RigSortingLayer()` / overload `Apply(go, order, layerId)`,
   không thì nón order 7 vẫn chìm sau cái đầu order 6.
   Lật trái/phải bằng `localScale.x = -1` **không** đụng sorting order nên không cần đảo gì.
   Lưu ý bàn CHÂN vẫn vẽ SAU cẳng chân (7 < 8) — rig gốc cố ý vậy; chỉ BÀN TAY GẦN được
   nâng lên 10 (yêu cầu art: thứ tự tay gần → vũ khí → tay xa).

4. **Đổi HƯỚNG giữa các không gian trên rig lật `localScale.x = -1` phải đi MA TRẬN THẬT.**
   Ba thứ sau đều BỎ QUA scale âm nên đều sai khi nhân vật quay trái (vũ khí chĩa ra sau lưng):
   `Transform.rotation` · **`TransformDirection`** · **`InverseTransformDirection`**
   — Unity ghi rõ hai hàm Direction là *"unaffected by scale"*, chúng chỉ xoay chứ không mirror.

   | Cần gì | Dùng |
   |---|---|
   | Đổi HƯỚNG local ↔ world | `localToWorldMatrix.MultiplyVector` / `worldToLocalMatrix.MultiplyVector` |
   | Đổi ĐIỂM local ↔ world | `TransformPoint` / `InverseTransformPoint` (hai hàm này CÓ tính scale) |
   | Vị trí IK target | gán thẳng `localPosition` — con thừa hưởng mirror của cha, không cần bù |

   Xem `StickmanProceduralAnimator.ApplyAimSpaceAngle` (runtime) và `WeaponBaseEditor`
   (Capture/Preview) — hai chỗ này phải dùng CÙNG một công thức, lệch nhau là pose bắt
   trong scene khác pose lúc chơi.

5. **XƯƠNG RIG XOAY 90° — ART THÌ VẼ ĐỨNG, MÁY LO PHẦN XOAY.**
   `body_1` xoay 90°, nên **local +X của mọi xương chỉ LÊN TRỜI**, không phải sang phải
   (chú thích trong `StickmanRigMetrics.Measure` đã ghi: *"xương đầu nằm ngang trong local
   space"*). Thứ gì gắn thẳng vào xương mà để `localRotation = identity` thì **NẰM NGANG**.

   | Câu hỏi | Trả lời |
   |---|---|
   | Ai xoay bù 90°? | `EquipmentStabilizer` (`keepUpright = true`) — mỗi `LateUpdate` ghi `transform.rotation = identity` |
   | Xoay bù bao nhiêu? | ĐÚNG bằng góc xương lúc đó: 90° + góc ngắm của `boneHead` + góc IK của bàn tay. Không phải một hằng số |
   | Kiểm bằng gì? | object đã bake trong scene: `AppearanceFace` có `m_LocalRotation.z = -0.704, w = 0.710` ⇒ **−89.5°**. Có xoay bù thật, không phải đoán |
   | Art vẽ thế nào? | **ĐỨNG THẲNG, mặt/mũi quay +X (sang PHẢI)**. Y hệt quy ước vũ khí |

   ⚠ **ĐỪNG "sửa" bằng cách xoay sẵn file PNG.** Art xoay sẵn 90° + stabilizer ghim đứng =
   món đồ nằm ngang thật trên người. Và tấm art đó hỏng luôn ở mọi chỗ khác dùng lại nó
   (`DroppedItem` lúc rơi xuống đất, ô chọn đồ trên HUD, contact sheet lúc soi art).

   ⚠ **`keepUpright` BẬT thì `EquipmentDefinition.localAngle` BỊ BỎ QUA.** `StickmanEquipment
   .Equip` có ghi `localEulerAngles = localAngle`, nhưng ngay frame đó stabilizer đè lại
   thành identity — chỉnh `localAngle` trong Inspector thấy KHÔNG có gì xảy ra, không lỗi
   nào báo. Muốn một món nghiêng thật (cây giáo đeo lưng, bao tên chéo vai) thì phải **TẮT
   `keepUpright`** và tự chịu: lúc đó `localAngle` tính trong KHÔNG GIAN XƯƠNG, nên "thẳng
   đứng" là **−90°**, không phải 0.

   ⚠ **LẬT TRÁI/PHẢI KHÔNG PHẢI VIỆC CỦA ART.** Nhóm `Sprite` lật `localScale.x = -1`, và
   `rotation = identity` + scale âm = ảnh soi gương — nên **đừng vẽ bản gương thứ hai**, và
   đừng bù dấu bằng tay. Riêng đổi HƯỚNG giữa các không gian thì vẫn phải đi ma trận thật
   (bẫy số 4) — `TransformDirection` bỏ qua scale âm.

   ⚠ **GIÁP THÌ PHẢI NGHIÊNG THEO THÂN — ghim đứng tuyệt đối là SAI cho slot Body/Back.**
   Thân ngả tới lúc chạy / ra đòn / trúng đòn (`StickmanLegWalker` xoay `body_1`,
   `StickmanBodyAnimator` cộng `bodyAngleOffset`); giáp đứng thẳng nguyên si thì nó RỜI HẲN
   khỏi người — không lỗi nào báo, chỉ nhìn ra "giáp không dính body".
   `EquipmentStabilizer._followBoneLean` giữ đúng góc xương đã LỆCH SO VỚI TƯ THẾ NGHỈ
   (`Mathf.DeltaAngle(restAngle, bone.eulerAngles.z)`), chứ không lấy thẳng góc xương — xương
   thân ở tư thế nghỉ đã là ~89.5°, lấy thẳng là giáp nằm ngang.
   · **KHÔNG nhân `flip`**: món đồ nằm trong cùng nhóm bị lật với xương nên phép soi gương áp
   cho cả hai như nhau.
   · Quyết định bằng **SLOT, không phải field trong asset** (`StickmanEquipment.LeansWithBody`):
   Body/Back nghiêng theo, Head/Shield ghim đứng (xương đầu xoay theo hướng ngắm, bàn tay xoay
   theo IK — nghiêng theo là nón lộn ngược). Thêm field thì mỗi asset mới lại phải nhớ tick.
   · **TÓC/RÂU thì QUAY THEO ĐẦU, NÓN thì KHÔNG** — hai lớp cùng bám `boneHead` nhưng khác
   vai trò: râu MỌC ở cằm nên đầu ngoẹo mà râu đứng thẳng là nó TRÔI KHỎI CẰM; nón thì ĐỘI
   LÊN sọ, ghim đứng để khỏi lộn ngược lúc ngắm dựng đứng. Xem `StickmanAppearance.ApplyLayer`.

⚠⚠ **NGUỒN KHAI SAI ĐƯỜNG DẪN = MỤC VÀNG KHÔNG BAO GIỜ SÁNG — VÀ IM LẶNG HOÀN TOÀN.**
`StickmanReadiness.NewestSource` trước đây lặng lẽ `continue` khi file khai không có trên đĩa.
Nên một đường dẫn gõ sai — hoặc đúng lúc khai nhưng file **ĐÃ DỜI** trong đợt chia module —
biến việc "cần chạy lại" thành vô hình: sửa bảng số trong file đó xong bảng điều khiển vẫn
XANH, không dòng nào bảo phải bấm lại nút.
Đã dính đúng hai lần cùng một kiểu: `CivilizationDefinition.cs` và `WeaponSkinSet.cs` khai ở
`Scripts/Combat/` trong khi cả hai đã sang `Scripts/Units/`. Nay `ReportMissingSource` réo một
lần vào Console và giữ danh sách ở `StickmanReadiness.MissingSources`.
⚠ **Dời file `.cs` sang assembly khác thì phải soát lại `StickmanBuildPipeline`** — trình biên
dịch không bao giờ báo giúp, vì đó chỉ là một chuỗi ký tự.

⚠ **BẢNG SỐ NẰM Ở FILE KHÁC THÌ PHẢI KHAI `extraSource`.** `StickmanReadiness` suy file nguồn
   ra từ `Run.Method.DeclaringType`, tức chỉ nhìn file của CHÍNH tool. Cỡ nón/giáp lại nằm ở
   `StickmanRigMetrics` — sửa ở đó xong bảng điều khiển vẫn XANH hết, không dòng nào bảo phải
   bấm lại, và asset trên đĩa giữ số cũ cho tới lúc ai đó tình cờ chạy lại. Đã dính đúng vậy:
   đổi `HelmetBrimLift`/`ArmorHeadRatio` mà bảng im lặng. Hai mục *Quét folder → AppearanceSet*
   và *Quét folder → 15 nền văn minh* nay khai `extraSource: StickmanRigMetrics.cs`.

   Áp dụng cho: nón · giáp · khiên trang bị · đồ đeo lưng · tóc/râu (`StickmanAppearance`
   dùng chung đúng `EquipmentStabilizer` đó). KHÔNG áp dụng cho vũ khí — vũ khí đi hệ riêng
   (`WeaponHoldPose.weaponAngle`, neo trong KHÔNG GIAN NGẮM, 0 = mũi chỉ thẳng mục tiêu).

5. **TẦM VỚI CỦA TAY = 1.469 rig unit, KHÔNG PHẢI 1.9.** Tổng hai khúc xương đo từ
   `Character.prefab`: `armR→handR` 0.7172 + `handR→effectArmR` 0.7518. Tài liệu cũ ghi 1.9 vì
   đo từ giá trị `IKArmL` LƯU SẴN trong prefab (−1.919) — mà chính giá trị đó đã vượt tầm.
   Hậu quả: **37/228 IK target của bộ vũ khí bị gõ vượt tầm**, cái nhiều nhất vượt 33%.
   Target vượt tầm thì `LimbSolver2D` duỗi thẳng hết cỡ rồi dừng — tay **cứng đơ, khuỷu không
   gập**, bàn tay (kèm vũ khí) nằm NGẮN HƠN chỗ pose định đặt. Không lỗi nào báo.
   Nay `StickmanProceduralAnimator.ClampToReach` chặn ở gốc (giữ HƯỚNG, kéo về ≤ 95% tầm).
   ⚠ **Bài học chung: đừng đo hằng số rig từ một giá trị đang nằm trong prefab — nó có thể là
   rác. Đo từ CHIỀU DÀI XƯƠNG.**
   Xem trước dáng cầm không cần mở Unity: `.claude/skills/stickman-setup/pose_preview.py`.
6. **CỠ VŨ KHÍ ĐO BẰNG % CHIỀU CAO NGƯỜI** (`StickmanWeaponBuilder.WeaponHeightRatio`), đừng
   để KHỔ CANVAS quyết định. Sprite mỗi cây một khổ (112–420 px) mà PPU chung 100, nên cây vẽ
   trên canvas rộng hơn tự động DÀI HƠN trong tay — không liên quan tới việc nó đáng dài bao
   nhiêu. Đo trước khi sửa: **đao dài 105% chiều cao người** (nên 72%), búa ném 74% (nên 36%),
   kiếm 67% (nên 52%). Bảng khai theo tỉ lệ đời thực, `ApplyWeaponFit` quy ra `_gripLocalScale`
   và áp ở **`SaveVariant`** — nút thắt mọi cây đi qua.
   ⚠ Đo bằng **`max(width, height)`**, không phải width: cung vẽ DỌC (Longbow 100×400).
   ⚠⚠ Đổi bảng này là **ĐỔI TẦM VỚI** (`_gripLocalScale` co cả `Tip`) → **PHẢI chạy lại
   `Weapons > Balance Report`**. `_hitRadius` KHÔNG co theo, cây thu nhỏ nhiều thì chỉnh tay.
6b. **CỠ VŨ KHÍ ĐO *PHẦN VẼ ĐƯỢC*, KHÔNG ĐO KHUNG ẢNH — VÀ SKIN PHẢI MANG THEO SỐ ĐÓ.**
   Cùng luật đã học ở nón/giáp (mục 2b), nhưng bộ vũ khí thì bỏ sót: `ApplyWeaponFit` đo
   `sprite.rect` = cả khổ canvas. Art vũ khí chừa viền từ **76% tới 100%**, nên hai cây khai
   CÙNG tỉ lệ vẫn ra hai cỡ chênh nhau tới 1.3 lần.
   ⚠ Nặng hơn ở **SKIN VĂN MINH**: `Bow.png` gốc vẽ kín **99%** khung còn `Weapon_Bow.png`
   của 7 nền chỉ **67%** — mà hai file CÙNG khổ 164×710, nên bù theo khung cho hệ số đúng
   1.0 và cây cung của mọi nền nhỏ hơn bản gốc **1.5 lần**. Đọc ra thành *"cây cung bé xíu,
   lúc bự lúc nhỏ"*, không lỗi nào báo. Nay `WeaponSkinSet.Entry.opaqueFraction` (tool đo lúc
   build) + `WeaponBase._visualOpaqueFraction` cho `FitSkin` so PHẦN VẼ với PHẦN VẼ.
   ⚠ `FitSkin` chỉ scale **RENDERER**, không scale gốc vũ khí: `Tip`/`Muzzle`/hitbox phải giữ
   nguyên thì hai phe mới cân bằng tuyệt đối — đó là toàn bộ lý do hệ skin dùng CHUNG prefab.
   ⚠ **LOẠI CHƯA KHAI TRONG BẢNG `WeaponHeightRatio` THÌ GIỮ NGUYÊN CỠ CANVAS.** Sáu loại
   súng hiện đại (`Pistol`/`Smg`/`Rifle`/`Shotgun`/`SniperRifle`/`GrenadeLauncher`) đã nằm
   ngoài bảng đúng như vậy — `ApplyWeaponFit` gặp `0` là `return` trong im lặng. Nay nó réo
   tên cây chưa khai. Thêm lớp vũ khí mới = thêm 1 dòng vào bảng.

6c. **VŨ KHÍ NẰM DƯỚI ĐẤT PHẢI ĐÚNG CỠ LÚC CẦM — `WeaponBase.DroppedWorldScale`, ĐỪNG GÕ `0.25f`.**
   Cỡ thật trên tay là **TÍCH HAI SỐ**: `_gripLocalScale` (do `ApplyWeaponFit` tính theo %
   chiều cao người) NHÂN rig 0.25. Hai chỗ đặt vũ khí xuống đất (`StickmanDemoBuilder.
   DropWeaponOnGround` — giá vũ khí Demo_1/7, và `WarCamp.CraftWeapon` — xưởng rèn) đều gõ
   `Vector3.one * 0.25f` kèm chú thích *"cùng cỡ vũ khí trên tay"* — **bỏ mất vế đầu**.
   `_gripLocalScale` chạy từ **0.30 (cung) tới 1.90 (khiên)** nên mỗi cây sai một kiểu, và
   sai theo HAI CHIỀU ngược nhau — đó là lý do nó khó đọc ra thành một lỗi:
   cung nằm đất **to gấp 3.34 lần** lúc cầm (247% chiều cao người) · búa ném 1.71× ·
   thương 1.26× · giáo 1.14× · còn **khiên chỉ còn 0.53×** (26% người) · súng 0.62× ·
   trượng phép 0.83×. Nhặt lên là cây vũ khí "co lại" hoặc "phình ra", không lỗi nào báo.
   ⚠ Chữa ở **NÚT THẮT `WeaponPickup.Awake`** (`ApplyDroppedScale`), không chữa ở từng chỗ
   gọi: mọi cây chờ nhặt đều đi qua component đó dù tới từ đường nào (rớt khỏi tay · xưởng
   rèn đúc ra · giá vũ khí BAKE SẴN trong scene). Nhờ vậy **40 scene cũ không phải dựng lại**
   và spawner mới không có cơ hội gõ lại con số.
   ⚠ Ép cỡ phải chạy **TRƯỚC** `DroppedItem.MakeDropped` + `EnsureTrigger` — cả hai đo
   collider/bán kính nhặt theo scale hiện tại.

6c-gear. ⚠⚠ **`SetParent(null, true)` KHÔNG GIỮ NỔI CỠ TRÊN RIG NÀY — ĐO `renderer.bounds`.**
   (`StickmanEquipment.DropSlot`, dính 2026-09-02: *"nón giáp rơi ra quá bự, sai tỉ lệ"*.)

   Unity biểu diễn cỡ tích luỹ bằng MỘT VECTOR 3 THÀNH PHẦN (`lossyScale`), và vector đó chỉ
   đúng khi chuỗi cha là scale ĐỀU và KHÔNG XOAY. Rig stickman phá **cả hai vế cùng lúc**:
   nhóm `Sprite` lật gương bằng `localScale.x = -1`, còn `body_1` **xoay 90°** — tích của lật
   và xoay không còn là phép scale theo trục nào cả. Nên `lossyScale` là số XẤP XỈ, và
   `SetParent(..., worldPositionStays: true)` lấy đúng số xấp xỉ ấy để tính `localScale` mới:
   món đồ vừa rời khỏi người là **phình ra gấp mấy lần**. Trên người nó vẫn đúng cỡ, nên nhìn
   rất giống lỗi của bảng số nón/giáp — **không lỗi nào báo**.

   Chữa bằng cách hỏi thứ KHÔNG đi qua ma trận nào: `renderer.bounds` là hộp bao THẬT trong
   không gian thế giới. Đo TRƯỚC khi tháo, đo lại SAU khi tháo, rồi chia. Miễn nhiễm với lật,
   xoay và scale không đều.
   ⚠ **BẬT `SetActive(true)` TRƯỚC KHI ĐO** — `bounds` của GameObject đang TẮT trả hộp rỗng,
   mà slot có thể đang bị `SetSlotVisible` tắt (luật MỘT KHIÊN). Đo trúng 0 thì phép chia bị
   bỏ qua và món đồ vẫn phình, **chỉ ở đúng nhánh hiếm đó**.
   ⚠ Họ hàng với §6c (`WeaponPickup.ApplyDroppedScale`), chỉ khác: ở vũ khí cỡ SUY RA được từ
   hai con số (`_gripLocalScale × 0.25`), còn ở đây phải ĐO.
   ⚠ **THỜI GIAN NẰM ĐẤT: `EquipmentDefinition.DroppedLifetime`, đừng đọc thẳng
   `droppedDespawnTime`.** 45 asset `Equip_*` đã BAKE số 20 nên sửa giá trị mặc định thì
   **không có gì đổi cả** — hệ số nhân lúc ĐỌC là `DespawnTuning`, đúng khuôn
   `SpeedTuning`/`ImpactTuning`.
   ⚠⚠ **CHẠM ĐẤT LÀ MỜ LUÔN, VÀ ĐỒNG HỒ ĐẾM TỪ LÚC CHẠM ĐẤT** (user chốt 2026-09-03).
   Đường đi của con số: 20 s → 6 s → **0.4 s** (`DespawnTuning` 0.02) + 1.2 s mờ dần. Thứ cần
   đọc được chỉ là KHOẢNH KHẮC *"vừa có ai bị vỡ nón"* — cú văng, cú rơi, cú lăn — chứ không
   phải cái nón nằm đó sau đó; nón/giáp rớt ra lại **không nhặt lại được** (dự án không có
   `EquipmentPickup` nào, chỉ vũ khí mới có `WeaponPickup`) nên rút ngắn đời nó không lấy mất
   của ai thứ gì. Vũ khí rớt vẫn 25 s như cũ.
   · ⚠ **Đếm từ lúc CHẠM ĐẤT, không từ lúc văng ra** (`DroppedItem.MakeDropped(...,
     despawnAfterLanding: true)`, mốc đặt ở `HandleImpact` = cú chạm ĐẦU TIÊN). Quãng bay
     không cố định, nên với hạn ngắn thế này thì món bị hất mạnh sẽ **mờ hết TRÊN KHÔNG**,
     chưa kịp rơi xuống.
   · ⚠ **KHÔNG để hạn bằng 0**: cú chạm đầu còn NẢY một hai nhịp, mờ ngay frame chạm là món
     đồ nhạt mất trong lúc còn đang nảy trên không.
   · ⚠⚠ **VAN CHỐNG RÒ — `DroppedItem.LandingWaitLimit` (6 s).** Đồ rơi xuống VỰC / xuống
     BIỂN thì KHÔNG BAO GIỜ chạm đất ⇒ đồng hồ không bao giờ chạy ⇒ nó rơi mãi mãi: mỗi lần
     vỡ nón cạnh mép vực là rò một GameObject, không lỗi nào báo. Bản đếm-từ-lúc-văng-ra cũ
     không có lỗ này (hết hạn là mờ, ở đâu cũng vậy) — **thêm một mốc ĐIỀU KIỆN vào đồng hồ
     tự dọn thì phải thêm luôn đường thoát cho lúc điều kiện đó không bao giờ tới.**
   · ⚠⚠ **ĐANG MỜ DẦN THÌ VẪN PHẢI CHẠY TIẾP PHA LĂN.** `DroppedItem.Update` bản cũ `return`
     ngay khi `_fading` (hồi đó hạn 6 s nên lúc mờ thì món đồ đã nằm im từ lâu). Nay nó bắt
     đầu mờ lúc CÒN ĐANG LĂN, mà pha lăn đã đặt `gravityScale = 0` và tự bám đất mỗi frame —
     bỏ qua `UpdateRoll` là món đồ **TRÔI NGANG LƠ LỬNG** suốt lúc mờ, không lỗi nào báo.
     Nay `StepFade()` trả bool và Update chỉ dừng khi đã huỷ thật.
   · Không phải dựng lại scene nào: `DespawnTuning` là hằng số đọc lúc chạy, còn
     `_despawnAfterLanding` là field MỚI (asset cũ nhận đúng giá trị khởi tạo = tắt).

6d. ⚠⚠ **PIVOT CỦA VŨ KHÍ PHẢI NẰM GIỮA VẬT LIỆU TẠI CHỖ NẮM TAY, KHÔNG PHẢI % CHIỀU
   CAO KHUNG.** Bàn tay OM LẤY CÁN, nên pivot phải ở giữa khối vật liệu tại cột đó.
   ⚠ **Sai pivot Y = SAI GÓC VŨ KHÍ**, và đó là chỗ rất khó đoán ra. `weaponAngle` xoay cây
   vũ khí sao cho **+X của nó** trỏ theo hướng ngắm; +X đo TỪ PIVOT. Đặt pivot thấp hơn
   đường sống lưỡi một chút là hướng pivot→mũi **chếch LÊN**, và cây vũ khí trong tay ngóc
   lên đúng bấy nhiêu độ dù `weaponAngle` không đổi một số nào.
   Đã dính khi nhận skin từ ngoài: art mới có CHUÔI + ĐỐC to hơn bản gốc, nên cùng một tỉ lệ
   chiều cao lại rơi thấp hơn sống lưỡi. Đo được: **Rus Sword +11.8°, Pirate SaberShort
   +19.3°, Ottoman Crossbow +16.7°** — người chơi đọc ra đúng câu *"cầm vũ khí một tay thì
   góc không đúng"*, mà mở prefab ra thì mọi con số `weaponAngle` đều y nguyên.
   Chữa: pivot Y = **tâm khoảng đặc tại cột nắm tay** (`intake_sheet.py`). Sau khi sửa, 27/30
   cây có góc chĩa lệch dưới 4° so với cây gốc.
   ⚠ Ba cây còn lệch là **rìu và búa ném** — báo GIẢ: phép đo lấy điểm XA NHẤT, mà lưỡi rìu
   art mới xoè XUỐNG còn bản gốc xoè LÊN. Nhìn cột TRỤC LƯỠI (vẫn ≈0°) chứ đừng nhìn cột MŨI.

7. **TAY PHỤ PHẢI NẮM CÁN, KHÔNG NẮM LƯỠI.** `SetupOffHand(gripX)` tính TỪ PIVOT (1.0 = 100 px):
   kiếm/đao HAI TAY thì gripX **ÂM** (tay phụ xuống pommel), cán dài thì dương 0.5–1.3, súng/nỏ
   thì dương kèm `gripY` ÂM (ốp lót dưới nòng).
   ⚠ Đã dính ở KIẾM RUNE: `gripX: 0.75` cho tay phụ rơi vào px 121/240 — mà art vẽ lưỡi từ
   px 80, tức **nắm thẳng vào lưỡi kiếm**. Kiểm bằng phép tính
   `điểm nắm px = pivotX × W + gripX × 100`, so với vùng cán mà hàm vẽ khai ra.
   ⚠⚠ **VỚI KHÔNG TỚI CÁN THÌ TRƯỢT DỌC CÁN, ĐỪNG KÉO VỀ VAI** (`ClampAlongHaft`). Chốt
   `ClampToReach` giữ hướng-nhìn-từ-vai — đúng cho tay TỰ DO, nhưng tay phụ đang NẮM CÁN nên
   kéo về vai là bàn tay rời khỏi cán, ra đúng ảnh "tay lơ lửng cạnh cây giáo". Bài học: một
   chốt "an toàn" áp cho mọi trường hợp thì có trường hợp nó làm hỏng.
   ⚠ **Cỡ vũ khí: tỉ lệ đời thực là ĐIỂM XUẤT PHÁT, không phải đích.** Thân stickman là khối
   đen mảnh nên cây kiếm đúng giải phẫu đọc ra "cái que thứ ba" — bản 2 nâng cây NGẮN (kiếm
   52% → 60%) và hạ cây DÀI (thương 130% → 118%). Chốt số cuối phải NHÌN ở cỡ thật.

Số đo nhân vật (bán kính đầu, chiều cao thân) lấy qua `StickmanRigMetrics.Measure()` —
scale/offset trang bị tính từ đó, không hardcode.
