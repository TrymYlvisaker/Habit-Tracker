// Main dashboard component - displays and manages user's habits
import { useEffect, useState } from "react";
import { getHabits, createHabit, completeHabit, deleteHabit } from "../api";

export default function Dashboard({ user }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    frequency: "daily"
  });
  const [submitting, setSubmitting] = useState(false);
  // Track which habits are being processed to prevent duplicate actions
  const [completingHabits, setCompletingHabits] = useState(new Set());
  const [deletingHabits, setDeletingHabits] = useState(new Set());
  const token = localStorage.getItem("token");

  // Load user's habits on component mount
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setSubmitting(true);
    try {
      const newHabit = await createHabit(formData, token);
      setHabits(prev => [...prev, newHabit]);
      setFormData({ title: "", description: "", frequency: "daily" });
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create habit:", error);
    } finally {
      setSubmitting(false);
    }
  };

// Handle habit completion - prevent duplicate completions and update UI
const handleComplete = async (habitId) => {
  const habit = habits.find(h => h.id === habitId);
  if (habit?.is_completed) {
    alert("This habit is already completed for this period!");
    return;
  }

  setCompletingHabits(prev => new Set([...prev, habitId]));
  try {
    const response = await completeHabit(habitId, token);
    // Update habit state with completion status and new streak
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { 
        ...h, 
        is_completed: true, 
        can_complete: false,
        streak: response.streak || h.streak // Update streak from backend response
      } : h
    ));
  } catch (error) {
    console.error("Failed to complete habit:", error);
    alert("Failed to complete habit. " + (error.message || "Please try again."));
  } finally {
    setCompletingHabits(prev => {
      const newSet = new Set(prev);
      newSet.delete(habitId);
      return newSet;
    });
  }
};

const handleDelete = async (habitId) => {
  if (!window.confirm("Are you sure you want to delete this habit? This action cannot be undone.")) {
    return;
  }

  setDeletingHabits(prev => new Set([...prev, habitId]));
  try {
    await deleteHabit(habitId, token);
    setHabits(prev => prev.filter(h => h.id !== habitId));
  } catch (error) {
    console.error("Failed to delete habit:", error);
    alert("Failed to delete habit. " + (error.message || "Please try again."));
  } finally {
    setDeletingHabits(prev => {
      const newSet = new Set(prev);
      newSet.delete(habitId);
      return newSet;
    });
  }
};

  const cancelForm = () => {
    setShowForm(false);
    setFormData({ title: "", description: "", frequency: "daily" });
  };

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '1280px',
      margin: '0 auto',
      border: '1px solid #d1d5db'
    }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard - {user.name}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          Add Habit
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h2 className="text-lg font-semibold mb-4">Create New Habit</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter habit title"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter habit description (optional)"
              />
            </div>
            
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.title.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded transition-colors"
              >
                {submitting ? "Creating..." : "Create Habit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center">Loading habits...</p>
      ) : (
        <div>
          {habits.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No habits yet. Create your first habit to get started!
            </p>
          ) : (
            <div className="w-full" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Uncompleted Habits Column */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                  Todo ({habits.filter(habit => !habit.is_completed).length})
                </h2>
                <ul className="space-y-3" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                  {habits
                    .filter(habit => !habit.is_completed)
                    .map((habit) => {
                      const isCompleting = completingHabits.has(habit.id);
                      const isDeleting = deletingHabits.has(habit.id);
                      
                      return (
                        <li key={habit.id} style={{ 
                          padding: '20px',
                          backgroundColor: '#ffffff',
                          border: '3px solid #3b82f6',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          marginBottom: '16px'
                        }}>
                          <div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.25rem', margin: 0 }}>{habit.title}</p>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <div style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    borderRadius: '6px',
                                    border: '1px solid #fcd34d'
                                  }}>
                                    🔥 {habit.streak || 0} streak
                                  </div>
                                  <button
                                    onClick={() => handleDelete(habit.id)}
                                    disabled={isDeleting}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: isDeleting ? '#fca5a5' : '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      cursor: isDeleting ? 'not-allowed' : 'pointer'
                                    }}
                                    title="Delete habit"
                                  >
                                    {isDeleting ? '...' : '🗑️'}
                                  </button>
                                </div>
                              </div>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '12px' }}>{habit.description}</p>
                              <p style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                                {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleComplete(habit.id)}
                              disabled={isCompleting}
                              style={{
                                padding: '12px 20px',
                                backgroundColor: isCompleting ? '#86efac' : '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: isCompleting ? 'not-allowed' : 'pointer',
                                width: '100%',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            >
                              {isCompleting ? "Completing..." : "Complete"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                </ul>
                {habits.filter(habit => !habit.is_completed).length === 0 && (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    All habits completed! 🎉
                  </p>
                )}
              </div>

              {/* Completed Habits Column */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                  Completed ({habits.filter(habit => habit.is_completed).length})
                </h2>
                <ul className="space-y-3" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                  {habits
                    .filter(habit => habit.is_completed)
                    .map((habit) => {
                      const isDeleting = deletingHabits.has(habit.id);
                      
                      return (
                        <li key={habit.id} style={{
                          padding: '20px',
                          backgroundColor: '#ffffff',
                          border: '3px solid #10b981',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          marginBottom: '16px',
                          opacity: '0.8'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.25rem', margin: 0, textDecoration: 'line-through' }}>{habit.title}</p>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <div style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#fef3c7',
                                    color: '#92400e',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    borderRadius: '6px',
                                    border: '1px solid #fcd34d'
                                  }}>
                                    🔥 {habit.streak || 0} streak
                                  </div>
                                  <button
                                    onClick={() => handleDelete(habit.id)}
                                    disabled={isDeleting}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: isDeleting ? '#fca5a5' : '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: '600',
                                      cursor: isDeleting ? 'not-allowed' : 'pointer'
                                    }}
                                    title="Delete habit"
                                  >
                                    {isDeleting ? '...' : '🗑️'}
                                  </button>
                                </div>
                              </div>
                              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '12px' }}>{habit.description}</p>
                              <p style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                              </p>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                              <span style={{
                                padding: '8px 12px',
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                borderRadius: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                border: '1px solid #bbf7d0'
                              }}>
                                ✓ Done
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
                {habits.filter(habit => habit.is_completed).length === 0 && (
                  <p className="text-center text-gray-400 py-8 text-sm">
                    No completed habits yet
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
