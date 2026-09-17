# Bộ khung làm SUBMODULE — repo game riêng, core vẫn chảy ngược về đây

> Trả lời đúng một câu: *"tôi mở một repo GAME mới, lấy core từ repo này, và khi sửa core
> trong lúc làm game thì sửa đó đẩy ngược lên repo core — làm thế nào, cấu hình những gì."*
>
> Làm hộ + đo: `./Docs/Tools/UseAsSubmodule.ps1`
> Lấy phần nào của bộ khung: [Modules.md](Modules.md) · skill `stickman-module`

---

## 0. Hai repo, hai vai

| | Repo BỘ KHUNG (`AssetStickMan`) | Repo GAME |
|---|---|---|
| Là gì | 10 module xếp tầng + art + tool + tài liệu | một game cụ thể |
| Ai sửa | mọi game đều hưởng | chỉ game đó |
| Chứa | `Assets/Scripts/*` · `Assets/Editor` · prefab · sprite · scene demo | màn chơi, art riêng, luật riêng |
| Trong repo game | nằm ở `Assets/XoiStickman/` dưới dạng **submodule** | chính nó |

Submodule **không phải bản chép**. Nó là một repo git đầy đủ nằm lồng bên trong: sửa file
trong đó rồi `commit` + `push` là code chảy thẳng lên repo bộ khung, không qua bước chép nào.
Repo game chỉ ghi lại **một con SHA** — "game này dùng bộ khung ở mốc nào".

---

## 1. Ba cách nhúng — khác nhau ở chỗ "sửa core ở đâu"

| Cách | Sửa core ở đâu | Lấy core mới về | Dùng khi |
|---|---|---|---|
| **A. Nút XUẤT** (chép file) | chỉ ở repo bộ khung; bản trong game là bản chết | chép đè lại — **mọi sửa tay bên game bị xoá** | game demo, game một lần, không định đóng góp ngược |
| **B. SUBMODULE** ★ | **sửa ngay trong dự án game**, `push` thẳng lên repo bộ khung | `git submodule update --remote` | ★ **đúng thứ bạn đang hỏi** |
| **C. Junction / symlink** | như B nhưng không qua git | thư mục dùng chung, tự thấy ngay | một máy duy nhất, không CI, không người thứ hai |

Cách C sạch hơn về đường dẫn (`Assets/XoiStickman/Scripts/...` thay vì lồng hai lớp `Assets`)
nhưng đổi lại: junction **không nằm trong git** nên máy khác không có nó, và git nhìn junction
như thư mục thật — **quên một dòng `.gitignore` là commit 10.290 file của bộ khung vào repo
game**. Cách B chạy được trên mọi máy và trên CI chỉ bằng git thuần, nên đây là cách chốt.

---

## 2. Bố cục đã chốt

```
GameProject/                        ← repo GAME (git init riêng)
├─ .gitmodules                      ← khai submodule + nhánh theo dõi
├─ Assets/
│  ├─ Game/                         ← code + art + scene RIÊNG của game
│  └─ XoiStickman/                  ← SUBMODULE = toàn bộ repo bộ khung
│     └─ Assets/                    ← Scripts · Editor · Prefabs · Sprites · Resources · _Scenes
├─ Packages/manifest.json           ← phải tự khai package (mục 5)
└─ ProjectSettings/                 ← KHÔNG đi theo submodule (mục 5)
```

**Vì sao hai lớp `Assets`:** submodule luôn gắn vào **gốc repo**, mà gốc repo bộ khung là cả
một dự án Unity (`Assets/` + `Packages/` + `ProjectSettings/`). Không có cách nào "gắn thư mục
con" bằng git thuần. Lồng một thư mục tên `Assets` bên trong `Assets/` là hợp lệ với Unity —
`Assets` không nằm trong danh sách tên thư mục đặc biệt.

