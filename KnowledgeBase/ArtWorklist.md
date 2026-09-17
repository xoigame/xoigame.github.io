# DANH SÁCH VIỆC — ART CÒN THIẾU (bản gõ tay 2026-09-02)

> ⚠⚠ **BẢN NÀY ĐÃ CŨ VÀ KHÔNG CÒN ĐƯỢC CẬP NHẬT.** Danh sách còn-thiếu nay do tool đo:
> `★ Bảng điều khiển > Hình > ★ ĐẶT HÀNG ART` → `Docs/ArtOrders/INDEX.md` (đếm lại mỗi lần
> bấm). File này giữ lại vì phần **khuôn và luật intake** (khuôn nón/giáp/cung/giáp ngựa,
> lệnh `intake_*.py`, bẫy "mỗi hàng chỉ một cây") vẫn đúng — đừng đọc phần ĐẾM ở đây nữa.
>
> Vì sao bỏ bản gõ tay: nó chốt ngày 02-09, mà sau đó kho vũ khí lên 68 tấm và nền văn minh
> lên 31 — đọc theo nó là đặt thiếu món, và không có gì báo.

## ĐÃ XONG HÔM NAY

| Bộ | Số lượng | Đường nhận |
|---|---|---|
| Nón theo CẤP 1–5, **15 nền** | 75/75 | `intake_fid.py <sheet> <nền> --tier Helm_<nền>` |
| Giáp theo CẤP 1–5, **15 nền** | 75/75 | `intake_row.py <sheet> <nền> Armor_<nền>` |
| Vũ khí CHUNG theo CẤP 0–5 | 24 dòng × 6 = 144 | `intake_wep.py` (ngang) · `intake_bow.py` (cung) |

### ✅ TRUNG CỔ — XONG TRỌN BỘ (22 dòng × 6 cấp)

Cận chiến + ném: Sword · Saber · SaberLong · SaberShort · Axe · Mace · Club · Warhammer ·
Hammer · Spear · Lance · Javelin · Halberd · Quarterstaff · Flail · Shield · Claws
Tầm xa: **Bow · Longbow · Crossbow · Sling · Matchlock**
Kèm 2 dòng fantasy tiện làm luôn: Trident · Scythe.

⚠ Cung vẽ DỌC nên đi khuôn RIÊNG: `bow_template.py` → `intake_bow.py`, và intake TỰ KIỂM
**hai** luật: bụng ở +X / dây ở −X, và **KHÔNG có dây vẽ sẵn** (dây là `LineRenderer` của
Unity để làm hiệu ứng kéo căng — xem `WeaponArt-ChatGPT-Prompt.md` mục 8a).
Khuôn: `head_template_big_5.png` (nón) · khổ 2560×512 (giáp) · `hand_template_6.png` (vũ khí).
⚠ Prompt phải ghi: **"KHÔNG CHẠM NHAU"** và với vũ khí **"MỖI HÀNG CHỈ ĐÚNG MỘT CÂY"** — thiếu là mảnh hàng nọ dính hàng kia.

## CÒN LẠI

### Vũ khí chưa có bộ 0–5 (kho CHUNG)

· Fantasy/hiện đại (để sau, trung cổ xong rồi): `Runeblade` · 6 trượng phép · 6 súng hiện đại
· DỌC (cần khuôn riêng, chưa làm): `Bow`, `Longbow`, `Crossbow`, `Sling` — bụng cung quay +X, dây ở −X
· Trượng phép (6 cây) + súng hiện đại (6 cây): chưa đặt.

### GIÁP NGỰA theo CẤP 1–5 (mới mở, 0/25)

Cấp của VẬT CƯỠI là **giáp ngựa**, không phải con ngựa khác — xem `AGENTS.md` mục
*7b-thang05-cuoi*. Cấp 0 = ngựa TRẦN, không đặt art.

| Loài | Khuôn | Nhận về bằng |
|---|---|---|
| `Horse` · `Camel` · `Elephant` · `Buffalo` · `Bear` | `barding_template_<loài>.png` | `intake_barding.py <sheet> <loài>` |

⚠ Khuôn là **BÓNG HỒNG của chính `<loài>_Body.png`** phóng to lên rộng 1024, xếp 5 ô dọc.
Hoạ sĩ vẽ tấm giáp **ĐÈ LÊN** bóng hồng; intake xoá hồng rồi thu nhỏ về đúng khung gốc và
chép PIVOT của thân. **KHÔNG trim, KHÔNG căn giữa** — vị trí trong khung chính là thông tin.
⚠ Sinh lại khuôn: `python barding_template.py <loài>`.

### Skin vũ khí GỐC theo nền còn thiếu (32 tấm)

· Arab       Javelin, Shield
· Byzantine  Bow, Shield
· China      Shield
· Crusader   Shield
· DaiViet    Shield
· Egypt      Bow, Javelin, Shield
· Europe     Longbow, Shield
· India      Javelin, Longbow, Shield
· Mongol     Javelin, Shield
· Ottoman    Bow, Matchlock, Shield
· Persia     Bow, Longbow, Shield
· Pirate     DualSabers, Javelin
· Rus        Bow, Javelin, Lance, Shield
· Viking     Hammer, Javelin, Shield

