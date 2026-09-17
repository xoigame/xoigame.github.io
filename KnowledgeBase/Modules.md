# Module hoá — dùng bộ khung này trong một dự án khác

> Dự án này là **BỘ KHUNG**, không phải một game. File này trả lời đúng một câu:
> *"làm game mới thì lấy phần nào, bỏ phần nào, và làm sao không lấy nhầm."*
>
> Cửa sổ: `Tools > Stickman > Nâng cao > Modules > Bảng module`
> Phép kiểm: `Tools > Stickman > Nâng cao > Modules > Kiểm tra kiến trúc`
> Nguồn sự thật: `Assets/Editor/Pipeline/StickmanModules.cs` (bảng `All`)

---

## 1. Mười module, xếp TẦNG

Mỗi thư mục dưới `Assets/Scripts/` là MỘT assembly riêng (`.asmdef`). **Tham chiếu chỉ đi
TỪ DƯỚI LÊN trong bảng này** — module ở tầng 5 dùng được tầng 0–4, KHÔNG được dùng tầng 6+.

| # | Module | Cho cái gì | Bỏ được khi |
|---|---|---|---|
| 0 | **Core** | enum vũ khí · `DamageInfo` · dữ liệu rig · pool · `StickmanUI` · **hợp đồng giữa module** | không bao giờ |
| 1 | **Combat** | nhân vật + ragdoll + di chuyển + leo trèo + phe + vũ khí + đạn + trang bị + trạng thái + hiệu ứng + ngựa + công trình | không, nếu còn muốn đánh nhau |
| 2 | **AI** | FSM, lối đánh theo vũ khí, module lắp rời, cây chỉ huy, playbook, ẩn thân | game chỉ có người chơi |
| 3 | **Units** | loadout · archetype · 15 nền văn minh · skin vũ khí · thể loại | game tự quyết trang bị bằng code riêng |
| 4 | **Gameplay** | luật thắng thua (15 mode), hồi sinh, bậc khó, kinh tế, ngày/đêm, camera, cần ảo | game tự viết luật ván |
| 5 | **Naval** | thuỷ chiến: thuyền là sàn di động có máu, áp mạn, pháo | **không có biển → bỏ ngay** |
| 6 | **Map** | `MapDefinition`/`Recipe`/`Library`, 7 kiểu nhiệm vụ, map ngẫu nhiên theo seed, CSV | map dựng tay |
| 7 | **Zombie** | 5 loại zombie, lây nhiễm, ổ phục kích | **không có zombie → bỏ ngay** |
| 8 | **Demo** | ô chọn scene (F1), bảng chỉ huy (F9), phòng thí nghiệm AI, bàn thử | ★ **game thật thì bỏ** — đồ nghề của người làm |
| 9 | **Editor** | hơn 100 mục menu: sinh art, vũ khí, scene, map, cân bằng | asset đã chốt, không sinh lại nữa |

**Phép thử của module hoá:** xoá hẳn `Assets/Scripts/Naval` thì phần còn lại vẫn biên dịch.
Đã kiểm: 10/10 module biên dịch RIÊNG được.

---

## 2. Bốn bộ hay dùng

| Muốn gì | Lấy |
|---|---|
| Chỉ cần nhân vật stickman đánh nhau | Core + Combat |
| Có bot | + AI |
| Game thật, có ván có thắng thua | + Units + Gameplay |
| Vẫn muốn sửa art/scene bằng tool | + Editor |
| Đang HỌC bộ khung, muốn xem thử mọi bài test | + Demo (và mở các scene `Demo_*`) |

Trong cửa sổ Bảng module có sẵn hai nút: **«Chọn bộ TỐI THIỂU»** và **«Chọn bộ GAME THẬT»**.

---

## 3. Cách mang sang dự án khác

### Cách A — nút XUẤT (khuyên dùng)

1. Mở `Tools > Stickman > Nâng cao > Modules > Bảng module`
2. Tick module cần → cửa sổ tự hiện *"sẽ xuất N module"* (đã kèm mọi tầng dưới)
3. Bấm **XUẤT** → chọn đúng thư mục `Assets/` của dự án đích
4. Sang dự án đích, chờ import xong, bấm **Kiểm tra kiến trúc**

Nút này chép cả **asset đi kèm** (prefab, sprite, settings, resources) theo bảng trong
`StickmanModules.All` — không phải tự nhớ "hệ vũ khí thì cần thư mục nào".

