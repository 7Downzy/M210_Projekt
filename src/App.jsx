import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import ShoppingList from "./components/ShoppingList";

const supabase = createClient(
  "https://iumkcujcrxicfvbnytol.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1bWtjdWpjcnhpY2Z2Ym55dG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NDQ4MDEsImV4cCI6MjA1MzAyMDgwMX0.vIVvwAC6YkRLjk8h4DbxNLeWVKMcEjgwTnvI8iKoip0"
);

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
      console.log("Aktuelle Session:", data?.session);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log("Auth State Changed:", session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Login</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Willkommen!</h1>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          setSession(null);
        }}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        Logout
      </button>

      <ShoppingList supabase={supabase} />
    </div>
  );
}

export default App;