⚠⚠ **Bắt buộc bật sparse-checkout cho submodule.** Không bật thì Unity nhìn thấy cả
`ProjectSettings/*.asset`, `Docs/*.md`, `README.md` của bộ khung và **sinh một file `.meta`
cho từng file đó** ngay trong cây làm việc của repo bộ khung. Hậu quả: repo bộ khung bẩn vĩnh
viễn, và đúng một lần `git add -A` trong đó là rác được commit vào core. Đây là lỗi im lặng
số một của cách nhúng này — lúc gắn không có thông báo nào.

Sparse-checkout giữ lại đúng `/Assets/` (10.290 file), bỏ 265 file ở gốc và trong `Docs/`.

---

## 3. Lệnh gắn — chép chạy được

### 3.1 Dựng repo game

Unity Hub → **New project** → template **2D (Built-In Render Pipeline)** → editor **6000.5.9f1**.

⚠ Template *2D (URP)* của Unity 6 là Universal Render Pipeline. Bộ khung này chạy **Built-in
RP** (`GraphicsSettings.m_CustomRenderPipeline: {fileID: 0}`) — chọn nhầm là material/shader
lệch ngay từ scene đầu tiên. Muốn có đèn 2D thì cài URP **sau**, theo `AgentRules/Lighting.md`.

```powershell
cd D:\Project\MyGame
git init
git add . ; git commit -m "Dự án Unity rỗng"
```

### 3.2 Gắn submodule + sparse-checkout + theo dõi nhánh

```powershell
git submodule add https://github.com/xoigame/AssetStickMan.git Assets/XoiStickman
git submodule set-branch --branch main -- Assets/XoiStickman
git -C Assets/XoiStickman sparse-checkout init --no-cone
git -C Assets/XoiStickman sparse-checkout set '/Assets/'
git -C Assets/XoiStickman checkout main
git add .gitmodules Assets/XoiStickman
git commit -m "Bộ khung stickman làm submodule"
```

Dòng `set-branch` ghi `branch = main` vào `.gitmodules` — thiếu nó thì
`git submodule update --remote` không biết bám nhánh nào.

⚠ **Chạy trong PowerShell hoặc CMD, đừng chạy trong Git Bash.** Đo được: Git Bash trên Windows
dịch `'/Assets/'` thành `C:/Program Files/Git/Assets/` (MSYS path conversion), mẫu trở thành vô
nghĩa và cả cây làm việc biến mất — không có lỗi nào báo. Bắt buộc phải dùng Git Bash thì
đặt `MSYS_NO_PATHCONV=1` trước lệnh.

⚠ `sparse-checkout` cần **git ≥ 2.25**; tách `init --no-cone` ra trước vì git 2.27 không hiểu cờ
`--no-cone` của lệnh `set` và ghi thẳng chuỗi đó vào file mẫu như một pattern rác (đã đo).

Hoặc để script làm cả bốn bước, rồi đo luôn phần cấu hình:

```powershell
./Docs/Tools/UseAsSubmodule.ps1 -Init -GameProject 'D:\Project\MyGame'
```

### 3.3 Cấu hình một lần cho đỡ quên (theo repo game)

`-Init` đã đặt hộ bốn thứ dưới đây; bảng này để biết nó đặt gì và tự gõ lại khi cần.

```powershell
git config submodule.recurse true              # pull/checkout tự kéo submodule theo
git config push.recurseSubmodules on-demand    # push game thì tự push core trước
git config diff.submodule log                  # `git diff` in ra commit của core, không in SHA trần
```

Thứ tư là một **hook `pre-commit` đặt trong git-dir của submodule**
(`.git/modules/Assets/XoiStickman/hooks/pre-commit`): nó **chặn commit khi submodule đang
detached HEAD** — bẫy 6.1, thứ git không hề cảnh báo. Đo được: commit bị chặn với thông báo
*"DUNG LAI: submodule dang detached HEAD"*. Hook là cấu hình **cục bộ**, máy mới phải chạy lại
`-Init` (hoặc `-Check` để được nhắc).

⚠ `push.recurseSubmodules on-demand` chỉ tự push khi **nhánh core có upstream**. Lần đầu phải
tự đẩy một lần: `git -C Assets/XoiStickman push -u origin main`.

---

## 4. Ba việc hằng ngày

