import { useState, useEffect } from 'react'

const useLocalStorage = (key, initialValue) => {
  // State để lưu trữ giá trị
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Hàm để set giá trị mới
  const setValue = (value) => {
    try {
      // Cho phép value là function để có syntax giống useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Lưu vào state
      setStoredValue(valueToStore)
      
      // Lưu vào localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Hàm để xóa giá trị
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage
