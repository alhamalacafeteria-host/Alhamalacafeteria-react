"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddTransactionFormProps {
  onSubmit: (transaction: {
    date: string
    type: "online-revenue" | "cash-revenue" | "expense"
    amount: number
    description: string
  }) => void
  onCancel: () => void
}

export default function AddTransactionForm({ onSubmit, onCancel }: AddTransactionFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "online-revenue" as "online-revenue" | "cash-revenue" | "expense",
    amount: "",
    description: "",
  })

  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: string[] = []

    if (!formData.amount) newErrors.push("Amount is required")
    if (!formData.date) newErrors.push("Date is required")
    if (Number(formData.amount) <= 0) newErrors.push("Amount must be greater than 0")

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      date: formData.date,
      type: formData.type,
      amount: Number.parseFloat(formData.amount),
      description: formData.description,
    })

    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "online-revenue",
      amount: "",
      description: "",
    })
    setErrors([])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, idx) => (
              <li key={idx} className="text-sm text-destructive font-medium">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full h-11 text-base"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Transaction Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full h-11 px-4 py-2 border border-input bg-background rounded-lg text-foreground text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="online-revenue">Online Revenue</option>
            <option value="cash-revenue">Cash in Hand</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Amount (₹)</label>
          <Input
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full h-11 text-base"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">Description</label>
          <Input
            type="text"
            placeholder="e.g., Daily sales, Supplies, etc."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-11 text-base"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
        >
          Add Transaction
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-11 text-base font-semibold bg-transparent"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
