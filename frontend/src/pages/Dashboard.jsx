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
  const [completingHabits, setCompletingHabits] = useState(new Set());
  const [deletingHabits, setDeletingHabits] = useState(new Set());
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

  const handleComplete = async (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit?.is_completed) {
      alert("This habit is already completed for this period!");
      return;
    }

    setCompletingHabits(prev => new Set([...prev, habitId]));
    try {
      const response = await completeHabit(habitId, token);
      setHabits(prev => prev.map(h => 
        h.id === habitId ? { 
          ...h, 
          is_completed: true, 
          can_complete: false,
          streak: response.streak || h.streak
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
      padding: '1.5rem', 
      borderRadius: '0.75rem', 
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
      width: '100%', 
      maxWidth: '80rem', 
      margin: '0 auto', 
      border: '1px solid #d1d5db' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Dashboard - {user.name}</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.375rem', 
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Add Habit
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Create New Habit</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="title" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
                placeholder="Enter habit title"
              />
            </div>
            
            <div>
              <label htmlFor="description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
                placeholder="Enter habit description (optional)"
              />
            </div>
            
            <div>
              <label htmlFor="frequency" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={cancelForm}
                style={{ 
                  padding: '0.5rem 1rem', 
                  color: '#4b5563', 
                  backgroundColor: '#e5e7eb',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#d1d5db'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.title.trim()}
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: (submitting || !formData.title.trim()) ? '#93c5fd' : '#3b82f6',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: (submitting || !formData.title.trim()) ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!submitting && formData.title.trim()) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting && formData.title.trim()) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {submitting ? "Creating..." : "Create Habit"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading habits...</p>
      ) : (
        <div>
          {habits.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>
              No habits yet. Create your first habit to get started!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Uncompleted Habits Column */}
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  Todo ({habits.filter(habit => !habit.is_completed).length})
                </h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }}>
                  {habits
                    .filter(habit => !habit.is_completed)
                    .map((habit) => {
                      const isCompleting = completingHabits.has(habit.id);
                      const isDeleting = deletingHabits.has(habit.id);
                      
                      return (
                        <li key={habit.id} style={{ 
                          padding: '1.25rem', 
                          backgroundColor: 'white', 
                          border: '3px solid #3b82f6', 
                          borderRadius: '0.75rem', 
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                        }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.25rem', margin: 0 }}>{habit.title}</p>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  backgroundColor: '#fef3c7', 
                                  color: '#92400e', 
                                  fontSize: '0.75rem', 
                                  fontWeight: '600',
                                  borderRadius: '0.375rem', 
                                  border: '1px solid #fcd34d' 
                                }}>
                                  🔥 {habit.streak || 0} streak
                                </div>
                                <button
                                  onClick={() => handleDelete(habit.id)}
                                  disabled={isDeleting}
                                  style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    backgroundColor: isDeleting ? '#fca5a5' : '#ef4444',
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '0.375rem', 
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
                            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.75rem' }}>{habit.description}</p>
                            <p style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                              {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                            </p>
                            <button
                              onClick={() => handleComplete(habit.id)}
                              disabled={isCompleting}
                              style={{ 
                                padding: '0.75rem 1.25rem', 
                                backgroundColor: isCompleting ? '#86efac' : '#22c55e',
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '0.5rem', 
                                fontWeight: '600',
                                cursor: isCompleting ? 'not-allowed' : 'pointer',
                                width: '100%', 
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              onMouseEnter={(e) => {
                                if (!isCompleting) {
                                  e.target.style.backgroundColor = '#16a34a';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isCompleting) {
                                  e.target.style.backgroundColor = '#22c55e';
                                }
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
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0', fontSize: '0.875rem' }}>
                    All habits completed! 🎉
                  </p>
                )}
              </div>

              {/* Completed Habits Column */}
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                  Completed ({habits.filter(habit => habit.is_completed).length})
                </h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }}>
                  {habits
                    .filter(habit => habit.is_completed)
                    .map((habit) => {
                      const isDeleting = deletingHabits.has(habit.id);
                      
                      return (
                        <li key={habit.id} style={{ 
                          padding: '1.25rem', 
                          backgroundColor: 'white', 
                          border: '3px solid #22c55e', 
                          borderRadius: '0.75rem', 
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          opacity: 0.8
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.25rem', margin: 0, textDecoration: 'line-through' }}>{habit.title}</p>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <div style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    backgroundColor: '#fef3c7', 
                                    color: '#92400e', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600',
                                    borderRadius: '0.375rem', 
                                    border: '1px solid #fcd34d' 
                                  }}>
                                    🔥 {habit.streak || 0} streak
                                  </div>
                                  <button
                                    onClick={() => handleDelete(habit.id)}
                                    disabled={isDeleting}
                                    style={{ 
                                      padding: '0.25rem 0.5rem', 
                                      backgroundColor: isDeleting ? '#fca5a5' : '#ef4444',
                                      color: 'white', 
                                      border: 'none', 
                                      borderRadius: '0.375rem', 
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
                              <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.75rem' }}>{habit.description}</p>
                              <p style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                              </p>
                            </div>
                            <div style={{ marginLeft: '1rem' }}>
                              <span style={{ 
                                padding: '0.5rem 0.75rem', 
                                backgroundColor: '#dcfce7', 
                                color: '#166534', 
                                fontSize: '0.875rem', 
                                fontWeight: '600',
                                borderRadius: '0.5rem', 
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
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
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0', fontSize: '0.875rem' }}>
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