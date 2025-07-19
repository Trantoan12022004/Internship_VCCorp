import React, { useState } from 'react'
import Button from '../common/Button/Button'
import './TodoForm.css'

const TodoForm = ({ onAddTodo }) => {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onAddTodo(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Nhập công việc mới..."
          className="todo-input"
        />
        <Button type="submit" variant="primary">
          Thêm
        </Button>
      </div>
    </form>
  )
}

export default TodoForm
