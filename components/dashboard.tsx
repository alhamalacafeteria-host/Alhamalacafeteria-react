"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import AddTransactionForm from "./add-transaction-form"
import TransactionTable from "./transaction-table"
import { LogOut, Plus, TrendingUp, DollarSign, Wallet, Zap } from "lucide-react"

interface Transaction {
  id: string
  date: string
  type: "online-revenue" | "cash-revenue" | "expense"
  amount: number
  description: string
  addedBy: string
  timestamp: string
}

interface MonthlySummary {
  month: string
  onlineRevenue: number
  cashRevenue: number
  totalRevenue: number
  expenses: number
  profit: number
}

export default function Dashboard({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    calculateMonthlySummary()
  }, [transactions])

  const loadTransactions = async () => {
    try {
      const response = await fetch("/api/sales")
      const data = await response.json()
      setTransactions(data.sales || [])
    } catch (err) {
      console.error("Failed to load transactions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateMonthlySummary = () => {
    const summary: { [key: string]: MonthlySummary } = {}

    transactions.forEach((t) => {
      const date = new Date(t.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthLabel = date.toLocaleDateString("en-US", { year: "numeric", month: "short" })

      if (!summary[monthKey]) {
        summary[monthKey] = {
          month: monthLabel,
          onlineRevenue: 0,
          cashRevenue: 0,
          totalRevenue: 0,
          expenses: 0,
          profit: 0,
        }
      }

      if (t.type === "online-revenue") {
        summary[monthKey].onlineRevenue += t.amount
      } else if (t.type === "cash-revenue") {
        summary[monthKey].cashRevenue += t.amount
      } else if (t.type === "expense") {
        summary[monthKey].expenses += t.amount
      }

      summary[monthKey].totalRevenue = summary[monthKey].onlineRevenue + summary[monthKey].cashRevenue
      summary[monthKey].profit = summary[monthKey].totalRevenue - summary[monthKey].expenses
    })

    setMonthlySummary(Object.values(summary).sort((a, b) => a.month.localeCompare(b.month)))
  }

  const handleAddTransaction = async (newTransaction: Omit<Transaction, "id" | "addedBy" | "timestamp">) => {
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTransaction, addedBy: userName }),
      })
      const data = await response.json()
      setTransactions([...transactions, data.sale])
      setShowForm(false)
    } catch (err) {
      console.error("Failed to add transaction:", err)
    }
  }

  const currentMonth = monthlySummary[monthlySummary.length - 1] || {
    month: "Current",
    onlineRevenue: 0,
    cashRevenue: 0,
    totalRevenue: 0,
    expenses: 0,
    profit: 0,
  }

  const revenueByType = [
    { name: "Online", value: currentMonth.onlineRevenue, color: "hsl(var(--chart-1))" },
    { name: "Cash", value: currentMonth.cashRevenue, color: "hsl(var(--chart-2))" },
  ]

  const profitPercentage =
    currentMonth.totalRevenue > 0 ? ((currentMonth.profit / currentMonth.totalRevenue) * 100).toFixed(1) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Profit Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome, {userName}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-12 flex justify-center">
          <Button
            onClick={() => setShowForm(true)}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 text-white font-semibold gap-2 px-8 py-6 text-lg rounded-xl transition-all"
          >
            <Plus className="w-6 h-6" />
            Add Transaction
          </Button>
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div
              className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full mx-4"
              style={{ maxHeight: "calc(100vh - 40px)", overflow: "auto" }}
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold">Record Transaction</h2>
                <p className="text-sm text-muted-foreground mt-1">Add revenue or expense entry</p>
              </div>
              <div className="p-6">
                <AddTransactionForm onSubmit={handleAddTransaction} onCancel={() => setShowForm(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics - Enhanced with better styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Total Revenue */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Total Revenue</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">₹{currentMonth.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">Current month</p>
            </CardContent>
          </Card>

          {/* Online Revenue */}
          <Card className="border-chart-1/20 bg-gradient-to-br from-card to-chart-1/5 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Online Revenue</CardTitle>
                <div className="p-2 bg-chart-1/10 rounded-lg">
                  <Zap className="w-4 h-4 text-chart-1" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: "hsl(var(--chart-1))" }}>
                ₹{currentMonth.onlineRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Digital sales</p>
            </CardContent>
          </Card>

          {/* Cash Revenue */}
          <Card className="border-chart-2/20 bg-gradient-to-br from-card to-chart-2/5 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Cash in Hand</CardTitle>
                <div className="p-2 bg-chart-2/10 rounded-lg">
                  <Wallet className="w-4 h-4" style={{ color: "hsl(var(--chart-2))" }} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: "hsl(var(--chart-2))" }}>
                ₹{currentMonth.cashRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Physical cash</p>
            </CardContent>
          </Card>

          {/* Net Profit */}
          <Card className="border-chart-3/30 bg-gradient-to-br from-card to-chart-3/10 hover:shadow-lg transition-shadow ring-1 ring-chart-3/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Net Profit</CardTitle>
                <div className="p-2 bg-chart-3/20 rounded-lg">
                  <TrendingUp className="w-4 h-4" style={{ color: "hsl(var(--chart-3))" }} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: "hsl(var(--chart-3))" }}>
                ₹{currentMonth.profit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{profitPercentage}% margin</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid - Enhanced with better visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Profit Trend */}
          <Card className="border-primary/10 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Profit Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly profit performance</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlySummary}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: `1px solid hsl(var(--border))` }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={3}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Mix */}
          <Card className="border-chart-1/10 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Mix</CardTitle>
              <p className="text-sm text-muted-foreground">Online vs Cash breakdown</p>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByType.filter((item) => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueByType.map((item, index) => (
                      <Cell key={`cell-${index}`} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue vs Expenses */}
          <Card className="border-primary/10 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Revenue vs Expenses</CardTitle>
              <p className="text-sm text-muted-foreground">Monthly comparison</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySummary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: `1px solid hsl(var(--border))` }}
                  />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="hsl(var(--chart-1))" name="Revenue" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card className="border-primary/10 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Summary</CardTitle>
              <p className="text-sm text-muted-foreground">Key metrics</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Online Revenue</span>
                  <span className="font-bold text-chart-1">₹{currentMonth.onlineRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Cash Revenue</span>
                  <span className="font-bold text-chart-2">₹{currentMonth.cashRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">Total Expenses</span>
                  <span className="font-bold text-destructive">₹{currentMonth.expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-chart-3/10 to-transparent rounded-lg border border-chart-3/20">
                  <span className="text-sm font-bold">Total Profit</span>
                  <span className="font-bold text-lg" style={{ color: "hsl(var(--chart-3))" }}>
                    ₹{currentMonth.profit.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <TransactionTable transactions={transactions} />
        )}
      </div>
    </div>
  )
}
