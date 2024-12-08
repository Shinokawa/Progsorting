import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

const EditDialog = ({ open, onClose, event, onSave }) => {
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');

  // 当event发生变化，或dialog重新打开时，根据当前event的值重置编辑框内的表单状态
  useEffect(() => {
    if (event) {
      setDuration(event.duration);
      setTitle(event.title);
    }
  }, [event]);

  // 保存修改数据
  const handleSave = () => {
    onSave({
      ...event,
      duration: Number(duration),
      title: title
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      {event && (
        <>
          <DialogTitle>编辑事件 - {event.title}</DialogTitle>
          <DialogContent>
            <TextField
              label="标题"
              value={title}
              onChange={e => setTitle(e.target.value)}
              fullWidth
              style={{ marginBottom: '16px' }}
            />
            <TextField
              label="持续时间(秒)"
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>取消</Button>
            <Button onClick={handleSave} variant="contained" color="primary">保存</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default EditDialog;