# GameDev Hub trên GitHub Pages

Trang công khai: <https://xoigame.github.io/gamedevhub/>

## Dữ liệu

`data.json` gồm `template` (6 phase chung), `projects` (milestone và task của từng game) và `lessons` (kinh nghiệm cá nhân dùng chung cho mọi dự án). Mỗi `id` phải duy nhất trong project và giữ ổn định khi sửa tiêu đề. Task mới để `done: false` cho tới khi Nhân xác nhận đã nghiệm thu.

Thêm game mới bằng cách thêm phần tử vào `projects`, dùng cùng 6 phase chính và viết milestone/task riêng. Không tự suy trạng thái hoàn thành từ code hoặc hồ sơ dự án.

Thêm bài học do Nhân viết vào `lessons` với mẫu dưới đây. Bài học không có `projectId` và không bị lọc theo game đang chọn; tình huống ban đầu có thể đến từ bất kỳ dự án nào nhưng điều rút ra phải dùng được cho các game sau.

```json
{
  "id": "ma-bai-hoc-duy-nhat",
  "kind": "lesson",
  "title": "Tên kinh nghiệm",
  "summary": "Nguyên tắc rút ra từ tình huống đã gặp, dùng được cho mọi game.",
  "nextTime": "Cách áp dụng trong các dự án sau.",
  "date": "YYYY-MM-DD"
}
```

## Checklist trên trang

GitHub Pages không có quyền ghi dữ liệu. Nút **Kết nối GitHub** nhận fine-grained personal access token có quyền `Contents: Read and write` cho riêng repo `xoigame/xoigame.github.io`. Khi tích task, trang đọc phiên bản `data.json` mới nhất từ GitHub API và tạo một commit cập nhật task. Token chỉ ở bộ nhớ tab, không đưa vào repo, URL hay localStorage. Tải lại trang sẽ cần kết nối lại. Nếu API trả lỗi, checkbox trở về trạng thái cũ.

GitHub Pages sẽ hiển thị trạng thái mới sau khi build xong. Các tab đã mở từ trước cần tải lại để thấy thay đổi do nơi khác ghi.