> Không nhớ đang đứng ở đâu thì hỏi tool — nó ĐO, không đoán:
>
> ```powershell
> ./Docs/Tools/UseAsSubmodule.ps1 -Status -GameProject 'D:\Project\MyGame'
> ```
>
> In ra: sửa nào rơi vào CORE (kèm module), sửa nào ở GAME, core còn commit chưa push không,
> repo game đã ghi mốc mới chưa, và thứ tự đẩy an toàn. Detached HEAD thì báo FAIL (exit 1).

### 4.1 Lấy core mới về

```powershell
git submodule update --remote --merge Assets/XoiStickman
git add Assets/XoiStickman ; git commit -m "Cập nhật bộ khung"
```

Commit thứ hai là bắt buộc: nó ghi mốc mới vào repo game. Bỏ qua thì máy khác vẫn nhận bản cũ.

### 4.2 Sửa core từ trong dự án game rồi đẩy ngược lên

```powershell
cd Assets\XoiStickman
git checkout main            # ⚠ BẮT BUỘC — xem bẫy 6.1
# ... sửa file trong Assets/Scripts/... ...
git add -A ; git commit -m "Core: sửa X" ; git push
cd ..\..
git add Assets/XoiStickman ; git commit -m "Ghi mốc bộ khung mới"
```

### 4.3 Máy mới / người mới clone repo game

```powershell
git clone --recurse-submodules <url-repo-game> MyGame
cd MyGame
git -C Assets/XoiStickman sparse-checkout init --no-cone
git -C Assets/XoiStickman sparse-checkout set '/Assets/'
```

⚠ Sparse-checkout là **cấu hình cục bộ** (`.git/config` của bản clone), không đi theo git.
Máy mới phải chạy lại đúng dòng đó — hoặc chạy
`./Docs/Tools/UseAsSubmodule.ps1 -Check -GameProject <đường dẫn>` để nó nhắc.

---

## 5. Cấu hình dự án game — bảng đã ĐO, không đoán

`ProjectSettings/` **không** nằm trong submodule (mỗi dự án Unity một bản riêng). Bảy dòng dưới
đây là toàn bộ thứ phải tự dựng lại bên game; con số đo từ file thật trong repo bộ khung.

| Thứ | Giá trị đúng | Đo được ở đâu | Thiếu thì hỏng thế nào |
|---|---|---|---|
| Editor | **6000.5.9f1** | `ProjectSettings/ProjectVersion.txt` | `com.unity.2d.common` vỡ compile: `error CS0246: EntityId` |
| Render pipeline | Built-in (`m_CustomRenderPipeline: {fileID: 0}`) | `ProjectSettings/GraphicsSettings.asset` | mở bằng dự án URP → sprite/material lệch |
| Package | `com.unity.2d.animation` · `com.unity.2d.common` · `com.unity.2d.sprite` · `com.unity.ugui` | mảng `references` của 10 file `.asmdef` | `namespace 'UnityEngine.U2D' does not exist` |
| Tag | `Ground` · `Bullet` | `TagManager.asset` | `CompareTag("Ground")` ném `UnityException` — **9 chỗ trong runtime** |
| Sorting layer | `character` = **1203916601** · `foreground` = **4010610959** | `TagManager.asset` | **112 renderer** rơi về `Default` → art đè sai thứ tự, không có lỗi nào |
| Input | `activeInputHandler: 0` (Input Manager cũ) | `ProjectSettings.asset` | dự án chỉ bật Input System mới → `Input.GetKey` ném `InvalidOperationException` |
| Android | `Assets/Plugins/Android/baseProjectTemplate.gradle` | `Assets/Plugins/Android/` | build Android chết ở `checkReleaseDuplicateClasses` (trùng `kotlin.*`) |

⚠⚠ **Sorting layer phải giữ nguyên `uniqueID`.** Prefab/scene ghi `m_SortingLayerID:
1203916601`, không ghi tên. Tự tay tạo layer tên `character` bên game sẽ ra một uniqueID
KHÁC, và 112 renderer im lặng rơi về `Default`. Chép nguyên khối `m_SortingLayers` từ
`TagManager.asset` của bộ khung, hoặc để `-Init` chép hộ.