### Cách B — git submodule (khi còn sửa core dài dài)

Repo game mượn nguyên repo này, sửa core **ngay trong lúc làm game** rồi `push` thẳng lên đây.
Toàn bộ lệnh, bảng cấu hình `ProjectSettings/` phải dựng lại, và sáu cái bẫy nằm ở
**[Submodule.md](Submodule.md)** — đọc mục 5 ở đó trước khi gõ `git submodule add`.

```powershell
./Docs/Tools/UseAsSubmodule.ps1 -Init -GameProject 'D:\Project\MyGame'
```

⚠ Submodule là NGUYÊN repo (đo: 249 MiB, 10.555 file — kể cả scene test và toàn bộ art).
Muốn gọn thì dùng cách A.

⚠ **Bắt buộc bật sparse-checkout** (`sparse-checkout set '/Assets/'`). Không bật thì Unity
import cả `ProjectSettings/` và `Docs/` của bộ khung rồi **rải `.meta` vào chính cây làm việc
của repo core** — không có thông báo nào.

⚠ Bỏ bớt module thì **thêm mẫu loại trừ vào sparse-checkout, đừng xoá file** — xoá là làm bẩn
cây làm việc của repo core, và phải bỏ kèm asset của module đó nếu không prefab thành
`Missing (Mono Script)`.

### ⚠⚠ LUẬT SỐ MỘT KHI CHÉP FILE: **luôn chép kèm `.meta`**

GUID nằm trong `.meta`. Chép thiếu là Unity bên kia cấp GUID mới, và **mọi tham chiếu trong
prefab/scene đứt sạch** — không có lỗi nào báo lúc chép, chỉ có prefab trống trơn lúc mở.
Nút XUẤT đã tự lo; chép tay thì phải nhớ.

---

## 4. Thêm code mới thì đặt vào module nào

Hỏi **"nó cần biết những gì"**, rồi đặt vào tầng CAO NHẤT trong số đó:

| Thứ nó cần | Đặt ở |
|---|---|
| chỉ enum, số liệu, không đụng nhân vật | Core |
| máu, vũ khí, va chạm, hiệu ứng | Combat |
| bot phải biết nghĩ | AI |
| loadout / văn minh / archetype | Units |
| luật thắng thua, hồi sinh, mode | Gameplay |
| thuyền / map / zombie | đúng gói đó |
| HUD thử nghiệm | Demo |
| `[MenuItem]`, `UnityEditor` | Editor |

**Sai lầm hay gặp nhất: đặt quá THẤP.** Ví dụ để `StickmanLocomotion` trong `AI/` (bản cũ
đúng như vậy) làm module Combat phải tham chiếu ngược lên AI, và cả hai dính chặt vào nhau.
Cứ đặt ở tầng cao nhất mà nó cần — hạ xuống sau thì dễ, gỡ ra thì khó.

---

## 5. Khi cần tham chiếu NGƯỢC LÊN — đảo bằng hợp đồng

Bị lỗi *"The type or namespace name X could not be found"* trong khi X rõ ràng có tồn tại →
đó là **tham chiếu ngược tầng**, và Unity đang làm đúng việc của nó.

**ĐỪNG chữa bằng cách thêm reference vào asmdef.** Làm vậy là tạo vòng tròn, và nửa năm sau
không ai bóc được module nào ra nữa.

Cách đúng: thêm một interface NHỎ vào `Assets/Scripts/Core/Foundation/StickmanContracts.cs`, tầng thấp
hỏi qua interface, tầng cao implement. Năm cái đã có, dùng làm mẫu:

| Hợp đồng | Ai hỏi | Ai trả lời | Hỏi câu gì |
|---|---|---|---|
| `IUnitBrain` | Combat (vũ khí) | AI (`StickmanAgent`) | kẻ cầm tôi khôn tới đâu |
| `IMovingPlatform` + `MovingPlatforms` | Combat (di chuyển) | Naval (`ShipVessel`) | sàn dưới chân có tự đi không |
| `IContestedZone` + `ContestedZones` | AI (chọn mục tiêu, chỉ huy) | Gameplay (`CapturePoint`) | có vùng nào đáng tranh không |
| `IPriorityTarget` | AI (sát thủ) | Map (`MapObjective`) | đứa này có phải mồi ngon không |
| `INoAutoDress` | Units (khoác áo văn minh) | Gameplay (`RescuedPrisoner`) | có được tự thay đồ nó không |

