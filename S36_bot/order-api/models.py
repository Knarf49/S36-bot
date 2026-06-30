from sqlalchemy import Column, String, Float, DateTime, Integer, func
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Order(Base):
    __tablename__ = 'orders'

    id = Column(String, primary_key=True)
    customer_name = Column(String, default='')
    customer_phone = Column(String, default='')
    pickup_address = Column(String, default='')
    delivery_province = Column(String, default='')
    receiver_name = Column(String, default='')
    receiver_phone = Column(String, default='')
    receiver_address = Column(String, default='')
    weight_kg = Column(Float, default=0)
    courier_code = Column(String, default='')
    courier_name = Column(String, default='')
    price = Column(Float, default=0)
    tracking_number = Column(String, default='')
    status = Column(String, default='กำลังกรอกข้อมูลลงระบบ')
    slip_image_path = Column(String, default='')
    slip_ocr_amount = Column(Float, default=0)
    slip_ocr_confidence = Column(Float, default=0)
    slip_ocr_raw = Column(String(2000), default='')
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
