"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Zap } from "lucide-react"

interface Transaction {
  id: string
  date: string
  type: "online-revenue" | "cash-revenue" | "expense"
  amount: number
  description: string
  addedBy: string
  timestamp: string
}

interface TransactionTableProps {
  transactions: Transaction[]
}

const typeConfig = {
  "online-revenue": { label: "Online Revenue", icon: Zap, color: "text-chart-1" },
  "cash-revenue": { label: "Cash Revenue", icon: TrendingUp, color: "text-chart-2" },
  expense: { label: "Expense", icon: TrendingDown, color: "text-destructive" },
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const sortedTransactions = [...transactions].reverse()

  return (
    <Card className="border-primary/10 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">All recorded transactions</p>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start by adding your first transaction</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.map((transaction) => {
              const config = typeConfig[transaction.type]
              const Icon = config.icon
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{transaction.description || "No description"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.addedBy}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${config.color}`}>₹{transaction.amount.toLocaleString()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
