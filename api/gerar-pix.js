import { buffer } from 'micro';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export const config = { api: { bodyParser: true } };

// SUBSTITUA pelo seu token do Mercado Pago
const ACCESS_TOKEN = "APP_USR-1245205998264290-041409-1047ee9e45914c23e16758074dc1b797-1712554417";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { valor, email, nome, turbinar } = req.body;
  const valorFinal = turbinar ? parseFloat(valor) + 5.99 : parseFloat(valor);

  if (!valorFinal || valorFinal <= 0) {
    return res.status(400).json({ erro: "Valor inválido" });
  }

  const nomeParts = nome?.split(' ') || ['Usuário'];
  const payer = {
    email: email || "usuario@teste.com",
    first_name: nomeParts[0],
    last_name: nomeParts.slice(1).join(' ') || "Desconhecido"
  };

  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'X-Idempotency-Key': uuidv4()
  };

  const body = {
    transaction_amount: valorFinal,
    description: "Doação via Pix",
    payment_method_id: "pix",
    payer
  };

  try {
    const response = await axios.post(
      'https://api.mercadopago.com/v1/payments',
      body,
      { headers }
    );

    const pagamento = response.data;

    if (!pagamento.point_of_interaction) {
      console.error("Erro inesperado no pagamento:", pagamento);
      return res.status(500).json({ erro: "Erro inesperado ao gerar QR Code." });
    }

    return res.json({
      pix_qr: pagamento.point_of_interaction.transaction_data.qr_code_base64,
      pix_copiaecola: pagamento.point_of_interaction.transaction_data.qr_code
    });

  } catch (err) {
    console.error("Erro ao gerar Pix:", err?.response?.data || err.message);
    return res.status(500).json({ erro: "Erro ao gerar Pix. Verifique o token e tente novamente." });
  }
}
