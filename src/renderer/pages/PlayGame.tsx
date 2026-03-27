import { useMemo, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Radio,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  Button,
  Divider,
  GameInstance,
  Menu,
  Subtitle,
  Title,
  Text,
} from '../components';
import type { Question } from '../types';
import { pink } from '@mui/material/colors';

type EditableQuestion = {
  question: string;
  options: string[];
  answer: number;
};

const MAX_OPTIONS_PER_QUESTION = 6;

const createEmptyQuestion = (): EditableQuestion => ({
  question: '',
  options: ['', ''],
  answer: 0,
});

const sanitizeQuestions = (input: unknown): Question[] => {
  if (!Array.isArray(input)) {
    throw new Error('O JSON precisa ser um array de perguntas.');
  }

  const sanitized = input.map((item, index) => {
    const row = item as Partial<Question>;

    if (typeof row.question !== 'string' || row.question.trim().length === 0) {
      throw new Error(`Pergunta ${index + 1}: campo "question" inválido.`);
    }

    if (!Array.isArray(row.options) || row.options.length < 2) {
      throw new Error(
        `Pergunta ${index + 1}: "options" precisa ter pelo menos 2 itens.`,
      );
    }

    const cleanOptions = row.options.map((option, optionIndex) => {
      if (typeof option !== 'string' || option.trim().length === 0) {
        throw new Error(
          `Pergunta ${index + 1}: opção ${optionIndex + 1} inválida.`,
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

  return sanitized;
};

export const PlayGame = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editorQuestions, setEditorQuestions] = useState<EditableQuestion[]>([
    createEmptyQuestion(),
  ]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const hasQuestionsLoaded = questions.length > 0;

  const canExportFormQuestions = useMemo(() => {
    try {
      sanitizeQuestions(editorQuestions);
      return true;
    } catch {
      return false;
    }
  }, [editorQuestions]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;
      const loaded = sanitizeQuestions(parsed);

      setQuestions(loaded);
      setErrorMessage('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Nao foi possivel ler o arquivo.';
      setErrorMessage(message);
    }
  };

  const updateQuestionText = (questionIndex: number, value: string) => {
    setEditorQuestions((prev) =>
      prev.map((item, index) =>
        index === questionIndex ? { ...item, question: value } : item,
      ),
    );
  };

  const updateOptionText = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    setEditorQuestions((prev) =>
      prev.map((item, index) => {
        if (index !== questionIndex) return item;

        return {
          ...item,
          options: item.options.map((option, idx) =>
            idx === optionIndex ? value : option,
          ),
        };
      }),
    );
  };

  const setCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    setEditorQuestions((prev) =>
      prev.map((item, index) =>
        index === questionIndex ? { ...item, answer: answerIndex } : item,
      ),
    );
  };

  const addOption = (questionIndex: number) => {
    setEditorQuestions((prev) =>
      prev.map((item, index) =>
        index === questionIndex
          ? item.options.length >= MAX_OPTIONS_PER_QUESTION
            ? item
            : { ...item, options: [...item.options, ''] }
          : item,
      ),
    );
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setEditorQuestions((prev) =>
      prev.map((item, index) => {
        if (index !== questionIndex || item.options.length <= 2) return item;

        const nextOptions = item.options.filter(
          (_, idx) => idx !== optionIndex,
        );
        const nextAnswer =
          item.answer >= nextOptions.length
            ? nextOptions.length - 1
            : item.answer === optionIndex
              ? 0
              : item.answer;

        return {
          ...item,
          options: nextOptions,
          answer: nextAnswer,
        };
      }),
    );
  };

  const addQuestion = () => {
    setEditorQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const removeQuestion = (questionIndex: number) => {
    setEditorQuestions((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, index) => index !== questionIndex);
    });
  };

  const loadQuestionsFromForm = () => {
    try {
      const loaded = sanitizeQuestions(editorQuestions);
      setQuestions(loaded);
      setErrorMessage('');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Formulário inválido.';
      setErrorMessage(message);
    }
  };

  const downloadFormAsJson = () => {
    try {
      const loaded = sanitizeQuestions(editorQuestions);
      const json = JSON.stringify(loaded, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'questions.json';
      link.click();

      URL.revokeObjectURL(url);
      setErrorMessage('');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possivel exportar.';
      setErrorMessage(message);
    }
  };

  if (hasQuestionsLoaded) {
    return (
      <>
        <main>
          <GameInstance questions={questions} />
          <Link to="/">
            <Button fitContent>Voltar</Button>
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <main>
        <Dialog
          open={Boolean(errorMessage)}
          onClose={() => setErrorMessage('')}
          aria-labelledby="playgame-error-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="playgame-error-dialog-title">
            <Text fontWeight="bold" textTransform="uppercase" variant="h5">
              Não é possível continuar
            </Text>
          </DialogTitle>
          <DialogContent dividers>
            <Text>{errorMessage}</Text>
          </DialogContent>
          <DialogActions>
            <Button size="small" fitContent onClick={() => setErrorMessage('')}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>

        <Menu direction="column">
          <Stack spacing={3} sx={{ width: 'min(1000px, 90vw)' }}>
            <Title variant="h3">Criar Partida</Title>

            <Paper elevation={3} sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Subtitle>1) Carregar JSON</Subtitle>
                <Text variant="h5" color="black">
                  Selecione um arquivo JSON com formato*:{' '}
                  <code>[{`{ question, options, answer }`}]</code>
                </Text>
                <Box>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={handleFileChange}
                  />
                </Box>
                <Text variant="body2" fontWeight="bold">
                  * question: string, options: string[], answer: number (posição
                  da resposta, começando em 0)
                </Text>
              </Stack>
            </Paper>

            <Divider color="light" />

            <Paper elevation={3} sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Subtitle>2) Montar via formulário</Subtitle>

                <Text variant="h5" color="black">
                  Cadastre as perguntas no formulário abaixo. Você pode
                  baixá-las como JSON.
                </Text>

                {editorQuestions.map((question, questionIndex) => (
                  <Paper
                    key={`form-question-${questionIndex}`}
                    variant="outlined"
                    sx={{ p: 2, borderColor: 'rgba(255,255,255,0.25)' }}
                  >
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6">
                          Pergunta {questionIndex + 1}
                        </Typography>
                        <Button
                          size="small"
                          fitContent
                          onClick={() => removeQuestion(questionIndex)}
                        >
                          Remover pergunta
                        </Button>
                      </Stack>

                      <TextField
                        fullWidth
                        label="Texto da pergunta"
                        value={question.question}
                        onChange={(event) =>
                          updateQuestionText(questionIndex, event.target.value)
                        }
                      />

                      {question.options.map((option, optionIndex) => (
                        <Stack
                          key={`question-${questionIndex}-option-${optionIndex}`}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <TextField
                            fullWidth
                            label={`Opção ${optionIndex + 1}`}
                            value={option}
                            onChange={(event) =>
                              updateOptionText(
                                questionIndex,
                                optionIndex,
                                event.target.value,
                              )
                            }
                          />
                          <Radio
                            sx={{
                              color: pink[500],
                              '&.Mui-checked': {
                                color: pink[500],
                              },
                            }}
                            checked={question.answer === optionIndex}
                            onChange={() =>
                              setCorrectAnswer(questionIndex, optionIndex)
                            }
                            slotProps={{
                              input: {
                                'aria-label': `Opção correta ${optionIndex + 1}`,
                              },
                            }}
                          />
                          <Button
                            size="small"
                            fitContent
                            onClick={() =>
                              removeOption(questionIndex, optionIndex)
                            }
                          >
                            Remover
                          </Button>
                        </Stack>
                      ))}

                      <Button
                        size="small"
                        fitContent
                        disabled={
                          question.options.length >= MAX_OPTIONS_PER_QUESTION
                        }
                        onClick={() => addOption(questionIndex)}
                      >
                        Adicionar opção
                      </Button>
                    </Stack>
                  </Paper>
                ))}

                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Button fitContent size="small" onClick={addQuestion}>
                    Adicionar pergunta
                  </Button>
                  <Button
                    fitContent
                    size="small"
                    onClick={downloadFormAsJson}
                    disabled={!canExportFormQuestions}
                  >
                    Baixar JSON
                  </Button>
                  <Button
                    fitContent
                    size="small"
                    onClick={loadQuestionsFromForm}
                  >
                    Usar perguntas no jogo
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Menu>
        <Link to="/">
          <Button fitContent>Voltar</Button>
        </Link>
      </main>
    </>
  );
};
