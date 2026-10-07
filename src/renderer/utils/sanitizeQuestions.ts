import type { Question } from '../types';

export const sanitizeQuestions = (input: unknown): Question[] => {
  if (!Array.isArray(input)) {
    throw new Error('O JSON precisa ser um array de perguntas.');
  }

  const sanitized = input.map((item, index) => {
    const row = item as Partial<Question>;

    if (typeof row.question !== 'string' || row.question.trim().length === 0) {
      throw new Error(`Pergunta ${index + 1}: campo "question" inválido.`);
    }

    if (row.question.trim().length > 500) {
      throw new Error(
        `Pergunta ${index + 1}: A pergunta deve ter no máximo 500 caracteres.`,
      );
    }

    if (!Array.isArray(row.options) || row.options.length < 2) {
      throw new Error(
        `Pergunta ${index + 1}: "options" precisa ter pelo menos 2 itens.`,
      );
    }

    if (row.options.length > 6) {
      throw new Error(
        `Pergunta ${index + 1}: "options" pode ter no máximo 6 itens.`,
      );
    }

    const cleanOptions = row.options.map((option, optionIndex) => {
      if (typeof option !== 'string' || option.trim().length === 0) {
        throw new Error(
          `Pergunta ${index + 1}: opção ${optionIndex + 1} inválida.`,
        );
      }

      if (option.trim().length > 200) {
        throw new Error(
          `Pergunta ${index + 1}: a opção ${optionIndex + 1} deve ter no máximo 200 caracteres.`,
        );
      }

      return option.trim();
    });

    if (
      typeof row.answer !== 'number' ||
      !Number.isInteger(row.answer) ||
      row.answer < 0 ||
      row.answer >= cleanOptions.length
    ) {
      throw new Error(`Pergunta ${index + 1}: campo "answer" inválido.`);
    }

    return {
      question: row.question.trim(),
      options: cleanOptions,
      answer: row.answer,
    };
  });

  if (sanitized.length === 0) {
    throw new Error('Adicione ao menos 1 pergunta.');
  }

  if (sanitized.length > 100) {
    throw new Error('O número máximo permitido de perguntas por partida é 100.');
  }

  return sanitized;
};
