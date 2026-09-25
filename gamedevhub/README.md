# GameDev Hub trên GitHub Pages

Trang công khai: <https://xoigame.github.io/gamedevhub/>

## Dữ liệu

`data.json` gồm `template` (6 phase chung), `projects` (milestone và task của từng game) và `lessons` (kinh nghiệm cá nhân). Mỗi `id` phải duy nhất trong project và giữ ổn định khi sửa tiêu đề. Task mới để `done: false` cho tới khi Nhân xác nhận đã nghiệm thu.

Thêm game mới bằng cách thêm phần tử vào `projects`, dùng cùng 6 phase chính và viết milestone/task riêng. Không tự suy trạng thái hoàn thành từ code hoặc hồ sơ dự án.

Thêm bài học do Nhân viết vào `lessons` với mẫu:

```json
{
  "id": "ma-bai-hoc-duy-nhat",
  "projectId": "last-tower",
  "kind": "lesson",
  "title": "Tên kinh nghiệm",
  "summary": "Điều đã học trong tình huống cụ thể.",
  "nextTime": "Lần sau sẽ làm gì.",
  "date": "YYYY-MM-DD"
}
```

## Checklist trên trang

GitHub Pages không có quyền ghi dữ liệu. Nút **Kết nối GitHub** nhận fine-grained personal access token có quyền `Contents: Read and write` cho riêng repo `xoigame/xoigame.github.io`. Khi tích task, trang đọc phiên bản `data.json` mới nhất từ GitHub API và tạo một commit cập nhật task. Token chỉ ở bộ nhớ tab, không đưa vào repo, URL hay localStorage. Tải lại trang sẽ cần kết nối lại. Nếu API trả lỗi, checkbox trở về trạng thái cũ.

GitHub Pages sẽ hiển thị trạng thái mới sau khi build xong. Các tab đã mở từ trước cần tải lại để thấy thay đổi do nơi khác ghi.
