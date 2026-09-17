## LƯU SKILL · RULE · KNOWLEDGE/MEMORY — QUY TRÌNH BẮT BUỘC

Mục này là cửa lưu bền vững cho mọi task có quyết định hoặc quy trình có thể dùng lại. Chat không phải
nơi lưu duy nhất: nếu một kết luận cần nhớ để lần sau không làm sai, phải ghi vào repo hoặc skill
đúng loại trước khi bàn giao.

### Phân loại nơi lưu

| Loại thông tin | Nơi lưu | Khi nào dùng |
|---|---|---|
| Quy trình có thể tái sử dụng qua nhiều project/task | Skill `SKILL.md` đúng scope | Có trigger rõ, input/output, công cụ, guardrail và cách kiểm tra; không nhét luật riêng của project vào skill chung |
| Ràng buộc kiến trúc, invariant, điều cấm của project | `Docs/AgentRules/<Topic>.md` + nối vào `INDEX.md` | Có thể làm code/asset/scene sai nếu quên; phải ngắn, mang tính bắt buộc |
| Nghiên cứu, bằng chứng, lý do, số đo, workflow chi tiết | `Docs/KnowledgeBase/<Topic>.md` | Cần giải thích để quyết định sau này không lặp lại nghiên cứu hoặc chữa nhầm chỗ |
| Thay đổi lớn về kiến trúc, hệ thống, scene, bảng số | `Docs/ProjectMap/index.html` mục 17 + `ProjectMapStats.ps1 -Apply` | Có ảnh hưởng liên module hoặc cần lịch sử để tra nguyên nhân |
| Đường tra task | `Docs/AgentRules/TaskIndex.md` | Mỗi mảng mới hoặc tool mới phải có dòng chỉ file luật và nút/tool bắt đầu |
| Quyết định một lần, không ảnh hưởng task sau | Không cần lưu dài hạn | Vẫn ghi trong final nếu ảnh hưởng kết quả hiện tại |

### Checklist trước bàn giao

1. Hỏi: nếu một AI khác đọc task mới mà không biết quyết định này, nó có dễ làm sai không?
2. Nếu có, lưu vào đúng bảng trên; không chỉ viết trong chat. Rule/KB mới phải có link từ `INDEX.md`
   hoặc `TaskIndex.md` để lần sau tìm được.
3. Nếu là skill, đọc/kiểm tra `SKILL.md` đầy đủ, đặt trigger hẹp, không tạo skill trùng một skill
   đang có; nếu chỉ là kiến thức project thì dùng Rule/KnowledgeBase, không tạo skill cho đủ hình thức.
4. Với code/asset/scene, ghi rõ file nguồn sự thật, tool thao tác, proof đã chạy, và phần chưa kiểm
   được. Không ghi kết quả suy đoán như một memory đã xác nhận.
5. Giữ thay đổi người dùng; kiểm `git status --short` trong phạm vi và nêu các lỗi pre-existing,
   timeout hoặc visual test chưa chạy.

### Quy ước cho các task sau

Trước khi sửa, đọc `AGENTS.md` rồi đọc rule/KB theo `TaskIndex`. Sau khi sửa, cập nhật rule/KB nếu
phát sinh invariant hoặc workflow mới; cập nhật ProjectMap khi đạt ngưỡng ở trên. Đây là quy trình
chung để không quên lưu quyết định, không phải giấy phép viết lại tài liệu không liên quan.