⚠ **`Assets/Plugins/Android/` phải nằm ở ĐÚNG đường dẫn đó.** Unity chỉ đọc
`baseProjectTemplate.gradle` ở `Assets/Plugins/Android/`, không đọc bản nằm sâu trong
`Assets/XoiStickman/Assets/Plugins/Android/`. Build Android thì chép file này ra ngoài.

**Không cần chép:** `Physics2DSettings.asset` (gravity `-9.81`, `velocityIterations 8` đều là
mặc định Unity) và layer `Enemy` ở ô 6 — đo trên toàn bộ prefab/scene: **0 object** dùng layer
khác 0.

**Package có trong bộ khung nhưng KHÔNG code nào dùng** (đo bằng `rg`): `2d.spriteshape` ·
`2d.tilemap` · `ai.navigation` · `purchasing` · `recorder`. Chỉ thêm nếu muốn giống hệt.

---

## 6. Bẫy — dính là hỏng trong im lặng

### 6.1 Submodule đứng ở `detached HEAD` — commit rơi vào hư không

Sau `git submodule update`, submodule **không đứng trên nhánh nào**. Sửa file, `commit` bình
thường, không có cảnh báo nào — rồi lần `git submodule update` sau là commit đó **mất sạch**
(không nhánh nào trỏ vào nó). Luôn `git checkout main` **trước khi sửa**, hoặc đặt
`git config submodule.recurse true` và cập nhật bằng `--merge`.

Cách tự bắt: `git -C Assets/XoiStickman branch --show-current` — in ra rỗng là đang detached.

### 6.2 Push game mà quên push core

Repo game ghi SHA của core. Nếu SHA đó chỉ có trên máy bạn, người khác clone về sẽ dính
`fatal: remote error: upload-pack: not our ref`. Chữa: `push.recurseSubmodules on-demand`
(mục 3.3), hoặc luôn push submodule trước.

### 6.3 Tool `Tools > Stickman` chạy trong dự án GAME sẽ ghi nhầm chỗ

Hơn 100 chỗ trong `Assets/Editor` ghi cứng đường dẫn `"Assets/Prefabs/..."`,
`"Assets/Settings/..."`, `"Assets/_Scenes/..."`. Trong dự án game, những đường dẫn đó trỏ vào
`Assets/` của **game**, không phải của bộ khung. Tool vẫn chạy, vẫn báo thành công, nhưng asset
sinh ra nằm ngoài submodule và bản trong core thì cũ dần.

**Luật:** sinh art / dựng scene / cân bằng vũ khí thì **mở dự án bộ khung mà chạy tool**, commit
ở đó, rồi bên game `git submodule update --remote`. Dự án game chỉ **dùng**.
(Đây cũng là lý do bảng module ghi "Editor — bỏ được khi asset đã chốt".)

### 6.4 Trùng tên trong `Resources/`

`Resources.Load` tra theo **tên**, không theo đường dẫn, và Unity gộp mọi thư mục `Resources`
ở bất kỳ đâu. Bộ khung có 20+ chỗ gọi `Resources.Load<T>("AISmartsTable")`,
`"EffectLibrary"`, `"ExperienceTable"`... Đặt một asset trùng tên trong `Assets/Resources/`
của game là **hai bản cùng tên, Unity chọn bản nào không đoán được**. Đặt tên riêng cho asset
của game (ví dụ tiền tố `MyGame_`).

### 6.5 Xoá bớt module trong submodule

Bỏ được — mỗi module là một assembly riêng. Nhưng phải **bỏ kèm asset của nó**, nếu không
prefab/scene còn lại thành `Missing (Mono Script)`. Bảng "module → asset đi kèm" là mảng `All`
trong `Assets/Editor/Pipeline/StickmanModules.cs`. Với submodule, cách bỏ đúng là thêm mẫu loại trừ vào
sparse-checkout, **không xoá file** (xoá file là làm bẩn cây làm việc của repo core):

