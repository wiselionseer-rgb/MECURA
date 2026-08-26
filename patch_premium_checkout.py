import re

with open("src/screens/PremiumCheckoutScreen.tsx", "r") as f:
    code = f.read()

# Make sure we use useCoupon from useAdminStore
if "const { coupons } = useAdminStore();" in code:
    code = code.replace("const { coupons } = useAdminStore();", "const { coupons, useCoupon } = useAdminStore();")

# Handle apply coupon logic
old_apply = """  const handleApplyCoupon = () => {
    setCouponError('');
    const currentUserId = auth.currentUser?.uid;
    const coupon = coupons.find(c => c.code === couponCode.toUpperCase() && c.active);
    
    if (coupon) {
      if (coupon.ownerId && coupon.ownerId === currentUserId) {
        setCouponError('Você não pode usar seu próprio cupom de indicação.');
        return;
      }
      setAppliedCoupon(coupon);
    } else {
      setCouponError('Cupom inválido ou expirado.');
    }
  };"""

new_apply = """  const handleApplyCoupon = () => {
    setCouponError('');
    const currentUserId = auth.currentUser?.uid || 'guest_' + Math.random().toString(36).substring(7); // Use a temp id if not logged in just in case, but auth.currentUser should be there
    const coupon = coupons.find(c => c.code === couponCode.toUpperCase() && c.active);
    
    if (coupon) {
      if (coupon.ownerId && coupon.ownerId === auth.currentUser?.uid) {
        setCouponError('Você não pode usar seu próprio cupom de indicação.');
        return;
      }
      
      // Check quantity
      if (coupon.quantity && coupon.quantity > 0) {
        const currentCount = coupon.usedCount || 0;
        if (currentCount >= coupon.quantity) {
          setCouponError('Este cupom atingiu o limite máximo de usos.');
          return;
        }
      }
      
      // Check if user already used it
      if (coupon.usedBy && auth.currentUser?.uid && coupon.usedBy.includes(auth.currentUser.uid)) {
        setCouponError('Você já utilizou este cupom anteriormente.');
        return;
      }
      
      setAppliedCoupon(coupon);
    } else {
      setCouponError('Cupom inválido ou inativo.');
    }
  };"""
code = code.replace(old_apply, new_apply)

# Handle calling useCoupon on success
old_success = """  const handleSuccess = () => {
    setPagamentoPremium(true);
    incrementBonus(); // +5% for premium upgrade
    navigate('/schedule/premium');
  };"""

new_success = """  const handleSuccess = () => {
    if (appliedCoupon && auth.currentUser) {
      useCoupon(appliedCoupon.id, auth.currentUser.uid);
    }
    setPagamentoPremium(true);
    incrementBonus(); // +5% for premium upgrade
    navigate('/schedule/premium');
  };"""
code = code.replace(old_success, new_success)

with open("src/screens/PremiumCheckoutScreen.tsx", "w") as f:
    f.write(code)
