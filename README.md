# Bangkok Flood 2026 Dashboard

แดชบอร์ดสถานการณ์น้ำท่วมกรุงเทพมหานคร พ.ศ. 2569 แบบไฟล์ HTML เดียว พร้อมกราฟข้อมูลและแผนที่เชิงโต้ตอบระดับ 50 เขต

## Features

- ภาพรวมสถานการณ์และตัวเลขสำคัญ
- ไทม์ไลน์เหตุการณ์ 23–28 กันยายน 2569
- กราฟปริมาณฝนและผลกระทบทางเศรษฐกิจ
- แผนที่ขอบเขต 50 เขต ค้นหาและซูมรายเขตได้
- แสดง 8 เขตที่ยังมีรายงานน้ำท่วมตามข้อมูลวันที่ 28 กันยายน 2569
- รวมลิงก์แหล่งข่าวและ API ต้นทาง
- Responsive รองรับเดสก์ท็อปและมือถือ

## Run locally

เปิด `index.html` ในเว็บเบราว์เซอร์ได้ทันที หรือใช้ local server:

```bash
python3 -m http.server 8080
```

จากนั้นเปิด `http://localhost:8080`

## Data and APIs

- Bangkok district boundaries: GeoJSON from `pcrete/gsvloader-demo`
- Base map: OpenStreetMap Standard Tiles
- Charts: Chart.js 4.4.7
- Map engine: Leaflet 1.9.4
- News and situation sources: BMA, DDPM, Thai PBS, Thai Rath, THE STANDARD, Hfocus, PPTV and Reuters

## Important note

ข้อมูลสถานการณ์ในแดชบอร์ดเป็น snapshot จากรายงานข่าวที่เผยแพร่ ไม่ใช่ข้อมูลเซนเซอร์ระดับน้ำแบบเรียลไทม์ ก่อนเดินทางควรตรวจสอบข้อมูลล่าสุดจาก:

- https://weather.bangkok.go.th/
- https://dds.bangkok.go.th/
- https://dxs.dds.bangkok.go.th/public

OpenStreetMap Standard Tiles เหมาะกับโครงการขนาดเล็กและต้องปฏิบัติตาม [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) หากใช้งานทราฟฟิกสูงควรเปลี่ยนเป็นผู้ให้บริการ tiles ที่มี SLA หรือ self-host

## License

Dashboard source code is released under the MIT License. Data and map layers retain their respective source licenses and attribution requirements.