```powershell
git -C Assets/XoiStickman sparse-checkout set '/Assets/' '!/Assets/Scripts/Naval/'
```

### 6.6 Repo nặng

Đo: **249 MiB** pack, **10.555 file**. Clone lần đầu chậm là bình thường.
`--depth 1` chỉ dùng cho CI/chỉ-đọc — bản shallow làm `submodule update --remote` và việc đẩy
ngược lên core rất dễ gãy, tức là mất đúng cái lợi của cách B.

---

## 7. Trước khi báo "xong"

```powershell
./Docs/Tools/UseAsSubmodule.ps1 -Check  -GameProject 'D:\Project\MyGame'   # lúc GẮN
./Docs/Tools/UseAsSubmodule.ps1 -Status -GameProject 'D:\Project\MyGame'   # HẰNG NGÀY
```

- [ ] `.gitmodules` có `branch = main`
- [ ] `git -C Assets/XoiStickman sparse-checkout list` in ra ĐÚNG một dòng `/Assets/`
- [ ] Mở Unity dự án game: Console sạch, menu `Tools > Stickman` hiện ra
- [ ] `Tools > Stickman > Nâng cao > Modules > Kiểm tra kiến trúc` — không dòng đỏ
- [ ] `git -C Assets/XoiStickman status --short` — **rỗng** (bẩn = sparse-checkout chưa bật)
- [ ] Kéo một `StickmanFighter.prefab` vào scene, bấm Play: nhân vật đứng đúng, không hồng

---

## 8. Sửa trong lúc làm game: để ở GAME hay đẩy vào CORE

Đây là câu hỏi hằng ngày của cách B, và cũng là chỗ bộ khung mục ruỗng nhanh nhất nếu trả lời
bừa: đẩy thứ riêng của một game vào core thì game sau phải gánh; giữ ở game thứ đáng lẽ chung
thì ba tháng sau có ba bản sao lệch nhau.

### 8.1 Ba câu hỏi — trả lời trước khi gõ `git add`

| Hỏi | "Có" → | "Không" → |
|---|---|---|
| a. Game **khác** cũng dùng được thứ này? | ứng viên của core | để bên game, hết |
| b. Trong code có **tên riêng của game này** (tên màn, tên nhân vật, số cân bằng của game)? | để bên game | ứng viên của core |
| c. Nó **đổi hành vi mặc định** của bộ khung? | **đừng sửa thẳng** → mục 8.2 | đưa vào core được |

`-Status` in đúng ba câu này mỗi lần chạy, ngay dưới danh sách file đã sửa.

**Phép thử một dòng:** mở file vừa sửa, tìm `rg -n 'MyGame|tên-màn|tên-nhân-vật'`. Còn một
chuỗi riêng của game trong file định đẩy vào core là câu b đã "có".

### 8.2 Bốn tình huống, bốn cách xử lý

| Tình huống | Làm gì |
|---|---|
| **Sửa lỗi / thêm tham số** cho file sẵn có của core | sửa ngay trong `Assets/XoiStickman/…`, commit + push **trong submodule** (mục 4.2). Đây là ca thường nhất và cũng là ca dễ nhất. |
| **Game cần hành vi khác** với mặc định của core | KHÔNG sửa thẳng. Thêm **cờ bật-tắt** (mặc định giữ nguyên hành vi cũ) hoặc **chỗ cắm** trong core, rồi bật/cắm ở phía game. Mẫu có sẵn: 5 interface trong `Assets/Scripts/Core/Foundation/StickmanContracts.cs` và chỗ cắm `AI/NavalStateFactory.cs` — xem [Modules.md](Modules.md) mục 5. |
| **File mới viết bên game**, sau thấy mọi game đều dùng | `-Promote` (mục 8.3) — dời file **kèm `.meta`**, GUID giữ nguyên nên prefab/scene đang trỏ vào nó không đứt. |
| **Số cân bằng / ScriptableObject / art / scene** | sửa ở **dự án bộ khung**, không sửa bên game: hơn 1.400 đường dẫn `"Assets/..."` ghi cứng trong `Assets/Editor` làm tool ghi ra ngoài submodule mà vẫn báo thành công (bẫy 6.3). Game muốn số khác thì **đặt asset riêng tên khác** (bẫy 6.4), đừng sửa bảng của core. |

