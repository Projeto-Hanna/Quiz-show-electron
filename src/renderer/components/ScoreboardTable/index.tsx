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
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table>
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
          {scoreboard.map((entry) => {
            const isMe = entry.id === playerId;
            return (
              <TableRow
                key={entry.id}
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
