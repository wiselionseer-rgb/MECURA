with open("src/screens/DashboardScreen.tsx", "r") as f:
    code = f.read()

# Card HC
old_hc = """              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >"""

new_hc = """              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/chat')}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >"""

# Card Consultoria
old_consult = """              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >"""

new_consult = """              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/chat')}
                className="flex-none w-[220px] flex flex-col bg-[#12121A] border border-[#A6FF00]/20 rounded-[28px] p-5 text-left group hover:bg-[#1A1A24] hover:border-[#A6FF00]/40 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.4)] relative overflow-hidden snap-start cursor-pointer"
              >"""

# Wait, replacing like this will hit all three since they share the identical old string.
# Let's count how many times it occurs.
code = code.replace(old_hc, new_hc)

with open("src/screens/DashboardScreen.tsx", "w") as f:
    f.write(code)
print("Done patching cards.")
