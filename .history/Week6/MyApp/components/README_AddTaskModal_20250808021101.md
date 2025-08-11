# AddTaskModal Component

## Mô tả
Component modal để tạo task mới trong ứng dụng. Modal hiển thị form với các trường cần thiết để tạo task và gửi dữ liệu về parent component để xử lý.

## Tính năng
- ✅ Form nhập liệu với validation
- ✅ Chọn ngày và giờ với DateTimePicker
- ✅ Xử lý loading state
- ✅ Responsive design
- ✅ Auto-reset form khi đóng modal
- ✅ Error handling

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

### 1. Import component
```typescript
import AddTaskModal from '../../components/AddTaskModal';
```

### 2. Khai báo state
```typescript
const [isModalVisible, setIsModalVisible] = useState(false);
```

### 3. Tạo handler function
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

### 4. Sử dụng component
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

## Validation Rules
- **Title**: Bắt buộc, tối đa 100 ký tự
- **Description**: Bắt buộc, tối đa 500 ký tự
- **Date**: Không được chọn ngày trong quá khứ
- **Time**: Format 24h (HH:MM)

## Dependencies
- `@react-native-community/datetimepicker`: Để chọn ngày và giờ
- `react-native`: Core components
- `@expo/vector-icons`: Icons (nếu cần mở rộng)

## Styling
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

## Customization
Có thể customize thông qua:
- Styles object
- Validation rules
- Date/time picker configuration
- Error messages
