import { useState, type FormEvent } from "react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { useTravel } from "../context/TravelContext";
import { formatCurrency } from "../utils/format";

const categories = ["Lodging", "Food", "Transportation", "Activities", "Shopping", "Other"];

export function ExpensesPage() {
  const { trip, travelers, expenses, addExpense, removeExpense } = useTravel();
  const [form, setForm] = useState({ description: "", amount: "", paidBy: travelers[0]?.name ?? "You", category: "Food" });
  const [error, setError] = useState("");
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const groupBudget = trip.budgetPerTraveler * trip.travelerCount;
  const remaining = groupBudget - total;
  const perTraveler = total / Math.max(1, trip.travelerCount);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (form.description.trim().length < 2) return setError("Add a short description.");
    if (!Number.isFinite(amount) || amount <= 0) return setError("Enter an amount above $0.");
    if (!form.paidBy) return setError("Choose who paid.");
    addExpense({ description: form.description.trim(), amount, paidBy: form.paidBy, category: form.category });
    setForm((current) => ({ ...current, description: "", amount: "" }));
    setError("");
  }

  return (
    <div>
      <PageHeader eyebrow="Stay on the same page" title="Trip expenses" description="Record what the group spends. Settlement and payments are intentionally outside this prototype." />
      <div className="budget-grid">
        <article className="budget-card budget-card--featured"><span>Total spent</span><strong>{formatCurrency(total)}</strong><small>Across {expenses.length} entries</small><div className="budget-meter"><span style={{ width: `${Math.min(100, (total / Math.max(1, groupBudget)) * 100)}%` }} /></div><p>{Math.round((total / Math.max(1, groupBudget)) * 100)}% of group budget</p></article>
        <article className="budget-card"><span>Per traveler</span><strong>{formatCurrency(perTraveler)}</strong><small>Approximate equal share</small></article>
        <article className={`budget-card ${remaining < 0 ? "budget-card--danger" : ""}`}><span>Remaining</span><strong>{formatCurrency(remaining)}</strong><small>From {formatCurrency(groupBudget)} total</small></article>
      </div>

      <div className="expenses-layout">
        <section className="panel expense-ledger">
          <div className="panel-header"><div><span className="eyebrow">Shared ledger</span><h2>Recorded expenses</h2></div><span className="count-pill">{expenses.length}</span></div>
          {expenses.length === 0 ? <EmptyState icon="$" title="No expenses yet" description="Add the first purchase to start tracking the group budget." /> : (
            <div className="expense-list">
              {expenses.map((expense) => (
                <article className="expense-row" key={expense.id}>
                  <span className="expense-avatar">{expense.paidBy.charAt(0).toUpperCase()}</span>
                  <div><strong>{expense.description}</strong><small>{expense.category || "Other"} · Paid by {expense.paidBy}</small></div>
                  <b>{formatCurrency(expense.amount)}</b>
                  <button type="button" className="row-delete" aria-label={`Delete ${expense.description}`} onClick={() => removeExpense(expense.id)}>×</button>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="panel add-expense-panel">
          <span className="eyebrow">New entry</span><h2>Add an expense</h2><p>Keep it simple—one purchase at a time.</p>
          <form onSubmit={handleSubmit}>
            <label className="field"><span>Description</span><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="e.g. Architecture tour" /></label>
            <label className="field"><span>Amount</span><div className="input-prefix"><b>$</b><input type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" /></div></label>
            <label className="field"><span>Paid by</span><select value={form.paidBy} onChange={(event) => setForm({ ...form, paidBy: event.target.value })}>{travelers.map((traveler) => <option key={traveler.id}>{traveler.name}</option>)}</select></label>
            <label className="field"><span>Category <small>optional</small></span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button--primary button--full" type="submit">Add to ledger</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
