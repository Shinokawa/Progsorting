import React from 'react';
import { Paper, Typography, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Portal from './Portal';

const EventItem = ({ event, provided, snapshot, onDoubleClick }) => {
  const baseStyle = {
    margin: '8px 0',
    padding: '16px',
    background: 'white',
    // 为所有静止状态的卡片添加平滑过渡，让其他卡片在让位时有动画
    transition: 'transform 0.2s ease, background 0.2s ease',
  };

  let draggingStyle = {};
  if (snapshot.isDragging) {
    draggingStyle = {
      background: '#e0f7fa',
      opacity: 0.8,
      transform: 'scale(1.02)',
      boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
      cursor: 'grabbing',
    };
  }

  const item = (
    <Paper
      ref={provided.innerRef}
      {...provided.draggableProps}
      style={{
        ...baseStyle,
        ...(snapshot.isDragging ? draggingStyle : { cursor: 'default' })
      }}
      onDoubleClick={() => onDoubleClick(event)}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <IconButton {...provided.dragHandleProps} style={{ cursor: 'grab' }}>
          <DragIndicatorIcon />
        </IconButton>
        <div style={{ marginLeft: '8px' }}>
          <Typography variant="h6">{event.title}</Typography>
          <Typography variant="body2">
            {event.start_time} - {event.end_time} （{Math.floor(event.duration / 60)}分{event.duration % 60}秒）
          </Typography>
          <Typography variant="body2">类型: {event.type}</Typography>
        </div>
      </div>
    </Paper>
  );

  // 拖拽物通过Portal渲染，使其在拖拽中不受布局限制，全屏范围可见
  return snapshot.isDragging ? <Portal>{item}</Portal> : item;
};

export default EventItem;