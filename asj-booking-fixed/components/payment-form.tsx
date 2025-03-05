"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PaymentMethod } from "@/lib/supabase"
import { CreditCard, Wallet } from "lucide-react"

interface PaymentFormProps {
  amount: number
  onSubmit: (paymentData: PaymentData) => void
  onCancel: () => void
  isLoading: boolean
}

export interface PaymentData {
  paymentType: PaymentMethod
  cardData?: {
    cardNumber: string
    cardholderName: string
    expiryMonth: number
    expiryYear: number
    cvv: string
  }
  walletData?: {
    provider: string
    walletId: string
  }
}

export function PaymentForm({ amount, onSubmit, onCancel, isLoading }: PaymentFormProps) {
  const [paymentType, setPaymentType] = useState<PaymentMethod>("credit_card")
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
    cvv: "",
  })
  const [walletData, setWalletData] = useState({
    provider: "paypal",
    walletId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const paymentData: PaymentData = {
      paymentType,
      ...(paymentType === "credit_card" && { cardData }),
      ...(paymentType === "digital_wallet" && { walletData }),
    }

    onSubmit(paymentData)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Complete your booking by providing payment information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentType}
              onValueChange={(value) => setPaymentType(value as PaymentMethod)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Credit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="digital_wallet" id="digital_wallet" />
                <Label htmlFor="digital_wallet" className="flex items-center cursor-pointer">
                  <Wallet className="mr-2 h-4 w-4" />
                  Digital Wallet
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentType === "credit_card" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  placeholder="John Doe"
                  value={cardData.cardholderName}
                  onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Select
                    value={cardData.expiryMonth.toString()}
                    onValueChange={(value) => setCardData({ ...cardData, expiryMonth: Number.parseInt(value) })}
                  >
                    <SelectTrigger id="expiryMonth">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Select
                    value={cardData.expiryYear.toString()}
                    onValueChange={(value) => setCardData({ ...cardData, expiryYear: Number.parseInt(value) })}
                  >
                    <SelectTrigger id="expiryYear">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentType === "digital_wallet" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Wallet Provider</Label>
                <Select
                  value={walletData.provider}
                  onValueChange={(value) => setWalletData({ ...walletData, provider: value })}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="apple_pay">Apple Pay</SelectItem>
                    <SelectItem value="gcash">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="walletId">Wallet ID / Email</Label>
                <Input
                  id="walletId"
                  placeholder="your.email@example.com"
                  value={walletData.walletId}
                  onChange={(e) => setWalletData({ ...walletData, walletId: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between font-bold">
              <p>Total Amount</p>
              <p>${amount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Complete Payment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

