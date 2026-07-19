"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingCart, Plus, Trash2, Check, Loader2 } from "lucide-react";

interface GroceryItem {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  checked: boolean;
}

interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
}

export function GroceryList() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/groceries");
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLists(); }, []);

  const createList = async () => {
    const res = await fetch("/api/groceries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Shopping List" }),
    });
    if (res.ok) {
      fetchLists();
      toast.success("Grocery list created");
    }
  };

  const addItem = async (listId: string) => {
    if (!newItemName.trim()) return;
    await fetch(`/api/groceries/${listId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newItemName.trim() }),
    });
    setNewItemName("");
    fetchLists();
  };

  const toggleItem = async (listId: string, itemId: string, checked: boolean) => {
    await fetch(`/api/groceries/${listId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, checked: !checked }),
    });
    fetchLists();
  };

  const deleteItem = async (listId: string, itemId: string) => {
    await fetch(`/api/groceries/${listId}?itemId=${itemId}`, { method: "DELETE" });
    fetchLists();
  };

  const deleteList = async (listId: string) => {
    await fetch(`/api/groceries/${listId}`, { method: "DELETE" });
    fetchLists();
  };

  if (loading && lists.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {lists.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No grocery lists yet</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={createList}>
              <Plus className="h-4 w-4 mr-1" />
              Create List
            </Button>
          </CardContent>
        </Card>
      ) : (
        lists.map((list) => (
          <Card key={list.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-lime" />
                  {list.name}
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => deleteList(list.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Add item */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add item..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem(list.id)}
                  className="h-8 text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 shrink-0"
                  onClick={() => addItem(list.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Items */}
              {list.items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No items yet. Add some above.
                </p>
              ) : (
                <div className="space-y-1">
                  {list.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 py-1.5 group"
                    >
                      <button
                        onClick={() => toggleItem(list.id, item.id, item.checked)}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                          item.checked
                            ? "bg-lime border-lime text-lime-foreground"
                            : "border-border hover:border-lime/40"
                        }`}
                      >
                        {item.checked && <Check className="h-3 w-3" />}
                      </button>
                      <span
                        className={`text-sm flex-1 ${
                          item.checked ? "line-through text-muted-foreground/50" : ""
                        }`}
                      >
                        {item.name}
                        {item.quantity && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({item.quantity}{item.unit ? ` ${item.unit}` : ""})
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => deleteItem(list.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {lists.length > 0 && (
        <Button variant="outline" size="sm" className="w-full" onClick={createList}>
          <Plus className="h-4 w-4 mr-1" />
          New List
        </Button>
      )}
    </div>
  );
}
