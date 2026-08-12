import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import { useCollection } from '../../hooks/useCollection';
import { AddFormPanel } from '../../components/common/AddFormPanel';
import { AddToggleActions } from '../../components/common/AddToggleActions';
import { OweItemForm } from './OweItemForm';
import { OweItemList } from './OweItemList';

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

function formatCurrency(value) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * The "Owe" tab's content on the Finances page — items with a name, amount
 * owed, optional months remaining, priority (defaults to Low), and an
 * optional description. Sorted by priority (high to low), though priority
 * itself isn't shown in the list — only on the full edit form. Click a row
 * to edit it in full (OweItemDetailPage); click the $ owed amount or
 * months-left specifically to update those inline instead. Ends with a
 * Total / Monthly Owed summary.
 */
export function OweSection() {
  const { items, loading, error, addItem, updateItem, removeItem } = useCollection('oweItems');
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const panelRef = useRef(null);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2)
      ),
    [items]
  );

  const totalOwed = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amountOwed || 0), 0),
    [items]
  );

  const monthlyOwed = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (item.monthsLeft != null && item.monthsLeft > 0) {
          return sum + Number(item.amountOwed) / Number(item.monthsLeft);
        }
        return sum;
      }, 0),
    [items]
  );

  function handleAmountChange(id, amountOwed) {
    return updateItem(id, { amountOwed });
  }

  function handleMonthsLeftChange(id, monthsLeft) {
    return updateItem(id, { monthsLeft });
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <AddToggleActions
          open={showForm}
          onOpen={() => setShowForm(true)}
          onSave={() => panelRef.current?.submit()}
          onCancel={() => setShowForm(false)}
          addLabel="Add to Owe"
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <AddFormPanel
        ref={panelRef}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={addItem}
        FormComponent={OweItemForm}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <OweItemList
          items={sortedItems}
          onItemClick={(item) => navigate(`/purchases/owe/${item.id}`)}
          onAmountChange={handleAmountChange}
          onMonthsLeftChange={handleMonthsLeftChange}
          onDelete={removeItem}
          emptyMessage="Nothing here — add an item above."
        />
      )}

      <Divider sx={{ mt: 4, mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="text.secondary">Total</Typography>
          <Typography fontWeight={600}>{formatCurrency(totalOwed)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Monthly Owed
          </Typography>
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            {formatCurrency(monthlyOwed)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
