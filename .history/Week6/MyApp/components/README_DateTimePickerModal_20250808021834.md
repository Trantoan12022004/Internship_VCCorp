# AddTaskModal Component

## Mô tả
Component modal để tạo task mới trong ứng dụng. Modal hiển thị form với các trường cần thiết để tạo task và sử dụng `react-native-modal-datetime-picker` để chọn ngày giờ với UI đẹp mắt.

## Tính năng
- ✅ Form nhập liệu với validation
- ✅ Chọn ngày và giờ với DateTimePickerModal (UI đẹp)
- ✅ Xử lý loading state
- ✅ Responsive design
- ✅ Auto-reset form khi đóng modal
- ✅ Error handling
- ✅ Localization (vi-VN)

## Dependencies
```json
{
  "react-native-modal-datetime-picker": "^17.1.0"
}
```

## Props

| Prop | Type | Required | Mô tả |
|------|------|----------|-------|
| `visible` | `boolean` | ✅ | Điều khiển hiển thị modal |
| `onClose` | `() => void` | ✅ | Callback khi đóng modal |
| `onCreateTask` | `(taskData: Omit<Task, "_id" \| "is_completed">) => Promise<void>` | ✅ | Callback khi tạo task mới |
| `selectedDate` | `Date` | ❌ | Ngày được chọn mặc định (default: new Date()) |

## Interface Task
```typescript
interface Task {
    _id: string;
    title: string;
    description: string;
    date: string; // Format: "2025-08-08T00:00:00.000Z"
    time: string; // Format: "14:00"
    is_completed: boolean;
}
```

## Cách sử dụng

### 1. Cài đặt dependencies
```bash
npm install react-native-modal-datetime-picker
```

### 2. Import component
```typescript
import AddTaskModal from '../../components/AddTaskModal';
```

### 3. Khai báo state
```typescript
const [isModalVisible, setIsModalVisible] = useState(false);
```

### 4. Tạo handler function
```typescript
const handleCreateTask = async (taskData: Omit<Task, "_id" | "is_completed">) => {
    try {
        // Gọi API tạo task
        const response = await createTask(taskData);
        
        if (response.data.success) {
            // Xử lý thành công
            const newTask = response.data.data;
            setTasks(prevTasks => [...prevTasks, newTask]);
            Alert.alert("Thành công", "Task đã được tạo!");
            setIsModalVisible(false);
        }
    } catch (error) {
        console.error("Error creating task:", error);
        throw error; // Re-throw để modal xử lý error
    }
};
```

### 5. Sử dụng component
```tsx
{/* Button để mở modal */}
<TouchableOpacity onPress={() => setIsModalVisible(true)}>
    <Text>Add New Task</Text>
</TouchableOpacity>

{/* Modal component */}
<AddTaskModal
    visible={isModalVisible}
    onClose={() => setIsModalVisible(false)}
    onCreateTask={handleCreateTask}
    selectedDate={selectedDate} // optional
/>
```

## DateTimePickerModal Features

### Date Picker
- **Modes:** `date`, `time`, `datetime`
- **Localization:** Hỗ trợ `vi-VN` locale
- **Minimum Date:** Không cho phép chọn ngày trong quá khứ
- **UI:** Modal đẹp với animation smooth

### Time Picker  
- **Format:** 24-hour format
- **Localization:** Hiển thị tiếng Việt
- **UI:** Wheel picker hoặc clock picker tùy platform

### Event Handlers
```typescript
// Xác nhận chọn ngày
const handleDateConfirm = (date: Date) => {
    setTaskDate(date);
    setShowDatePicker(false);
};

// Hủy chọn ngày
const handleDateCancel = () => {
    setShowDatePicker(false);
};
```

## Validation Rules
- **Title**: Bắt buộc, tối đa 100 ký tự
- **Description**: Bắt buộc, tối đa 500 ký tự
- **Date**: Không được chọn ngày trong quá khứ
- **Time**: Format 24h (HH:MM)

## Customization

### DateTimePickerModal Props
```tsx
<DateTimePickerModal
    isVisible={showDatePicker}
    mode="date"                    // 'date' | 'time' | 'datetime'
    onConfirm={handleDateConfirm}
    onCancel={handleDateCancel}
    date={taskDate}               // Initial date
    minimumDate={new Date()}      // Minimum selectable date
    locale="vi-VN"               // Localization
    is24Hour={true}              // 24-hour format for time
/>
```

### Styling
Component sử dụng StyleSheet với:
- Modal overlay với độ trong suốt
- Form layout responsive
- Button styling với loading states
- Input validation styling

## Error Handling
- Form validation với thông báo lỗi
- Network error handling
- Loading states
- User-friendly error messages

## Platform Support
- ✅ iOS: Native date/time picker với modal wrapper
- ✅ Android: Material Design date/time picker
- ✅ Cross-platform consistent API
