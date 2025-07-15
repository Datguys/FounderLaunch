import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit3,
  Download,
  Calculator,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface BOMItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  notes: string;
}

export default function BOM() {
  const [bomItems, setBomItems] = useState<BOMItem[]>([
    {
      id: '1',
      name: 'Cloud Hosting (AWS)',
      description: 'Web hosting and server infrastructure',
      category: 'Infrastructure',
      quantity: 1,
      unitCost: 150,
      supplier: 'Amazon Web Services',
      notes: 'Monthly subscription'
    },
    {
      id: '2',
      name: 'Domain Registration',
      description: 'Custom domain name',
      category: 'Infrastructure',
      quantity: 1,
      unitCost: 15,
      supplier: 'Namecheap',
      notes: 'Annual registration'
    },
    {
      id: '3',
      name: 'Logo Design',
      description: 'Professional logo and brand identity',
      category: 'Design',
      quantity: 1,
      unitCost: 500,
      supplier: 'Fiverr Designer',
      notes: 'One-time cost'
    }
  ]);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<BOMItem>>({
    name: '',
    description: '',
    category: '',
    quantity: 1,
    unitCost: 0,
    supplier: '',
    notes: ''
  });

  const categories = ['Infrastructure', 'Design', 'Development', 'Marketing', 'Legal', 'Equipment', 'Software', 'Services'];

  const totalCost = bomItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  const addItem = () => {
    if (newItem.name && newItem.category) {
      const item: BOMItem = {
        id: Date.now().toString(),
        name: newItem.name || '',
        description: newItem.description || '',
        category: newItem.category || '',
        quantity: newItem.quantity || 1,
        unitCost: newItem.unitCost || 0,
        supplier: newItem.supplier || '',
        notes: newItem.notes || ''
      };
      setBomItems([...bomItems, item]);
      setNewItem({ name: '', description: '', category: '', quantity: 1, unitCost: 0, supplier: '', notes: '' });
      setIsAddingItem(false);
    }
  };

  const removeItem = (id: string) => {
    setBomItems(bomItems.filter(item => item.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bill of Materials (BOM)</h1>
            <p className="text-muted-foreground">Track all the resources and costs needed for your startup</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export BOM
            </Button>
            <Button onClick={() => setIsAddingItem(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold text-foreground">{bomItems.length}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-foreground">${totalCost.toLocaleString()}</p>
                </div>
                <Calculator className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Set(bomItems.map(item => item.category)).size}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add New Item */}
        {isAddingItem && (
          <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Add New Item</CardTitle>
              <CardDescription>Add a new item to your bill of materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g., Web Development"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Unit Cost ($)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({ ...newItem, unitCost: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Brief description of the item"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    placeholder="Where to source this item"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addItem}>Add Item</Button>
                <Button variant="outline" onClick={() => setIsAddingItem(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BOM Table */}
        <Card className="bg-glass-background border-glass-border backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Bill of Materials</CardTitle>
            <CardDescription>All items required for your startup project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bomItems.map((item) => (
                <div key={item.id} className="border border-glass-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unit Cost</p>
                      <p className="font-medium">${item.unitCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Cost</p>
                      <p className="font-medium text-primary">
                        ${(item.quantity * item.unitCost).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Supplier</p>
                      <p className="font-medium">{item.supplier || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <div className="mt-3 pt-3 border-t border-glass-border">
                      <p className="text-xs text-muted-foreground">
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {bomItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Items Added</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your bill of materials by adding the first item
                  </p>
                  <Button onClick={() => setIsAddingItem(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Item
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}