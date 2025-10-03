import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import OpenAI from 'openai';
import { Transaction } from '@prisma/client';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService, // 👈 integración con TransactionsModule
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async parseText(userId: number, text: string) {
    return this.processAi(userId, text, false);
  }

  async parseAndSave(userId: number, text: string) {
    return this.processAi(userId, text, true);
  }

  private async processAi(userId: number, text: string, save: boolean) {
    // 1. Verificar créditos
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Usuario no encontrado');
    if (user.credits <= 0) throw new ForbiddenException('No tienes créditos disponibles');

    let parsed: any;
    let errorMessage: string | null = null;

    try {
      // 2. Llamar a OpenAI
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente que convierte texto de transacciones financieras en JSON estricto. Responde únicamente con JSON válido, sin explicaciones adicionales.',
          },
          {
            role: 'user',
            content: `Texto: "${text}". 
Devuelve SOLO un JSON válido en este formato:
{
  "type": "ingreso" | "gasto",
  "amount": number,
  "date": string (en formato ISO completo: "YYYY-MM-DDTHH:mm:ss.sssZ". 
                  Si NO existe ninguna fecha en el texto, usa la fecha actual del sistema),
  "category": string,
  "paymentMethod": string,
  "note": string (opcional)
}

Reglas estrictas:
- Responde únicamente con JSON, sin texto adicional.
- Usa siempre el formato ISO con milisegundos y zona horaria UTC ("Z").
- Si no encuentras una fecha explícita en el texto, coloca la fecha actual exacta.`
          },
        ],
        temperature: 0,
      });

      let raw = response.choices[0].message?.content?.trim() || '{}';
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) raw = match[0];

      parsed = JSON.parse(raw);

      // 3. Validar campos obligatorios
      const missing: string[] = [];
      if (!parsed.type || !['ingreso', 'gasto'].includes(parsed.type)) {
        missing.push('tipo de transacción (ingreso o gasto)');
      }
      if (typeof parsed.amount !== 'number') {
        missing.push('monto numérico');
      }
      if (!parsed.category || typeof parsed.category !== 'string') {
        missing.push('concepto o categoría');
      }

      if (missing.length > 0) {
        errorMessage = `Faltan datos importantes: ${missing.join(
          ', ',
        )}. Asegúrate de incluir monto, concepto, fecha y si fue crédito o débito.`;
      }
    } catch {
      errorMessage =
        'La IA no devolvió un formato válido. Asegúrate de incluir monto, concepto de la transacción, fecha y si fue un crédito o débito.';
    }

    // 4. Descontar créditos SIEMPRE
    await this.prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 1 } },
    });

    await this.prisma.creditHistory.create({
      data: {
        userId,
        action: errorMessage ? 'IA Parse (error)' : save ? 'IA Parse & Save' : 'IA Parse',
        creditsUsed: 1,
      },
    });

    // 5. Si hubo error, devolver mensaje
    if (errorMessage) {
      throw new ForbiddenException(errorMessage);
    }

    // 6. Guardar en DB si corresponde
    let saved: Transaction | null = null;

    if (save) {
      // Buscar categoría existente o crear una nueva
      const category = await this.prisma.category.findFirst({
        where: { userId, name: parsed.category },
      });

      let categoryId: number;
      if (category) {
        categoryId = category.id;
      } else {
        const newCategory = await this.prisma.category.create({
          data: { userId, name: parsed.category, type: parsed.type },
        });
        categoryId = newCategory.id;
      }

      // ✅ Ajustar fecha: usar la de IA o la actual si no viene
      let trxDate: string;
      try {
        let tmp = parsed.date ? new Date(parsed.date) : new Date();

        // Validar que sea fecha válida
        if (isNaN(tmp.getTime())) {
          tmp = new Date();
        }

        // (Opcional) Regla de negocio: no aceptar fechas viejas/futuras absurdas
        const now = new Date();
        const diff = Math.abs(now.getTime() - tmp.getTime());
        const maxDiff = 7 * 24 * 60 * 60 * 1000; // 7 días

        if (diff > maxDiff) {
          tmp = now;
        }

        trxDate = tmp.toISOString();
      } catch {
        trxDate = new Date().toISOString();
      }

      saved = await this.transactionsService.create(userId, {
        type: parsed.type,
        amount: parsed.amount,
        date: trxDate, // 👈 ahora es string
        categoryId,
        paymentMethod: parsed.paymentMethod || 'N/A',
        note: parsed.note || '',
      });
    }

    return {
      transaction: parsed,
      saved,
      remainingCredits: user.credits - 1,
    };
  }
}
