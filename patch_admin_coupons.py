with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Update coupon form state
old_form = "const [couponForm, setCouponForm] = useState({ code: '', discount: 10 });"
new_form = "const [couponForm, setCouponForm] = useState({ code: '', discount: 10, quantity: 0 });"
code = code.replace(old_form, new_form)

# Update handleAddCoupon
old_handle = """  const handleAddCoupon = () => {
    addCoupon({ id: Date.now().toString(), active: true, ...couponForm });
    setShowAddCoupon(false);
    setCouponForm({ code: '', discount: 10 });
  };"""
new_handle = """  const handleAddCoupon = () => {
    addCoupon({ id: Date.now().toString(), active: true, usedCount: 0, usedBy: [], ...couponForm });
    setShowAddCoupon(false);
    setCouponForm({ code: '', discount: 10, quantity: 0 });
  };"""
code = code.replace(old_handle, new_handle)

# Update list view
old_list = """                  <div>
                    <h3 className="font-bold text-xl uppercase tracking-wider text-mecura-neon">{coupon.code}</h3>
                    <p className="text-[#8A8A9E] text-sm mt-1">{coupon.discount}% de Desconto {coupon.ownerId ? `(Indicador: ${coupon.ownerId})` : ''}</p>
                  </div>"""
new_list = """                  <div>
                    <h3 className="font-bold text-xl uppercase tracking-wider text-mecura-neon">{coupon.code}</h3>
                    <p className="text-[#8A8A9E] text-sm mt-1">{coupon.discount}% de Desconto {coupon.ownerId ? `(Indicador: ${coupon.ownerId})` : ''}</p>
                    <p className="text-[#8A8A9E] text-xs mt-1">Usados: {coupon.usedCount || 0} / {coupon.quantity ? coupon.quantity : 'Ilimitado'}</p>
                  </div>"""
code = code.replace(old_list, new_list)

# Update modal view
old_modal = """            <h3 className="text-xl font-bold mb-4">Novo Cupom</h3>
            <input type="text" placeholder="Código" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" />
            <input type="number" placeholder="Desconto %" value={couponForm.discount} onChange={e => setCouponForm({...couponForm, discount: Number(e.target.value)})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" />
            <div className="flex gap-3">"""
new_modal = """            <h3 className="text-xl font-bold mb-4">Novo Cupom</h3>
            <input type="text" placeholder="Código" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" />
            <input type="number" placeholder="Desconto %" value={couponForm.discount} onChange={e => setCouponForm({...couponForm, discount: Number(e.target.value)})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" />
            <input type="number" placeholder="Quantidade Máx. (0 = Ilimitado)" value={couponForm.quantity} onChange={e => setCouponForm({...couponForm, quantity: Number(e.target.value)})} className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4" title="Deixe 0 para ilimitado" />
            <div className="flex gap-3">"""
code = code.replace(old_modal, new_modal)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
