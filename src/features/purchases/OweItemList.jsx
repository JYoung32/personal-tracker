import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { OweItemRow } from './OweItemRow';

export function OweItemList({
  items,
  onItemClick,
  onAmountChange,
  onMonthsLeftChange,
  onDelete,
  emptyMessage,
}) {
  if (items.length === 0) {
    return (
      <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box>
      {items.map((item) => (
        <OweItemRow
          key={item.id}
          item={item}
          onItemClick={onItemClick}
          onAmountChange={onAmountChange}
          onMonthsLeftChange={onMonthsLeftChange}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
}
