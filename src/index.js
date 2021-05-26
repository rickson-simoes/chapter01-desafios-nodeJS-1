const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( f => f.username == username);

  if (!user) {
    return response.status(404).json({ error: 'User not found.' })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  };

  const checkUserAlreadyExists = users.find(f => f.username == username);

  if (checkUserAlreadyExists) {
    return response.status(400).json({ error: 'User already exists.'});
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const { todos } = users.find(f => f.username === username);
  
  return response.status(200).json(todos);  
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  
  const user = users.find(f => f.username == username);
  
  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };
  
  user.todos.push(todo);
  
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;
  
  const user = users.find(f => f.username == username);
  const todo = user.todos.find(f => f.id == id);
  
  if (!todo) {
    return response.status(404).json({error: "Todo doesn't exist."});
  }
  
  todo.title = title;  
  todo.deadline = new Date(deadline);
  
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  
  const user = users.find(f => f.username == username);
  const todo = user.todos.find(f => f.id == id);
  
  if (!todo) {
    return response.status(404).json({error: "Todo dont exist."});
  }
  
  todo.done = true;
  
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  
  const user = users.find(f => f.username == username);
  const todo = user.todos.find(f => f.id == id);
  const todoIndex = user.todos.findIndex(f => f.id == id);
  
  if (!todo) {
    return response.status(404).json({error: "Todo dont exist."});
  }
  
  user.todos.splice(todoIndex, 1);
  
  return response.status(204).send();
});

module.exports = app;