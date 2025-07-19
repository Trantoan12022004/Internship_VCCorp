import React from 'react'
import Button from '../common/Button/Button'
import './TodoList.css'

const TodoItem = ({ todo, onToggle, onDelete }) => {
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="todo-checkbox"
        />
        <span className="todo-text">{todo.text}</span>
      </div>
      <Button
        variant="danger"
        size="small"
        onClick={() => onDelete(todo.id)}
        className="delete-btn"
      >
        Xóa
      </Button>
    </div>
  )
}

export default TodoItem
