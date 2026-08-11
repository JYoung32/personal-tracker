import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TodoItem } from './TodoItem';

export function TodoList({ todos, onToggleComplete, onDelete, onPriorityChange, showFrequency }) {
  if (todos.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
        Nothing here — add a to-do above.
      </Typography>
    );
  }

  return (
    <Box>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onPriorityChange={onPriorityChange}
          showFrequency={showFrequency}
        />
      ))}
    </Box>
  );
}