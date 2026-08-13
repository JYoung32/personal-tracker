import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { ConfirmDeleteButton } from '../../components/common/ConfirmDeleteButton';
import { TagChipRow } from '../../components/common/TagChipRow';

const INLINE_FIELD_INPUT_STYLE = { fontSize: 12, textAlign: 'right', padding: '0 0 2px' };

/**
 * A row on the Owe list. The whole row navigates to the full edit view on
 * click, except the $ owed amount and months-left, both editable in place
 * within the secondary caption line — each swaps in a small number field
 * that commits on blur/Enter, Escape cancels. Monthly payment (when both
 * are set) shows there too, in a lighter grey since it's read-only.
 * Priority isn't shown here — it only drives sort order and is visible on
 * the full edit form.
 */
export function OweItemRow({ item, onItemClick, onAmountChange, onMonthsLeftChange, onDelete }) {
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountDraft, setAmountDraft] = useState(item.amountOwed);
  const [editingMonths, setEditingMonths] = useState(false);
  const [monthsDraft, setMonthsDraft] = useState(item.monthsLeft ?? '');

  const monthlyPayment =
    item.monthsLeft != null && item.monthsLeft > 0 ? item.amountOwed / item.monthsLeft : null;

  function startEditingAmount(e) {
    e.stopPropagation();
    setAmountDraft(item.amountOwed);
    setEditingAmount(true);
  }

  async function commitAmount() {
    const parsed = Number(amountDraft);
    if (!Number.isNaN(parsed) && amountDraft !== '' && parsed !== item.amountOwed) {
      try {
        await onAmountChange(item.id, parsed);
      } catch {
        // error surfaces via OweSection's error state; keep this field in
        // edit mode (with the typed value) instead of silently reverting
        return;
      }
    }
    setEditingAmount(false);
  }

  function handleAmountKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitAmount();
    } else if (e.key === 'Escape') {
      setAmountDraft(item.amountOwed);
      setEditingAmount(false);
    }
  }

  function startEditingMonths(e) {
    e.stopPropagation();
    setMonthsDraft(item.monthsLeft ?? '');
    setEditingMonths(true);
  }

  async function commitMonths() {
    const newValue = monthsDraft === '' ? null : Number(monthsDraft);
    if (newValue === null || !Number.isNaN(newValue)) {
      if (newValue !== item.monthsLeft) {
        try {
          await onMonthsLeftChange(item.id, newValue);
        } catch {
          // error surfaces via OweSection's error state; keep this field
          // in edit mode (with the typed value) instead of silently
          // reverting
          return;
        }
      }
    }
    setEditingMonths(false);
  }

  function handleMonthsKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitMonths();
    } else if (e.key === 'Escape') {
      setMonthsDraft(item.monthsLeft ?? '');
      setEditingMonths(false);
    }
  }

  return (
    <Box
      onClick={() => onItemClick(item)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:last-of-type': { borderBottom: 'none' },
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography>{item.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 0.5 }}>
          {editingAmount ? (
            <TextField
              type="number"
              variant="standard"
              autoFocus
              value={amountDraft}
              onChange={(e) => setAmountDraft(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={commitAmount}
              onKeyDown={handleAmountKeyDown}
              placeholder="$ owed"
              slotProps={{ htmlInput: { min: 0, step: '0.01', style: INLINE_FIELD_INPUT_STYLE } }}
              sx={{ width: 64 }}
            />
          ) : (
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              onClick={startEditingAmount}
              sx={{ cursor: 'text', '&:hover': { textDecoration: 'underline' } }}
            >
              ${Number(item.amountOwed).toLocaleString()} owed
            </Typography>
          )}
          {(item.monthsLeft != null || editingMonths) && (
            <>
              <Typography component="span" variant="caption" color="text.secondary">
                ·
              </Typography>
              {editingMonths ? (
                <TextField
                  type="number"
                  variant="standard"
                  autoFocus
                  value={monthsDraft}
                  onChange={(e) => setMonthsDraft(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={commitMonths}
                  onKeyDown={handleMonthsKeyDown}
                  placeholder="mo left"
                  slotProps={{ htmlInput: { min: 0, style: INLINE_FIELD_INPUT_STYLE } }}
                  sx={{ width: 56 }}
                />
              ) : (
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  onClick={startEditingMonths}
                  sx={{ cursor: 'text', '&:hover': { textDecoration: 'underline' } }}
                >
                  {item.monthsLeft} mo left
                </Typography>
              )}
            </>
          )}
          {monthlyPayment !== null && (
            <>
              <Typography component="span" variant="caption" color="text.secondary">
                ·
              </Typography>
              <Typography component="span" variant="caption" color="text.disabled">
                ${monthlyPayment.toFixed(2)}/mo
              </Typography>
            </>
          )}
        </Box>
        <TagChipRow tags={item.tags} />
      </Box>

      <ConfirmDeleteButton
        itemLabel={item.name}
        onConfirm={() => onDelete(item.id)}
        renderTrigger={(open) => (
          <IconButton
            aria-label="delete"
            onClick={open}
            size="small"
            sx={{ color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      />
    </Box>
  );
}
