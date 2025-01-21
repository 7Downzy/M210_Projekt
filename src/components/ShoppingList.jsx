import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import Items from './Items';

function ShoppingList({ supabase }) {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [session, setSession] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [editingListTitle, setEditingListTitle] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      fetchShoppingLists();
    }
  }, [session]);

  async function fetchShoppingLists() {
    const { data, error } = await supabase.from("shopping_lists").select("*");
    if (error) {
      console.error("Fehler beim Abrufen der Einkaufslisten:", error);
    } else {
      setLists(data);
    }
  }

  async function addShoppingList() {
    if (newListTitle.trim() === "") {
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      console.error("Benutzer ist nicht authentifiziert");
      return;
    }

    const { error } = await supabase
      .from("shopping_lists")
      .insert([{ title: newListTitle, user_id: userId }]);

    if (error) {
      console.error("Fehler beim Hinzufügen der Einkaufsliste:", error);
    } else {
      setNewListTitle("");
      fetchShoppingLists();
    }
  }

  async function deleteShoppingList(id) {
    const { error } = await supabase.from("shopping_lists").delete().eq("id", id);
    if (error) {
      console.error("Fehler beim Löschen der Einkaufsliste:", error);
    } else {
      window.location.reload(); // Seite neu laden
    }
  }

  async function updateShoppingList() {
    if (editingListTitle.trim() === "") {
      return;
    }

    const { error } = await supabase
      .from("shopping_lists")
      .update({ title: editingListTitle })
      .eq("id", editingListId);

    if (error) {
      console.error("Fehler beim Bearbeiten der Einkaufsliste:", error);
    } else {
      setEditingListId(null);
      setEditingListTitle("");
      fetchShoppingLists();
    }
  }

  return (
    <div>
      <h2>Einkaufslisten</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Neue Einkaufsliste hinzufügen"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "300px",
            marginRight: "10px",
          }}
        />
        <button
          onClick={addShoppingList}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Hinzufügen
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {lists.map((list) => (
          <li
            key={list.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {editingListId === list.id ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  value={editingListTitle}
                  onChange={(e) => setEditingListTitle(e.target.value)}
                  style={{
                    padding: "5px",
                    fontSize: "14px",
                    marginRight: "10px",
                  }}
                />
                <button
                  onClick={updateShoppingList}
                  style={{
                    padding: "5px 10px",
                    fontSize: "14px",
                    color: "white",
                    backgroundColor: "green",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginRight: "5px",
                  }}
                >
                  Speichern
                </button>
                <button
                  onClick={() => {
                    setEditingListId(null);
                    setEditingListTitle("");
                  }}
                  style={{
                    padding: "5px 10px",
                    fontSize: "14px",
                    color: "white",
                    backgroundColor: "gray",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <span>{list.title}</span>
            )}
            <div>
              <button
                onClick={() => setSelectedListId(list.id)}
                style={{
                  padding: "5px 10px",
                  fontSize: "14px",
                  color: "white",
                  backgroundColor: "blue",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "5px",
                }}
              >
                Items anzeigen
              </button>
              <button
                onClick={() => {
                  setEditingListId(list.id);
                  setEditingListTitle(list.title);
                }}
                style={{
                  padding: "5px 10px",
                  fontSize: "14px",
                  color: "white",
                  backgroundColor: "orange",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "5px",
                }}
              >
                Bearbeiten
              </button>
              <button
                onClick={() => deleteShoppingList(list.id)}
                style={{
                  padding: "5px 10px",
                  fontSize: "14px",
                  color: "white",
                  backgroundColor: "red",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Löschen
              </button>
            </div>
          </li>
        ))}
      </ul>

      {selectedListId && <Items supabase={supabase} listId={selectedListId} />}
    </div>
  );
}

export default ShoppingList;
