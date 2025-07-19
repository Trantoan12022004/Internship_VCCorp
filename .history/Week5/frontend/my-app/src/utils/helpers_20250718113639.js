/**
 * Utility functions for the Todo App
 */

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

export const validateTodoText = (text) => {
  if (!text || text.trim().length === 0) {
    return { isValid: false, message: 'Nội dung không được để trống' }
  }
  
  if (text.trim().length > 200) {
    return { isValid: false, message: 'Nội dung không được vượt quá 200 ký tự' }
  }
  
  return { isValid: true, message: '' }
}

export const filterTodos = (todos, filter) => {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed)
    case 'completed':
      return todos.filter(todo => todo.completed)
    default:
      return todos
  }
}

export const getTodoStats = (todos) => {
  const total = todos.length
  const completed = todos.filter(todo => todo.completed).length
  const active = total - completed
  
  return { total, completed, active }
}