## SAU KHI NHẬN THÊM ART

Bấm **★ Bảng điều khiển → ★ 15 nền văn minh — art theo CẤP + asset** (nó tự: dọn recolor → quét folder → gắn `_tierSprites` prefab).

---

# ĐỢT 2026-09-06 — "art code vẽ hơi xấu"

## Đã làm được gì bằng CODE (và vì sao chỉ tới đó)

Thêm một tầng **HẬU KỲ** ở đúng chỗ mọi tấm art đi qua lúc ghi file:

| Cửa | Ai đi qua | Lượt chạy |
|---|---|---|
| `WeaponArtGenerator.Save` → `PixelCanvas.Refine` | vũ khí · 5 bản cấp · nón/giáp/khiên 15 nền · mặt · vật cưỡi · thuyền · hiệu ứng · quân hàm | Volume → Shade → Crease → Grain → (EdgeOutline nếu tấm CHƯA có viền) |
| `EnvCanvas.Refine` | công trình lắp ghép · nhà cửa · bối cảnh | như trên, luôn có viền |

Bốn thứ nó thêm vào: **khối theo chiều đứng** · **đánh khối theo hình bóng** (sáng chếch
trên-trái) · **gờ ở ranh giới hai mảng màu** · **vân hạt theo độ sáng**; cộng một phép **dịch
nhiệt độ** (chỗ tối ngả lạnh, chỗ sáng ngả ấm) — đây mới là thứ tách "khối màu bị nhân độ
sáng" khỏi "vật thể có chất liệu".

**KHÔNG hàm vẽ nào bị sửa**, và art người dùng tự đặt vẫn được chừa nguyên (`StickmanArtSource`
chặn trước tầng này). Xem bản mô phỏng để thử trước: `.claude/skills/stickman-assets/scripts/refine.py`.

⚠ **Hậu kỳ làm art ĐỌC ĐƯỢC và CÓ CHẤT, nó KHÔNG làm art ĐẸP.** Một con gấu vẽ bằng ba hình
tròn trắng, sau hậu kỳ vẫn là ba hình tròn trắng có bóng. Muốn đẹp thì phải ĐẶT — bảng dưới đây
là thứ tự nên đặt.

## Bảng ĐO — đặt cái nào trước

Đo bằng `rank_art.py`: **số màu** · **độ bão hoà** · **tỉ lệ pixel ở ranh giới màu**. Điểm
cao = ít màu, nhạt, không có chi tiết bên trong — tức "nhìn ra bản nháp".

| Ưu tiên | Bộ | Điểm | Vì sao |
|---|---|---|---|
| **1** | `Mounts/` (21) — Bear/Buffalo Body · LegUpper · LegLower · Saddle | 56 | **2–4 màu, bão hoà 0.00**: con gấu và con trâu hiện ra là mấy khối TRẮNG. Tệ nhất trong game. |
| **2** | `Naval/` (6) — Ship_Hull · Sail · Mast · Flag · Wheel · Cannon | 62 | Buồm và thân thuyền **một màu trắng**, không có gỗ, không có vải. |
| **3** | `Insignia/` (2), `Buildings/Police·Army·Terrorist·Robbers` (16) | 55–77 | Khối chữ nhật phẳng, đọc không ra công trình. |
| **4** | `Civilizations/Crusader·Arab·Viking·DaiViet` (39) | 40–52 | Nhóm nền văn minh còn dùng art code; Japan/Egypt/Pirate… đã có art thật nên điểm thấp. |
| 5 | `Weapons/` (92) | 38 | Đã có viền + hậu kỳ nên đọc được; đặt sau cùng vì số lượng lớn mà đã dùng tạm được. |

⚠ **ĐIỂM CAO KHÔNG PHẢI LÚC NÀO CŨNG LÀ LỖI.** `Environment/Hill_*` và `Peak_*` chấm 85–97
vì chúng đúng **một màu** — nhưng đó là **bóng đồi ở xa**, và bóng phẳng một màu chính là cách
lớp nền xa phải vẽ. Đừng đặt lại nhóm đó theo bảng điểm; đọc bảng bằng mắt trước khi đặt hàng.

Chạy lại phép đo bất cứ lúc nào:

```
python .claude/skills/stickman-assets/scripts/rank_art.py 30
```

## Prompt

Dùng nguyên bộ ràng buộc ở `WeaponArt-ChatGPT-Prompt.md` §1, rồi thêm phần riêng của từng bộ.
Với **vật cưỡi** và **thuyền** thì nhớ ghi thêm hai câu — hai lỗi này khuôn không tự bắt được:

```
- Con vật vẽ NGHIÊNG ĐỨNG YÊN, bốn chân tách rời rõ, KHÔNG vẽ người cưỡi, KHÔNG vẽ yên
  (yên là một tấm RIÊNG cùng khổ).
- Thuyền vẽ nguyên chiếc nhìn ngang mũi quay PHẢI, nhưng CỘT · BUỒM · CỜ · BÁNH LÁI là các
  tấm RIÊNG cùng khổ — máy lắp chúng lên thân theo ổ cắm.
```
