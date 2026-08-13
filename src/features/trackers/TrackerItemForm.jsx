import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormActions } from '../../components/common/FormActions';

// A field's TextField value is always a string (even type="number" inputs
// report e.target.value as a string), so "empty" only ever means an
// unset/blank string here — not a falsy check, which would wrongly treat
// a typed "0" as empty.
function isEmptyValue(value) {
  return typeof value !== 'string' || value.trim() === '';
}

/**
 * The dynamic form for a tracker item — renders `title` (always), one
 * TextField per the tracker type's current fields, and `notes` (always).
 * `fields` is the tracker type's tracker_fields list (caller sorts by
 * sortOrder); each field is keyed by its own id — never its label, which
 * is freely renameable — so field_values in the DB never orphans on
 * rename (see migration 002's header). Each field's `required` drops its
 * "(optional)" suffix and blocks submit (silently, same as the Title
 * check below) if left blank; `fieldType` picks a text vs number
 * TextField — both are pure form-behavior metadata, field_values is
 * stored as text either way. `itemNameLabel` is the tracker type's own
 * `item_name_label` (see TrackerTypeForm's docstring) — just relabels the
 * Title field for this type, still submitted as `title`. Calls
 * onSubmit({ title, fieldValues, notes }); fieldValues only includes keys
 * for fields the user actually filled in. In "add" mode (no
 * initialValues) it clears itself after submit.
 */
export function TrackerItemForm({
  fields,
  itemNameLabel,
  initialValues,
  onSubmit,
  submitLabel = 'Add',
  onCancel,
}) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [fieldValues, setFieldValues] = useState(initialValues?.fieldValues ?? {});
  const [notes, setNotes] = useState(initialValues?.notes ?? '');

  function handleFieldChange(fieldId, value) {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    for (const field of fields) {
      if (field.required && isEmptyValue(fieldValues[field.id])) return;
    }

    const cleanedFieldValues = {};
    for (const field of fields) {
      const value = fieldValues[field.id];
      if (!isEmptyValue(value)) cleanedFieldValues[field.id] = value.trim();
    }

    onSubmit({
      title: trimmedTitle,
      fieldValues: cleanedFieldValues,
      notes: notes.trim() || null,
    });

    if (!initialValues) {
      setTitle('');
      setFieldValues({});
      setNotes('');
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
          htmlFor="tracker-item-title"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          {itemNameLabel || 'Title'}
        </Typography>
        <TextField
          id="tracker-item-title"
          variant="standard"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
      </Box>

      {fields.map((field) => (
        <Box key={field.id}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="label"
            htmlFor={`tracker-item-field-${field.id}`}
            align="center"
            sx={{ display: 'block', mb: 0.5 }}
          >
            {field.label}
            {!field.required && ' (optional)'}
          </Typography>
          <TextField
            id={`tracker-item-field-${field.id}`}
            variant="standard"
            type={field.fieldType === 'number' ? 'number' : 'text'}
            value={fieldValues[field.id] ?? ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            fullWidth
          />
        </Box>
      ))}

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          component="label"
          htmlFor="tracker-item-notes"
          align="center"
          sx={{ display: 'block', mb: 0.5 }}
        >
          Notes (optional)
        </Typography>
        <TextField
          id="tracker-item-notes"
          variant="standard"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          minRows={2}
          fullWidth
        />
      </Box>

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <FormActions submitLabel={submitLabel} onCancel={onCancel} />
      </Box>
    </Box>
  );
}
