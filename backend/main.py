from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional
import pandas as pd
from dateutil import parser
from fastapi.middleware.cors import CORSMiddleware
import csv

def save_to_csv():
    current_events = morning_events + afternoon_events
    # 将事件列表写回 events.csv
    with open("events.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        # 写入表头
        writer.writerow(["时间","内容","类型","社团/表演者","补充说明","时长"])
        for e in current_events:
            # 将开始/结束时间组合成原来的格式：“HH:MM:SS-HH:MM:SS”
            time_range = f"{e['start_time']}-{e['end_time']}"
            # 将时长（秒）转换回原格式，比如 600秒 -> "10分钟0秒"
            minutes = e["duration"] // 60
            seconds = e["duration"] % 60
            duration_str = f"{minutes}分钟{seconds}秒"

            writer.writerow([
                time_range,
                e["title"],
                e["type"],
                e["group"] if e["group"] else "—",
                e["note"] if e["note"] else "",
                duration_str
            ])
app = FastAPI()

# 启用CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 前端运行端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 固定起点时间，可从前端调整
MORNING_START = "09:20:00"
AFTERNOON_START = "14:00:00"

# 假设CSV中会标识上午和下午的项目，例如通过某字段区分，或你可以初始全部放上午场，然后手动分配
df = pd.read_csv("events.csv")

def parse_duration(duration_str: str) -> int:
    import re
    match = re.match(r"(\d+)分钟(\d+)秒", duration_str)
    if match:
        minutes = int(match.group(1))
        seconds = int(match.group(2))
        total_sec = minutes * 60 + seconds
        return total_sec
    else:
        return 0

def parse_time_range(time_range: str):
    start_str, end_str = time_range.split("-")
    return start_str.strip(), end_str.strip()

# 假设上午场活动都在上午时间段内（数据来源需保证），下午场在下午
# 若数据不分上午下午，可人工分配或在前端拖拽时区分
events_raw = []
for i, row in df.iterrows():
    start_str, end_str = parse_time_range(row["时间"])
    duration = parse_duration(str(row["时长"]))
    # 简单判断属于上午或下午：若开始时间<12点就归为上午，否则下午(依据你的数据实际情况)
    start_hour = int(start_str.split(":")[0])
    session = "morning" if start_hour < 12 else "afternoon"
    events_raw.append({
        "id": i,
        "title": row["内容"],
        "type": row["类型"],
        "group": row["社团/表演者"] if pd.notna(row["社团/表演者"]) else "",
        "note": row["补充说明"] if pd.notna(row["补充说明"]) else "",
        "duration": duration,
        "session": session  # 标记所属时段
    })

morning_events = [e for e in events_raw if e["session"] == "morning"]
afternoon_events = [e for e in events_raw if e["session"] == "afternoon"]

def recalculate_times():
    global MORNING_START, AFTERNOON_START
    # 上午重算
    start = datetime.strptime(MORNING_START, "%H:%M:%S")
    for e in morning_events:
        e["start_time"] = start.strftime("%H:%M:%S")
        end = start + timedelta(seconds=e["duration"])
        e["end_time"] = end.strftime("%H:%M:%S")
        start = end

    # 下午重算
    start = datetime.strptime(AFTERNOON_START, "%H:%M:%S")
    for e in afternoon_events:
        e["start_time"] = start.strftime("%H:%M:%S")
        end = start + timedelta(seconds=e["duration"])
        e["end_time"] = end.strftime("%H:%M:%S")
        start = end

recalculate_times()

class Event(BaseModel):
    id: int
    title: str
    type: str
    group: str
    note: str
    duration: int
    start_time: str
    end_time: str
    session: str

class ReorderRequest(BaseModel):
    # order是一个对象，包含morning和afternoon两个列表，分别是id的顺序
    morning: List[int]
    afternoon: List[int]

class UpdateEventRequest(BaseModel):
    id: int
    title: Optional[str] = None
    type: Optional[str] = None
    duration: Optional[int] = None
    group: Optional[str] = None
    note: Optional[str] = None

class UpdateStartTimeRequest(BaseModel):
    morning_start: Optional[str] = None
    afternoon_start: Optional[str] = None

@app.get("/api/events", response_model=List[Event])
def get_events():
    return morning_events + afternoon_events

@app.post("/api/reorder", response_model=List[Event])
def reorder_events(req: ReorderRequest):
    global morning_events, afternoon_events
    id_map = {e["id"]: e for e in (morning_events + afternoon_events)}

    new_morning = []
    for eid in req.morning:
        if eid not in id_map:
            raise HTTPException(status_code=400, detail="Invalid event ID in morning reorder")
        ev = id_map[eid]
        ev["session"] = "morning"
        new_morning.append(ev)

    new_afternoon = []
    for eid in req.afternoon:
        if eid not in id_map:
            raise HTTPException(status_code=400, detail="Invalid event ID in afternoon reorder")
        ev = id_map[eid]
        ev["session"] = "afternoon"
        new_afternoon.append(ev)

    morning_events = new_morning
    afternoon_events = new_afternoon
    recalculate_times()
    save_to_csv()  # 保存到CSV
    return morning_events + afternoon_events

@app.post("/api/update", response_model=List[Event])
def update_event(req: UpdateEventRequest):
    found = False
    for e in (morning_events + afternoon_events):
        if e["id"] == req.id:
            if req.title is not None:
                e["title"] = req.title
            if req.type is not None:
                e["type"] = req.type
            if req.duration is not None:
                e["duration"] = req.duration
            if req.group is not None:
                e["group"] = req.group
            if req.note is not None:
                e["note"] = req.note
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Event not found")
    recalculate_times()
    save_to_csv()  # 保存到CSV
    return morning_events + afternoon_events

@app.post("/api/updatestarttime", response_model=List[Event])
def update_start_time(req: UpdateStartTimeRequest):
    global MORNING_START, AFTERNOON_START
    if req.morning_start:
        MORNING_START = req.morning_start
    if req.afternoon_start:
        AFTERNOON_START = req.afternoon_start
    recalculate_times()
    save_to_csv()  # 保存到CSV
    return morning_events + afternoon_events


from fastapi.responses import Response
import csv
import io


@app.get("/api/exportcsv")
def export_csv():
    # 将当前 morning_events + afternoon_events 合并
    current_events = morning_events + afternoon_events

    # 定义CSV列名
    headers = ["开始时间", "结束时间", "标题", "类型", "社团/表演者", "补充说明", "时长（秒）", "场次(上午/下午)"]

    # 使用io.StringIO在内存中构建CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)

    for e in current_events:
        writer.writerow([
            e.get("start_time", ""),
            e.get("end_time", ""),
            e.get("title", ""),
            e.get("type", ""),
            e.get("group", ""),
            e.get("note", ""),
            e.get("duration", ""),
            "上午" if e["session"] == "morning" else "下午"
        ])

    csv_data = output.getvalue()
    output.close()

    # 以CSV文件形式返回
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=events_export.csv"}
    )