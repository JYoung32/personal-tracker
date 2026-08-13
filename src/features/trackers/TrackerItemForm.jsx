import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FormActions } from '../../components/common/FormActions';
import { TagsInput } from '../../components/common/TagsInput';
import { normalizeTags } from '../../utils/tags';

// A text/number/date/select field's value is always a string (even
// type="number" inputs report e.target.value as a string), so "empty"
// only ever means an unset/blank string here — not a falsy check, which
// would wrongly treat a typed "0" as empty. Boolean fields never go
// through this — see the two call sites below.
function isEmptyValue(value) {
  return typeof value !== 'string' || value.trim() === '';
}

/**
 * The dynamic form for a tracker item — renders `title` (always), one
 * input per the tracker type's current fields, and `notes` (always).
 * `fields` is the tracker type's tracker_fields list (caller sorts by
 * sortOrder); each field is keyed by its own id — never its label, which
 * is freely renameable — so field_values in the DB never orphans on
 * rename (see migration 001's tracker_fields section). Each field's
 * `required` drops its "(optional)" suffix and blocks submit (silently,
 * same as the Title check below) if left blank — except for `boolean`
 * fields, which always have a definite true/false value so "required"
 * doesn't apply. `fieldType` picks which input renders:
 * text/number/date (all TextField, just a different `type`), `boolean`
 * (a Checkbox, stored as an actual boolean rather than text), or `select`
 * (a Select populated from the field's `selectOptions`). `itemNameLabel`
 * is the tracker type's own `item_name_label` (see TrackerTypeForm's
 * docstring) — just relabels the Title field for this type, still
 * submitted as `title`. Calls onSubmit({ title, fieldValues, notes, tags });
 * fieldValues only includes keys for fields the user actually filled in
 * (booleans are the exception — false is a real answer, not "empty", so
 * it's always included). In "add" mode (no initialValues) it clears
 * itself after submit.
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
  const [tags, setTags] = useState(initialValues?.tags ?? []);

  function handleFieldChange(fieldId, value) {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    for (const field of fields) {
      if (!field.required || field.fieldType === 'boolean') continue;
      if (isEmptyValue(fieldValues[field.id])) return;
    }

    const cleanedFieldValues = {};
    for (const field of fields) {
      const value = fieldValues[field.id];
      if (field.fieldType === 'boolean') {
        cleanedFieldValues[field.id] = !!value;
        continue;
      }
      if (!isEmptyValue(value)) cleanedFieldValues[field.id] = value.trim();
    }

    onSubmit({
      title: trimmedTitle,
      fieldValues: cleanedFieldValues,
      notes: notes.trim() || null,
      tags: normalizeTags(tags),
    });

    if (!initialValues) {
      setTitle('');
      setFieldValues({});
      setNotes('');
      setTags([]);
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
          {field.fieldType === 'boolean' ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!fieldValues[field.id]}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                />
              }
              label={field.label}
            />
          ) : (
            <>
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
              {field.fieldType === 'select' ? (
                <Select
                  id={`tracker-item-field-${field.id}`}
                  variant="standard"
                  displayEmpty
                  value={fieldValues[field.id] ?? ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {(field.selectOptions ?? []).map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <TextField
                  id={`tracker-item-field-${field.id}`}
                  variant="standard"
                  type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                  value={fieldValues[field.id] ?? ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  fullWidth
                />
              )}
            </>
          )}
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

      <TagsInput id="tracker-item-tags" value={tags} onChange={setTags} />

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <FormActions submitLabel={submitLabel} onCancel={onCancel} />
      </Box>
    </Box>
  );
}
