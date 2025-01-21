import { useEffect, useState } from "react";

function Items({ supabase, listId }) {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);

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

    if (error) {
      console.error("Fehler beim Hinzufügen des Items:", error);
    } else if (data) {
      setItems((prevItems) => [...prevItems, ...data]);
      setNewItemName("");
      setNewItemQuantity(1);
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
            <span>
              {item.name} (x{item.quantity})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Items;
