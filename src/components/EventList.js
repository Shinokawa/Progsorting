import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import EventItem from './EventItem';
import { Grid, Typography } from '@mui/material';

const EventLists = ({ events, morningOrder, afternoonOrder, onDragEnd, onEventDoubleClick }) => {
  const morningEvents = morningOrder.map(id => events.find(e => e.id === id));
  const afternoonEvents = afternoonOrder.map(id => events.find(e => e.id === id));

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Grid container spacing={4} style={{marginTop:'20px'}}>
        <Grid item xs={6}>
          <Typography variant="h5" gutterBottom>上午场</Typography>
          <Droppable droppableId="morning" direction="vertical" type="EVENTS">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  padding: '8px',
                  minHeight: '300px',
                  background: snapshot.isDraggingOver ? '#dff0d8' : '#fafafa',
                  overflowY: 'auto',
                  border: snapshot.isDraggingOver ? '2px solid #8bc34a' : '1px solid #ddd',
                  borderRadius: '4px',
                  transition: 'background 0.2s ease, border 0.2s ease'
                }}
              >
                {morningEvents.map((ev, index) => ev && (
                  <Draggable key={ev.id} draggableId={ev.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <EventItem
                        event={ev}
                        provided={provided}
                        snapshot={snapshot}
                        onDoubleClick={onEventDoubleClick}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h5" gutterBottom>下午场</Typography>
          <Droppable droppableId="afternoon" direction="vertical" type="EVENTS">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  padding: '8px',
                  minHeight: '300px',
                  background: snapshot.isDraggingOver ? '#f1f8e9' : '#fafafa',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                {afternoonEvents.map((ev, index) => ev && (
                  <Draggable key={ev.id} draggableId={ev.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <EventItem
                        event={ev}
                        provided={provided}
                        snapshot={snapshot}
                        onDoubleClick={onEventDoubleClick}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Grid>
      </Grid>
    </DragDropContext>
  );
};

export default EventLists;