### 8.3 `-Promote` — dời một file từ cây game vào bộ khung

```powershell
./Docs/Tools/UseAsSubmodule.ps1 -GameProject 'D:\Project\MyGame' `
    -Promote 'Assets/Game/Scripts/LedgeGrab.cs' -Into 'Assets/Scripts/Combat/Movement'
```

`-Into` là đường dẫn **tính từ gốc repo bộ khung**. Script: từ chối khi submodule đang detached
HEAD (commit sẽ mất), dời cả `.cs` và `.cs.meta`, `git add` hộ ở cả hai repo, rồi in ra hai thứ
để tự kiểm ngay:

- **danh sách `using` của file** — dòng nào trỏ vào namespace riêng của game thì bộ khung
  không biên dịch được, phải cắt phụ thuộc đó trước;
- **tên assembly đích** (ví dụ `Xoi.Stickman.Combat`) — nhắc luật tầng: file chỉ được tham
  chiếu **xuống** tầng thấp hơn. Không thấy `.asmdef` nào phía trên là file sẽ rơi vào
  `Assembly-CSharp`, ranh giới module biến mất trong im lặng.

Sau đó vẫn phải: commit + push **core trước**, rồi ghi mốc ở repo game, rồi mở dự án bộ khung
(`git pull`) bấm **Kiểm tra kiến trúc**.

⚠ `-Promote` **dời một file**, không dời cả thư mục và không sửa `namespace` trong file. Đổi
`namespace` cho khớp module là việc tay, làm ngay sau khi dời.

### 8.4 Vì sao luôn PUSH CORE TRƯỚC

Repo game chỉ ghi **một SHA** của core. Push game trước là người khác clone về nhận một SHA
không tồn tại trên server → `fatal: remote error: upload-pack: not our ref`. Thứ tự đúng:

```powershell
git -C Assets/XoiStickman add -A
git -C Assets/XoiStickman commit -m "Core: ..."
git -C Assets/XoiStickman push          # 1. core lên trước
git add Assets/XoiStickman
git commit -m "Ghi moc bo khung moi"    # 2. repo game ghi mốc
git push                                # 3. game lên sau
```

`push.recurseSubmodules on-demand` (mục 3.3) làm hộ bước 1 khi quên — nhưng chỉ khi nhánh core
đã có upstream.

### 8.5 Sửa core to, chưa chắc đúng → làm trên nhánh

```powershell
git -C Assets/XoiStickman checkout -b feature/leo-tuong
# ... sửa, commit, push nhánh đó ...
```

Repo game vẫn ghi được mốc trỏ vào commit của nhánh, chạy thử thoải mái; chốt thì mở PR trên
repo bộ khung rồi đổi lại `main` bằng `git -C Assets/XoiStickman checkout main`. Đừng để
`.gitmodules` bám nhánh tạm — `branch = main` mới là thứ `--remote` cần.

### 8.6 ⚠ Trên máy bạn có HAI bản sao của core

Bản "xưởng" (`E:\Project\Xoi_AssetStickMan`, nơi chạy tool và mở Unity để sinh art/scene) và
bản trong submodule (`MyGame/Assets/XoiStickman`). Chúng **không tự thấy nhau** — chỉ gặp nhau
trên GitHub. Hệ quả phải nhớ:

- đẩy core từ trong game xong → sang xưởng `git pull` **trước khi** chạy tool, nếu không tool
  chạy trên bản cũ và ghi đè mất phần vừa đẩy;
- sinh art/scene ở xưởng xong → `git push` ở xưởng, rồi bên game
  `git submodule update --remote --merge` (mục 4.1).

---

Xem thêm: [Modules.md](Modules.md) (lấy phần nào · đặt code mới vào đâu) ·
[../AgentRules/Modules.md](../AgentRules/Modules.md) (luật tầng · hợp đồng đảo cạnh) ·
[../../README.md](../../README.md) mục 10.
