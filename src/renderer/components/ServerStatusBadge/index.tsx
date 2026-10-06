import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Tooltip,
  Typography,
  IconButton,
} from '@mui/material';
import { RotateCw } from 'lucide-react';
import {
  getServerStatus,
  subscribeServerStatus,
  wakeUpServer,
  type ServerStatus,
} from '../../services/socket';

export interface ServerStatusBadgeProps {
  autoWake?: boolean;
}

export const ServerStatusBadge: React.FC<ServerStatusBadgeProps> = ({
  autoWake = true,
}) => {
  const [status, setStatus] = useState<ServerStatus>(getServerStatus);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeServerStatus(setStatus);
    if (autoWake && getServerStatus() !== 'online') {
      wakeUpServer();
    }
    return unsubscribe;
  }, [autoWake]);

  const handleRetry = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetrying(true);
    await wakeUpServer(true);
    setIsRetrying(false);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          textColor: '#2e7d32',
          dotColor: '#4caf50',
          dotShadow: '0 0 8px rgba(76, 175, 80, 0.7)',
          label: 'Servidor Online',
          tooltip: 'O servidor está ativo e pronto para partidas multiplayer.',
        };
      case 'waking':
        return {
          textColor: '#e65100',
          dotColor: '#ff9800',
          dotShadow: '0 0 8px rgba(255, 152, 0, 0.7)',
          label: 'Inicializando Servidor...',
          tooltip:
            'O servidor está inicializando. Isso pode levar alguns segundos.',
        };
      case 'offline':
        return {
          textColor: '#c2185b',
          dotColor: '#ff0a69',
          dotShadow: '0 0 8px rgba(255, 10, 105, 0.6)',
          label: 'Servidor em Espera',
          tooltip:
            'Não foi possível conectar ao servidor. Clique para tentar acordá-lo.',
        };
      case 'idle':
      default:
        return {
          textColor: '#757575',
          dotColor: '#9e9e9e',
          dotShadow: 'none',
          label: 'Verificando Servidor...',
          tooltip: 'Verificando disponibilidade do servidor multiplayer...',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              color: config.textColor,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              fontSize: '0.75rem',
              mb: 0.3,
            }}
          >
            {config.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#333333',
              fontSize: '0.82rem',
              lineHeight: 1.35,
              fontWeight: 500,
            }}
          >
            {config.tooltip}
          </Typography>
        </Box>
      }
      arrow
      placement="top"
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: 'white',
            border: '2px solid transparent',
            borderImage:
              'linear-gradient(135deg, #e42c2c, #ff0a69, #51bddf, #afe1f1) 1',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            maxWidth: 320,
            p: 1.2,
          },
        },
        arrow: {
          sx: {
            color: 'white',
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.2,
          px: { xs: 1.8, sm: 2.2 },
          py: 0.8,
          backgroundColor: 'white',
          border: '3px solid transparent',
          borderImage:
            'linear-gradient(135deg, #e42c2c, #ff0a69, #51bddf, #afe1f1)',
          borderImageSlice: 1,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
          userSelect: 'none',
          cursor: status === 'offline' ? 'pointer' : 'default',
          transition: 'all 0.25s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
            transform: 'translateY(-1px)',
          },
        }}
        onClick={status === 'offline' ? handleRetry : undefined}
      >
        {status === 'waking' || isRetrying ? (
          <CircularProgress
            size={14}
            thickness={5}
            sx={{ color: config.textColor }}
          />
        ) : (
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: config.dotColor,
              boxShadow: config.dotShadow,
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
            }}
          />
        )}

        <Typography
          variant="caption"
          sx={{
            color: config.textColor,
            fontWeight: 700,
            fontSize: 'clamp(12px, 1.1vw, 14px)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          {config.label}
        </Typography>

        {status === 'offline' && (
          <IconButton
            size="small"
            onClick={handleRetry}
            sx={{
              p: 0.3,
              ml: 0.3,
              color: config.textColor,
              transition: 'all 0.25s ease',
              '&:hover': {
                color: '#ff0a69',
                transform: 'rotate(180deg)',
              },
            }}
          >
            <RotateCw size={14} />
          </IconButton>
        )}
      </Box>
    </Tooltip>
  );
};
