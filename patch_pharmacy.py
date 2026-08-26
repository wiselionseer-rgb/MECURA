import re
with open("src/screens/PharmacyScreen.tsx", "r") as f:
    code = f.read()

old_block = """                  onClick={() => {
                    if (step < 3) setStep(step + 1 as any);
                    else {
                      alert('Pedido confirmado com sucesso!');
                      navigate('/dashboard');
                    }
                  }}"""

new_block = """                  onClick={() => {
                    if (step < 3) setStep(step + 1 as any);
                    else {
                      const finalTotal = totalBeforeDiscount - pixDiscount;
                      
                      let itemsText = prescriptionItems.map(item => {
                        const qty = quantities[item.id] || 1;
                        return `- ${qty}x ${item.name}`;
                      }).join('\\n');
                      
                      const addressText = `${address.street}, ${address.number} ${address.complement ? `(${address.complement})` : ''}\\n${address.neighborhood}, ${address.city} - ${address.state}\\nCEP: ${address.cep}`;
                      
                      const paymentMethodText = paymentMethod === 'pix' ? 'PIX' : `Cartão de Crédito (${installments}x)`;
                      
                      const message = `Olá, vim pelo aplicativo Mecura e gostaria de finalizar a compra da minha receita! 🌿\\n\\n📦 *ITENS DA PRESCRIÇÃO:*\\n${itemsText}\\n\\n🚚 *ENTREGA:*\\nEndereço:\\n${addressText}\\n\\n💳 *PAGAMENTO:*\\nMétodo escolhido: ${paymentMethodText}\\n💰 *Valor Total: ${finalTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*`;
                      
                      const whatsappUrl = `https://wa.me/5566996280883?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                      navigate('/dashboard');
                    }
                  }}"""

if old_block in code:
    code = code.replace(old_block, new_block)
    with open("src/screens/PharmacyScreen.tsx", "w") as f:
        f.write(code)
    print("PharmacyScreen patched successfully")
else:
    print("old block not found in PharmacyScreen")
