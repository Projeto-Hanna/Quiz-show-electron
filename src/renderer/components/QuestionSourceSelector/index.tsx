import { useMemo, useState, type ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Radio,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { pink } from '@mui/material/colors';
import { Upload } from 'lucide-react';

import { Button } from '../Button';
import { sanitizeQuestions } from '../../utils/sanitizeQuestions';
import { Text } from '../Text';
import { Subtitle } from '../Subtitle';
import { DEFAULT_QUESTIONS } from '../../utils/defaultQuestions';
import type { Question } from '../../types';

export type EditableQuestion = {
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

interface QuestionSourceSelectorProps {
  onQuestionsLoaded: (
    questions: Question[],
    source: 'default' | 'custom' | 'form',
  ) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export const QuestionSourceSelector = ({
  onQuestionsLoaded,
  onError,
  onSuccess,
}: QuestionSourceSelectorProps) => {
  const [tabIndex, setTabIndex] = useState(0);

  const [editorQuestions, setEditorQuestions] = useState<EditableQuestion[]>([
    createEmptyQuestion(),
  ]);

  const canExportFormQuestions = useMemo(() => {
    try {
      sanitizeQuestions(editorQuestions);
      return true;
    } catch {
      return false;
    }
  }, [editorQuestions]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleLoadDefault = () => {
    onQuestionsLoaded(DEFAULT_QUESTIONS, 'default');
    onSuccess('Perguntas padrão carregadas com sucesso!');
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;
      const loaded = sanitizeQuestions(parsed);

      onQuestionsLoaded(loaded, 'custom');
      onSuccess('Perguntas do arquivo JSON carregadas com sucesso!');
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : 'Não foi possível ler o arquivo.',
      );
    }
  };

  const handleApplyFormQuestions = () => {
    try {
      const loaded = sanitizeQuestions(editorQuestions);
      onQuestionsLoaded(loaded, 'form');
      onSuccess('Perguntas do formulário carregadas com sucesso!');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Formulário inválido.');
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
    } catch (error) {
      console.error('Falha ao exportar JSON', error);
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

  return (
    <Paper
      elevation={3}
      sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.95)' }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { fontWeight: 'bold' },
            '& .MuiTab-root.Mui-selected': { color: '#b80047 !important' },
            '& .MuiTabs-indicator': { backgroundColor: '#b80047' },
          }}
        >
          <Tab label="Perguntas Padrão" />
          <Tab label="Carregar JSON" />
          <Tab label="Criar Manualmente" />
        </Tabs>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {tabIndex === 0 && (
          <Stack spacing={2} alignItems="center">
            <Subtitle>Usar Perguntas Padrão</Subtitle>
            <Text variant="h5" color="text.secondary" textAlign="center">
              Você jogará com {DEFAULT_QUESTIONS.length} perguntas que já vêm
              embutidas no jogo. Ideal para testes rápidos.
            </Text>
            <Button fitContent onClick={handleLoadDefault}>
              {`Carregar Perguntas Padrão (${DEFAULT_QUESTIONS.length})`}
            </Button>
          </Stack>
        )}

        {tabIndex === 1 && (
          <Stack spacing={2} alignItems="center">
            <Subtitle>Carregar Arquivo JSON</Subtitle>
            <Text variant="h5" color="text.secondary" textAlign="center">
              Selecione um arquivo JSON contendo suas perguntas.
            </Text>
            <Text
              variant="body2"
              color="#b80047"
              fontWeight="bold"
              textAlign="center"
            >
              Formato esperado: <br />
              <code>
                [{`{ question: string, options: string[], answer: number }`}]
              </code>
              <br />* answer: posição da resposta correta (começando em 0)
            </Text>
            <Box mt={2}>
              <input
                type="file"
                id="source-selector-json-upload"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="source-selector-json-upload">
                <Button
                  fitContent
                  icon={<Upload size={18} />}
                  onClick={() => {
                    document
                      .getElementById('source-selector-json-upload')
                      ?.click();
                  }}
                >
                  Selecionar Arquivo JSON
                </Button>
              </label>
            </Box>
          </Stack>
        )}

        {tabIndex === 2 && (
          <Stack spacing={2}>
            <Subtitle textAlign="center">Criar Manualmente</Subtitle>
            <Text variant="h5" color="text.secondary" textAlign="center">
              Cadastre as perguntas abaixo. Você pode usá-las diretamente no
              jogo ou baixá-las como JSON.
            </Text>

            {editorQuestions.map((question, questionIndex) => (
              <Paper
                key={`form-question-${questionIndex}`}
                variant="outlined"
                sx={{ p: 2, borderColor: 'rgba(0,0,0,0.1)' }}
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
                      Remover
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
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
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
                        onClick={() => removeOption(questionIndex, optionIndex)}
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

            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              useFlexGap
              justifyContent="center"
              mt={2}
            >
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
                onClick={handleApplyFormQuestions}
                disabled={!canExportFormQuestions}
              >
                Usar estas perguntas
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Paper>
  );
};
