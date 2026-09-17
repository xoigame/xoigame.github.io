## SINH ASSET BẰNG CODE / AI — HÌNH · HẠT · TIẾNG

Gần như toàn bộ asset của dự án sinh bằng CODE: nón/giáp/khiên 13 nền, sprite vũ khí, trang
trí đầu, bối cảnh, sprite effect, và (khi gói SFX không có) cả tiếng động. Chi tiết đầy đủ:
**`Docs/KnowledgeBase/AssetGeneration.md`**; bộ script + quy trình:
**`.claude/skills/stickman-assets/`** (`canvas.py` vẽ thử pixel art, `sfx.py` tổng hợp WAV).

### ⚠⚠ LUẬT NGUỒN ASSET — **MỌI THỨ VẼ RA ĐỀU DO CHATGPT**, TIẾNG THÌ GEMINI

**MỌI TẤM ART ĐẸP ĐỀU DO CHATGPT VẼ. Vẽ bằng code chỉ là PHƯƠNG ÁN DỰ PHÒNG khi hết token AI.**
Nón · giáp · khiên · vũ khí · skin vũ khí theo nền · mặt/tóc · công trình · bối cảnh · sprite
effect · thuyền · vật cưỡi — **tất cả** đi qua ChatGPT. Cần TIẾNG mới thì Gemini.

⚠ Luật do NGƯỜI DÙNG chốt (2026-08-28), thay hẳn luật cũ *"art code là bản nháp, cần đẹp thì
mới nhờ ChatGPT"*. Luật cũ nghe hợp lý nhưng thực tế nó cho phép AI cứ vẽ tiếp bằng
`Circle`/`Rect` rồi báo xong, và dự án tích lại **~300 tấm art gốc vẽ bằng code**.

**BA VẾ, ĐỦ CẢ BA:**

| Vế | Nghĩa | Chỗ thực thi |
|---|---|---|
| **1. Đẹp thì đặt ChatGPT** | AI trong Claude Code đổi vai: từ NGƯỜI VẼ thành **NGƯỜI ĐẶT HÀNG + NGƯỜI LẮP**. Thấy art xấu/thiếu thì viết bản mô tả, KHÔNG mở `PixelCanvas` ra vẽ | `Docs/KnowledgeBase/WeaponArt-ChatGPT-Prompt.md` |
| **2. Code chỉ VẼ BÙ, không ghi đè** | hết token AI thì vẫn phải có nút bấm để dự án đủ file mà chạy — nhưng nó chỉ được lấp CHỖ TRỐNG | `Art > ★ Vẽ bù art còn thiếu bằng code` |
| **3. Người tự đặt hình bằng tay** | tìm được hình đẹp ở ngoài thì thả vào là nó Ở LẠI, không tool nào đụng | `StickmanArtSource` (nhãn) |

### ⚠⚠ ĐƠN HÀNG ART SINH BẰNG TOOL — **MỘT BẢN RÀNG BUỘC DUY NHẤT** (2026-09-09)

User: *"lưu prompt vẽ hình cho tất cả hình ảnh trong game, nhất là trang bị… nhất là nó phải
ĐỒNG BỘ và ĐẸP"*.

`Tools > Stickman > ★ Bảng điều khiển` → tab Hình → **★ ĐẶT HÀNG ART** (hoặc
`Nâng cao > Art > ★ Đặt hàng ART`) sinh `Docs/ArtOrders/` — mỗi bộ một file `.md`, mở ra là
chép khối ```text``` dán thẳng vào ChatGPT. **Nguồn:** `StickmanArtPrompt`.

**Ba thứ tool này giữ mà văn bản viết tay không giữ được:**

| Thứ | Vì sao phải là tool |
|---|---|
| **Danh sách món** | đọc `WeaponArtGenerator.AllSpriteNames`, `CivilizationDefinition`, `StickmanArtSource.ExpectedArtProof` **lúc bấm**. `ArtWorklist.md` gõ tay đã cũ mất một tuần (kho vũ khí lên 68 tấm, nền văn minh lên 31) và không có gì báo |
| **CỠ từng món** | tính từ `WeaponHeightRatio` × `StickmanRigMetrics.CharacterHeight`. Gõ lại số vào văn bản là sửa bảng cân bằng xong prompt vẫn nói số cũ ⇒ art về sai cỡ |
| **ĐƯỜNG DẪN nhận art** | tên file ≠ tên enum ở 5 chỗ (`ShortSaber`→`SaberShort.png`, `SniperRifle`→`Sniper.png`, `DualSwords` không có file riêng). Đưa nhầm đường dẫn là art vẽ xong **nằm chết không ai đọc** |

⚠⚠ **RÀNG BUỘC CHUNG CHỈ CÓ MỘT BẢN: `StickmanArtPrompt.StyleBible`.** Sáu ràng buộc kỹ thuật
(nền trong suốt · nhìn ngang · vẽ đứng · không đối xứng · một khổ ảnh · một tỉ lệ) cộng phần
PHONG CÁCH (viền tối, 3–4 mảng màu phẳng, sáng từ trên–trái, đọc được ở 40 px) là **thứ quyết
định bộ hình có đồng bộ không**. Chép nó sang file thứ hai là hai bản, và hai bản thì trôi —
mỗi lượt đặt ra một kiểu. Sửa phong cách chung thì sửa hằng số đó, đừng sửa trong `.md`.

⚠ **ĐỪNG ĐẶT `TierN/` VÀ `Variants/`.** Đó là bản do tool sinh từ tấm GỐC (đổi bảng màu kim
loại / gieo biến thể) — 1824 tấm trong `Sprites/Weapons` là loại này. Đặt tấm gốc, rồi chạy
tool sinh cấp.

⚠ Luật hình từng nhóm (nón · giáp · khiên · cung · thú bốn chân…) vẫn nằm ở
`Docs/KnowledgeBase/WeaponArt-ChatGPT-Prompt.md` và các file `*-ChatGPT-Prompt.md`: tool chỉ
soạn ĐƠN HÀNG, không thay phần chỉ đạo nghệ thuật.