Ngoài ra có **CHỖ CẮM** cho trường hợp tầng thấp cần TẠO RA thứ của tầng cao:
`AI/NavalStateFactory.cs` — module Naval cắm hàm dựng `AIStateBoarding` + `AINavalModule` vào
lúc nạp game (`NavalBootstrap`). Bỏ Naval thì chỗ cắm để trống và AI vẫn chạy.

⚠ **Interface phải NHỎ, chỉ hỏi MỘT câu.** Interface phình to là tầng thấp lại biết quá
nhiều về tầng cao, chỉ khác cái tên.

---

## 5b. Lỗi `namespace 'UnityEngine.U2D' does not exist` — thiếu khai PACKAGE

Đây KHÔNG phải lỗi tầng. Nguyên nhân:

> Không có asmdef thì code thấy MỌI package. Có asmdef rồi thì phải **khai từng package**.

| Trong code có | Thêm vào `"references"` của asmdef |
|---|---|
| `using UnityEngine.U2D.Animation` | `Unity.2D.Animation.Runtime` |
| `using UnityEngine.U2D.IK` | `Unity.2D.IK.Runtime` |
| `using UnityEngine.U2D` | `Unity.2D.Common.Runtime` |
| `using UnityEngine.UI` | `UnityEngine.UI` |
| editor: `UnityEditor.U2D.*` | `Unity.2D.Animation.Editor` · `Unity.2D.Sprite.Editor` |

Module BUILT-IN của engine (`UnityEngine.Rendering`, `SceneManagement`, `Physics2D`…) thì
không phải khai. `Modules > Kiểm tra kiến trúc` đối chiếu `using` với asmdef nên bắt được
trước khi Unity báo.

⚠ **Phép kiểm phải NGHIÊM NGẶT mới bắt được lỗi này.** Bản đầu của script compile-check tự
nhét sẵn DLL của mọi package vào từng module, nên nó báo "10/10 OK" trong khi Unity thì lỗi —
phép kiểm nói dối còn tệ hơn không có phép kiểm. Nay nó đọc `references` từ chính asmdef.

---

## 6. Ba cái bẫy khi động vào cấu trúc module

1. **Đừng dời class `MonoBehaviour`/`ScriptableObject` sang FILE khác.**
   Asset trỏ vào SCRIPT bằng **GUID của FILE**. Dời class sang file mới là mọi prefab/asset
   dùng nó mất script (`Missing (Mono Script)`). Dời cả FILE (kèm `.meta`) thì an toàn — GUID
   đi theo. `enum` và `struct` thuần thì tự do, không ai trỏ vào chúng bằng GUID.
   *(Vì vậy `GenreDefinition` ở lại `Units/GameGenre.cs` dù enum `GameGenre` đã sang Core.)*

2. **Script đứng ngoài mọi module rơi vào `Assembly-CSharp`** — nó thấy được TẤT CẢ, nên ranh
   giới biến mất mà compile vẫn xanh. Phép Kiểm tra kiến trúc réo tên file đó.

3. **Kiểm tra ranh giới KHÔNG dùng phép biên dịch gộp.** Biên dịch cả `Assets/` một cục thì
   mọi type đều thấy nhau nên không bao giờ báo lỗi tầng. Phải biên dịch TỪNG assembly
   (Unity tự làm đúng vậy) — hoặc bấm Kiểm tra kiến trúc, nó đọc thẳng asmdef trên đĩa.

---

## 7. Sửa xong thì kiểm bằng gì

| Việc vừa làm | Kiểm bằng |
|---|---|
| thêm/dời file script | `Modules > Kiểm tra kiến trúc` |
| thêm module mới | thêm 1 dòng vào `StickmanModules.All` + tạo `.asmdef` → kiểm tra lại |
| sửa builder / bảng số | `★ Bảng điều khiển` (Ctrl+Alt+S) — con số đỏ `⚠ N việc chưa chạy` |
| sửa art sinh bằng code | chạy lại tool sinh art rồi NHÌN |

Chi tiết luật của từng hệ: [AGENTS.md](../../AGENTS.md) · bản đồ AI:
[AI-Architecture.md](AI-Architecture.md) · bản đồ code: [CodeMap.md](CodeMap.md)
