/**
 * supabaseAdapter
 * ----------------
 * Same four-method contract as localStorageAdapter (getAll/create/update/
 * remove), backed by real Postgres tables instead of localStorage. Every
 * feature's "collection key" (e.g. "garageVehicles", "oweItems") is a
 * camelCase name; every Postgres table/column is snake_case. Rather than
 * hand-maintaining a key -> table map and per-collection field mappers,
 * this converts generically in both directions — so a new collection only
 * needs a matching table (see supabase/migrations/), never a code change
 * here.
 */
import { supabase } from '../supabase/client';
import { toSnakeCase, toCamelCase } from './caseConversion';

function rowToItem(row) {
  const item = {};
  for (const [key, value] of Object.entries(row)) {
    item[toCamelCase(key)] = value;
  }
  return item;
}

function itemToRow(item) {
  const row = {};
  for (const [key, value] of Object.entries(item)) {
    row[toSnakeCase(key)] = value;
  }
  return row;
}

export const supabaseAdapter = {
  /**
   * @param {string} key - collection name, e.g. "todos" -> table "todos"
   */
  async getAll(key) {
    const { data, error } = await supabase
      .from(toSnakeCase(key))
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data.map(rowToItem);
  },

  /**
   * @param {string} key
   * @param {object} item - fields specific to the feature (e.g. { text, completed })
   */
  async create(key, item) {
    const { data, error } = await supabase
      .from(toSnakeCase(key))
      .insert(itemToRow(item))
      .select()
      .single();
    if (error) throw error;
    return rowToItem(data);
  },

  /**
   * @param {string} key
   * @param {string} id
   * @param {object} updates - partial fields to merge in
   */
  async update(key, id, updates) {
    const { data, error } = await supabase
      .from(toSnakeCase(key))
      .update({ ...itemToRow(updates), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return rowToItem(data);
  },

  /**
   * @param {string} key
   * @param {string} id
   */
  async remove(key, id) {
    const { error } = await supabase.from(toSnakeCase(key)).delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};