⚠⚠ **AI LÀ CHỦ TẤM ART NÀY — HỎI NHÃN, ĐỪNG ĐOÁN BẰNG KHỔ ẢNH** (`StickmanArtSource`).
Cách cũ nhận diện art code-gen bằng **KHỔ CANVAS** (`GeneratedSizes`). Nó chạy được khi art
thật luôn lệch khổ — nhưng đó là giả định **vỡ đúng lúc đau nhất**: bộ nón đặt ChatGPT vẽ theo
đúng chuẩn của dự án là **256×256**, TRÙNG KHÍT khổ generator. Nghĩa là ngay khi người dùng làm
ĐÚNG quy trình, nút *"Dọn art code-gen lỗi thời"* sẽ **xoá mất art vừa đặt tiền vẽ**, không lỗi
nào báo. Nay mỗi tấm mang nhãn trong `TextureImporter.userData`:

| Nhãn | Nghĩa | Code được đè? |
|---|---|---|
| `stickman:codegen` | generator ghi ra | ✔ |
| `stickman:hand` | người khoá tay (`Art > Khoá art đang chọn`) | ✘ |
| **trống** | art người dùng thả vào | ✘ — **mặc định an toàn** |

Mặc định nghiêng về GIỮ: mất một lần vẽ lại thì bấm nút là có; mất một tấm art đặt vẽ thì
không lấy lại được.
⚠ Vế trái của nó: art code-gen CŨ (chưa gắn nhãn) cũng không đè được → chạy
`Art > Gắn nhãn «do code vẽ» cho art hiện có` **một lần** sau khi đã khoá tay mấy tấm art thật.

⚠ **CHẶN Ở TẦNG GHI FILE, KHÔNG Ở TỪNG GENERATOR.** `WeaponArtGenerator.Save` hỏi
`StickmanArtSource.CanCodeWrite` — 5/7 generator đi qua đó nên được bảo vệ miễn phí, và
generator thứ tám sau này cũng vậy. Hai đường tự ghi PNG (`StickmanEnvironmentArt`,
`StickmanBuildingArt`) phải tự hỏi — đã nối.

⚠ **BẢY GENERATOR LÀ LƯỚI AN TOÀN, KHÔNG PHẢI CÔNG CỤ ĐỂ LÀM ĐẸP:**
`WeaponArtGenerator` · `CivilizationArtGenerator` + `CivilizationHelmetArt` · `HeadArtGenerator` ·
`StickmanEnvironmentArt` · `StickmanBuildingArt` · `StickmanEffectBuilder` · `NavalArtGenerator`.
**Đừng thêm hàm vẽ mới vào chúng** trừ khi đang bù một món hoàn toàn chưa có hình.
Đếm nợ bằng `Tools > Stickman > Nâng cao > Art > Đếm art còn vẽ bằng code`.

