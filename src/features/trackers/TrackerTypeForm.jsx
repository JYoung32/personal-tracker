import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormActions } from '../../components/common/FormActions';

// Trims, drops empties, and dedupes labels case-insensitively (same rule
// as utils/tags.js normalizeTags) while preserving each pill's
// required/fieldType metadata — normalizeTags itself only handles plain
// strings, so this is the pill-aware equivalent.
function normalizeFieldPills(pills) {
  const seen = new Set();
  const result = [];
  for (const pill of pills) {
    const label = pill.label.trim();
    if (!label) continue;
    const dedupeKey = label.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push({ ...pill, label });
  }
  return result;
}

/**
 * Form for creating or renaming a Tracker (a user-defined domain, e.g.
 * "Guitars"). Calls onSubmit({ name, description, itemNameLabel,
 * fieldDefs }). In "add" mode (no initialValues) it clears itself after
 * submit; pass initialValues (an existing tracker type) to prefill for
 * editing.
 *
 * `itemNameLabel` renames what TrackerItemForm calls its Title field for
 * this type's items (e.g. "Guitar Name" instead of the generic "Title") —
 * purely a display label, `tracker_items.title` is still where the value
 * lives, so this is free to change at any time with nothing to migrate.
 * It's shown as a single clickable pill (a Chip) rather than a plain
 * TextField; clicking it swaps in a text input, and blurring/Enter swaps
 * back to the pill showing whatever was typed.
 *
 * The "Fields for Item in Tracker" input is the same tag-style Autocomplete
 * as TodoForm's Tags field — type a label, press Enter, repeat — as pills
 * instead of a separate managed list. In add mode it starts empty; pass
 * the type's current `tracker_fields` rows as the `fields` prop
 * (`[{id, label, required, fieldType}, ...]`) in edit mode to seed the
 * pills from what already exists. Clicking a field pill (not its delete X)
 * opens a small dialog to set that field's `required` (checkbox) and
 * `fieldType` (string/number) — this is metadata `tracker_fields` rows
 * carry per-field, unlike `itemNameLabel` which is a whole-type setting,
 * so only these pills get that editor.
 *
 * `onSubmit` gets the resulting pill set as `fieldDefs`
 * (`[{label, required, fieldType}, ...]`, sourced from `field.key`, `field.label`
 * — the caller reconciles it against any existing fields by label (add
 * what's new, remove what's missing, update required/fieldType on what's
 * unchanged so its id — and so its data — survives), the same "diff by
 * value" idiom a plain tag list uses, since a pure label rename has no
 * separate affordance here (it looks like delete-old-add-new, same as any
 * tag list).
 */
export function TrackerTypeForm({ initialValues, fields, onSubmit, submitLabel = 'Add', onCancel }) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [itemNameLabel, setItemNameLabel] = useState(initialValues?.itemNameLabel ?? '');
  const [editingItemNameLabel, setEditingItemNameLabel] = useState(false);
  const [fieldPills, setFieldPills] = useState(
    (fields ?? []).map((f) => ({
      key: f.id,
      label: f.label,
      required: !!f.required,
      fieldType: f.fieldType || 'string',
    }))
  );
  const [editingFieldKey, setEditingFieldKey] = useState(null);
  const isAdding = !initialValues;
  const editingField = fieldPills.find((p) => p.key === editingFieldKey) ?? null;

  function handleFieldsChange(_, newValue) {
    setFieldPills(
      newValue.map((v) =>
        typeof v === 'string' ? { key: crypto.randomUUID(), label: v, required: false, fieldType: 'string' } : v
      )
    );
  }

  function updateFieldPill(key, updates) {
    setFieldPills((prev) => prev.map((p) => (p.key === key ? { ...p, ...updates } : p)));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    onSubmit({
      name: trimmed,
      description: description.trim() || null,
      itemNameLabel: itemNameLabel.trim() || null,
      fieldDefs: normalizeFieldPills(fieldPills).map(({ label, required, fieldType }) => ({
        label,
        required,
        fieldType,
      })),
    });
    if (isAdding) {
      setName('');
      setDescription('');
      setItemNameLabel('');
      setFieldPills([]);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 5 }}
    >
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="tracker-type-name"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Tracker name
        </Typography>
        <TextField
          id="tracker-type-name"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="tracker-type-description"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Description (optional)
        </Typography>
        <TextField
          id="tracker-type-description"
          variant="standard"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="tracker-type-item-name-label"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Name for Tracker Item
        </Typography>
        {editingItemNameLabel ? (
          <TextField
            id="tracker-type-item-name-label"
            variant="standard"
            autoFocus
            value={itemNameLabel}
            onChange={(e) => setItemNameLabel(e.target.value)}
            onBlur={() => setEditingItemNameLabel(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setEditingItemNameLabel(false);
              }
            }}
            placeholder="Title"
            fullWidth
          />
        ) : (
          <Chip label={itemNameLabel || 'Title'} size="small" onClick={() => setEditingItemNameLabel(true)} />
        )}
      </Box>

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="tracker-type-fields"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Fields for Item in Tracker (optional)
        </Typography>
        <Autocomplete
          id="tracker-type-fields"
          multiple
          freeSolo
          options={[]}
          value={fieldPills}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          onChange={handleFieldsChange}
          renderValue={(value, getItemProps) =>
            value.map((pill, index) => {
              const { key: _key, ...chipProps } = getItemProps({ index });
              return (
                <Chip
                  key={pill.key}
                  label={pill.label}
                  size="small"
                  onClick={() => setEditingFieldKey(pill.key)}
                  {...chipProps}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField {...params} variant="standard" placeholder="Field label, press Enter" />
          )}
        />
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <FormActions submitLabel={submitLabel} onCancel={onCancel} />
      </Box>

      <Dialog
        open={!!editingField}
        onClose={() => setEditingFieldKey(null)}
        slotProps={{ paper: { sx: { width: 320, maxWidth: 'calc(100vw - 32px)' } } }}
      >
        <DialogTitle>{editingField?.label}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={editingField?.required ?? false}
                onChange={(e) => updateFieldPill(editingField.key, { required: e.target.checked })}
              />
            }
            label="Required"
          />
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              component="label"
              htmlFor="tracker-field-type"
              align="center"
              sx={{ display: 'block', mb: 0.5 }}
            >
              Type
            </Typography>
            <Select
              id="tracker-field-type"
              variant="standard"
              value={editingField?.fieldType ?? 'string'}
              onChange={(e) => updateFieldPill(editingField.key, { fieldType: e.target.value })}
              fullWidth
            >
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="number">Number</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingFieldKey(null)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
