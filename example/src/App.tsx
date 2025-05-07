import { useState, useEffect } from 'react';
import StateManager from 'simple-state-manager';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type FilterType = 'all' | 'active' | 'completed';

const todoManager = new StateManager<Todo[]>([]);

function App() {
  const [todos, setTodos] = useState<Todo[]>(todoManager.getState());
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const unsubscribe = todoManager.subscribe(setTodos);
    return unsubscribe;
  }, []);

  const addTodo = () => {
    if (input.trim()) {
      const newTodo = {
        id: Date.now().toString(),
        text: input,
        completed: false,
      };
      todoManager.setState([...todos, newTodo]);
      setInput('');
    }
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    todoManager.setState(updated);
  };

  const deleteTodo = (id: string) => {
    const filtered = todos.filter(todo => todo.id !== id);
    todoManager.setState(filtered);
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      const updated = todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editText } : todo
      );
      todoManager.setState(updated);
      setEditingId(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="todo-container">
      <h1>Todo List</h1>
      
      <div className="todo-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Добавить новую задачу..."
        />
        <button onClick={addTodo}>Добавить</button>
      </div>

      <div className="filter-buttons">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все
        </button>
        <button 
          className={`filter-button ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Активные
        </button>
        <button 
          className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Завершенные
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map(todo => (
          <li key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="todo-checkbox"
            />
            
            {editingId === todo.id ? (
              <div className="todo-edit-container">
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '0px' }}>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="todo-edit-input"
                    autoFocus
                  />
                </div>
                <div className="todo-edit-buttons">
                  <button onClick={saveEdit} className="todo-edit-save">Сохранить</button>
                  <button onClick={cancelEdit} className="todo-edit-cancel">Отмена</button>
                </div>
              </div>
            ) : (
              <>
                <span 
                  className={`todo-text ${todo.completed ? 'completed' : ''}`}
                  onDoubleClick={() => !todo.completed && startEditing(todo.id, todo.text)}
                  title={todo.completed ? "" : "Двойной клик для редактирования"}
                >
                  {todo.text}
                </span>
                <div className="todo-actions">
                  {!todo.completed && (
                    <button 
                      onClick={() => startEditing(todo.id, todo.text)} 
                      className="todo-edit"
                      title="Редактировать задачу"
                    >
                      Ред.
                    </button>
                  )}
                  <button 
                    onClick={() => deleteTodo(todo.id)} 
                    className="todo-delete"
                    title="Удалить задачу"
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
        {filteredTodos.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)' }}>
            {filter === 'all' 
              ? 'Нет задач. Добавьте новую задачу!' 
              : filter === 'active' 
                ? 'Нет активных задач' 
                : 'Нет завершенных задач'}
          </p>
        )}
      </ul>
    </div>
  );
}

export default App; 