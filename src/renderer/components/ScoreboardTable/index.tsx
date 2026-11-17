import { Fragment } from 'react';
import {
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { ScoreboardEntry } from '../../types';

type Props = {
  scoreboard: ScoreboardEntry[];
  playerId?: string;
};

export const ScoreboardTable = ({ scoreboard, playerId }: Props) => {
  return (
    <TableContainer
      sx={{ maxHeight: 420, overflowX: 'auto', overflowY: 'auto' }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell width={80}>
              <strong>Posição</strong>
            </TableCell>
            <TableCell>
              <strong>Jogador</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Pontuação</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scoreboard.map((entry, index) => {
            const isMe = entry.id === playerId;
            const previous = index > 0 ? scoreboard[index - 1] : undefined;
            const hasGap =
              previous !== undefined && entry.rank > previous.rank + 1;
            return (
              <Fragment key={entry.id}>
                {hasGap && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 0.5 }}>
                      <Typography variant="h6" color="text.secondary">
                        ⋯
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow
                  sx={{
                    bgcolor: isMe ? 'rgba(255, 10, 105, 0.12)' : 'transparent',
                    fontWeight: isMe ? 'bold' : 'normal',
                  }}
                >
                  <TableCell>
                    <Avatar
                      sx={{
                        bgcolor: isMe ? '#ff0a69' : '#e0e0e0',
                        color: isMe ? '#fff' : '#444',
                      }}
                    >
                      {entry.rank}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="h6"
                      fontWeight={isMe ? 'bold' : 'normal'}
                    >
                      {entry.name} {isMe && '(Você)'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="#ff0a69">
                      {entry.score} pts
                    </Typography>
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
