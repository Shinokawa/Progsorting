import React, { useEffect, useState } from 'react';
import { getEvents, reorderEvents, updateEvent, updateStartTime } from './api';
import { Container, Typography, TextField, Button, Grid } from '@mui/material';
import EventLists from './components/EventList';
import EditDialog from './components/EditDialog';

function App() {
  const [events, setEvents] = useState([]);
  const [morningOrder, setMorningOrder] = useState([]);
  const [afternoonOrder, setAfternoonOrder] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const [morningStart, setMorningStart] = useState("09:20:00");
  const [afternoonStart, setAfternoonStart] = useState("14:00:00");

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    getEvents().then(res => {
      setEvents(res.data);
      const m = res.data.filter(e => e.session === "morning").map(e => e.id);
      const a = res.data.filter(e => e.session === "afternoon").map(e => e.id);
      setMorningOrder(m);
      setAfternoonOrder(a);
    });
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    let newMorning = [...morningOrder];
    let newAfternoon = [...afternoonOrder];

    // 移除拖拽项目
    let movedId;
    if (source.droppableId === "morning") {
      movedId = newMorning.splice(source.index, 1)[0];
    } else {
      movedId = newAfternoon.splice(source.index, 1)[0];
    }

    // 插入到新位置
    if (destination.droppableId === "morning") {
      newMorning.splice(destination.index, 0, movedId);
    } else {
      newAfternoon.splice(destination.index, 0, movedId);
    }

    setMorningOrder(newMorning);
    setAfternoonOrder(newAfternoon);

    reorderEvents({ morning: newMorning, afternoon: newAfternoon })
      .then(res => setEvents(res.data));
  };

  const handleEventDoubleClick = (event) => {
    setEditEvent(event);
    setEditOpen(true);
  };

  const handleDialogClose = () => {
    setEditOpen(false);
    setEditEvent(null);
  };

  const handleDialogSave = (newData) => {
    updateEvent(newData.id, {title: newData.title, duration: newData.duration}).then(res => {
      setEvents(res.data);
      handleDialogClose();
    });
  };

  const handleUpdateStartTime = () => {
    updateStartTime(morningStart, afternoonStart).then(res => {
      setEvents(res.data);
      // 更新后重新提取order
      const m = res.data.filter(e => e.session === "morning").map(e => e.id);
      const a = res.data.filter(e => e.session === "afternoon").map(e => e.id);
      setMorningOrder(m);
      setAfternoonOrder(a);
    });
  };

  return (
    <Container maxWidth="md" style={{marginTop: '40px'}}>
      <Typography variant="h4" gutterBottom>时间表编辑</Typography>
      <Typography variant="body1" gutterBottom>
        拖拽卡片改变顺序，双击卡片编辑时长或标题。<br/>
        分别有上午和下午的固定开始时间，可在下方调整。
      </Typography>
      <Grid container spacing={2} style={{marginBottom: '20px'}}>
        <Grid item>
          <TextField
            label="上午开始时间"
            value={morningStart}
            onChange={(e) => setMorningStart(e.target.value)}
            helperText="格式: HH:MM:SS"
          />
        </Grid>
        <Grid item>
          <TextField
            label="下午开始时间"
            value={afternoonStart}
            onChange={(e) => setAfternoonStart(e.target.value)}
            helperText="格式: HH:MM:SS"
          />
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={handleUpdateStartTime}>更新开始时间</Button>
        </Grid>
        <Grid item>
          {/* 直接使用a标签访问后端csv接口，让浏览器自动下载 */}
          <Button variant="outlined" component="a" href="http://127.0.0.1:8000/api/exportcsv" download>
            导出CSV
          </Button>
        </Grid>
      </Grid>
      <EventLists
        events={events}
        morningOrder={morningOrder}
        afternoonOrder={afternoonOrder}
        onDragEnd={handleDragEnd}
        onEventDoubleClick={handleEventDoubleClick}
      />
      <EditDialog open={editOpen} onClose={handleDialogClose} event={editEvent} onSave={handleDialogSave}/>
    </Container>
  );
}

export default App;