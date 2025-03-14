"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Trash, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import NavBar from "@/components/nav-bar"

type Coupon = {
  id: string
  code: string
  isActive: boolean
  position: number
  createdAt: string
  claimCount: number
}

export default function AdminPage() {
  const [coupons, setCoupons] = useState<string[]>([])
  const [existingCoupons, setExistingCoupons] = useState<Coupon[]>([])
  const [newCoupon, setNewCoupon] = useState("")
  const [bulkCoupons, setBulkCoupons] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false)
  const { toast } = useToast()

  const fetchCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const response = await fetch("/api/coupons");
      const data = await response.json();

      if (data.success) {
        setExistingCoupons(data.coupons);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch coupons",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCoupons()
  }, [])

  const addCoupon = () => {
    if (newCoupon.trim() && !coupons.includes(newCoupon.trim())) {
      setCoupons([...coupons, newCoupon.trim()])
      setNewCoupon("")
    }
  }

  const removeCoupon = (index: number) => {
    setCoupons(coupons.filter((_, i) => i !== index))
  }

  const addBulkCoupons = () => {
    const newCoupons = bulkCoupons
      .split("\n")
      .map((c) => c.trim())
      .filter((c) => c && !coupons.includes(c))

    if (newCoupons.length > 0) {
      setCoupons([...coupons, ...newCoupons])
      setBulkCoupons("")
    }
  }

  const handleSubmit = async () => {
    if (coupons.length === 0) {
      toast({
        title: "No coupons to add",
        description: "Please add at least one coupon code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/seed-coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coupons }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Added ${coupons.length} coupons to the system`,
        })
        setCoupons([])
        fetchCoupons()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add coupons",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Deleted",
          description: "Coupon successfully removed",
        });
        fetchCoupons();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete coupon",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Coupon System Administration</h1>

          <Tabs defaultValue="add">
            <TabsList className="mb-4">
              <TabsTrigger value="add">Add Coupons</TabsTrigger>
              <TabsTrigger value="manage">Manage Coupons</TabsTrigger>
            </TabsList>

            <TabsContent value="add">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Individual Coupon</CardTitle>
                    <CardDescription>Add coupons one at a time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        value={newCoupon}
                        onChange={(e) => setNewCoupon(e.target.value)}
                        placeholder="Enter coupon code"
                        onKeyDown={(e) => e.key === "Enter" && addCoupon()}
                      />
                      <Button onClick={addCoupon} type="button">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Add Coupons</CardTitle>
                    <CardDescription>Add multiple coupons (one per line)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={bulkCoupons}
                      onChange={(e) => setBulkCoupons(e.target.value)}
                      placeholder="Enter coupon codes, one per line"
                      className="min-h-[100px]"
                    />
                    <Button onClick={addBulkCoupons} type="button" className="mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add All
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Coupons to Add ({coupons.length})</CardTitle>
                  <CardDescription>Review before submitting to the system</CardDescription>
                </CardHeader>
                <CardContent>
                  {coupons.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-3">
                      {coupons.map((coupon, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                          <span className="font-mono">{coupon}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeCoupon(index)}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No coupons added yet</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSubmit} disabled={isLoading || coupons.length === 0} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Submit Coupons to System"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="manage">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Existing Coupons</CardTitle>
                    <CardDescription>Manage your coupon inventory</CardDescription>
                  </div>
                  <Button variant="outline" onClick={fetchCoupons} disabled={isLoadingCoupons}>
                    {isLoadingCoupons ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="sr-only">Refresh</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingCoupons ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : existingCoupons.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 bg-gray-100 p-2 text-xs font-medium text-gray-500">
                        <div className="col-span-3">Code</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-3">Created</div>
                        <div className="col-span-2">Claims</div>
                        <div className="col-span-2">Delete</div>
                      </div>
                      <div className="divide-y">
                        {existingCoupons.map((coupon, index) => (
                          <div key={coupon.id} className="grid grid-cols-12 p-2 text-sm">
                            <div className="col-span-3 font-mono">{coupon.code}</div>
                            <div className="col-span-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {coupon.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="col-span-3 text-gray-500">
                              {format(new Date(coupon.createdAt), "MMM d, yyyy")}
                            </div>
                            <div className="col-span-2 text-center">{coupon.claimCount}</div>
                            <div className="col-span-2 text-center">
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteCoupon(coupon.id)}>
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No coupons found in the system</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

