from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Depends, Form, Query, Response
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select, update, func
from models import Base, Order, User
from auth import hash_password, verify_password, create_access_token, verify_token
from datetime import datetime
import base64
import os
import re

COURIER_SHORT = {
    'DPKERRY': 'KERRY',
    'DPTHAIPOST': 'POST',
    'DPFLASHA': 'FLASH',
    'DPSHOPEE': 'SHOPEE',
    'DPDHL': 'DHL',
    'DPFLASHLIVEBULKY': 'BULKY',
}

engine = create_async_engine("sqlite+aiosqlite:////app/data/orders.db")
async_session = async_sessionmaker(engine, expire_on_commit=False)

templates = Jinja2Templates(directory="/app/templates")

@asynccontextmanager
async def lifespan(app: FastAPI):
    import os
    os.makedirs("/app/data", exist_ok=True)
    os.makedirs("/app/data/slips", exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        def _migrate(conn):
            for col, typ in [
                ("slip_image_path", "VARCHAR DEFAULT ''"),
                ("slip_ocr_amount", "FLOAT DEFAULT 0"),
                ("slip_ocr_confidence", "FLOAT DEFAULT 0"),
                ("slip_ocr_raw", "VARCHAR(2000) DEFAULT ''"),
            ]:
                try:
                    conn.exec_driver_sql(f"ALTER TABLE orders ADD COLUMN {col} {typ}")
                except Exception:
                    pass
        await conn.run_sync(_migrate)
    async with async_session() as session:
        result = await session.execute(select(User).where(User.username == "admin"))
        if not result.scalar_one_or_none():
            import os
            admin_pass = os.environ.get("ADMIN_PASSWORD", "2658_xtrail")
            user = User(username="admin", password_hash=hash_password(admin_pass))
            session.add(user)
            await session.commit()
    yield

app = FastAPI(lifespan=lifespan)


def get_current_user(request: Request):
    token = request.cookies.get("s36_token")
    if not token:
        return None
    username = verify_token(token)
    return username


async def get_db():
    async with async_session() as session:
        yield session


@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return templates.TemplateResponse("login.html", {"request": request, "error": "Username หรือ Password ไม่ถูกต้อง"})

    token = create_access_token(username)
    resp = RedirectResponse("/dashboard", status_code=303)
    resp.set_cookie(key="s36_token", value=token, httponly=True, max_age=86400)
    return resp


@app.post("/api/login")
async def login_api(username: str = Form(...), password: str = Form(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token(username)
    return {"token": token}


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    username = get_current_user(request)
    if not username:
        return RedirectResponse("/login")
    return templates.TemplateResponse("dashboard.html", {"request": request, "username": username})


@app.get("/logout")
async def logout():
    resp = RedirectResponse("/login", status_code=303)
    resp.delete_cookie("s36_token")
    return resp


@app.get("/api/orders")
async def list_orders(request: Request, phone: str = Query(None), status: str = Query(None), limit: int = Query(0), offset: int = Query(0), db: AsyncSession = Depends(get_db)):
    username = get_current_user(request)
    if not username:
        raise HTTPException(401)

    base = select(Order)
    if phone:
        base = base.where(Order.customer_phone == phone)
    if status:
        base = base.where(Order.status == status)
    q = base.order_by(Order.created_at.desc())
    if limit > 0:
        q = q.limit(limit).offset(offset)

    result = await db.execute(q)
    orders = result.scalars().all()
    return [{"id": o.id, "customer_name": o.customer_name, "customer_phone": o.customer_phone,
             "pickup_address": o.pickup_address, "delivery_province": o.delivery_province,
             "receiver_name": o.receiver_name, "receiver_phone": o.receiver_phone,
             "weight_kg": o.weight_kg, "courier_code": o.courier_code, "courier_name": o.courier_name,
             "price": o.price, "tracking_number": o.tracking_number, "status": o.status,
             "slip_image_path": o.slip_image_path, "slip_ocr_amount": o.slip_ocr_amount,
             "slip_ocr_confidence": o.slip_ocr_confidence, "slip_ocr_raw": o.slip_ocr_raw,
             "created_at": str(o.created_at), "updated_at": str(o.updated_at)} for o in orders]


@app.get("/api/orders/count")
async def count_orders(request: Request, status: str = Query(None), db: AsyncSession = Depends(get_db)):
    username = get_current_user(request)
    if not username:
        raise HTTPException(401)
    q = select(func.count()).select_from(Order)
    if status:
        q = q.where(Order.status == status)
    result = await db.execute(q)
    return {"total": result.scalar_one()}


@app.get("/api/orders/{order_id}")
async def get_order(request: Request, order_id: str, db: AsyncSession = Depends(get_db)):
    username = get_current_user(request)
    if not username:
        raise HTTPException(401)

    result = await db.execute(select(Order).where(Order.id == order_id))
    o = result.scalar_one_or_none()
    if not o:
        raise HTTPException(404, "Order not found")

    slip_base64 = ""
    if o.slip_image_path and os.path.isfile(o.slip_image_path):
        try:
            with open(o.slip_image_path, "rb") as f:
                slip_base64 = base64.b64encode(f.read()).decode()
        except Exception:
            slip_base64 = ""

    return {"id": o.id, "customer_name": o.customer_name, "customer_phone": o.customer_phone,
            "pickup_address": o.pickup_address, "delivery_province": o.delivery_province,
            "receiver_name": o.receiver_name, "receiver_phone": o.receiver_phone,
            "weight_kg": o.weight_kg, "courier_code": o.courier_code, "courier_name": o.courier_name,
            "price": o.price, "tracking_number": o.tracking_number, "status": o.status,
            "slip_image_base64": slip_base64, "slip_ocr_amount": o.slip_ocr_amount,
            "slip_ocr_confidence": o.slip_ocr_confidence, "slip_ocr_raw": o.slip_ocr_raw,
            "created_at": str(o.created_at), "updated_at": str(o.updated_at)}


@app.get("/api/orders/{order_id}/slip")
async def get_slip(request: Request, order_id: str, db: AsyncSession = Depends(get_db)):
    username = get_current_user(request)
    if not username:
        raise HTTPException(401)

    result = await db.execute(select(Order).where(Order.id == order_id))
    o = result.scalar_one_or_none()
    if not o:
        raise HTTPException(404, "Order not found")

    slip_base64 = ""
    if o.slip_image_path and os.path.isfile(o.slip_image_path):
        try:
            with open(o.slip_image_path, "rb") as f:
                slip_base64 = base64.b64encode(f.read()).decode()
        except Exception:
            slip_base64 = ""

    return {"slip_image_base64": slip_base64, "slip_ocr_amount": o.slip_ocr_amount,
            "slip_ocr_confidence": o.slip_ocr_confidence, "slip_ocr_raw": o.slip_ocr_raw}


@app.patch("/api/orders/{order_id}")
async def update_order(request: Request, order_id: str, db: AsyncSession = Depends(get_db)):
    username = get_current_user(request)
    if not username:
        raise HTTPException(401)

    body = await request.json()
    vals = {"updated_at": datetime.now()}

    editable_fields = [
        "customer_name", "customer_phone", "pickup_address",
        "delivery_province", "receiver_name", "receiver_phone",
        "weight_kg", "courier_code", "courier_name", "price",
        "tracking_number",
    ]
    for field in editable_fields:
        if field in body and body[field] is not None:
            vals[field] = body[field]

    new_status = body.get("status")
    if new_status and new_status in {"กำลังกรอกข้อมูลลงระบบ", "ยังไม่ส่ง", "กำลังจัดส่ง", "ส่งถึงแล้ว", "รอตรวจสอบสลิป"}:
        vals["status"] = new_status
    elif new_status:
        raise HTTPException(400, f"Invalid status: {new_status}")

    if vals:
        await db.execute(update(Order).where(Order.id == order_id).values(**vals))
        await db.commit()

    result = await db.execute(select(Order).where(Order.id == order_id))
    o = result.scalar_one_or_none()
    if not o:
        raise HTTPException(404, "Order not found")
    return {"id": o.id, "customer_name": o.customer_name, "customer_phone": o.customer_phone,
            "pickup_address": o.pickup_address, "delivery_province": o.delivery_province,
            "receiver_name": o.receiver_name, "receiver_phone": o.receiver_phone,
            "weight_kg": o.weight_kg, "courier_code": o.courier_code, "courier_name": o.courier_name,
            "price": o.price, "tracking_number": o.tracking_number, "status": o.status,
            "slip_image_path": o.slip_image_path, "slip_ocr_amount": o.slip_ocr_amount,
            "slip_ocr_confidence": o.slip_ocr_confidence, "slip_ocr_raw": o.slip_ocr_raw,
            "created_at": str(o.created_at), "updated_at": str(o.updated_at)}


@app.post("/api/orders")
async def create_order(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    courier_code = body.get("courier_code", "")

    result = await db.execute(select(Order))
    count = len(result.scalars().all())

    short = COURIER_SHORT.get(courier_code, "UNK")
    ts = datetime.now().strftime("%y%m%d%H%M%S")
    order_id = f"{short}{ts}"

    slip_image_path = ""
    slip_image_base64 = body.get("slip_image_base64", "")
    if slip_image_base64:
        try:
            filepath = f"/app/data/slips/{order_id}.png"
            with open(filepath, "wb") as f:
                f.write(base64.b64decode(slip_image_base64))
            slip_image_path = filepath
        except Exception:
            slip_image_path = ""

    initial_status = "กำลังกรอกข้อมูลลงระบบ"
    if slip_image_path:
        initial_status = "รอตรวจสอบสลิป"
    if body.get("status"):
        initial_status = body["status"]

    order = Order(
        id=order_id,
        customer_name=body.get("customer_name", ""),
        customer_phone=body.get("customer_phone", ""),
        pickup_address=body.get("pickup_address", ""),
        delivery_province=body.get("delivery_province", ""),
        receiver_name=body.get("receiver_name", ""),
        receiver_phone=body.get("receiver_phone", ""),
        weight_kg=body.get("weight_kg", 0),
        courier_code=courier_code,
        courier_name=body.get("courier_name", ""),
        price=body.get("price", 0),
        status=initial_status,
        slip_image_path=slip_image_path,
        slip_ocr_amount=body.get("slip_ocr_amount", 0),
        slip_ocr_confidence=body.get("slip_ocr_confidence", 0),
        slip_ocr_raw=body.get("slip_ocr_raw", ""),
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    return {"id": order.id, "courier_code": order.courier_code, "courier_name": order.courier_name,
            "price": order.price, "status": order.status, "slip_image_path": order.slip_image_path,
            "created_at": str(order.created_at)}


@app.api_route("/api/orders/lookup", methods=["GET"])
async def lookup_order(request: Request, q: str = Query(...), db: AsyncSession = Depends(get_db)):
    username = get_current_user(request)
    if not username:
        raise HTTPException(401)

    result = await db.execute(
        select(Order).where(
            (Order.id == q) | (Order.customer_phone == q) | (Order.receiver_phone == q)
        ).order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()

    return [{"id": o.id, "customer_name": o.customer_name, "customer_phone": o.customer_phone,
             "delivery_province": o.delivery_province, "receiver_name": o.receiver_name,
             "weight_kg": o.weight_kg, "courier_code": o.courier_code, "courier_name": o.courier_name,
             "price": o.price, "status": o.status, "tracking_number": o.tracking_number,
             "slip_ocr_amount": o.slip_ocr_amount, "slip_ocr_confidence": o.slip_ocr_confidence,
             "created_at": str(o.created_at)} for o in orders]


@app.get("/api/public/order-lookup")
async def public_lookup(q: str = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).where(
            (Order.id == q) | (Order.customer_phone == q) | (Order.receiver_phone == q)
        ).order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()

    return [{"id": o.id, "customer_name": o.customer_name,
             "receiver_name": o.receiver_name,
             "delivery_province": o.delivery_province,
             "courier_name": o.courier_name, "price": o.price,
             "status": o.status, "tracking_number": o.tracking_number,
             "created_at": str(o.created_at)} for o in orders]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
