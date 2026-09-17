## PHÒNG THÍ NGHIỆM THÂN MỀM + VÒNG QUAY VŨ KHÍ (2026-09-16)

Hai thứ nhỏ, một bài học chung: **tài sản có sẵn của dự án tự nó đã là nội dung** — thứ thiếu chỉ
là một cái cửa để người chơi chạm vào chúng.

Code: `Assets/Scripts/Gameplay/Arcade/RagdollLabMode.cs` ·
`Assets/Scripts/Gameplay/Shell/WeaponRoulette.cs`. Màn: `Demo_88_RagdollLab`.

---

### 1. Phòng thí nghiệm thân mềm (`Demo_88`)

Khảo sát 2026: dòng *physics sandbox / "virtual stressball"* là thể loại stickman ăn khách nhất
trên di động, và nó cần đúng hai thứ — **một thân mềm** và **thật nhiều cách hành hạ nó**. Dự án
đã có cả hai từ lâu (rig 20 khớp · 60 vũ khí · nổ khoét đất · trọng lực đổi được · slow-mo), nhưng
**50 mode đều dùng ragdoll làm HẬU QUẢ** của một luật thắng thua. Đây là màn đầu lấy nó làm **nội
dung**.

Sáu món: ĐẤM · NỔ · NHẤC · XOÁY · TRỌNG LỰC (thường → nhẹ → **ngược**) · CHẬM.

⚠ **KHÔNG dùng `ArcadeModeBase`.** Arcade chơi lại bằng **một cú chạm bất kỳ**, mà ở đây mọi cú
chạm đều là một hành động trong sân — hai luật đó không sống chung: chạm để dùng búa cũng sẽ là
chạm để bắt đầu lượt mới.

⚠⚠ **Sandbox vẫn phải có vòng chơi.** Không có con số thì nó là một cái hộp: nghịch mười phút rồi
thôi. Ở đây con số là *"một hình nhân chịu được bao nhiêu trước khi tan"*, cất trong `SaveBag`.

⚠⚠ **Cộng sát thương bằng cách NGHE `Damaged`, không tự cộng ở chỗ gây đòn.** Giáp, đỡ đòn, hệ số
`DamageTaken` và trần máu đều nằm SAU chỗ ra đòn — con số duy nhất đúng là con số mà chính nhân
vật ghi nhận.

⚠⚠ **Chụp và TRẢ LẠI `Physics2D.gravity` + `Time.timeScale` ở `OnDestroy`.** Hai biến này sống qua
cả scene; đổi mà không trả là mọi màn chơi SAU đó chạy trong một thế giới nhẹ bẫng hoặc chậm như
sên, và **không có gì báo**. Cùng luật mà `MutatorBinder` đã ghi.

⚠ **Gió xoáy cộng lực cho TỪNG KHỚP theo hướng riêng**, ngược với `ArcadeRagdoll.AddImpulse` (cộng
cùng một Δv cho cả 20 khớp để cả người bay nguyên khối). Chính sự khác nhau giữa các khớp mới làm
cái thân **xoắn lại** — cả trò vui nằm ở đó.

⚠ **Tắt não hình nhân.** Một con búp bê biết bỏ chạy thì mọi phép đo "cú này mạnh bao nhiêu" đều đo
nhầm sang "nó chạy kịp không".

⚠ Sân **nhỏ và kín**: sân rộng thì cú nổ đầu tiên thổi hình nhân ra ngoài khung hình và người chơi
mất luôn thứ duy nhất họ đang nhìn. Và **không dựng người thứ hai** — người thứ hai là ngay lập tức
có phe, có đánh nhau, có luật, tức một mode khác.

---

### 2. ⚠⚠ Vòng quay vũ khí — luật biến thể **CÓ NHỊP** đầu tiên

Dự án có 60 cây vũ khí và 20 mode đánh nhau, nhưng một ván bất kỳ chỉ gặp 2–3 cây: người chơi chọn
một cây quen rồi cầm tới hết trận. `MutatorKind.WeaponRoulette` biến **cả kho vũ khí thành nội dung
của MỘT ván** mà không thêm mode nào — phép NHÂN: 1 luật × 20 mode.

| | Mười loại cũ | `WeaponRoulette` |
|---|---|---|
| Áp khi nào | **một lần** lúc vào trận | **suốt ván** |
| `MutatorBinder` làm gì | gọi một hàm, nhân một hệ số | **gắn một component** |

Nguyên tắc cũ giữ nguyên: *mỗi giá trị `MutatorKind` trỏ tới đúng một đường áp CÓ THẬT* — không có
giá trị enum nào là lời hứa suông.

⚠ **Kho bốc cố ý NGẮN** (16 cây cận/xa trung cổ). Bốc từ cả 60 cây thì một nửa số lượt là trượng
phép hoặc súng hiện đại rơi vào màn trung cổ, và "ngẫu nhiên vui" thành "ngẫu nhiên vô lý".

⚠ **Không mượn `MatchModeBase.Announce`** — nó `protected` là CỐ Ý: băng-rôn của trận là chuyện của
trọng tài. Một luật biến thể không phải trọng tài, nên nó nói phần của nó ở chỗ của nó (dưới đồng
hồ trận, `y = 12%`). Nới `Announce` thành `public` để tiện là mở cửa cho mọi component ghi đè lời
của trọng tài.

Hai dòng trong bảng: `roulette` (15 giây) và `roulettefast` (6 giây).