⚠⚠ **NHƯNG LƯỚI AN TOÀN PHẢI ĐÚNG BẢN SẮC** (user chốt 2026-09-08: *"tool vẽ phải đẹp hơn và
chính xác nền văn minh và môi trường hơn"*). Trước đó bản dự phòng có đúng MỘT bộ công trình
đá xám Âu cho cả 18 nền và đồi mọi biome đều là tổng sin — Viking đóng thành đá, cồn cát và
núi tuyết chỉ khác nhau "cao hay thấp". Nay bản sắc là **DỮ LIỆU**, không phải hàm vẽ tay:

| Trục | Bảng | Sửa bản sắc = |
|---|---|---|
| Nền văn minh (18) | `StickmanBuildingArt.Civilizations.CivStyles` — vật liệu · nóc tường · đỉnh tháp · vòm · mái · 4 màu | sửa **một dòng** `Style(...)`; 4 generator tham số hoá dựng Wall/Tower/Gate/House |
| Môi trường (7) | `StickmanEnvironmentArt.HillShape` (dáng sống đồi) + `MapLibrary.biomeProps` (cọ · xương rồng · thông tuyết · bạch dương · liễu · lau · bazan) | thêm một `Save*`/một dòng trong `StickmanMapSystemBuilder` |

Bảng nền lấy từ cột *"Kiến trúc / Vật liệu"* của `CivilizationEnvironmentArt.md`. Bộ code theo
nền GIỮ NGUYÊN hợp đồng hình học của bộ Default (tường đi ở 248/320, sàn tháp 344/470) nên
không phải đo lại `towerWalkableRatio`; nền nào có sheet thật (`stickman:hand`) thì code nhường
chỗ ở tầng `Save`. Thêm nền = thêm dòng vào cả `CivSpec` lẫn `CivStyles`, thiếu một bên là
nền đó về đá xám mà không lỗi nào báo — `Đếm art còn vẽ bằng code` và sheet
`Docs/ArtSheets/Buildings_Civilizations.png` là chỗ nhìn ra.

⚠⚠ **NÚT «★ Vẽ LẠI TOÀN BỘ art code (force)»** (`StickmanArtSource.RedrawAllCodeArt`, Bảng
điều khiển › Nhân vật). Sửa generator xong bấm «Vẽ bù» là **không đổi một byte** — nó cố ý
không ghi đè, nên luật mới nằm trong code còn đĩa giữ tấm cũ, và bảng vẫn xanh. Nút force
chạy cả 9 generator ở chế độ ghi đè **tấm mang nhãn `stickman:codegen`**, rồi dựng lại
`Civ_*.asset` + thú vật và xuất contact sheet. Tấm `stickman:hand` / không nhãn được chừa ở
tầng `CanCodeWrite` và liệt kê ở Console — an toàn nhờ NHÃN, không nhờ ý tốt của từng
generator. Cố ý KHÔNG sinh lại bản theo CẤP bằng recolor (luật 2026-09-02). Sau khi bấm,
BẮT BUỘC nhìn `Docs/ArtSheets/*.png` — đó là bước kiểm bằng mắt của luật số 1.

⚠ **NGOẠI LỆ DUY NHẤT — và nó không phải "vẽ":** bản art theo **CẤP** (`<nền>/TierN/`, ~960
tấm) là phép **ĐỔI BẢNG MÀU KIM LOẠI** trên chính tấm art gốc, không phải một bức vẽ mới. Đặt
960 tấm là không làm nổi, và cái cần giữ ở đó là *đúng cùng một hình, khác chất liệu* — thứ mà
đặt vẽ tay lại không bảo đảm được. Tấm gốc do ChatGPT vẽ thì bản cấp cũng là art của ChatGPT.

⚠ **HẠT KHÔNG PHẢI ART.** Lửa · sao · tàn là `ParticleSystem` — chuyển động, không phải một
tấm ảnh. Cái ĐẶT HÀNG được là tấm sprite hạt (đốm lửa, ngôi sao); còn quỹ đạo, dải màu theo
đời hạt, trọng lực âm thì vẫn là số trên component.

AI trong Claude Code **không gọi được hai dịch vụ đó** — nên việc của AI là **giao đúng bản
mô tả** rồi nhận file về, KHÔNG phải im lặng vẽ tiếp bằng code:

| Việc | Ai làm | Giao/nhận cái gì |
|---|---|---|
| Viết PROMPT + bảng ràng buộc kỹ thuật | **AI** | khổ ảnh · nền trong suốt · góc nhìn · pivot · bảng màu |
| Sinh ra file | **user** (ChatGPT / Gemini) | PNG · WAV |
| Nhận file, cắt/đo/gắn vào asset, chạy tool | **AI** | tool intake dưới đây |
| Nhìn / nghe kết quả cuối | **user** | AI không nghe được, không chạy được Unity |

**HÌNH → ChatGPT.** Prompt PHẢI kèm năm ràng buộc, thiếu cái nào cũng ra tấm ảnh không lắp
được: **nền TRONG SUỐT** · **nhìn NGANG đúng hướng +X** (quy ước của mọi vũ khí trong dự án)
· **vẽ ĐỨNG THẲNG, KHÔNG xoay nghiêng sẵn trong file** (máy tự xoay bù — xem bẫy hình học
số 5) · **chỉ vẽ đúng món đó, không vẽ kèm nhân vật/đất/bóng đổ** · **cả bộ CHUNG MỘT KHỔ
ẢNH và CHUNG MỘT TỈ LỆ** (fit theo chiều cao nên tấm nào vẽ hẹp hơn là ra món đồ hẹp hơn —
đúng chỗ `Armor_Japan` đang lệch). Nhận
về thì thả vào `Assets/Art_Incoming/` rồi `Buildings > 2. Cắt sheet` (cắt theo ĐẢO PIXEL, tự
đặt PPU 100 + pivot đáy giữa), hoặc thả thẳng vào folder của hệ tương ứng
(`Sprites/Heads/Decos|Helmets`, `Sprites/Civilizations/<Key>/`) rồi chạy tool build của hệ đó
— **cỡ và offset thì ĐỪNG gõ tay, tool đo từ rig**.

### ⚠⚠ KHOÁ PIVOT TAY — NHÃN `stickman:hand` CHẶN PIXEL, KHÔNG CHẶN PIVOT (2026-09-14)

Bảng nhãn ở trên bảo vệ **nội dung ảnh**. Nhưng **pivot** — chỗ cầm của vũ khí, chỗ đặt
xuống đất của công trình, điểm neo của nón — nằm trong `.meta` chứ không nằm trong PNG, và
nó đang bị **11 chỗ khác nhau trong `Assets/Editor` ghi**. **Không một chỗ nào hỏi
`CanCodeWrite`.** Nghĩa là: khoá tay một tấm art xong, hình giữ nguyên, nhưng lần chạy builder
kế tiếp vẫn kéo pivot về chỗ công thức tính ra — không lỗi nào báo, chỉ là hôm sau cái nón lệch.

**Khoá pivot** = sidecar `<tấm>.png.pivotlock.json` (cùng quy ước với `.headanchor.json`), giữ
luôn giá trị pivot + PPU. Chỉnh và khoá bằng **`🔒 Xưởng pivot`** (`Ctrl+Alt+P`, hoặc Bảng điều
khiển › Nhân vật): duyệt mọi tấm art, kéo chuột / `←→↑↓` đặt pivot, xem tấm art đứng cạnh
stickman ở đúng tỉ lệ thật, bật 🔒 rồi Lưu. Lưu cũng đóng luôn nhãn `stickman:hand`.

⚠⚠ **HAI LỚP CHẶN, CỐ Ý CHỒNG NHAU — và lớp thứ hai mới là lời hứa thật:**

1. **Chốt hợp tác** — `StickmanPivotLock.CanWritePivot(path)`, đã cắm vào cả 11 chỗ ghi pivot đơn
   (+ `StickmanHelmetTrimTool`).
   Rẻ, và làm ý định đọc được ngay tại chỗ ghi. Nhưng nó chỉ đúng với writer **CÓ NHỚ hỏi**.
2. **Chốt cứng** — `StickmanPivotLockPostprocessor` mặc lại pivot đã khoá ở **mỗi lượt import**.
   Mọi thay đổi pivot rốt cuộc đều phải đi qua một lượt import, nên chặn ở đây là chặn ở chỗ
   hẹp nhất: writer nào quên hỏi (**kể cả code AI viết ngày mai**) vẫn ghi được vào `.meta`,
   nhưng thứ Unity nạp ra — thứ game và mọi phép đo nhìn thấy — vẫn là pivot đã khoá.

Đó là lý do **không cần đi sửa hết mọi chỗ ghi mới an toàn**, và là lý do luật này không phụ thuộc vào
việc ai đó đọc được dòng này. `GetPostprocessOrder() = 1000` để chạy SAU
`StickmanReviewArtPostprocessor` (order 0) — hai postprocessor cùng ghi một trường thì cái sau
thắng, và khoá tay phải là cái sau cùng.

**Thêm một chỗ ghi pivot mới** thì cắm `if (!StickmanPivotLock.CanWritePivot(path)) …` — không
cắm cũng không vỡ khoá, chỉ tốn một lượt reimport thừa mỗi lần builder chạy — và Doctor
(«Khoá pivot tay đang bị bào mòn») sẽ chỉ đích danh tấm nào đang bị ghi đè để còn lần ra writer.

⚠ Tấm Sprite Mode = **Multiple** có pivot riêng từng ô, không khoá kiểu này được — cả Xưởng
pivot lẫn Doctor đều nói thẳng điều đó thay vì im lặng bỏ qua. `StickmanHelmetTrimTool` cũng
chừa tấm đã khoá: trim đổi **cả pixel lẫn pivot**, cắt xong là mất đúng cái người dùng vừa chỉnh.

⚠ **HAI CHỖ GHI PIVOT CỐ Ý KHÔNG CẮM CHỐT** — đừng "sửa" chúng: `FantasyRaceArtBuilder` ghi pivot
cho từng ô của một **atlas Multiple** (khoá không phủ loại này), còn `StickmanHelmetLayerTool`
**chép pivot của tấm NGUỒN** sang lớp Front/Back nó sinh ra — tức nó đang **lan truyền** khoá chứ
không phá khoá; cắm chốt vào đó là làm lớp dẫn xuất lệch khỏi tấm gốc.

### ⚠ FANTASY RACE ART — ĐỪNG DÁN CHÂN DUNG VUÔNG LÊN STICKMAN

Art Fantasy AI hay trả về **ô caro RGB được vẽ vào ảnh**, không phải alpha. Đem atlas đó vào
Unity rồi chỉ đặt `alphaIsTransparency = true` KHÔNG xoá được nền; vào Game View nó thành các
ô trắng/xám sau đầu. Quy trình duy nhất là `FantasyRaceArtBuilder.PrepareArt()`:

1. Giữ `*_Source.png` nguyên vẹn; xuất bản xử lý sang atlas production (`Faces_v2` và
   `Bodies_v1`) để chạy lại không phá art gốc.

2. Flood-fill **chỉ vùng xám/trắng nối với mép ảnh** thành alpha 0 — không key toàn bộ màu
   trắng, vì tóc/răng/giáp trắng nằm bên trong viền phải còn nguyên.
3. Cắt 3×3, trim theo alpha và đặt pivot giữa phần vẽ cho overlay đầu. Không cắt nguyên ô
   vuông rồi hy vọng scale runtime che được phần nền.
4. **HÌNH DÁNG LÀ CỦA CHỦNG, KHÔNG PHẢI CỦA STICKMAN (2026-09-09 — luật cũ đã bị bỏ).**
   Luật trước ở đúng chỗ này viết *"chỉ `Head` là art Fantasy… không quay lại đắp một bộ
   full-body Fantasy rời lên rig"*. Người dùng bỏ luật đó: *"không cần form stickman mà vẽ
   theo hình dáng chủng tộc fantasy… vẽ monster thì kích thước hình dáng theo monster"*.

   Lý do đo được: cả 30 chủng dùng chung một bộ xương và một dải hình học đầu quá hẹp
   (crown 0.1–1.3 trên một cái sọ rộng 34 đơn vị), nên **goblin, khổng lồ, nhân mã và rồng
   ra cùng một cái bóng, khác nhau đúng màu**. Cỡ thì có bảng (`bodyScale` 0.66–1.55) nhưng
   art lại vẽ mọi chủng bằng nhau — hai bảng, không ai đồng bộ.

   Nay `FantasyRaceCatalog.BodyOf` là MỘT nguồn cho cả art lẫn cỡ trên sân
   (`Of().bodyScale = height / 0.73`), và `FantasyBodyPlan` quyết định vẽ gì:

   | Plan | Chủng | Tấm | Rig stickman |
   |---|---|---|---|
   | `Biped` | 21 chủng hình người | `Torso_*` (vỏ ngực) | GIỮ — còn cầm vũ khí, còn IK |
   | `Centaur` · `Serpent` · `Spectre` | nhân mã · naga · banshee · lich | `Hull_*` (nửa dưới) | giấu CHÂN, giữ tay + đầu |
   | `Quadruped` · `Arachnid` · `Blob` | rồng · wyvern · gryphon · nhện · slime · wisp | `Body_*` (nguyên con) | GIẤU HẾT |

   Chiều cao thật: wisp 0.34 → người 0.73 → khổng lồ 1.75 → rồng 2.10 world.

   ⚠ **Ba cái bẫy của cách này, đều im lặng:**
   - **Nhân số hai lần.** Art vẽ ở chiều cao thật, mà `FantasyRaceTactics` ĐÃ nhân
     `localScale` với `bodyScale`. `FantasyCreatureLook.BuildBodyShell` phải CHIA LẠI cho
     `height`; quên là khổng lồ cao gấp 5.8 lần người thay vì 2.4.
   - **Vỏ ngực phải lấy hông/vai CỦA RIG (0.44 / 0.62), không của chủng.** Rig luôn nối tay
     ở 0.62 và chân ở 0.44; vẽ vỏ theo hông của chủng rồi dán lên rig thì tay chân que thò
     ra ngoài khối thân — xem được ngay trên ảnh ghép, không có log.
   - **Nhóm "nguyên con" thiếu tấm `Body_*` là VÔ HÌNH**, vì `FantasyRigPaint` đã tắt cả rig
     theo plan. Phép đo: Doctor mục *«Chủng Fantasy THIẾU ART ĐẦU»* (đã cộng thêm vế THÂN).

   Giấu rig phải hỏi `FantasyBodyPlan`, không kê tay — và **lúc chết phải giấu đúng ngần ấy**
   (`FantasyCorpseLook.HiddenOnCorpse` = `FantasyRigPaint.Replaced`), nếu không con rồng ngã
   xuống thành một hình que đỏ.

   Chủng nào giữ được vũ khí thì tra `FantasyRaceLoadout`: nhân mã (cung) · naga/lich/banshee
   (trượng) phải giữ TAY, nên chúng chỉ được thay nửa dưới. Sáu chủng nhóm cuối đều dùng vũ
   khí cơ thể nên giấu hết rig không mất cây nào.

### ⚠ BIPED ĐỦ 5 MẢNH = MỘT NGUỒN VẼ, KHÔNG CÓ VỎ DỰ PHÒNG

Khi `FantasyRigPaint.HasPaintedBipedArt(kind)` đúng, năm mảnh
`{Kind}_Head|Torso|Limb|Hand|Foot` trong `FantasyRaceParts_v3` là **một nhân vật hoàn chỉnh**:
`FantasyRaceArt.FaceFor` phải lấy chính `{Kind}_Head`, và
`FantasyCreatureLook.BuildBodyShell` phải trả về trước. Không lấy đầu `Flat/{Kind}` rồi gắn
vào bốn mảnh này, cũng không đắp `Flat/Torso_{Kind}` codegen phía dưới — hai lối ấy làm đầu,
thân và khớp có hai tỉ lệ/đổ bóng, đồng thời chồng silhouette khi chạy. `Flat`/atlas cũ chỉ là
fallback cho chủng chưa đủ cả năm mảnh. Phép đo: Doctor › *«Biped Fantasy CHỒNG / LỆCH nguồn
art»*.

⚠ **XÁC PHẢI GIỐNG STYLE LÚC SỐNG.** `FantasyRigPaint` nằm trong group `Sprite` và sẽ bị tắt
trước `Died`; vì vậy `FantasyCorpseLook` phải ở ROOT, cache renderer `*Ragdoll` KHI CÒN SỐNG,
đổi **chỉ Head** sang art Fantasy rồi alpha-mask nhuộm body/chi ragdoll stickman trong event
`Died` (sau `EnableRagdoll`). Cấm tạo xác/renderer riêng ngoài group `Ragdoll`: nó sẽ không nhận
physics, freeze, fade và despawn chung. `FantasyRaceMotion` tìm `FantasyHeadReplacement` trên
TOÀN character và không ghi bone/IK. Atlas đầu cận camera dùng `Bilinear`, không mipmap, không
nén block, `maxTextureSize >= 4096`; flood-fill chỉ xoá trắng/xám trung tính NỐI với mép ảnh để
giữ highlight/răng/xương trong outline. Đổi importer, shader hoặc slice phải tăng recipe nếu
cần và khai nguồn vào job để Bảng điều khiển tự báo cũ; material alpha-mask phải là asset
`Resources` để player build không strip shader.

### ⚠⚠ TẤM KHÔNG NHÃN = TOOL VẼ LẠI THÀNH NÚT CHẾT (2026-09-09)

`CanCodeWrite` đọc nhãn trong `TextureImporter.userData`: **không nhãn = art của NGƯỜI,
không đè**. Luật đó đúng, nhưng nó biến mọi lần **quên gắn nhãn lúc ghi** thành một cái
nút bấm không bao giờ ăn, không một dòng lỗi:

```
generator ghi PNG mà KHÔNG gắn stickman:codegen
  → lần sau CanCodeWrite trả false cho ĐÚNG những tấm chính nó vẽ
  → bấm «Vẽ LẠI» → 0 tấm được ghi → mtime không đổi
  → Bảng điều khiển VÀNG VĨNH VIỄN, và trong game vẫn là art cũ
```

Đo được: 41/41 tấm `Assets/Resources/Fantasy/Races/Flat` không nhãn (Weapons 0/1930,
Environment 0/64, Looks 0/86 — tức chỉ generator này hỏng). Kèm theo: `spriteMode` còn
*Multiple* và PPU còn 100 thay vì 190 — dấu hiệu `Configure()` **chưa bao giờ chạy**.

**Nguyên nhân:** vòng vẽ bọc trong `AssetDatabase.StartAssetEditing()`. Trong mẻ đó Unity
HOÃN import, nên `AssetImporter.GetAtPath` trả **null** cho file vừa ghi, mà mọi hàm
`Configure`/`SetTag` đều thoát sớm khi importer null.

**Ba luật rút ra:**

1. **Không bọc `StartAssetEditing` quanh đoạn có ghi `.meta`** (cài đặt import, nhãn nguồn).
   Cùng bài học đã ghi ở `TagExistingGeneratedArt` (AGENTS 2e-0h).
2. **Thư mục đầu ra của generator phải có tên trong `StickmanArtSource.GeneratorFolders`**,
   kể cả khi nó nằm ngoài `Assets/Sprites` (đã thêm `Resources/Fantasy/Races/Flat` và
   `Sprites/Looks`) — không có tên thì nút «Gắn nhãn «do code vẽ»» cũng không cứu được.
3. **Generator nên tự NHẬN LẠI art của chính mình** ở đầu lượt vẽ
   (`FantasyRaceSilhouetteArt.AdoptOwnOutput`): tấm KHÔNG nhãn trong thư mục riêng của nó thì
   đóng nhãn codegen. Tấm `stickman:hand` vẫn được chừa — đó mới là cửa chặn thật.

**Phép đo tự động:** `StickmanDoctor` mục *«Art trong thư mục generator KHÔNG MANG NHÃN»* — thư mục nào có quá nửa số tấm không nhãn thì VÀNG (người dùng thả vài tấm art thật vào là chuyện hợp lệ, cả bộ không nhãn thì là generator hỏng). File `StickmanDoctor.ArtSource.cs`.

**Cách đo nhanh** (PowerShell, từ gốc repo) — đếm tấm không nhãn trong một thư mục art:

```powershell
(Get-ChildItem Assets/Sprites/Weapons -Recurse -Filter *.png.meta |
  Where-Object { -not (Select-String -Path $_.FullName -Pattern 'userData: stickman:' -Quiet) }).Count
```

### ⚠ FANTASY RACE LOADOUT — KHÔNG MẶC ĐỒ NGƯỜI LÊN QUÁI VẬT

`FantasyRaceLoadout` là nguồn sự thật khi spawn 9 chủng: nó nhận `FantasyCreatureKind` +
`UnitRank`, implement `INoAutoDress`, và dọn outfit Trung cổ trước khi `FantasyCreatureLook`
vẽ cơ thể native. Với sân chính, art `Unified` chứa cả nón/giáp/chất liệu cấp bậc trong **một
silhouette** (`Levy` đơn giản · `Regular` huấn luyện · `Elite` tinh nhuệ); tuyệt đối không phát
nón hoặc giáp rời. Bảng `helmetFrom`/`armorFrom` chỉ còn là dữ liệu tương thích cho art cũ
fallback, không được dùng để dựng Equipment. **Tiên/Skeleton/Quỷ:** cầm đúng vũ khí roster
nhưng không đội nón/giáp rời. **Troll/Harpy/Rồng:** cơ thể là vũ khí/giáp — không phát weapon,
nón hoặc giáp; giữ `Weapon_Fists` không sprite để dùng hitbox/combo chung.

⚠ **ART FANTASY KHÔNG ĐƯỢC KÉO GIÃN BẰNG MỘT LƯỚI.** Một ảnh toàn thân skin theo nhiều bone sẽ
cao su hoá hình ở khuỷu tay/đầu gối khi action chạy. Nguồn phải được cắt thành `Head · Torso ·
Limb · Hand · Foot` theo từng chủng trong `FantasyRaceParts_v3`; `FantasyRigPaint` gắn từng
`SpriteRenderer` vào đúng bone Character. Thay pixel hoặc hàng art xong phải chạy `Fantasy — cắt
mảnh theo rig Stickman`. Tool đi qua Sprite Editor data provider có capability check để trim/đặt
pivot socket (không sửa `.meta` tay); Doctor đo đủ 45/45 mảnh và điểm nối `FantasyRigPaint` trước
khi cho qua. Đây là mảnh cơ thể của một thiết kế, không phải nón/giáp lắp rời.

⚠ `Unequip()` chỉ giấu cây đang cầm, KHÔNG dọn kho prefab. Loài tự nhiên phải gọi
`StickmanWeaponHolder.UseNaturalWeaponsOnly()` để rút kho, chặn AI đổi/nhặt vũ khí về sau;
loài có vũ khí gọi `KeepCurrentWeaponOnly()` để AI không móc cây của chủng khác ra. Builder
Fantasy mới phải áp policy trước look/motion và khai `FantasyRaceLoadout.cs` trong
`extraSources` job scene, để Bảng điều khiển báo scene cần dựng lại sau khi sửa policy.
**Sân kiểm Fantasy phải lộ đủ 9 chủng** (Tiên/Lùn · Orc/Goblin · Skeleton/Troll/Quỷ/Harpy/Rồng),
không chỉ vẽ đủ trong atlas rồi để hai loài cuối không bao giờ spawn để kiểm art, pivot và policy.

**TIẾNG → Gemini.** Vẫn tìm trong gói SFX TRƯỚC (bảng `StickmanAudioBuilder.Library`); không
có mới nhờ sinh. Xin **WAV mono 44.1 kHz, ngắn (0.2–1.5 s), KHÔNG fade đầu, KHÔNG nhạc nền,
KHÔNG khoảng lặng đầu/cuối**. Nhận về thì đo bằng `sfx.py report()` (đỉnh · RMS · độ dài ·
im lặng đầu file) rồi thả vào `Assets/Sounds/SFX/` + nối một dòng vào bảng
`StickmanAudioBuilder.Library` + chạy `Audio > 2` — quên nối bảng thì cây đó **câm lặng
không có lỗi nào báo**.

⚠ **BA THỨ KHÓ, NHƯNG VẪN ĐẶT CHATGPT — chỉ là phải KIỂM khi nhận về** (luật cũ liệt kê
chúng như "phải vẽ bằng code"; đó là né việc, không phải giới hạn kỹ thuật):

| Khó ở chỗ | Đặt thế nào | Kiểm lúc nhận |
|---|---|---|
| **LẶP LIỀN MẠCH** (mặt cỏ, nền trời) | xin ảnh *tileable theo chiều ngang* | so cột trái với cột phải: lệch > 8/255 là hở mạch → xin lại |
| **MÀU KHỚP TUYỆT ĐỐI** với thứ khác | đưa thẳng mã HEX vào prompt | lấy màu trung bình vùng nối, so với hằng số |
| **SPRITE CỦA RIG** | ChatGPT vẽ PNG là được | phần bone vẫn phải qua **Skinning Editor** của Unity — đúng SỐ BONE + THỨ TỰ; đó là bước RIG, không phải bước vẽ |

⚠ **SPRITE VŨ KHÍ ĐÃ CÓ LỚP VIỀN CHUNG** (`WeaponArtGenerator.Polish`, chạy trong `Save`):
viền tối nở ra ngoài + mép trên bắt sáng. Làm ở tầng `Save` nên **53 cây + 5 cấp + skin 15 nền
văn minh** đều ăn theo, không sửa hàm vẽ nào. Nó làm art code-gen **ĐỌC ĐƯỢC**, không làm nó
**ĐẸP** — muốn đẹp vẫn phải theo luật dưới đây.
⚠ Chỉ áp cho VŨ KHÍ: nón/giáp/khiên văn minh gọi `Save(..., polish: false)` vì đã tự có viền và
khổ ảnh của chúng là dấu nhận diện của `GeneratedSizes`.

⚠⚠ **KHÔNG ĐƯỢC IM LẶNG THAY THẾ — VÀ NAY CŨNG KHÔNG ĐƯỢC "SỬA TẠM VÀI CON SỐ".**
Luật cũ còn chừa một cửa: *"sửa một tấm art code-gen ĐANG CÓ thì cứ sửa"*. Chính cái cửa đó
làm art code-gen sống mãi — mỗi lần chỉ chỉnh vài con số nên không lần nào đáng đi đặt hàng,
và sau vài chục lần thì vẫn là mấy khối `Circle`/`Rect`. **Cửa đó đã đóng.**
Thấy art sai/xấu thì: (1) nói rõ nó sai ở đâu, ĐO ĐƯỢC nếu đo được; (2) viết bản mô tả cho
ChatGPT vào `Docs/KnowledgeBase/WeaponArt-ChatGPT-Prompt.md`; (3) nhận file về, cắt/đo/gắn.
Chỉ được đụng vào hàm vẽ khi chữa một lỗi **HÌNH HỌC/LẮP RÁP** (pivot, cỡ, chỗ đặt, thứ tự vẽ)
— tức thứ mà tấm art nào thay vào cũng vẫn sai nếu không sửa — **hoặc khi bản sắc SAI** (nền
này không có kiểu mái/vật liệu đó; biome này không có loại cây đó): sửa Ở BẢNG STYLE, không
sửa số lẻ trong hàm vẽ, rồi bấm nút force và nhìn sheet.

⚠ **HAI TOOL ĐÃ NÂNG (2026-09-05, user: *"cải thiện tool vẽ hình, tool tạo âm thanh"*):**
· **Hình**: `Tools > Stickman > Nâng cao > Art > Soi bộ art — contact sheet theo cỡ thật`
  (`StickmanArtSheet`, có trên Bảng điều khiển, proof `Docs/ArtSheets/Structures.png`): mỗi thư mục
  art thành MỘT PNG ở CÙNG thang 40 px = 1 đơn vị world + stickman 0.73 đầu mỗi hàng + `.txt` thứ
  tự. Đọc PNG bằng `File.ReadAllBytes` (không `GetPixels`). Phía Python, `envcanvas.py` thêm
  `FillRectI` (inclusive ĐÚNG khuôn C# — `FillRect` cũ hụt một pixel mỗi mép), `SoftDisc` ·
  `Glow` · `GradientV` · `Noise` · `Polyline` · `Clear` · `opaque_bounds`, `stickman()` thước và
  `sheet(scale=, labels=)` xếp chung đường chân.
· **Tiếng**: `sfx.py` thêm preset `cannon` · `crater_thud` · `rubble` · `footstep_grass` · `wind`
  (lặp được), bảng `PRESETS`, `render_presets(outdir)` và **CLI**:
  `python sfx.py --demo <thư mục> [--only Cannon Wind]` xuất WAV + PNG + in bảng đo;
  `python sfx.py --report a.wav b.wav`. ⚠ Đã đo và trả giá: lọc MỘT cực trên nhiễu trắng cho
  trọng tâm phổ ~5 kHz (tức chưa lọc gì) — gió/đá vụn phải ba cực nối tiếp / `order=3`.

⚠ **LUẬT SỐ 1 — CẢ BA LÀN HỎNG TRONG IM LẶNG.** Nón vẽ sai khối, hạt bay sai trục, cây vũ khí
quên nối bảng tiếng: biên dịch sạch, tool báo thành công, **không một dòng lỗi nào**. Cho nên
quy trình BẮT BUỘC có bước kiểm bằng GIÁC QUAN, không phải bằng cách đọc lại code:

| Làn | Kiểm bằng | Ai kiểm |
|---|---|---|
| **HÌNH** | render PNG + contact sheet rồi NHÌN | AI tự nhìn được |
| **HẠT** | vào Play mà xem | **user** — AI không chạy được Unity |
| **TIẾNG** | `report()` đo số + vẽ dạng sóng/phổ, rồi **NGHE** | AI đo, **user nghe** |

⚠ **AI KHÔNG NGHE ĐƯỢC và KHÔNG CHẠY ĐƯỢC UNITY.** Cấm viết "tiếng chém nghe rất đã" hay
"hiệu ứng nhìn rất mượt". Đo được gì thì nói đúng cái đó, phần còn lại đưa file cho user.

**HÌNH** — vẽ ở Python TRƯỚC (`canvas.py` trùng tên hàm + trùng công thức với
`WeaponArtGenerator.PixelCanvas`, nên số dán sang C# là ra đúng hình đó), NHÌN, rồi mới port.
Ba luật vẽ nón (một khối liền có viền · dải hẹp hơn vòm · dưới `FaceLine` là mặt, `CutFace`
gọi sau cùng) đã ghi ở mục nền văn minh — phá luật nào cũng ra "cái bàn có chân".
Đo cỡ bằng **PHẦN VẼ ĐƯỢC** (`opaque_bounds` / `StickmanRigMetrics.FitOpaqueWidth`), đừng đo
cả khung ảnh.

**HẠT** — TĨNH thì là SPRITE, CHUYỂN ĐỘNG thì là HẠT (mục *Bối cảnh & hình công trình* §5).
Bốn bẫy "không thấy gì": xoay object hạt **−90° quanh X** · particle cần **`Material`** chứ
không nhận `Sprite` (shader `Sprites/Default`) · **`prewarm = true`** · ô phát co theo khung
nhìn. Effect chiến đấu luôn đi qua `EffectManager.Play` + bảng `EffectLibrary`.

**TIẾNG** — tìm trong gói SFX TRƯỚC (bảng `StickmanAudioBuilder.Library` là nguồn sự thật),
tự tổng hợp SAU. Bốn bẫy khi tổng hợp, đều chỉ bắt được bằng `report()`: lọc một tầng là chưa
lọc (`order=3..4`) · `resonator` đừng nhân `(1-r)` (tiếng ngân bị dìm mất) · vuốt đầu file
3 ms là ĂN MẤT cú đánh (đầu 0.5 ms thôi) · cắt đuôi im lặng (`trim_silence`).


## TOOL VẼ — HẬU KỲ Ở TẦNG `Save()` (2026-09-06)

`EnvCanvas.Volume · Shade · Grain · EdgeOutline`, gọi trong `StickmanStructureArt.Save()`
theo ĐÚNG thứ tự đó. Chúng chạy trên tấm ĐÃ VẼ XONG, nên nâng cả bộ 230 tấm mà không phải
sửa một hàm vẽ nào — và art thật người dùng thả vào vẫn được chừa (`StickmanArtSource` chặn
trước khi tới đây).

| Lượt | Làm gì | Vì sao |
|---|---|---|
| `Volume` | dốc sáng từ dưới lên (chân −13 %, đỉnh +7 %) | mắt đọc khối chủ yếu qua gradient LỚN, không qua viền |
| `Shade` | mép quay về nguồn sáng (trên-trái) sáng lên, mép quay đi tối xuống, dò 3 vòng | biến mảng màu phẳng thành khối có bề dày |
| `Grain` | nhiễu ±3.5 % nhân vào màu, seed từ TÊN TỆP | bề mặt phẳng lì đọc ra "nhựa" |
| `EdgeOutline` | làm tối vành ngoài, VẼ VÀO TRONG | khổ ảnh không đổi một pixel |

⚠ **LUẬT VÀNG: ngoài khung ảnh coi như ĐẶC.** Chi tiết cắm chồng (tầng nhà · thân tháp · khối
tường) vẽ kín tới mép; coi ngoài khung là trong suốt thì chúng bị đánh khối và viền ngay tại
đường nối ⇒ lộ khe, đúng cái luật «vẽ kín hai mép trên/dưới» cấm.
⚠ `Volume` còn CHỪA HẲN tấm nào phủ kín ≥ 95 % cả hàng đáy lẫn hàng đỉnh — đó là khúc thân
lặp, kéo dốc lên nó thì cả cái tháp thành một chồng SỌC NGANG ở chỗ nối.
⚠ `EdgeOutline` chừa nét MẢNH (3×3 không đủ 5 pixel đặc): dây phơi, ăng-ten, tia nước rộng
1–2 px sẽ thành một vệt đen tuyền.
⚠ Viền đi SAU cùng: đánh khối trên tấm đã có viền là làm SÁNG chính cái viền (nó nằm ở rìa
hình bóng, tức chỗ "quay về nguồn sáng").
⚠ Seed vân hạt lấy từ tên tệp ⇒ sinh lại không đổi một pixel, Unity không phải import lại.

Hai primitive cũng được sửa: `Stroke` nay là CAPSULE (đo khoảng cách tới đoạn) thay vì dập
chuỗi đĩa — bản cũ cộng dồn alpha ở chỗ chồng nên mép gợn sóng và nét mờ đậm lên; `Triangle`
quét 3 hàng con mỗi pixel nên cạnh xiên hết răng cưa theo chiều dọc. Bản mô phỏng
`envcanvas.py` đã khớp cả bốn lượt và cả hai primitive.

### Mở rộng CHIỀU: hậu kỳ nay chạy cho MỌI generator, không riêng công trình

Bản đầu chỉ `StickmanStructureArt` chạy hậu kỳ, nên cùng một bức tường mà tấm trong
`Structures/` có khối còn tấm trong `Buildings/` phẳng lì — đứng cạnh nhau trong một map là
lộ ngay. Nay có **hai cửa**, và mọi generator phải đi qua một trong hai:

| Cửa | Ai đi qua | Số tấm |
|---|---|---|
| `PixelCanvas.Refine` trong `WeaponArtGenerator.Save` | vũ khí + 5 bản cấp · nón/giáp/khiên 15 nền · mặt · vật cưỡi · thuyền · hiệu ứng · quân hàm | ~400 |
| `EnvCanvas.Refine` trong `StickmanStructureArt/EnvironmentArt/BuildingArt.Save` | công trình lắp ghép · nhà · bối cảnh | ~290 |

Thêm hai lượt so với bản đầu:

| Lượt | Làm gì | Vì sao |
|---|---|---|
| `Crease` | ấn tối cạnh dưới-phải của mỗi RANH GIỚI MÀU trong lòng sprite | `Shade` chỉ đọc ALPHA, nên chi tiết vẽ ĐÈ lên thân (đai, tấm ngực, khe cửa, nan giỏ) vẫn phẳng lì — mắt đọc ra "sticker dán lên" |
| dịch NHIỆT ĐỘ (trong `Mul`/`Tint`) | chỗ bị làm tối ngả LẠNH, chỗ được làm sáng ngả ẤM | chỉ nhân độ sáng thì mắt vẫn đọc ra NHỰA; có dịch nhiệt độ mới ra kim loại / đá / da |

⚠ **`Crease` phải chạy SAU `Volume`/`Shade`.** Nó đọc chênh lệch màu; chạy trước thì đúng,
chạy sau nữa thì nó bắt luôn cái gradient vừa thêm và kẻ một cái gờ ngang bụng sprite.
⚠ **`Grain` đổi biên độ theo ĐỘ SÁNG** (`0.022 × (0.35 + 0.65 × (1 − lum))`) và **bỏ qua sprite
< 24 px**. Cùng một biên độ tuyệt đối, mặt TỐI nuốt hạt còn mặt SÁNG (vải trắng, đá vôi, cánh
buồm) hiện ra thành CÁT — đọc ra "ảnh bị nhiễu", không ra chất liệu.
⚠ **VIỀN TRONG chỉ thêm khi tấm CHƯA có viền** — `PixelCanvas.HasOwnOutline()` **ĐO** (độ sáng
vành ngoài < 72 % ruột) chứ không kê danh sách: vũ khí sẽ được viền NGOÀI ở `Polish`, còn
nón/giáp/khiên tự vẽ viền sẵn. Kê tay là chắc chắn có ngày thêm generator thứ tám rồi quên,
mà quên thì viền chồng viền — dày gấp đôi và **không có lỗi nào báo**.
⚠ **`Refine` KHÔNG đổi khổ ảnh một pixel.** Bắt buộc: `CivilizationArtGenerator.GeneratedSizes`
nhận diện art code-gen BẰNG KHỔ ẢNH. `Polish` (nới 2 px mỗi phía) vẫn chỉ dành cho vũ khí.
⚠ **Seed vân hạt dùng FNV-1a tự băm, KHÔNG dùng `string.GetHashCode()`** — hàm đó bị random
hoá theo tiến trình trên .NET Core, nên mỗi lần mở Unity lại ra vân khác: cả bộ art "đổi" mà
không ai sửa gì, và mỗi mẻ dựng lại đẻ ra một mẻ diff giả.

⚠⚠ **HẬU KỲ LÀM ART CÓ CHẤT, NÓ KHÔNG LÀM ART ĐẸP.** Con gấu vẽ bằng ba hình tròn trắng, sau
hậu kỳ vẫn là ba hình tròn trắng có bóng. Đây không phải cửa lách LUẬT NGUỒN ASSET ở đầu file:
thứ tự đúng vẫn là **ĐẶT ChatGPT vẽ**, hậu kỳ chỉ nâng tấm đang có trong lúc chờ. Bảng đo
"nên đặt cái nào trước" ở `Docs/KnowledgeBase/ArtWorklist.md`, chạy lại bằng
`.claude/skills/stickman-assets/scripts/rank_art.py`.

Thử trước khi đổi số: `.claude/skills/stickman-assets/scripts/refine.py --sheet` (trùng tên
hàm, trùng công thức với C#).
