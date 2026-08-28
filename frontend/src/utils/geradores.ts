/**
 * Gera o código de verificação único impresso no certificado.
 * Formato: CERT-XXXX-XXXX (letras maiúsculas e dígitos).
 */
export function gerarCodigoVerificacao(): string {
  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bloco = () =>
    Array.from(
      { length: 4 },
      () => alfabeto[Math.floor(Math.random() * alfabeto.length)],
    ).join('');

  return `CERT-${bloco()}-${bloco()}`;
}

/**
 * Gera o identificador da transação devolvido pelo gateway de pagamento
 * simulado no checkout. Formato: TRX-<timestamp>-<sufixo>.
 */
export function gerarIdTransacao(): string {
  const sufixo = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TRX-${Date.now()}-${sufixo}`;
}
