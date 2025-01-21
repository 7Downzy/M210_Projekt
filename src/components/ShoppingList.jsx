import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import Items from './Items';

function ShoppingList({ supabase }) {
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [session, setSession] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null); // Zustand für die ausgewählte Liste

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
      fetchShoppingLists();
    }
  }

  if (!session) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Login</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
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
            <span>{list.title}</span>
            <div>
              <button
                onClick={() => setSelectedListId(list.id)} // Items anzeigen
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
                onClick={() => deleteShoppingList(list.id)} // Einkaufsliste löschen
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

      {/* Items-Komponente wird angezeigt, wenn eine Liste ausgewählt ist */}
      {selectedListId && <Items supabase={supabase} listId={selectedListId} />}
    </div>
  );
}

export default ShoppingList;
