import { useEffect, useState } from "react";
import { getHabits } from "../api";

export default function Dashboard({ user }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchHabits() {
      try {
        const data = await getHabits(token);
        setHabits(data);
      } catch {
        console.error("Failed to fetch habits");
      } finally {
        setLoading(false);
      }
    }
    fetchHabits();
  }, [token]);

  return (
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Welcome, {user.name}!</h1>
      {loading ? (
        <p className="text-center">Loading habits...</p>
      ) : (
        <ul className="space-y-4">
          {habits.map((habit) => (
            <li key={habit.id} className="p-4 bg-gray-100 rounded shadow flex justify-between">
              <div>
                <p className="font-semibold">{habit.title}</p>
                <p className="text-sm text-gray-500">{habit.description}</p>
              </div>
              <p className="text-blue-500 capitalize">{habit.frequency}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
