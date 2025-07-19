import React from 'react'
import Header from '../../components/common/Header/Header'
import TodoForm from '../../components/TodoForm/TodoForm'
import TodoList from '../../components/TodoList/TodoList'
import useTodos from '../../hooks/useTodos'
import './Home.css'

const Home = () => {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos()

  return (
    <div className="home">
      <Header 
        title="📝 Todo App" 
        subtitle="Quản lý công việc hiệu quả với React"
      />
      
      <main className="main-content">
        <div className="container">
          <div className="todo-section">
            <TodoForm onAddTodo={addTodo} />
            
            <div className="stats">
              <span>Tổng: {todos.length}</span>
              <span>Hoàn thành: {todos.filter(t => t.completed).length}</span>
              <span>Chưa hoàn thành: {todos.filter(t => !t.completed).length}</span>
            </div>
            
            <TodoList 
              todos={todos}
              onToggleTodo={toggleTodo}
              onDeleteTodo={deleteTodo}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
