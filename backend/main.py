import os, json
from datetime import datetime, timezone
from typing import Optional, List

import jwt
from jwt import InvalidTokenError
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import UniqueConstraint
from sqlmodel import SQLModel, Field, Session, create_engine, func, select
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

def load_privy_public_key() -> str:
    key = os.getenv("PRIVY_PUBLIC_KEY", "")
    # convert literal backslash-n to real newlines
    if "\\n" in key:
        key = key.replace("\\n", "\n")
    key = key.strip()
    if "BEGIN PUBLIC KEY" not in key:
        raise RuntimeError("PRIVY_PUBLIC_KEY is not a PEM public key.")
    return key

PRIVY_APP_ID = os.getenv("PRIVY_APP_ID")
PRIVY_PUBLIC_KEY = load_privy_public_key()
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
CORS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

if not PRIVY_APP_ID or not PRIVY_PUBLIC_KEY:
    raise RuntimeError("Missing PRIVY_APP_ID or PRIVY_PUBLIC_KEY.")

engine = create_engine(DB_URL, connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {})

app = FastAPI(title="Privy Social Login API", version="1.0.0")
if CORS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# -------------------- DB models --------------------
class User(SQLModel, table=True):
    did: str = Field(primary_key=True)
    x_subject: str | None = None
    x_username: str | None = None
    x_name: str | None = None
    x_profile_picture_url: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Wallet(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("user_did", "address", name="uq_user_wallet"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    user_did: str = Field(index=True, foreign_key="user.did")
    address: str = Field(index=True)
    chain_type: Optional[str] = Field(default=None)
    wallet_client_type: Optional[str] = None
    connector_type: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as s:
        yield s

# -------------------- Auth helpers --------------------
def _get_bearer_or_cookie(request: Request, header_name: str, cookie_name: str) -> Optional[str]:
    auth = request.headers.get("authorization")
    if header_name == "authorization" and auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()
    token = request.headers.get(header_name)
    if token:
        return token
    cookie_token = request.cookies.get(cookie_name)
    if cookie_token:
        return cookie_token
    return None

def verify_access_token(request: Request):
    """
    Verifies Privy ACCESS token (auth). Use for protecting routes.
    """
    token = _get_bearer_or_cookie(request, "authorization", "privy-token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing access token")
    try:
        claims = jwt.decode(
            token,
            PRIVY_PUBLIC_KEY,
            algorithms=["ES256"],
            audience=PRIVY_APP_ID,
            issuer="privy.io",
            options={"require": ["exp", "iat", "iss", "aud", "sub", "sid"]},
        )
    except InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid access token: {e}")
    return claims

def parse_identity_token(request: Request):
    """
    Verifies Privy IDENTITY token (contains linked accounts snapshot).
    Prefer to receive from 'privy-id-token' header; cookie fallback.
    """
    id_token = _get_bearer_or_cookie(request, "privy-id-token", "privy-id-token")
    if not id_token:
        raise HTTPException(status_code=401, detail="Missing identity token")
    try:
        payload = jwt.decode(
            id_token,
            PRIVY_PUBLIC_KEY,
            algorithms=["ES256"],
            audience=PRIVY_APP_ID,
            issuer="privy.io",
            options={"require": ["exp", "iat", "iss", "aud", "sub"]},
        )
        linked_accounts = json.loads(payload.get("linked_accounts", "[]"))
        custom_metadata = json.loads(payload.get("custom_metadata", "{}")) if payload.get("custom_metadata") else {}
        return {"sub": payload["sub"], "linked_accounts": linked_accounts, "custom_metadata": custom_metadata}
    except InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid identity token: {e}")

# -------------------- Schemas --------------------
class MeOut(BaseModel):
    did: str
    session_id: str

class WalletOut(BaseModel):
    address: str
    chain_type: Optional[str] = None
    wallet_client_type: Optional[str] = None
    connector_type: Optional[str] = None

class SyncResult(BaseModel):
    did: str
    x_username: Optional[str] = None
    wallet_count: int

# -------------------- Routes --------------------
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/auth/me", response_model=MeOut)
def auth_me(claims=Depends(verify_access_token)):
    return MeOut(did=claims["sub"], session_id=claims["sid"])

@app.get("/wallets", response_model=List[WalletOut])
def list_wallets(claims=Depends(verify_access_token), session: Session = Depends(get_session)):
    rows = session.exec(select(Wallet).where(Wallet.user_did == claims["sub"])).all()
    return [WalletOut(address=w.address, chain_type=w.chain_type,
                      wallet_client_type=w.wallet_client_type, connector_type=w.connector_type) for w in rows]

@app.post("/sync-identity", response_model=SyncResult)
def sync_identity(request: Request, session: Session = Depends(get_session)):
    """
    Upsert X (Twitter) info + wallet list from the PRIVY IDENTITY TOKEN.
    Call this after login AND after user connects/unlinks wallets.
    """
    payload = parse_identity_token(request)
    did = payload["sub"]

    user = session.get(User, did) or User(did=did)
    user.updated_at = datetime.now(timezone.utc)

    x_accounts = [a for a in payload["linked_accounts"] if a.get("type") == "twitter_oauth"]
    if x_accounts:
        xa = x_accounts[0]
        user.x_subject = xa.get("subject")
        user.x_username = xa.get("username")
        user.x_name = xa.get("name")
        user.x_profile_picture_url = xa.get("profilePictureUrl")

    if session.get(User, did) is None:
        session.add(user)
        session.flush()

    wallet_accounts = [a for a in payload["linked_accounts"] if a.get("type") in ("wallet", "smart_wallet")]
    print(wallet_accounts)
    addresses = {a.get("address"): a for a in wallet_accounts if a.get("address")}
    existing = session.exec(select(Wallet).where(Wallet.user_did == did)).all()
    existing_by_addr = {w.address: w for w in existing}

    for addr, acct in addresses.items():
        if addr in existing_by_addr:
            w = existing_by_addr[addr]
            w.chain_type = acct.get("chain_type") or w.chain_type
            w.wallet_client_type = acct.get("wallet_client_type") or w.wallet_client_type
            w.connector_type = acct.get("connector_type") or w.connector_type
        else:
            session.add(Wallet(
                user_did=did,
                address=addr,
                chain_type=acct.get("chain_type"),
                wallet_client_type=acct.get("wallet_client_type"),
                connector_type=acct.get("connector_type"),
            ))

    session.commit()
    count = len(session.exec(
        select(Wallet.address).where(Wallet.user_did == did)
    ).all())
    return SyncResult(did=did, x_username=user.x_username, wallet_count=count)
