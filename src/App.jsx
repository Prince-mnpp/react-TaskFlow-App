import React, { useEffect, useState } from 'react'
import Animate from './components/Animate'
import Notification from './components/Notification'
import Header from './components/Header'
import StatsGrid from './components/StatsGrid'
import Input from './components/Input'
import ClearButton from './components/ClearButton'
import TodoList from './components/TodoList'
import {playSound} from './components/PlaySound'

const App = () => {
  const STORAGE_KEY = "todos";

  // get from localStorage
  


  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [notification, setNotification] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  console.log("my todo is:", todos);

  useEffect(() => {
    try{
      const data = localStorage.getItem(STORAGE_KEY);
      if(data){
        setTodos(JSON.parse(data))
      }
    }
    catch (error){
      console.log("Load Errors:",error)
    }
    finally{
      setHasLoaded(true);
    }
  }, [])

  // save to local STORAGE
  useEffect(() => {
  if (!hasLoaded) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.log("save error:", error);
  }
}, [todos, hasLoaded]);

  //show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  //add todo
  const handleAddTodo = () => {
    if (!input.trim()) return;

    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([newTodo, ...todos]);
    setInput("");
    playSound("add");
    showNotification("✨ Task added Successfully!");
  };

  // onToggle 
  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) => 
        todo.id === id ? { ...todo, completed: !todo.completed} : todo
      )
    );
    const todo = todos.find((t) => t.id === id)
    if(!todo.completed){
      playSound("complete")
      showNotification("🎉 Great Job! Task completed")
    }
  };

  //key press down (add)
  const handleKeyPress = (e) => {
    if (e.key == "Enter") {
      handleAddTodo();
    }
  }

  //edit key press
  const handleEditKeyPress = (e, id) => {
    if (e.key === "Enter") {
      saveEdit(id);
    }
    else if (e.key === "Escape") {
      cancelEdit();
    }
  }

  //start edit 
  const startEditing = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  //update todo 
  const saveEdit = (id) => {
    if (!editText.trim()) return;

    setTodos(todos.map((todo) => (
      todo.id === id ? { ...todo, text: editText } : todo
    )));

    setEditText("");
    setEditingId(null);
    playSound("update");
    showNotification("Task updated Successfully");
  }

  //cancel edit
  const cancelEdit = () => {
    setEditText("");
    setEditingId(null);
  }

  //delete todo 
  const deleteTodo = (id) => {
    setTodos(todos.filter((todos) => todos.id != id))
    playSound("delete")
    showNotification("🚮 Task deleted", "info")
  }

  // clear all completed Tasks
  const clearCompleted = () => {
    setTodos(todos.filter((t) => !t.completed));
    playSound("delete")
    showNotification("🚮 Task deleted", "info")
  }

  const activeTodos = todos.filter((t) => !t.completed).length
  const completedTodos = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedTodos/todos.length)*100 : 0;

  return (
    <>
      <div className='min-h-screen bg-linear-to-br from-indigo-950 via-purple-950 to-pink-950 p-3 sm:p-6 relative overflow-hidden' style={{ minHeight: "100vh" }}>
        <Animate />

        <Notification notification={notification} onClose={() => setNotification(null)} />

        <div>
          <Header activeTodos ={activeTodos} progress = {progress} totalTodos = {todos.length} />

          <StatsGrid activeTodos ={activeTodos} progress = {progress} totalTodos = {todos.length} completedTodos={completedTodos}/>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onAdd={handleAddTodo}
            onKeyPress={handleKeyPress}
          />


          <TodoList 
          todos={todos} 
          onDelete={deleteTodo} 
          onStartEdit={startEditing} 
          onCancelEdit={cancelEdit} 
          editingId={editingId} 
          editText={editText} 
          onEditTextChange={(e) => setEditText(e.target.value)} 
          onSaveEdit={saveEdit}
          onEditKeyPress = {handleEditKeyPress} 
          onToggle = {toggleTodo}
          />
          
          <ClearButton 
          completedTodos = {completedTodos} 
          onClick = {clearCompleted}/>
        </div>

        <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
      </div>
    </>
  )
}

export default App
