import { useEffect, useState } from "react";

function Items({ supabase, listId }) {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemQuantity, setEditingItemQuantity] = useState(1);

  useEffect(() => {
    fetchItems();
  }, [listId]);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("list_id", listId);

    if (!error) {
      setItems(data);
    }
  }

  async function addItem() {
    if (newItemName.trim() === "") return;

    const { data, error } = await supabase
      .from("items")
      .insert([
        {
          list_id: listId,
          name: newItemName,
          quantity: newItemQuantity,
          checked: false,
        },
      ])
      .select();

    if (!error && data) {
      setItems((prevItems) => [...prevItems, ...data]);
      setNewItemName("");
      setNewItemQuantity(1);
    }
  }

  async function deleteItem(itemId) {
    const { error } = await supabase.from("items").delete().eq("id", itemId);

    if (!error) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    }
  }

  async function updateItem() {
    if (editingItemName.trim() === "") return;

    const { error } = await supabase
      .from("items")
      .update({
        name: editingItemName,
        quantity: editingItemQuantity,
      })
      .eq("id", editingItemId);

    if (!error) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === editingItemId
            ? { ...item, name: editingItemName, quantity: editingItemQuantity }
            : item
        )
      );
      setEditingItemId(null);
      setEditingItemName("");
      setEditingItemQuantity(1);
    }
  }

  async function toggleChecked(itemId, currentChecked) {
    const { error } = await supabase
      .from("items")
      .update({ checked: !currentChecked })
      .eq("id", itemId);

    if (!error) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, checked: !currentChecked } : item
        )
      );
    }
  }

  return (
    <div>
      <h3>Items</h3>
      <div>
        <input
          type="text"
          placeholder="Neues Item hinzufügen"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <input
          type="number"
          min="1"
          value={newItemQuantity}
          onChange={(e) => setNewItemQuantity(e.target.value)}
        />
        <button onClick={addItem}>Hinzufügen</button>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {editingItemId === item.id ? (
              <div>
                <input
                  type="text"
                  value={editingItemName}
                  onChange={(e) => setEditingItemName(e.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  value={editingItemQuantity}
                  onChange={(e) => setEditingItemQuantity(e.target.value)}
                />
                <button onClick={updateItem}>Speichern</button>
                <button
                  onClick={() => {
                    setEditingItemId(null);
                    setEditingItemName("");
                    setEditingItemQuantity(1);
                  }}
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <div>
                <span
                  style={{
                    textDecoration: item.checked ? "line-through" : "none",
                  }}
                >
                  {item.name} (x{item.quantity})
                </span>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleChecked(item.id, item.checked)}
                  style={{ marginLeft: "10px" }}
                />
                <button
                  onClick={() => {
                    setEditingItemId(item.id);
                    setEditingItemName(item.name);
                    setEditingItemQuantity(item.quantity);
                  }}
                >
                  Bearbeiten
                </button>
                <button onClick={() => deleteItem(item.id)}>Löschen</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Items;
