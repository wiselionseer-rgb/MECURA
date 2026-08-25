import re

for filename in ["src/screens/CheckoutScreen.tsx", "src/screens/PremiumCheckoutScreen.tsx"]:
    with open(filename, "r") as f:
        code = f.read()
    
    old_block = """  React.useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);"""
    
    new_block = """  React.useEffect(() => {
    if (pixData?.id) {
      pollingInterval.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment-status/${pixData.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'approved' || data.status === 'completed') {
              if (pollingInterval.current) clearInterval(pollingInterval.current);
              handleSuccess();
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [pixData]);"""

    if old_block in code:
        code = code.replace(old_block, new_block)
    else:
        old_block2 = """  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);"""
        new_block2 = """  useEffect(() => {
    if (pixData?.id) {
      pollingInterval.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment-status/${pixData.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'approved' || data.status === 'completed') {
              if (pollingInterval.current) clearInterval(pollingInterval.current);
              handleSuccess();
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [pixData]);"""
        code = code.replace(old_block2, new_block2)
        
    with open(filename, "w") as f:
        f.write(code)

print("Polling patched.")
